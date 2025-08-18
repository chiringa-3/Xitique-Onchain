// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Xitique Web3 - Decentralized Community Savings (ROSCA)
/// @notice A group of participants contributes a fixed amount of USDC per cycle
///         and one participant receives the pooled payout by rotation, auction,
///         lottery, or group vote. Includes governance, penalties, and reputation.

interface IERC20 {
	// Minimal ERC20 interface
	function totalSupply() external view returns (uint256);
	function balanceOf(address account) external view returns (uint256);
	function transfer(address to, uint256 amount) external returns (bool);
	function allowance(address owner, address spender) external view returns (uint256);
	function approve(address spender, uint256 amount) external returns (bool);
	function transferFrom(address from, address to, uint256 amount) external returns (bool);

	event Transfer(address indexed from, address indexed to, uint256 value);
	event Approval(address indexed owner, address indexed spender, uint256 value);
}

/// @notice Optional NFT/badge interface for proof of participation
interface IXitiqueBadge {
	function mint(address to, uint256 groupId, uint256 cycleId) external;
}

/// @notice Basic reentrancy guard (OpenZeppelin pattern, reduced)
abstract contract ReentrancyGuardLite {
	uint256 private _status;
	constructor() {
		_status = 1;
	}
	modifier nonReentrant() {
		require(_status == 1, "REENTRANCY");
		_status = 2;
		_;
		_status = 1;
	}
}

contract XitiqueGroup is ReentrancyGuardLite {
	/// ====== Types ======

	/// @notice Group lifecycle states
	enum Status {
		Active,
		Paused,
		Ended
	}

	/// @notice Beneficiary selection strategies per cycle
	enum SelectionMode {
		Rotation,
		Auction,
		Vote,
		Lottery
	}

	/// @notice Governance proposal types
	enum ProposalType {
		ChangeRule,
		RemoveMember,
		PauseGroup,
		ResumeGroup,
		EndGroup
	}

	/// @notice Cycle state
	struct Cycle {
		uint256 id;
		uint256 startTime;
		uint256 dueTime; // contribution deadline
		uint256 totalContributed; // sum of member contributions for this cycle
		uint256 contributors; // count of unique contributors this cycle
		address beneficiary; // resolved when finalized
		SelectionMode selectionMode;
		bool finalized;
		// Auction (escrowed bids)
		address highestBidder;
		uint256 highestBid;
		mapping(address => uint256) bidBy; // current effective bid (escrowed)
		// Contributions
		mapping(address => bool) hasContributed;
		mapping(address => bool) isLateContributor;
		// Votes: nominee => votes
		mapping(address => uint256) votesFor;
		mapping(address => bool) hasVoted;
	}

	/// @notice Simple governance proposal with 1-address-1-vote majority
	struct Proposal {
		uint256 id;
		ProposalType proposalType;
		address paramAddress; // e.g., member to remove
		uint256 paramUint; // e.g., new rule value
		bool executed;
		uint256 yesVotes;
		uint256 noVotes;
		mapping(address => bool) hasVoted;
	}

	/// ====== Immutable / Config ======

	IERC20 public immutable usdc;
	address public immutable creator;

	/// ====== Group Metadata ======
	string public groupName;
	string public groupSymbol;

	/// ====== Group Parameters ======
	uint256 public contributionAmount; // in USDC units (e.g., 10 USDC => 10_000_000 for 6 decimals)
	uint256 public contributionFrequencyDays; // e.g., 7 for weekly
	uint256 public maxParticipants;

	/// @notice Penalty and discipline
	/// penaltyBasisPoints: penalty taken if contributed after dueTime but before grace
	/// gracePeriodDays: after due, before considered missed
	/// missedLimit: auto-removal threshold
	uint256 public penaltyBasisPoints; // e.g., 200 = 2%
	uint256 public gracePeriodDays; // e.g., 2
	uint256 public missedLimit; // e.g., 2 (auto-remove after 2 missed)

	/// ====== Group State ======
	Status public status;
	address[] private memberList;
	mapping(address => bool) public isMember;
	mapping(address => uint256) private memberIndex; // 1-based index (0 means not in)
	uint256 public activeMembersCount;

	/// @notice Reputation and discipline tracking
	mapping(address => int256) public reputationScore;
	mapping(address => uint256) public lateCountBy;
	mapping(address => uint256) public missedCountBy;

	/// @notice Rotation bookkeeping
	uint256 public nextRotationIndex; // index into memberList for next rotation target

	/// @notice Cycles
	uint256 public currentCycleId;
	mapping(uint256 => Cycle) private cycles;

	/// @notice Governance proposals
	uint256 public nextProposalId;
	mapping(uint256 => Proposal) private proposals;

	/// @notice Optional badge/NFT minter
	IXitiqueBadge public badgeMinter;

	/// ====== Events ======
	event GroupCreated(
		address indexed creator,
		string name,
		string symbol,
		uint256 contributionAmount,
		uint256 frequencyDays,
		uint256 maxParticipants
	);
	event StatusChanged(Status indexed previous, Status indexed current);
	event MemberJoined(address indexed member);
	event MemberRemoved(address indexed member, string reason);
	event CycleStarted(uint256 indexed cycleId, uint256 startTime, uint256 dueTime, SelectionMode mode);
	event ContributionMade(uint256 indexed cycleId, address indexed member, uint256 amount, bool late, uint256 penalty);
	event ContributionMissed(uint256 indexed cycleId, address indexed member);
	event BidPlaced(uint256 indexed cycleId, address indexed bidder, uint256 amount, address prevRefunded);
	event VoteCast(uint256 indexed cycleId, address indexed voter, address indexed nominee, uint256 votesForNominee);
	event PayoutDistributed(uint256 indexed cycleId, address indexed beneficiary, uint256 amountPayout, uint256 highestBidAdded);
	event ProposalCreated(uint256 indexed proposalId, ProposalType proposalType, address paramAddress, uint256 paramUint);
	event ProposalVoted(uint256 indexed proposalId, address indexed voter, bool support, uint256 yesVotes, uint256 noVotes);
	event ProposalExecuted(uint256 indexed proposalId);
	event ReputationUpdated(address indexed member, int256 newScore, string reason);
	event BadgeMinterUpdated(address indexed minter);

	/// ====== Modifiers ======
	modifier onlyCreator() {
		require(msg.sender == creator, "ONLY_CREATOR");
		_;
	}

	modifier onlyActive() {
		require(status == Status.Active, "GROUP_NOT_ACTIVE");
		_;
	}

	modifier onlyMember() {
		require(isMember[msg.sender], "ONLY_MEMBER");
		_;
	}

	/// ====== Constructor ======

	/// @param _usdc Address of USDC ERC20 token
	/// @param _name Group name
	/// @param _symbol Group symbol
	/// @param _contributionAmount Fixed contribution per cycle (USDC units)
	/// @param _frequencyDays Contribution frequency in days
	/// @param _maxParticipants Maximum members allowed
	/// @param _penaltyBps Penalty BPS for late contributions
	/// @param _graceDays Grace period after due date before marking missed
	/// @param _missedLimit Auto-removal threshold for missed contributions
	constructor(
		address _usdc,
		string memory _name,
		string memory _symbol,
		uint256 _contributionAmount,
		uint256 _frequencyDays,
		uint256 _maxParticipants,
		uint256 _penaltyBps,
		uint256 _graceDays,
		uint256 _missedLimit
	) {
		require(_usdc != address(0), "USDC_ZERO");
		require(_contributionAmount > 0, "AMOUNT_ZERO");
		require(_frequencyDays > 0, "FREQUENCY_ZERO");
		require(_maxParticipants > 1, "MAX_PARTICIPANTS");

		usdc = IERC20(_usdc);
		creator = msg.sender;

		groupName = _name;
		groupSymbol = _symbol;

		contributionAmount = _contributionAmount;
		contributionFrequencyDays = _frequencyDays;
		maxParticipants = _maxParticipants;

		penaltyBasisPoints = _penaltyBps;
		gracePeriodDays = _graceDays;
		missedLimit = _missedLimit;

		status = Status.Active;

		emit GroupCreated(msg.sender, _name, _symbol, _contributionAmount, _frequencyDays, _maxParticipants);
		emit StatusChanged(Status.Active, Status.Active);
	}

	/// ====== View Helpers ======

	/// @notice Returns the number of members
	function totalMembers() external view returns (uint256) {
		return memberList.length;
	}

	/// @notice Returns a member at index
	function memberAt(uint256 index) external view returns (address) {
		return memberList[index];
	}

	/// @notice Returns current cycle metadata (without mappings)
	function currentCycleInfo()
		external
		view
		returns (
			uint256 id,
			uint256 startTime,
			uint256 dueTime,
			uint256 totalContributed,
			uint256 contributors,
			address beneficiary,
			SelectionMode selectionMode,
			bool finalized,
			address highestBidder,
			uint256 highestBid
		)
	{
		Cycle storage c = cycles[currentCycleId];
		return (
			c.id,
			c.startTime,
			c.dueTime,
			c.totalContributed,
			c.contributors,
			c.beneficiary,
			c.selectionMode,
			c.finalized,
			c.highestBidder,
			c.highestBid
		);
	}

	/// ====== Membership Management ======

	/// @notice Join group before it is full and while active; first cycle starts when creator calls startFirstCycle
	function joinGroup() external onlyActive {
		require(!isMember[msg.sender], "ALREADY_MEMBER");
		require(memberList.length < maxParticipants, "GROUP_FULL");
		isMember[msg.sender] = true;
		memberList.push(msg.sender);
		memberIndex[msg.sender] = memberList.length; // 1-based
		activeMembersCount += 1;
		reputationScore[msg.sender] = 0;
		emit MemberJoined(msg.sender);
	}

	/// @notice Creator can add a member (e.g., whitelist flows)
	function addMember(address member) external onlyCreator onlyActive {
		require(member != address(0), "ZERO_ADDR");
		require(!isMember[member], "ALREADY_MEMBER");
		require(memberList.length < maxParticipants, "GROUP_FULL");
		isMember[member] = true;
		memberList.push(member);
		memberIndex[member] = memberList.length;
		activeMembersCount += 1;
		reputationScore[member] = 0;
		emit MemberJoined(member);
	}

	/// @notice Remove member (auto or by governance execution)
	function _removeMember(address member, string memory reason) internal {
		require(isMember[member], "NOT_MEMBER");

		// Swap and pop
		uint256 idx = memberIndex[member];
		uint256 lastIdx = memberList.length;
		if (idx != 0 && idx != lastIdx) {
			address last = memberList[lastIdx - 1];
			memberList[idx - 1] = last;
			memberIndex[last] = idx;
		}
		if (lastIdx > 0) {
			memberList.pop();
		}
		memberIndex[member] = 0;
		isMember[member] = false;

		if (activeMembersCount > 0) {
			activeMembersCount -= 1;
		}
		emit MemberRemoved(member, reason);

		// If rotation pointer goes out of range, wrap
		if (nextRotationIndex >= memberList.length && memberList.length > 0) {
			nextRotationIndex = nextRotationIndex % memberList.length;
		}
	}

	/// ====== Cycle Control ======

	/// @notice Start the first cycle. Can only be called once by creator when at least 2 members exist.
	function startFirstCycle(SelectionMode mode) external onlyCreator onlyActive {
		require(currentCycleId == 0, "ALREADY_STARTED");
		require(memberList.length >= 2, "NEED_2_MEMBERS");
		require(memberList.length <= maxParticipants, "EXCEEDS_MAX");

		_startNewCycle(mode);
	}

	/// @notice Start next cycle after previous finalized. Anyone can call when ready.
	function startNextCycle(SelectionMode mode) external onlyActive {
		require(currentCycleId > 0, "FIRST_CYCLE_NOT_STARTED");
		Cycle storage prev = cycles[currentCycleId];
		require(prev.finalized, "PREV_NOT_FINALIZED");
		_startNewCycle(mode);
	}

	function _startNewCycle(SelectionMode mode) internal {
		currentCycleId += 1;
		Cycle storage c = cycles[currentCycleId];
		c.id = currentCycleId;
		c.selectionMode = mode;
		c.startTime = block.timestamp;
		c.dueTime = block.timestamp + (contributionFrequencyDays * 1 days);
		c.finalized = false;

		emit CycleStarted(c.id, c.startTime, c.dueTime, mode);
		if (address(badgeMinter) != address(0)) {
			// Optional badge mint signaling start; minting per member on join or payout can also be used
			// Best effort, ignore failures by not performing external calls that could revert
			// For safety, we do not call here to avoid unexpected reverts.
		}
	}

	/// ====== Contributions ======

	/// @notice Contribute USDC for the current cycle. Requires prior USDC approval for contribution + penalty if late.
	/// Late penalty is collected if contributed after dueTime but before grace end.
	function contribute() external onlyMember onlyActive nonReentrant {
		require(currentCycleId > 0, "CYCLE_NOT_STARTED");
		Cycle storage c = cycles[currentCycleId];
		require(!c.finalized, "CYCLE_FINALIZED");
		require(!c.hasContributed[msg.sender], "ALREADY_CONTRIBUTED");

		uint256 penalty = 0;
		bool late = false;

		if (block.timestamp > c.dueTime) {
			uint256 graceEnd = c.dueTime + (gracePeriodDays * 1 days);
			require(block.timestamp <= graceEnd, "GRACE_OVER_MISSED");
			late = true;
			if (penaltyBasisPoints > 0) {
				penalty = (contributionAmount * penaltyBasisPoints) / 10_000;
			}
		}

		uint256 total = contributionAmount + penalty;
		require(usdc.transferFrom(msg.sender, address(this), total), "TRANSFER_FAIL");

		c.hasContributed[msg.sender] = true;
		c.contributors += 1;
		c.totalContributed += contributionAmount;

		if (late) {
			c.isLateContributor[msg.sender] = true;
			lateCountBy[msg.sender] += 1;
			reputationScore[msg.sender] -= 2;
			emit ReputationUpdated(msg.sender, reputationScore[msg.sender], "Late contribution");
		} else {
			reputationScore[msg.sender] += 1;
			emit ReputationUpdated(msg.sender, reputationScore[msg.sender], "On-time contribution");
		}

		emit ContributionMade(currentCycleId, msg.sender, contributionAmount, late, penalty);
	}

	/// @notice Mark members who missed contributions after grace and possibly auto-remove them.
	/// Can be called by anyone after grace period ends.
	function enforceMissed(address[] calldata membersToCheck) external onlyActive {
		require(currentCycleId > 0, "CYCLE_NOT_STARTED");
		Cycle storage c = cycles[currentCycleId];
		require(block.timestamp > c.dueTime + (gracePeriodDays * 1 days), "GRACE_NOT_ENDED");
		require(!c.finalized, "CYCLE_FINALIZED");

		for (uint256 i = 0; i < membersToCheck.length; i++) {
			address m = membersToCheck[i];
			if (isMember[m] && !c.hasContributed[m]) {
				c.hasContributed[m] = true; // lock to avoid duplicate marking
				c.contributors += 1; // counted as decided for cycle
				missedCountBy[m] += 1;
				reputationScore[m] -= 5;
				emit ReputationUpdated(m, reputationScore[m], "Missed contribution");
				emit ContributionMissed(currentCycleId, m);

				if (missedCountBy[m] >= missedLimit) {
					_removeMember(m, "Auto-removed for missed payments");
				}
			}
		}
	}

	/// ====== Auction (escrow bids) ======

	/// @notice Place an auction bid in USDC for the current cycle. Funds are escrowed.
	/// The previous highest bidder is refunded automatically.
	function placeBid(uint256 amount) external onlyMember onlyActive nonReentrant {
		require(currentCycleId > 0, "CYCLE_NOT_STARTED");
		Cycle storage c = cycles[currentCycleId];
		require(!c.finalized, "CYCLE_FINALIZED");
		require(c.selectionMode == SelectionMode.Auction, "NOT_AUCTION");
		require(amount > c.highestBid, "BID_TOO_LOW");

		// Pull funds for new bid
		require(usdc.transferFrom(msg.sender, address(this), amount), "BID_TRANSFER_FAIL");

		// Refund previous highest if exists
		address prev = c.highestBidder;
		if (prev != address(0)) {
			require(usdc.transfer(prev, c.highestBid), "REFUND_FAIL");
		}

		c.bidBy[msg.sender] = amount;
		c.highestBid = amount;
		c.highestBidder = msg.sender;

		emit BidPlaced(currentCycleId, msg.sender, amount, prev);
	}

	/// ====== DAO Voting (1 addr = 1 vote) ======

	/// @notice Cast a vote for a nominee as cycle beneficiary in voting mode
	function castVote(address nominee) external onlyMember onlyActive {
		require(currentCycleId > 0, "CYCLE_NOT_STARTED");
		Cycle storage c = cycles[currentCycleId];
		require(!c.finalized, "CYCLE_FINALIZED");
		require(c.selectionMode == SelectionMode.Vote, "NOT_VOTING");
		require(isMember[nominee], "NOMINEE_NOT_MEMBER");
		require(!c.hasVoted[msg.sender], "ALREADY_VOTED");

		c.hasVoted[msg.sender] = true;
		c.votesFor[nominee] += 1;

		emit VoteCast(currentCycleId, msg.sender, nominee, c.votesFor[nominee]);
	}

	/// ====== Finalization and Payout ======

	/// @notice Finalize the cycle when all contributions are decided (paid/late/missed) or after grace and enforcement.
	/// Selects beneficiary according to selection mode and distributes funds.
	function finalizeAndPayout() external onlyActive nonReentrant {
		require(currentCycleId > 0, "CYCLE_NOT_STARTED");
		Cycle storage c = cycles[currentCycleId];
		require(!c.finalized, "CYCLE_FINALIZED");

		// Ensure all members have resolved status for this cycle
		if (block.timestamp <= c.dueTime + (gracePeriodDays * 1 days)) {
			require(c.contributors >= activeMembersCount, "NOT_ALL_RESOLVED");
		}

		// Decide beneficiary
		if (c.selectionMode == SelectionMode.Rotation) {
			require(memberList.length > 0, "NO_MEMBERS");
			if (nextRotationIndex >= memberList.length) {
				nextRotationIndex = nextRotationIndex % memberList.length;
			}
			c.beneficiary = memberList[nextRotationIndex];
			nextRotationIndex = (nextRotationIndex + 1) % memberList.length;
		} else if (c.selectionMode == SelectionMode.Auction) {
			require(c.highestBidder != address(0), "NO_BIDS");
			c.beneficiary = c.highestBidder;
		} else if (c.selectionMode == SelectionMode.Vote) {
			c.beneficiary = _tallyVotes();
			require(c.beneficiary != address(0), "NO_VOTES");
		} else if (c.selectionMode == SelectionMode.Lottery) {
			c.beneficiary = _lotterySelect();
		} else {
			revert("MODE_UNKNOWN");
		}

		// Payout = total contributions + highest bid (if auction)
		uint256 payout = c.totalContributed;
		uint256 extra = 0;
		if (c.selectionMode == SelectionMode.Auction && c.highestBid > 0) {
			extra = c.highestBid;
			// Auction highest bid remains in contract; add to payout
		}

		uint256 amountToSend = payout + extra;
		require(amountToSend > 0, "NOTHING_TO_PAY");

		c.finalized = true;

		require(usdc.transfer(c.beneficiary, amountToSend), "PAYOUT_FAIL");
		emit PayoutDistributed(currentCycleId, c.beneficiary, payout, extra);

		// Reputation bump for beneficiary (successful cycle)
		reputationScore[c.beneficiary] += 1;
		emit ReputationUpdated(c.beneficiary, reputationScore[c.beneficiary], "Received payout");

		// Optional badge mint on payout
		if (address(badgeMinter) != address(0)) {
			// External call intentionally omitted to avoid revert risk
			// badgeMinter.mint(c.beneficiary, uint256(uint160(address(this))), currentCycleId);
		}
	}

	/// @dev Tally votes to find the nominee with the highest votes (ties broken by lower address)
	function _tallyVotes() internal view returns (address winner) {
		Cycle storage c = cycles[currentCycleId];
		uint256 bestVotes = 0;
		address best = address(0);
		uint256 n = memberList.length;
		for (uint256 i = 0; i < n; i++) {
			address m = memberList[i];
			uint256 v = c.votesFor[m];
			if (v > bestVotes || (v == bestVotes && v > 0 && m < best)) {
				bestVotes = v;
				best = m;
			}
		}
		return best;
	}

	/// @dev Simple on-chain lottery using block data (Chainlink VRF recommended for production)
	function _lotterySelect() internal view returns (address) {
		require(memberList.length > 0, "NO_MEMBERS");
		uint256 seed = uint256(keccak256(abi.encodePacked(blockhash(block.number - 1), address(this), currentCycleId, block.timestamp)));
		uint256 idx = seed % memberList.length;
		return memberList[idx];
	}

	/// ====== Governance ======

	/// @notice Create a proposal for group governance
	/// - ChangeRule: paramUint used to update a rule (see execute)
	/// - RemoveMember: paramAddress is target member
	/// - PauseGroup/ResumeGroup/EndGroup: no params needed
	function createProposal(ProposalType pType, address paramAddress, uint256 paramUint) external onlyMember onlyActive returns (uint256) {
		uint256 pid = ++nextProposalId;
		Proposal storage p = proposals[pid];
		p.id = pid;
		p.proposalType = pType;
		p.paramAddress = paramAddress;
		p.paramUint = paramUint;
		p.executed = false;
		emit ProposalCreated(pid, pType, paramAddress, paramUint);
		return pid;
	}

	/// @notice Vote on a proposal (1 address = 1 vote). Majority (>50% of current members) wins.
	function voteProposal(uint256 proposalId, bool support) external onlyMember {
		Proposal storage p = proposals[proposalId];
		require(p.id != 0, "NO_PROPOSAL");
		require(!p.executed, "EXECUTED");
		require(!p.hasVoted[msg.sender], "ALREADY_VOTED");

		p.hasVoted[msg.sender] = true;
		if (support) {
			p.yesVotes += 1;
		} else {
			p.noVotes += 1;
		}
		emit ProposalVoted(proposalId, msg.sender, support, p.yesVotes, p.noVotes);

		// Optional auto-execute if majority reached now
		if (p.yesVotes > activeMembersCount / 2) {
			_executeProposal(proposalId);
		}
	}

	/// @notice Execute proposal if majority reached
	function executeProposal(uint256 proposalId) external {
		_executeProposal(proposalId);
	}

	function _executeProposal(uint256 proposalId) internal {
		Proposal storage p = proposals[proposalId];
		require(p.id != 0, "NO_PROPOSAL");
		require(!p.executed, "EXECUTED");
		require(p.yesVotes > activeMembersCount / 2, "NO_MAJORITY");

		if (p.proposalType == ProposalType.ChangeRule) {
			// paramUint interpretation:
			// upper 64 bits each: penaltyBps | graceDays | missedLimit | contributionAmount | frequencyDays
			// For simplicity, we support targeted setters instead; or use paramUint as packed is more complex.
			// Here, we choose: paramUint is ignored and rules are changed via specific setters below using proposals as signaling.
			// To keep it simple, we just mark executed; Admin can act on offchain signal or you can extend to encode specific changes.
			// (Alternatively, deploy separate proposals for each setter.)
		} else if (p.proposalType == ProposalType.RemoveMember) {
			require(p.paramAddress != address(0), "NO_TARGET");
			if (isMember[p.paramAddress]) {
				_removeMember(p.paramAddress, "Governance removal");
			}
		} else if (p.proposalType == ProposalType.PauseGroup) {
			_setStatus(Status.Paused);
		} else if (p.proposalType == ProposalType.ResumeGroup) {
			_setStatus(Status.Active);
		} else if (p.proposalType == ProposalType.EndGroup) {
			_setStatus(Status.Ended);
		}

		p.executed = true;
		emit ProposalExecuted(proposalId);
	}

	/// ====== Admin / Creator Controls ======

	/// @notice Creator can end the group
	function endGroup() external onlyCreator {
		_setStatus(Status.Ended);
	}

	/// @notice Creator can pause the group
	function pauseGroup() external onlyCreator {
		_setStatus(Status.Paused);
	}

	/// @notice Creator can resume the group
	function resumeGroup() external onlyCreator {
		_setStatus(Status.Active);
	}

	/// @notice Set optional badge minter
	function setBadgeMinter(address minter) external onlyCreator {
		badgeMinter = IXitiqueBadge(minter);
		emit BadgeMinterUpdated(minter);
	}

	/// @notice Update penalty (BPS)
	function setPenaltyBasisPoints(uint256 bps) external onlyCreator {
		require(bps <= 2_000, "PENALTY_TOO_HIGH"); // <=20%
		penaltyBasisPoints = bps;
	}

	/// @notice Update grace period in days
	function setGracePeriodDays(uint256 days_) external onlyCreator {
		require(days_ <= 14, "TOO_LONG");
		gracePeriodDays = days_;
	}

	/// @notice Update missed limit threshold
	function setMissedLimit(uint256 limit) external onlyCreator {
		require(limit >= 1 && limit <= 5, "INVALID_LIMIT");
		missedLimit = limit;
	}

	/// @notice Update contribution amount (takes effect next cycles)
	function setContributionAmount(uint256 amount) external onlyCreator {
		require(amount > 0, "AMOUNT_ZERO");
		contributionAmount = amount;
	}

	/// @notice Update frequency days (takes effect next cycles)
	function setContributionFrequencyDays(uint256 days_) external onlyCreator {
		require(days_ >= 1 && days_ <= 365, "INVALID_DAYS");
		contributionFrequencyDays = days_;
	}

	/// ====== Internal ======

	function _setStatus(Status s) internal {
		Status prev = status;
		status = s;
		emit StatusChanged(prev, s);
	}

	/// ====== Safety Getters for off-chain tools ======

	/// @notice Returns whether a member has contributed in current cycle
	function hasContributed(address member) external view returns (bool) {
		return cycles[currentCycleId].hasContributed[member];
	}

	/// @notice Returns whether a member was late in current cycle
	function isLateContributor(address member) external view returns (bool) {
		return cycles[currentCycleId].isLateContributor[member];
	}

	/// @notice Get votes received by a nominee in current cycle
	function votesFor(address nominee) external view returns (uint256) {
		return cycles[currentCycleId].votesFor[nominee];
	}

	/// @notice Get current highest bid and bidder
	function currentHighestBid() external view returns (address bidder, uint256 amount) {
		Cycle storage c = cycles[currentCycleId];
		return (c.highestBidder, c.highestBid);
	}
}
