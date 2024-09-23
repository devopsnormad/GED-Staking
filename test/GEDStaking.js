const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StakingPool", function () {
    let stakingToken, rewardNFT, stakingPool, stakingPoolAddress, stakingTokenAddress, rewardNFTAddress;
    let owner, user1, user2;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();
    
        const Token = await ethers.getContractFactory("GEDStakingToken");
        stakingToken = await Token.deploy(10000);
        stakingTokenAddress = await stakingToken.getAddress();
        console.log("StakingToken deployed to:", stakingTokenAddress);
       
        const NFT = await ethers.getContractFactory("GEDNFT");
        rewardNFT = await NFT.deploy();
        rewardNFTAddress = await rewardNFT.getAddress();
        console.log("RewardNFT deployed to:", rewardNFTAddress);
       
        const StakingPool = await ethers.getContractFactory("StakingPool");
        stakingPool = await StakingPool.deploy(stakingTokenAddress, rewardNFTAddress);
        stakingPoolAddress = await stakingPool.getAddress();
        console.log("StakingPool deployed to:", stakingPoolAddress);
        
        
        await stakingToken.transfer(user1.address, 5000);
        await stakingToken.transfer(user2.address, 5000);

        expect(stakingTokenAddress).to.properAddress;
        expect(rewardNFTAddress).to.properAddress;
        expect(stakingPoolAddress).to.properAddress;

    });
    
  

    it("should allow a user to stake tokens in a pool", async function () {
        const stakeAmount = 1000;
        await stakingToken.connect(user1).approve(stakingPoolAddress, stakeAmount);
        console.log(stakingPoolAddress);
        await expect(stakingPool.connect(user1).stake(0, stakeAmount))
            .to.emit(stakingPool, "Staked")
            .withArgs(user1.address, 0, stakeAmount);

        const userStake = await stakingPool.getUserStake(user1.address, 0);
        expect(userStake).to.equal(stakeAmount);
    });

    it("should allow unstaking before maturity without rewards", async function () {
        const stakeAmount = 1000;
        await stakingToken.connect(user1).approve(stakingPoolAddress, stakeAmount);
        await stakingPool.connect(user1).stake(0, stakeAmount);

        await expect(stakingPool.connect(user1).unstake(0))
            .to.emit(stakingPool, "Unstaked")
            .withArgs(user1.address, 0, stakeAmount, false);

        // Verify no rewards were minted
        expect(await rewardNFT.balanceOf(user1.address, 1)).to.equal(0);
    });

    it("should allow unstaking with NFT rewards after maturity", async function () {
        const stakeAmount = 1000;
        await stakingToken.connect(user1).approve(stakingPoolAddress, stakeAmount);
        await stakingPool.connect(user1).stake(0, stakeAmount);

        await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
        await ethers.provider.send("evm_mine");

        await expect(stakingPool.connect(user1).unstake(0))
        .to.emit(stakingPool, "Unstaked")
        .withArgs(user1.address, 0, stakeAmount, true); // Expect true after maturity
    

        // Verify NFT rewards
        expect(await rewardNFT.balanceOf(user1.address, 1)).to.equal(20); // Reward based on APY
    });

    it("should prevent staking with invalid poolId", async function () {
        const stakeAmount = 1000;
        await stakingToken.connect(user1).approve(stakingPoolAddress, stakeAmount);

        await expect(stakingPool.connect(user1).stake(10, stakeAmount))
            .to.be.revertedWith("Invalid pool ID");
    });

    it("should allow a user to stake multiple times", async function () {
        const stakeAmount1 = 1000;
        const stakeAmount2 = 2000;
    
        await stakingToken.connect(user1).approve(stakingPoolAddress, stakeAmount1);
        await stakingPool.connect(user1).stake(0, stakeAmount1);
    
        await stakingToken.connect(user1).approve(stakingPoolAddress, stakeAmount2);
        await stakingPool.connect(user1).stake(0, stakeAmount2);
    
        const userStakes = await stakingPool.getStakes(user1.address);
        expect(userStakes.length).to.equal(2);
        expect(userStakes[0].amount).to.equal(stakeAmount1);
        expect(userStakes[1].amount).to.equal(stakeAmount2);
    });
    
    it("should allow unstaking with NFT rewards after maturity", async function () {
        const stakeAmount = 1000;
        await stakingToken.connect(user1).approve(stakingPoolAddress, stakeAmount);
        await stakingPool.connect(user1).stake(0, stakeAmount);
    
        // Fast forward time to maturity
        await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
        await ethers.provider.send("evm_mine");
    
        await expect(stakingPool.connect(user1).unstake(0))
            .to.emit(stakingPool, "Unstaked")
            .withArgs(user1.address, 0, stakeAmount, true);
    
        // Verify NFT rewards
        expect(await rewardNFT.balanceOf(user1.address, 1)).to.equal(20); // Adjust based on your reward calculation
    });
    it("should allow unstaking before maturity without rewards", async function () {
        const stakeAmount = 1000;
        await stakingToken.connect(user1).approve(stakingPoolAddress, stakeAmount);
        await stakingPool.connect(user1).stake(0, stakeAmount);
    
        await expect(stakingPool.connect(user1).unstake(0))
            .to.emit(stakingPool, "Unstaked")
            .withArgs(user1.address, 0, stakeAmount, false);
    
        // Verify no rewards were minted
        expect(await rewardNFT.balanceOf(user1.address, 1)).to.equal(0);
    });
    it("should prevent staking and unstaking with invalid pool ID", async function () {
        const stakeAmount = 1000;
        await stakingToken.connect(user1).approve(stakingPoolAddress, stakeAmount);
    
        await expect(stakingPool.connect(user1).stake(10, stakeAmount))
            .to.be.revertedWith("Invalid pool ID");
    
        await expect(stakingPool.connect(user1).unstake(10))
            .to.be.revertedWith("Invalid pool ID");
    });
    it("should prevent unstaking more than staked amount", async function () {
        const stakeAmount = 1000;
        await stakingToken.connect(user1).approve(stakingPoolAddress, stakeAmount);
        await stakingPool.connect(user1).stake(0, stakeAmount);
    
        await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
        await ethers.provider.send("evm_mine");
    
        // Unstake the full amount first
        await expect(stakingPool.connect(user1).unstake(0))
            .to.emit(stakingPool, "Unstaked")
            .withArgs(user1.address, 0, stakeAmount, true);
    
        // Verify that the stake is now marked as withdrawn
        const userStakes = await stakingPool.getStakes(user1.address);
        expect(userStakes[0].withdrawn).to.be.true;
    
        // Attempt to unstake again and expect revert
        await expect(stakingPool.connect(user1).unstake(0))
            .to.be.revertedWith("Already withdrawn");
    });
    
});
