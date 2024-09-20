const { expect } = require("chai");
const hre = require("hardhat");

describe("GEDToken Contract", function () {
    let gedStakingToken;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        const GEDStakingToken = await hre.ethers.getContractFactory("GEDStakingToken");
        [owner, addr1, addr2] = await hre.ethers.getSigners();
        
        gedStakingToken = await GEDStakingToken.deploy(1000000);
        console.log("GEDStakingToken Address:", gedStakingToken.address);
    });

    it("Should deploy the contract with the correct initial supply", async function () {
        expect(await gedStakingToken.totalSupply()).to.equal(1000000);
    });

    it("Should assign total supply of tokens to the owner", async function () {
        expect(await gedStakingToken.balanceOf(owner.address)).to.equal(1000000);
    });

    it("Should allow owner to transfer token", async function () {
        await expect(gedStakingToken.transfer(addr1.address, 100))
            .to.emit(gedStakingToken, "Transfer")
            .withArgs(owner.address, addr1.address, 100);
        expect(await gedStakingToken.balanceOf(addr1.address)).to.equal(100);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
        await expect(
            gedStakingToken.connect(addr1).transfer(addr2.address, 100)
        ).to.be.revertedWith("Insufficient balance");
    });

    it("Should update balance after transfer", async function () {
        await gedStakingToken.transfer(addr1.address, 200);
        await gedStakingToken.transfer(addr2.address, 100);
        
        expect(await gedStakingToken.balanceOf(owner.address)).to.equal(1000000 - 300);
        expect(await gedStakingToken.balanceOf(addr1.address)).to.equal(200); 
        expect(await gedStakingToken.balanceOf(addr2.address)).to.equal(100);
    });

    it("Should approve tokens for delegated transfer", async function () {
        await expect(gedStakingToken.approve(addr1.address, 150))
            .to.emit(gedStakingToken, "Approval")
            .withArgs(owner.address, addr1.address, 150);
        expect(await gedStakingToken.allowance(owner.address, addr1.address)).to.equal(150);
    });

    it("Should allow delegate to transfer tokens", async function () {
        await gedStakingToken.approve(addr1.address, 150);
        await expect(
            gedStakingToken.connect(addr1).transferFrom(owner.address, addr2.address, 100)
        )
            .to.emit(gedStakingToken, "Transfer")
            .withArgs(owner.address, addr2.address, 100);

        expect(await gedStakingToken.balanceOf(addr2.address)).to.equal(100);
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
