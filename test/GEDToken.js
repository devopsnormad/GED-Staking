const { expect } = require("chai");
const hre = require("hardhat");

describe("GEDToken Contract", function () {
    let gedStakingToken;
    let owner;
    let addr1;
    let addr2;

    before(async function () {
        const GEDStakingToken = await hre.ethers.getContractFactory("GEDStakingToken");
        [owner, addr1, addr2] = await hre.ethers.getSigners();
        
        // Deploy the contract only once
        gedStakingToken = await GEDStakingToken.deploy(1000000);
        console.log("GEDStakingToken Address:", gedStakingToken.target);
    });

    it("Should deploy the contract with the correct initial supply", async function () {
        expect(await gedStakingToken.totalSupply()).to.equal(1000000);
    });

    it("Should assign total supply of tokens to the owner", async function () {
        expect(await gedStakingToken.balanceOf(owner.address)).to.equal(1000000);
    });

    it("Should allow owner to transfer tokens", async function () {
        await gedStakingToken.transfer(addr1.address, 100);
        expect(await gedStakingToken.balanceOf(addr1.address)).to.equal(100);
        expect(await gedStakingToken.balanceOf(owner.address)).to.equal(999900);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
        await expect(
            gedStakingToken.connect(addr1).transfer(addr2.address, 200)
        ).to.be.revertedWith("Insufficient balance");
    });

    it("Should update balance after transfer", async function () {
        await gedStakingToken.transfer(addr1.address, 200); // Transfer to addr1
        expect(await gedStakingToken.balanceOf(owner.address)).to.equal(999700);
        expect(await gedStakingToken.balanceOf(addr1.address)).to.equal(300); // Updated addr1's balance
        
        await gedStakingToken.transfer(addr2.address, 100); // Transfer to addr2
        expect(await gedStakingToken.balanceOf(owner.address)).to.equal(999600); // Owner's updated balance
        expect(await gedStakingToken.balanceOf(addr2.address)).to.equal(100); // Updated addr2's balance
    });

    it("Should approve tokens for delegated transfer", async function () {
        await gedStakingToken.approve(addr1.address, 150);
        expect(await gedStakingToken.allowance(owner.address, addr1.address)).to.equal(150);
    });
    it("Should allow delegate to transfer tokens", async function () {
        // Step 1: Transfer initial tokens to addr1
        await gedStakingToken.transfer(addr1.address, 200); 
        console.log("Initial balances:");
        console.log("Owner balance:", await gedStakingToken.balanceOf(owner.address)); // Should be 999800
        console.log("Addr1 balance:", await gedStakingToken.balanceOf(addr1.address)); // Should be 200
        console.log("Addr2 balance:", await gedStakingToken.balanceOf(addr2.address)); // Should be 0
    
        // Step 2: Approve addr1 to spend tokens on behalf of owner
        await gedStakingToken.approve(addr1.address, 100); 
        console.log("Allowance set:", await gedStakingToken.allowance(owner.address, addr1.address)); // Should be 100
    
        // Step 3: Now addr1 should be able to transfer 100 tokens from owner to addr2
        await gedStakingToken.connect(addr1).transferFrom(owner.address, addr2.address, 100);
        
        // Step 4: Check balances after the transfer
        console.log("After transfer:");
        console.log("Owner balance:", await gedStakingToken.balanceOf(owner.address)); // Should be 999700
        console.log("Addr1 balance:", await gedStakingToken.balanceOf(addr1.address)); // Should be 200
        console.log("Addr2 balance:", await gedStakingToken.balanceOf(addr2.address)); // Should be 100
    });
    
    
    it("Should fail if delegate tries to transfer more than allowed", async function () {
        await gedStakingToken.approve(addr1.address, 50);
        await expect(
            gedStakingToken.connect(addr1).transferFrom(owner.address, addr2.address, 100)
        ).to.be.revertedWith("Allowance exceeded");
    });

    it("Should handle zero transfers properly", async function () {
        await expect(gedStakingToken.transfer(addr1.address, 0))
            .to.emit(gedStakingToken, "Transfer")
            .withArgs(owner.address, addr1.address, 0);
    });

    it("Should not allow transfer to the zero address", async function () {
        await expect(
            gedStakingToken.transfer("0x0000000000000000000000000000000000000000", 100)
        ).to.be.revertedWith("Transfer to zero address");
    });
});
