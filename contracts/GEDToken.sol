// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GEDStakingToken {
    // Token attributes
    string public name = "GEDStaking";
    string public symbol = "GEDSTK";
    uint8 public decimals = 18;

    // Map balance of each owner address to hold token balance
    mapping(address => uint256) public balances;

    // Map addresses of allowed accounts and the amounts allowed that will withdraw from owner address
    mapping(address => mapping(address => uint256)) public allowed;

    event Approval(address indexed tokenOwner, address indexed spender, uint256 tokenValue);
    event Transfer(address indexed from, address indexed to, uint256 tokenValue);

    // Setting the number of tokens that will be in circulation
    uint256 public totalSupply;

    constructor(uint256 _initialSupply) {
        totalSupply = _initialSupply;
        balances[msg.sender] = _initialSupply;
        emit Transfer(address(0), msg.sender, _initialSupply);
    }

    // Get total token supply
    function totalSupply_() public view returns (uint256) {
        return totalSupply;
    }

    // Get token balance of owner of token
    function balanceOf(address tokenOwner) public view returns (uint256) {
        return balances[tokenOwner];
    }

    // Transfer tokens to another account using the transfer function
    function transfer(address receiver, uint256 numTokens) public returns (bool) {
        require(numTokens <= balances[msg.sender], "Insufficient balance");
        require(receiver != address(0), "Transfer to zero address");

        balances[msg.sender] -= numTokens; // Use `-` for subtraction
        balances[receiver] += numTokens; // Use `+` for addition

        emit Transfer(msg.sender, receiver, numTokens);
        return true;
    }

    // Approve a delegate to withdraw tokens using the approve function
    function approve(address delegate, uint256 numTokens) public returns (bool) {
        allowed[msg.sender][delegate] = numTokens;
        emit Approval(msg.sender, delegate, numTokens);
        return true;
    }

    // Get number of tokens approved for withdrawal using the allowance function
    function allowance(address owner, address delegate) public view returns (uint256) {
        return allowed[owner][delegate];
    }

    // Transfer funds from delegate using the transferFrom function
    function transferFrom(address owner, address buyer, uint256 numTokens) public returns (bool) {
        require(numTokens <= balances[owner], "Insufficient balance");
        require(numTokens <= allowed[owner][msg.sender], "Allowance exceeded");

        balances[owner] -= numTokens; 
        allowed[owner][msg.sender] -= numTokens; 
        balances[buyer] += numTokens; 

        emit Transfer(owner, buyer, numTokens);
        return true;
    }
}
