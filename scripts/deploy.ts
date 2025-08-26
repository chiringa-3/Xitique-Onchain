import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("Starting Xitique contract deployment...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Contract parameters
  const groupName = "Test Xitique Group";
  const groupSymbol = "TXG";
  const contributionAmount = ethers.parseUnits("100", 6); // 100 USDT (6 decimals)
  const frequencyDays = 30; // Monthly
  const maxParticipants = 10;
  
  // USDT contract address on Hedera testnet (replace with actual address)
  const usdtTokenAddress = "0x00000000000000000000000000000000002625a0";

  console.log("\nDeployment parameters:");
  console.log("- Group Name:", groupName);
  console.log("- Group Symbol:", groupSymbol);
  console.log("- Contribution Amount:", ethers.formatUnits(contributionAmount, 6), "USDT");
  console.log("- Frequency:", frequencyDays, "days");
  console.log("- Max Participants:", maxParticipants);
  console.log("- USDT Token Address:", usdtTokenAddress);

  // Deploy the contract
  const XitiqueFactory = await ethers.getContractFactory("Xitique");
  const xitique = await XitiqueFactory.deploy(
    groupName,
    groupSymbol,
    contributionAmount,
    frequencyDays,
    maxParticipants,
    usdtTokenAddress
  );

  console.log("\nDeploying contract...");
  await xitique.waitForDeployment();

  const contractAddress = await xitique.getAddress();
  console.log("✅ Xitique contract deployed to:", contractAddress);

  // Verify deployment by calling a view function
  try {
    const groupInfo = await xitique.getGroupInfo();
    console.log("\n📋 Contract verification:");
    console.log("- Contract Name:", groupInfo.name);
    console.log("- Contract Symbol:", groupInfo.symbol);
    console.log("- Creator:", groupInfo.creator);
    console.log("- Is Active:", groupInfo.isActive);
    console.log("- Total Members:", groupInfo.totalMembers.toString());
  } catch (error) {
    console.log("⚠️  Could not verify contract deployment:", error);
  }

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📝 Save this contract address for your application:");
  console.log(`VITE_XITIQUE_ADDRESS=${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });