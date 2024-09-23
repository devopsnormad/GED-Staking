const fs = require("fs");
const { ethers } = require("hardhat");

async function deploy() {
  const [owner] = await ethers.getSigners();

  // Deploy GEDStakingToken
  const GEDStakingToken = await ethers.getContractFactory("GEDStakingToken");
  const token = await GEDStakingToken.deploy(10000);
  await token.waitForDeployment(); // Wait for deployment to complete
  const tokenAddress = await token.getAddress();
  console.log("Token Address:", tokenAddress);

  // Deploy GEDNFT
  const GEDNFT = await ethers.getContractFactory("GEDNFT");
  const nftContract = await GEDNFT.deploy();
  await nftContract.waitForDeployment();
  const nftAddress = await nftContract.getAddress();
  console.log("NFT Contract Address:", nftAddress);

  // Deploy StakingPool
  const StakingPool = await ethers.getContractFactory("StakingPool");
  const stakingPool = await StakingPool.deploy(tokenAddress, nftAddress);
  await stakingPool.waitForDeployment();
  const stakingPoolAddress = await stakingPool.getAddress();
  console.log("Staking Pool Address:", stakingPoolAddress);

  // Log owner address
  console.log("Deployed by owner:", owner.address);

  // Save addresses to a JSON file
  const addresses = {
    token: tokenAddress,
    nft: nftAddress,
    stakingPool: stakingPoolAddress,
    owner: owner.address
  };
  fs.writeFileSync("deployments.json", JSON.stringify(addresses, null, 2));
}

deploy().catch((error) => {
  console.error("Error during deployment:", error);
  process.exit(1);
});
