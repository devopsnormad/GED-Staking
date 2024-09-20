const { expect } = require("chai");
const { ethers } = require("hardhat");  // Import ethers from Hardhat

describe("GED Staking Pool", function () {
    let owner, addr1, addr2;
    let gedToken, gedNFT, stakingContract;

    beforeEach(async function () {
        // Get signers
        [owner, addr1, addr2] = await ethers.getSigners();

        // Deploy GEDStakingToken (initial supply 1 million tokens)
        const GEDStakingToken = await ethers.getContractFactory("GEDStakingToken");
        const totalSupply = BigInt(1000000) * BigInt(10 ** 18); 
        await gedToken.deployed();

        // Deploy GEDNFT
        const GEDNFT = await ethers.getContractFactory("GEDNFT");
        gedNFT = await GEDNFT.deploy("https://brown-definite-snake-356.mypinata.cloud/ipfs/QmcntrmXc2QcByjobpD5og65DeTJJ2fo28wNmjmgKW7Cgt/");
        await gedNFT.deployed();

        // Deploy Staking Contract
        const Staking = await ethers.getContractFactory("Staking");
        stakingContract = await Staking.deploy(gedToken.address, gedNFT.address);
        await stakingContract.deployed();

        // Approve staking contract to transfer tokens on behalf of addr1 and addr2
        await gedToken.connect(addr1).approve(stakingContract.address, ethers.utils.parseEther("1000"));
        await gedToken.connect(addr2).approve(stakingContract.address, ethers.utils.parseEther("1000"));

        // Mint some tokens to addr1 and addr2
        await gedToken.transfer(addr1.address, ethers.utils.parseEther("1000"));
        await gedToken.transfer(addr2.address, ethers.utils.parseEther("1000"));
    });

    it("Should stake tokens", async function () {
        // Addr1 stakes 100 tokens
        await stakingContract.connect(addr1).createStake(ethers.utils.parseEther("100"));

        const stake = await stakingContract.stakeholderToStake(addr1.address);
        expect(stake.stakedGED).to.equal(ethers.utils.parseEther("100"));
    });

    it("Should mint NFT as rewards when removing stake", async function () {
        // Addr1 stakes 100 tokens
        await stakingContract.connect(addr1).createStake(ethers.utils.parseEther("100"));

        // Addr1 removes 50 tokens of their stake
        await stakingContract.connect(addr1).removeStake(ethers.utils.parseEther("50"));

        const stake = await stakingContract.stakeholderToStake(addr1.address);
        expect(stake.stakedGED).to.equal(ethers.utils.parseEther("50"));

        // Check that an NFT was minted to addr1
        const nftBalance = await gedNFT.balanceOf(addr1.address, 1); // Token ID 1
        expect(nftBalance).to.equal(1);
    });

    it("Should handle multiple stakes", async function () {
        // Addr1 stakes 100 tokens
        await stakingContract.connect(addr1).createStake(ethers.utils.parseEther("100"));

        // Addr2 stakes 200 tokens
        await stakingContract.connect(addr2).createStake(ethers.utils.parseEther("200"));

        const stakeAddr1 = await stakingContract.stakeholderToStake(addr1.address);
        const stakeAddr2 = await stakingContract.stakeholderToStake(addr2.address);

        expect(stakeAddr1.stakedGED).to.equal(ethers.utils.parseEther("100"));
        expect(stakeAddr2.stakedGED).to.equal(ethers.utils.parseEther("200"));
    });

    it("Should fail if trying to remove more stake than available", async function () {
        // Addr1 stakes 100 tokens
        await stakingContract.connect(addr1).createStake(ethers.utils.parseEther("100"));

        // Attempt to remove more than staked amount should fail
        await expect(stakingContract.connect(addr1).removeStake(ethers.utils.parseEther("150")))
            .to.be.revertedWith("Not enough staked!");
    });
});
