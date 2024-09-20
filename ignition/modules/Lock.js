const { ethers } = require("hardhat");

async function main() {
  // Get the contract factory
  const GEDNFTFactory = await ethers.getContractFactory("GEDNFT");

  // Deploy the contract with the baseURI as an argument
  const baseURI = "https://brown-definite-snake-356.mypinata.cloud/ipfs/QmcntrmXc2QcByjobpD5og65DeTJJ2fo28wNmjmgKW7Cgt/";
  const gedNFT = await GEDNFTFactory.deploy(baseURI);

  // Wait for the transaction to be mined
  await gedNFT.deployed();

  // Retrieve and log the contract address
  const contractAddress = gedNFT.address;
  console.log("GEDNFT contract deployed to:", contractAddress);
}

// Execute the main function and catch any errors
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
