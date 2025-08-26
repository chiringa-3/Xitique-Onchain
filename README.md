# Xitique-Onchain

**Xitique Web3** is a decentralized community savings contract (ROSCA model) built on Solidity.  
It enables groups to contribute stable amounts in **USDT**, rotating payouts to members based on various mechanisms.

## 🧩 Features

- 💸 **Periodic contributions** in USDT
- 🌀 **Flexible payout selection modes**:
  - Rotation (round-robin)
  - Auction (highest bidder wins)
  - DAO-style voting (1 address = 1 vote)
  - Lottery (pseudo-random selection)
- ⏰ **Late penalties** and automatic member removal
- 📊 **Reputation system** based on participation behavior
- 🗳️ **On-chain governance** with proposal creation and voting
- 🏅 Optional **NFT badge minter** for proof of participation

## ⚙️ Technical Details

- Written in **Solidity `^0.8.20`**
- Works with any **ERC-20 token** (designed for USDT)
- Includes **reentrancy guard**
- Emits detailed **events** for full transparency
- Modular design for cycle logic, membership, and governance

## 🛡️ Reputation Rules

| Behavior               | Reputation Impact |
|------------------------|-------------------|
| On-time contribution   | +1                |
| Late contribution      | -2 + penalty fee  |
| Missed contribution    | -5 + possible removal |

## 🔐 Security

- Token transfer validation (`transferFrom`, `transfer`)
- `nonReentrant` modifiers on fund-moving functions
- Access-restricted modifiers: `onlyMember`, `onlyCreator`, etc.
- Graceful fallback when badge minting fails

## 🚀 Getting Started

To deploy and test:

```bash
git clone https://github.com/chiringa-3/xitique-Onchain.git
cd xitique-smart-contract

# compile with your preferred framework (e.g. Hardhat, Foundry, Remix)
