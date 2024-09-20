const { ethers, network } = require("hardhat");

async function deploy() {
  const [deployer] = await ethers.getSigners();

  console.log(`Deploying contracts with account: ${deployer.address}`);

  // Deploy GEDStakingToken
  const Token = await ethers.getContractFactory("GEDStakingToken");
  const token = await Token.deploy(1000000);
  await token.waitForDeployment();

  console.log(`GEDStakingToken deployed to: ${token.address}`);

  // Deploy GEDNFT
  const NFT = await ethers.getContractFactory("GEDNFT");
  const nft = await NFT.deploy("https://brown-definite-snake-356.mypinata.cloud/ipfs/QmcntrmXc2QcByjobpD5og65DeTJJ2fo28wNmjmgKW7Cgt/");
  await nft.waitForDeployment();

  console.log(`GEDNFT deployed to: ${nft.address}`);

  // Deploy Staking
  const Staking = await ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(token.address, nft.address);
  await staking.waitForDeployment();

  console.log(`Staking deployed to: ${staking.address}`);
}

deploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
