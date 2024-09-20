const { expect } = require("chai");
const { ethers } = require("hardhat");


const INITIAL_STAKE_AMOUNT = "1000000000000000000000000";
const BASE_URI = "https://brown-definite-snake-356.mypinata.cloud/ipfs/QmcntrmXc2QcByjobpD5og65DeTJJ2fo28wNmjmgKW7Cgt/";

describe("Staking Contract", function () {
    let staking;
    let gedStakingToken;
    let gedNFT;
    let owner;
    let addr1;
    let addr2;

    
    beforeEach(async function () {
        try {
          [owner, addr1, addr2] = await ethers.getSigners();
    
          const GedStakingToken = await ethers.getContractFactory("GEDStakingToken");
          gedStakingToken = await GedStakingToken.deploy(INITIAL_STAKE_AMOUNT).catch((error) => {
            console.error("Error deploying GEDStakingToken:", error);
          });
    
          const GedNFT = await ethers.getContractFactory("GEDNFT");
          gedNFT = await GedNFT.deploy(BASE_URI).catch((error) => {
            console.error("Error deploying GEDNFT:", error);
          });
    
          const GedStakingPool = await ethers.getContractFactory("Staking");
          staking = await GedStakingPool.deploy(gedStakingToken.address, gedNFT.address).catch((error) => {
            console.error("Error deploying Staking:", error);
          });
        } catch (error) {
          console.error("Deployment error:", error);
        }
      });

    // it("Should set the initial ratio with the first stake", async function () {
    //     await gedStakingToken.connect(addr1).approve(staking.address, 500);

    //     const block = await hre.ethers.provider.getBlock("latest");
        
    //     if (!block) {
    //         throw new Error("Failed to get the latest block");
    //     }

    //     // Use block.timestamp for the event assertion
    //     await expect(staking.connect(addr1).setInitialRatio(500))
    //         .to.emit(staking, "StakeAdded")
    //         .withArgs(addr1.address, 500, 500, block.timestamp);

    //     expect(await staking.totalStakes()).to.equal(500);
    //     expect(await staking.totalShares()).to.equal(500);
    // });

    it("Should allow creating a stake", async function () {
        await gedStakingToken.connect(addr1).approve(staking.address, 200);
        await staking.connect(addr1).setInitialRatio(500);

        await expect(staking.connect(addr1).createStake(200))
            .to.emit(staking, "StakeAdded")
            .withArgs(addr1.address, 200, 200);

        expect(await staking.totalStakes()).to.equal(700);
    });

//     it("Should allow removing a stake and mint rewards", async function () {
//         await gedStakingToken.connect(addr1).approve(staking.address, 500);
//         await staking.connect(addr1).setInitialRatio(500);
//         await staking.connect(addr1).createStake(200);

//         await expect(staking.connect(addr1).removeStake(200))
//             .to.emit(staking, "StakeRemoved")
//             .withArgs(addr1.address, 200);

//         expect(await staking.totalStakes()).to.equal(500);
//     });

//     it("Should fail if trying to remove more than staked", async function () {
//         await gedStakingToken.connect(addr1).approve(staking.address, 500);
//         await staking.connect(addr1).setInitialRatio(500);

//         await expect(staking.connect(addr1).removeStake(600))
//             .to.be.revertedWith("Not enough staked!");
//     });

//     it("Should revert if trying to set initial ratio more than once", async function () {
//         await gedStakingToken.connect(addr1).approve(staking.address, 500);
        
//         await staking.connect(addr1).setInitialRatio(500);
        
//         await expect(staking.connect(addr1).setInitialRatio(300))
//             .to.be.revertedWith("Initial Ratio has already been set");
//     });

//     it("Should not allow zero stake", async function () {
//         await expect(staking.connect(addr1).createStake(0))
//             .to.be.revertedWith("Amount must be greater than zero");
//     });
});
