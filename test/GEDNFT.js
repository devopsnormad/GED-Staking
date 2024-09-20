const { expect } = require("chai");
const hre = require("hardhat");

describe("GEDNFT Contract", function () {
    let gedNFT;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        const NFT = await hre.ethers.getContractFactory("GEDNFT");
        [owner, addr1, addr2] = await hre.ethers.getSigners();
        gedNFT = await NFT.deploy("https://brown-definite-snake-356.mypinata.cloud/ipfs/QmbcEboTUDc73rKw5WURhFt1YVWk5uuhXrqqJBW6gxMpnK/");
    });

    // 1. Single token minting test
    it("Should mint a single NFT with correct metadata", async function () {
        await gedNFT.mintNFT(owner.address, 1); // Corrected the call to match the function signature
        expect(await gedNFT.balanceOf(owner.address, 1)).to.equal(1);
        expect(await gedNFT.uri(1)).to.equal("https://brown-definite-snake-356.mypinata.cloud/ipfs/QmbcEboTUDc73rKw5WURhFt1YVWk5uuhXrqqJBW6gxMpnK/1.json");
    });

    // 2. Batch minting test
    it("Should mint multiple NFTs in a batch with correct metadata", async function () {
        const amounts = [5, 10];  // Mint 5 of the first token, 10 of the second token
        await gedNFT.mintBatchNFT(owner.address, amounts); // Batch mint

        // Verify balances
        expect(await gedNFT.balanceOf(owner.address, 1)).to.equal(5);  // Token 1 balance
        expect(await gedNFT.balanceOf(owner.address, 2)).to.equal(10); // Token 2 balance

        // Verify URIs
        expect(await gedNFT.uri(1)).to.equal("https://brown-definite-snake-356.mypinata.cloud/ipfs/QmbcEboTUDc73rKw5WURhFt1YVWk5uuhXrqqJBW6gxMpnK/1.json");
        expect(await gedNFT.uri(2)).to.equal("https://brown-definite-snake-356.mypinata.cloud/ipfs/QmbcEboTUDc73rKw5WURhFt1YVWk5uuhXrqqJBW6gxMpnK/2.json");
    });

    // 3. Transfer single token test
    it("Should allow transfer of a single token", async function () {
        await gedNFT.mintNFT(owner.address, 1);  // Mint 1 token of ID 1
        await gedNFT.safeTransferFrom(owner.address, addr1.address, 1, 1, "0x");  // Transfer 1 token

        expect(await gedNFT.balanceOf(owner.address, 1)).to.equal(0); // Updated expected balance
        expect(await gedNFT.balanceOf(addr1.address, 1)).to.equal(1);
    });

    // 4. Batch transfer test
    it("Should transfer multiple tokens in a batch", async function () {
        const amounts = [5, 10];
        await gedNFT.mintBatchNFT(owner.address, amounts); // Mint 5 of Token 1 and 10 of Token 2

        await gedNFT.safeBatchTransferFrom(owner.address, addr1.address, [1, 2], [2, 5], "0x");  // Transfer part of each

        // Verify balances
        expect(await gedNFT.balanceOf(owner.address, 1)).to.equal(3);  // Token 1 balance
        expect(await gedNFT.balanceOf(owner.address, 2)).to.equal(5);  // Token 2 balance
        expect(await gedNFT.balanceOf(addr1.address, 1)).to.equal(2);  // Addr1 Token 1 balance
        expect(await gedNFT.balanceOf(addr1.address, 2)).to.equal(5);  // Addr1 Token 2 balance
    });

    // 5. Test for transfer exceeding balance
    it("Should fail if transfer amount exceeds balance", async function () {
        await gedNFT.mintNFT(owner.address, 5);  // Mint 5 tokens of ID 1
        await expect(
            gedNFT.safeTransferFrom(owner.address, addr1.address, 1, 10, "0x")  // Attempt to transfer 10 tokens
        ).to.be.revertedWith("Insufficient funds");
    });

    // 6. Test for setting base URI
    it("Should update base URI correctly", async function () {
        const newBaseURI = "https://brown-definite-snake-356.mypinata.cloud/ipfs/QmcntrmXc2QcByjobpD5og65DeTJJ2fo28wNmjmgKW7Cgt/";
        await gedNFT.setBaseURI(newBaseURI);
        expect(await gedNFT.uri(1)).to.equal(`${newBaseURI}1.json`);
    });

    // 7. Test for invalid recipient address
    it("Should fail if transfer to invalid address", async function () {
        await gedNFT.mintNFT(owner.address, 10);  // Mint 10 tokens of ID 1
        await expect(
            gedNFT.safeTransferFrom(owner.address, "0x0000000000000000000000000000000000000000", 1, 5, "0x")  // Attempt to transfer to zero address
        ).to.be.revertedWith("Invalid recipient address");
    });

    // 8. Test for minting with invalid address
    it("Should fail if minting to invalid address", async function () {
        const amounts = [5, 10];
        await expect(
            gedNFT.mintBatchNFT("0x0000000000000000000000000000000000000000", amounts)  // Attempt to mint to zero address
        ).to.be.revertedWith("Invalid address");
    });
});
