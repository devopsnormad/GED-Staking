// Import the ethers library from Hardhat
const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with account:", deployer.address);

    // Define total supply directly
    const totalSupply = BigInt(1000000) * BigInt(10 ** 18);

    // Deploy the GEDToken contract
    const GEDToken = await ethers.getContractFactory("GEDStakingToken");
    const gedToken = await GEDToken.deploy(totalSupply.toString());  
    await gedToken.deployed();
    console.log("GEDToken deployed to:", gedToken.address);

    // Deploy the GEDNFT contract
    const GEDNFT = await ethers.getContractFactory("GEDNFT");
    const gedNFT = await GEDNFT.deploy("https://brown-definite-snake-356.mypinata.cloud/ipfs/QmcntrmXc2QcByjobpD5og65DeTJJ2fo28wNmjmgKW7Cgt/");
    await gedNFT.deployed();
    console.log("GEDNFT deployed to:", gedNFT.address);

    // Deploy the Staking contract
    const Staking = await ethers.getContractFactory("Staking");
    const stakingContract = await Staking.deploy(gedToken.address, gedNFT.address);
    await stakingContract.deployed();
    console.log("Staking contract deployed to:", stakingContract.address);
}

// Run the main function
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
