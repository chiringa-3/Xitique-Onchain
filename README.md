# 💡 Xitique Onchain — Decentralized Community Savings on Hedera

> "Because saving together is part of our culture — and now it’s part of the blockchain."

Xitique Onchain is a decentralized community savings contract (ROSCA model) built on Solidity.  
It enables groups to contribute stable amounts in **USDT/USDC**, rotating payouts to members based on various mechanisms.
---

## 🎯 The Problem
Across Africa, millions of people rely on informal community savings systems — known as **Xitique**, **Stokvel**, or **Tontine** — to pool funds and help each other save and access small loans.  

However, these traditional systems face critical challenges:
- ❌ **Lack of transparency** — members must trust one coordinator.  
- ⚠️ **Risk of fraud or mismanagement.**  
- 🕒 **Manual and time-consuming** contribution process.  
- 🌍 **Diaspora communities** struggle to participate remotely.  

In short, the system works — but **trust doesn’t scale**.

---

## 💡 The Solution — Xitique Onchain
**Xitique Onchain** transforms Africa’s traditional community savings model into a **transparent, automated, and trustless Web3 experience**, powered by **Hedera Smart Contracts**.

It’s a **decentralized ROSCA (Rotating Savings and Credit Association)** that:
- Automates contributions and payouts in **stablecoins (e.g., USDC)**.  
- Eliminates the need for a human coordinator.  
- Guarantees **fairness and transparency** through on-chain logic.  
- Enables **global participation** — diaspora members can join from anywhere.  
- Records all actions immutably on the **Hedera network**.

Trust is no longer personal — it’s programmable.

---

## ⚙️ How It Works
1. **Create or Join a Group**  
   Define the contribution amount, frequency, and maximum number of members.

2. **Contribute Automatically**  
   Members deposit stablecoins into the group’s smart contract.

3. **Receive Payouts**  
   Each round, one member receives the pooled funds, determined by:
   - Rotation (default)  
   - DAO Voting (for emergencies)  
   - Auction (highest bid wins priority)

4. **On-Chain Reputation**  
   Members earn trust scores based on their contribution history.

5. **Auto-Restart or Close**  
   Once all rounds are complete, the group can restart or end automatically.

---

## 💰 DeFi Integration (Future Phase)
Idle funds between rounds can be invested in **DeFi protocols (like Aave)** to generate yield, increasing group value and rewarding active members.

---

## 🧩 Why Hedera?
- ⚡ **Near-zero transaction fees**    
- 🔒 **Fair consensus and timestamping**  
- 🌐 **EVM compatible** (runs Solidity contracts seamlessly)  
- 💼 **Perfect for inclusive, scalable financial systems**

---

## 🌍 Market Opportunity
- 400+ million Africans use informal savings groups every month.  
- Over **$10 billion USD** circulates annually through ROSCAs in Sub-Saharan Africa.  
- Xitique Onchain digitizes this trusted model and makes it **borderless, transparent, and secure**.  

---

## 💸 Revenue Model
- **1% service fee** per completed savings cycle (optional early phase)  
- **Premium DAO tools** for governance automation  
- **DeFi yield optimization** on idle funds  
- **Partnerships** with NGOs, cooperatives, and microfinance institutions  

---

## 🧱 Tech Stack
- **Smart Contracts:** Solidity on Hedera EVM  
- **Frontend:** React (mobile-first)  
- **Wallets:** HashPack, MetaMask  
- **Consensus Layer:** Hedera Consensus Service (HCS)  
- **Storage:** IPFS / on-chain metadata  

---

## 👤 Founder
**Luis Chiringatambo**   
Experienced in **DeFi**, **Web3 testing**, and **smart contract integration**.  
Driven by the mission to promote **financial inclusion and digital empowerment** across Africa.

---

## 🚀 Current Stage
- ✅ Smart contract developed in Solidity  
- ✅ App prototype completed  
- 🔬 Testing and deployment on **Hedera Testnet**  
- 📊 Pitch deck and certifications included below  

---

## 🌱 Social Impact
- 🌍 Enables **financial inclusion** for unbanked communities.  
- 🔗 Builds **transparent, trustless** cooperative savings networks.  
- 💪 Empowers **diaspora participation** in local economies.  
- ❤️ Preserves **African savings traditions** through modern Web3 technology.  

---

## 📎 Certifications & Pitch Deck 
- Hedera Certification PDF: (docs/Hashgraph_Developer_Course_Certificate.pdf)
- Pitch Deck PDF: (docs/Xitique-Onchain-Decentralized-Community-_Pitch_deck.pdf) 
 
---

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
