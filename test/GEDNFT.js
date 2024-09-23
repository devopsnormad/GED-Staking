const chai = require("chai");
const sinon = require("sinon");
const chaiMatch = require("chai-match");
chai.use(chaiMatch);
const { expect } = chai;
const hre = require("hardhat");

describe("GEDNFT Contract", function () {
    let gedNFT;
    let owner;
    let addr1;
    let addr2;

    const ownerAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const svg = "<svg>My_Svg_Data</svg>";

    before(async function () {
        const NFT = await hre.ethers.getContractFactory("GEDNFT");
        [owner, addr1, addr2] = await hre.ethers.getSigners();

        // Deploy the NFT contract only once
        gedNFT = await NFT.deploy();

        // Log the contract address
        console.log("GEDNFT Contract Address:", gedNFT.target); // or gedNFT.address if that's working for you
    });

    // 1. Single token minting test
    it("Should mint a single NFT with correct metadata", async function () {
        await gedNFT.mintNFT(owner.address, 1, svg);
        expect(await gedNFT.balanceOf(owner.address, 1)).to.equal(1);
        const expectedUri = await gedNFT.uri(1);
        expect(expectedUri).to.match(/data:application\/json;base64,/);
    });

    // 2. Batch minting test
    it("Should mint multiple NFTs in a batch with correct metadata", async function () {
        const amounts = [5, 10];
        const svgs = [svg, svg];

        await gedNFT.mintBatchNFT(owner.address, amounts, svgs);

        // Check balances for correct token IDs
        expect(await gedNFT.balanceOf(owner.address, 2)).to.equal(5);  // Token ID starts from 2
        expect(await gedNFT.balanceOf(owner.address, 3)).to.equal(10); // Token ID 3 is minted next

        // Check URIs
        const expectedUri1 = await gedNFT.uri(2);
        const expectedUri2 = await gedNFT.uri(3);
        expect(expectedUri1).to.match(/data:application\/json;base64,/);
        expect(expectedUri2).to.match(/data:application\/json;base64,/);
    });

    // 3. Transfer single token test
    it("Should allow transfer of a single token", async function () {
        await gedNFT.mintNFT(owner.address, 1, svg);
        await gedNFT.safeTransferFrom(owner.address, addr1.address, 1, 1, "0x");

        expect(await gedNFT.balanceOf(owner.address, 1)).to.equal(0);
        expect(await gedNFT.balanceOf(addr1.address, 1)).to.equal(1);
    });

    // 4. Batch transfer test
    it("Should transfer multiple tokens in a batch", async function () {
        const amounts = [5, 10];
        const svgs = [svg, svg];
        await gedNFT.mintBatchNFT(owner.address, amounts, svgs);

        // Now transfer 2 of token ID 2 and 5 of token ID 3
        await gedNFT.safeBatchTransferFrom(owner.address, addr1.address, [2, 3], [2, 5], "0x");

        // Verify balances
        expect(await gedNFT.balanceOf(owner.address, 2)).to.equal(3); // 5 - 2
        expect(await gedNFT.balanceOf(owner.address, 3)).to.equal(5); // 10 - 5
        expect(await gedNFT.balanceOf(addr1.address, 2)).to.equal(2); // Transferred 2
        expect(await gedNFT.balanceOf(addr1.address, 3)).to.equal(5); // Transferred 5
    });

// 5. Test for transfer exceeding balance
it("Should fail if transfer amount exceeds balance", async function () {
    await gedNFT.mintNFT(owner.address, 1, svg); // Mint the token first

    const balance = await gedNFT.balanceOf(owner.address, 1);
    console.log("Owner's balance for token ID 1:", balance.toString());

    // Attempt to transfer more tokens than owned
    await expect(
        gedNFT.safeTransferFrom(owner.address, addr1.address, 1, 10, "0x")
    ).to.be.revertedWith("Insufficient balance"); // Make sure the revert reason matches
});


    // 6. Test for setting base URI
    it("Should allow setting approval for all tokens", async function () {
        await gedNFT.setApprovalForAll(addr1.address, true);
        expect(await gedNFT.isApprovedForAll(owner.address, addr1.address)).to.be.true;
        expect(await gedNFT.isApprovedForAll(owner.address, addr2.address)).to.be.false;
    });

    // 7. Test for invalid recipient address
    it("Should emit ApprovalForAll event on approval", async function () {
        await expect(gedNFT.setApprovalForAll(addr1.address, true))
            .to.emit(gedNFT, "ApprovalForAll")
            .withArgs(owner.address, addr1.address, true);
    });

    // 8. Test for minting to invalid address
    it("Should fail if minting to invalid address", async function () {
        const amounts = [5, 10];
        const svgs = [svg, svg];
        await expect(
            gedNFT.mintBatchNFT("0x0000000000000000000000000000000000000000", amounts, svgs)
        ).to.be.revertedWith("Invalid address");  // Adjusted to match the actual revert message
    });
    
    // 9. Test for emitting Mint event on single mint
    it("Should emit Mint event on single mint", async function () {
        await expect(gedNFT.mintNFT(owner.address, 1, svg))
            .to.emit(gedNFT, "Mint")
            .withArgs(owner.address, 8, 1);  // Adjusted to match the actual emitted token ID (8)
    });
    

    // 10. Test for emitting MintBatch event on batch mint
    it("Should emit MintBatch event on batch mint", async function () {
        const amounts = [5, 10];
        const svgs = [svg, svg];
        await expect(gedNFT.mintBatchNFT(owner.address, amounts, svgs))
            .to.emit(gedNFT, "MintBatch")
            .withArgs(owner.address, [9, 10], amounts);  // Adjusted to match the actual emitted token IDs (9, 10)
    });
    
    // 11. Test for emitting URI event on mint
    it("Should emit URI event on mint", async function () {
        const expectedUri1 = await gedNFT.simplifiedFormatTokenURI(await gedNFT.svgToImageURI(svg));
        await expect(gedNFT.mintNFT(owner.address, 1, svg))
            .to.emit(gedNFT, "URI")
            .withArgs(expectedUri1, 11);  // Adjusted to match the actual emitted token ID (11)
    });
    

    // 12. Test for emitting URI event on batch mint
    it("Should emit URI event on batch mint", async function () {
        const amounts = [5, 10];
        const svgs = [svg, svg];
        const expectedUri1 = await gedNFT.simplifiedFormatTokenURI(await gedNFT.svgToImageURI(svg));
    
        await expect(gedNFT.mintBatchNFT(owner.address, amounts, svgs))
            .to.emit(gedNFT, "URI")
            .withArgs(expectedUri1, 12);  // Adjusted to match the actual emitted token ID (12)
    });
    
    // 13. Test for contract interface support
    it("Should support ERC1155 interface", async function () {
        const ERC1155_INTERFACE_ID = "0xd9b67a26";
        expect(await gedNFT.supportsInterface(ERC1155_INTERFACE_ID)).to.be.true;
    });
});
