// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Ownable.sol";
import {Base64} from "./Base64.sol";

contract GEDNFT is Ownable {
    event ApprovalForAll(
        address indexed account,
        address indexed operator,
        bool approved
    );
    event TransferSingle(
        address indexed operator,
        address indexed from,
        address indexed to,
        uint256 id,
        uint256 value
    );
    event TransferBatch(
        address indexed operator,
        address indexed from,
        address indexed to,
        uint256[] ids,
        uint256[] values
    );
    event Mint(address indexed to, uint256 id, uint256 amount);
    event MintBatch(address indexed to, uint256[] ids, uint256[] amounts);
    event URI(string value, uint256 indexed id);

    mapping(uint256 => mapping(address => uint256)) internal _balances;
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    mapping(uint256 => string) private _tokenURIs; // Store token metadata (SVGs)

    uint256 private _tokenIdCounter;

    // --- Metadata encoding functions ---

    // Convert SVG to Base64
    function svgToImageURI(
        string memory svg
    ) public pure returns (string memory) {
        string memory baseURL = "data:image/svg+xml;base64,";
        string memory svgBase64Encoded = Base64.encode(svg);
        return string(abi.encodePacked(baseURL, svgBase64Encoded));
    }

    // Format the token URI with on-chain metadata
    function simplifiedFormatTokenURI(
        string memory imageURI
    ) public pure returns (string memory) {
        string memory baseURL = "data:application/json;base64,";
        string memory json = string(
            abi.encodePacked(
                '{"name": "LCM ON-CHAINED", "description": "A simple SVG based on-chain NFT", "image":"',
                imageURI,
                '"}'
            )
        );
        string memory jsonBase64Encoded = Base64.encode(json);
        return string(abi.encodePacked(baseURL, jsonBase64Encoded));
    }

    // --- Minting functions ---

    // Mint a single NFT with SVG (ERC1155 style)
    function mintNFT(address to, uint256 amount, string memory svg) public {
        require(to != address(0), "Invalid address");
        require(bytes(svg).length > 0, "Invalid SVG");
        require(amount > 0, "Invalid amount");

        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;

        _balances[tokenId][to] += amount;

        string memory imageURI = svgToImageURI(svg);
        string memory tokenURI = simplifiedFormatTokenURI(imageURI);

        _tokenURIs[tokenId] = tokenURI;

        emit URI(tokenURI, tokenId);
        emit Mint(to, tokenId, amount);
        emit TransferSingle(msg.sender, address(0), to, tokenId, amount);
    }

    // Batch mint multiple NFTs with SVGs
    function mintBatchNFT(
        address to,
        uint256[] memory amounts,
        string[] memory svgs
    ) public onlyOwner {
        require(to != address(0), "Invalid address");
        require(
            amounts.length == svgs.length,
            "Amounts and SVGs length mismatch"
        );
        require(svgs.length > 0, "No SVGs provided");

        uint256[] memory ids = new uint256[](amounts.length);
        for (uint256 i = 0; i < amounts.length; i++) {
            require(bytes(svgs[i]).length > 0, "Invalid SVG");

            _tokenIdCounter++;
            uint256 tokenId = _tokenIdCounter;
            _balances[tokenId][to] += amounts[i];

            string memory imageURI = svgToImageURI(svgs[i]);
            string memory tokenURI = simplifiedFormatTokenURI(imageURI);

            _tokenURIs[tokenId] = tokenURI;
            ids[i] = tokenId;
        }

        // Emit URI events after the loop to avoid reentrancy
        for (uint256 i = 0; i < ids.length; i++) {
            emit URI(_tokenURIs[ids[i]], ids[i]);
        }

        emit MintBatch(to, ids, amounts);
        emit TransferBatch(msg.sender, address(0), to, ids, amounts);
    }

    // --- ERC1155 Metadata ---

    function uri(uint256 tokenId) public view returns (string memory) {
        return _tokenURIs[tokenId];
    }

    // --- ERC1155 Functions ---

    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory /*data*/
    ) public {
        require(
            from == msg.sender || isApprovedForAll(from, msg.sender),
            "Not owner or approved"
        );
        require(to != address(0), "Invalid recipient");

        _transfer(from, to, id, amount);
        emit TransferSingle(msg.sender, from, to, id, amount);
    }

    function _transfer(
        address from,
        address to,
        uint256 id,
        uint256 amount
    ) private {
        uint256 fromBalance = _balances[id][from];
        require(fromBalance >= amount, "Insufficient balance");
        _balances[id][from] = fromBalance - amount;
        _balances[id][to] += amount;
    }

    function setApprovalForAll(address operator, bool approved) public {
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function isApprovedForAll(
        address owner,
        address operator
    ) public view returns (bool) {
        return _operatorApprovals[owner][operator];
    }

    function balanceOf(
        address owner,
        uint256 id
    ) public view returns (uint256) {
        return _balances[id][owner];
    }

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory /*data*/
    ) public {
        require(
            from == msg.sender || isApprovedForAll(from, msg.sender),
            "Not owner or approved"
        );
        require(to != address(0), "Invalid recipient");

        for (uint256 i = 0; i < ids.length; i++) {
            _transfer(from, to, ids[i], amounts[i]);
        }

        emit TransferBatch(msg.sender, from, to, ids, amounts);
    }

    function supportsInterface(bytes4 interfaceId) public pure returns (bool) {
        return
            interfaceId == 0xd9b67a26 || // ERC1155
            interfaceId == 0x01ffc9a7; // ERC165
    }
}
