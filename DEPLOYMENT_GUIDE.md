# Xitique Smart Contract Deployment Guide

Since we're encountering Node.js version compatibility issues with Hardhat, here's how to deploy your Xitique smart contract using Remix IDE:

## Method 1: Using Remix IDE (Recommended)

### Step 1: Prepare Your Wallet
1. Install MetaMask if you haven't already
2. Add Hedera Testnet to MetaMask:
   - **Network Name**: Hedera Testnet
   - **RPC URL**: `https://testnet.hashio.io/api`
   - **Chain ID**: `296`
   - **Currency Symbol**: HBAR
   - **Block Explorer**: `https://hashscan.io/testnet`

### Step 2: Get Test HBAR
1. Visit the Hedera faucet: https://portal.hedera.com/faucet
2. Request test HBAR for your MetaMask address

### Step 3: Deploy the Contract
1. **Open Remix**: Go to https://remix.ethereum.org/
2. **Create Contract File**: 
   - Click "Create New File"
   - Name it `Xitique.sol`
   - Copy the entire contract code from `contracts/Xitique.sol`
3. **Compile the Contract**:
   - Go to "Solidity Compiler" tab
   - Set compiler version to `0.8.20`
   - Enable optimization with 200 runs
   - Click "Compile Xitique.sol"
4. **Deploy**:
   - Go to "Deploy & Run Transactions" tab
   - Set Environment to "Injected Provider - MetaMask"
   - Ensure MetaMask is connected to Hedera Testnet
   - Select "Xitique" from the contract dropdown
   - Enter constructor parameters:
     ```
     _name: "Test Xitique Group"
     _symbol: "TXG"
     _contributionAmount: 100000000
     _frequencyDays: 30
     _maxParticipants: 10
     _usdtToken: 0x00000000000000000000000000000000002625a0
     ```
   - Click "Deploy"
   - Confirm the transaction in MetaMask

### Step 4: Save Contract Address
1. After successful deployment, copy the contract address
2. Add it to your environment variables:
   ```
   VITE_XITIQUE_ADDRESS=<your_deployed_contract_address>
   ```

## Method 2: Using Node.js Script (Alternative)

If you prefer using a script, run:
```bash
node deploy-contract.js
```

This will provide you with deployment instructions and create the necessary files.

## Constructor Parameters Explanation

- **_name**: Display name for your savings group
- **_symbol**: Short symbol for the group  
- **_contributionAmount**: Amount in USDT (with 6 decimals, so 100000000 = 100 USDT)
- **_frequencyDays**: How often cycles occur (30 = monthly)
- **_maxParticipants**: Maximum number of group members
- **_usdtToken**: USDT contract address on Hedera

## Testing the Deployment

After deployment, you can verify the contract is working by:
1. Calling `getGroupInfo()` to see group details
2. Checking `isMember()` with your address (should return true)
3. Viewing `getMemberList()` to see you're the first member

## Troubleshooting

- **Transaction Failed**: Ensure you have enough HBAR for gas fees
- **Network Issues**: Verify you're connected to the correct Hedera network
- **Compilation Errors**: Make sure you're using Solidity 0.8.20
- **MetaMask Issues**: Try refreshing the page and reconnecting

Once deployed, your Xitique application will be able to interact with the real smart contract on Hedera!