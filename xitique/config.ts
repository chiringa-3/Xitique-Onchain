// Map your real contract function names here.
// If a mapping is empty/null, the dashboard will switch that action to "Simulate mode".
export const XCFG = {
  // ERC-20 token config
  tokenAddress: import.meta.env.VITE_ERC20_ADDRESS || "",   // if blank, will try contract.token()
  tokenDecimals: 18, // adjust to your token

  // Contract function names (edit to match your ABI when ready)
  fns: {
    createGroup: "createGroup",            // (name:string, weeklyAmount:uint256, members:uint256?) -> groupId
    joinGroup: "joinGroup",                // (groupId:uint256)
    invite: "",                            // (groupId:uint256, invitee:address)  // optional
    contribute: "contribute",              // (groupId:uint256, amount:uint256)
    payPenalty: "payPenalty",              // (groupId:uint256, amount:uint256?)  // or no amount if computed on-chain
    vote: "castVote",                      // (proposalId:uint256, choice:uint8|bool)
    placeBid: "",                          // optional for auction-based payout
    getGroup: "getGroup",                  // (groupId:uint256) -> returns group info (optional for views)
    groupCount: "groupCount"               // () -> uint256 (optional)
  }
} as const;