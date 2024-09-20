// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GEDNFT {
    event ApprovalForAll(address indexed account, address indexed operator, bool approved);
    event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value);
    event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values);
    event URI(string value, uint256 id);
    event Mint(address indexed to, uint256 id, uint256 amount);
    event MintBatch(address indexed to, uint256[] ids, uint256[] amounts);

    mapping(uint256 => mapping(address => uint256)) internal _balances;
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    string private _baseURI;
    uint256 private _tokenIdCounter;

    constructor(string memory baseURI) {
        _baseURI = baseURI;
    }

    function setBaseURI(string memory newuri) public {
        _baseURI = newuri;
    }

    function uri(uint256 tokenId) public view returns (string memory) {
        return string(abi.encodePacked(_baseURI, uint2str(tokenId), ".json"));
    }

    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    function balanceOf(address account, uint256 id) public view returns (uint256) {
        require(account != address(0), "Address not valid");
        return _balances[id][account];
    }

    function setApprovalForAll(address operator, bool approved) public {
        require(operator != address(0), "Operator address is not valid");
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function isApprovedForAll(address owner, address operator) public view returns (bool) {
        return _operatorApprovals[owner][operator];
    }

    function mintNFT(address to, uint256 amount) public {
        require(to != address(0), "Invalid address");
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        _balances[tokenId][to] += amount;
        emit Mint(to, tokenId, amount);
        emit TransferSingle(msg.sender, address(0), to, tokenId, amount);
    }

    function mintBatchNFT(address to, uint256[] memory amounts) public {
        require(to != address(0), "Invalid address");
        uint256[] memory ids = new uint256[](amounts.length);

        for (uint256 i = 0; i < amounts.length; i++) {
            _tokenIdCounter++;
            uint256 tokenId = _tokenIdCounter;
            _balances[tokenId][to] += amounts[i];
            ids[i] = tokenId;
        }

        emit MintBatch(to, ids, amounts);
        emit TransferBatch(msg.sender, address(0), to, ids, amounts);
    }

    function _transfer(address from, address to, uint256 id, uint256 amount) private {
        uint256 fromBalance = _balances[id][from];
        require(fromBalance >= amount, "Insufficient funds");
        _balances[id][from] = fromBalance - amount;
        _balances[id][to] += amount;
    }

    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes memory data) public {
        require(from == msg.sender || isApprovedForAll(from, msg.sender), "Sender not owner or approved");
        require(to != address(0), "Invalid recipient address");

        _transfer(from, to, id, amount);
        emit TransferSingle(msg.sender, from, to, id, amount);

        require(_checkOnERC1155Received(data), "Receiver not implemented");
    }

    function safeBatchTransferFrom(address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) public {
        require(from == msg.sender || isApprovedForAll(from, msg.sender), "Sender not owner or approved");
        require(to != address(0), "Invalid recipient address");
        require(ids.length == amounts.length, "IDs and amounts length mismatch");

        for (uint256 i = 0; i < ids.length; i++) {
            _transfer(from, to, ids[i], amounts[i]);
        }

        emit TransferBatch(msg.sender, from, to, ids, amounts);
        require(_checkOnERC1155Received(data), "Receiver not implemented");
    }

    function _checkOnERC1155Received(bytes memory) private pure returns (bool) {
        return true; // Simplified; in a real contract, you should call onERC1155Received on the recipient contract
    }

    function supportsInterface(bytes4 interfaceId) public pure returns (bool) {
        return interfaceId == 0xd9b67a26 || interfaceId == 0x01ffc9a7; // 0x01ffc9a7 is the ERC165 interface ID
    }
}
