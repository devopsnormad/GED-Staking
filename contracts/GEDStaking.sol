// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./GEDToken.sol";
import "./GEDNFT.sol";  

contract Staking {
    GEDStakingToken private gedToken;
    GEDNFT private rewardNFT;

    struct Stake {
        uint256 stakedGED;
        uint256 shares;
    }

    mapping(address => Stake) private stakeholderToStake;
    address[] private stakeholders;

    uint256 private base;
    uint256 private totalStakes;
    uint256 private totalShares;
    bool private initialRatioFlag;

    event StakeAdded(address indexed stakeholder, uint256 amount, uint256 shares, uint256 timestamp);
    event StakeRemoved(address indexed stakeholder, uint256 amount, uint256 shares, uint256 reward, uint256 timestamp);

    modifier isInitialRatioNotSet() {
        require(!initialRatioFlag, "Initial Ratio has already been set");
        _;
    }

    modifier isInitialRatioSet() {
        require(initialRatioFlag, "Initial Ratio has not yet been set");
        _;
    }

    constructor(address _gedToken, address _rewardNFT) {
        gedToken = GEDStakingToken(_gedToken);
        rewardNFT = GEDNFT(_rewardNFT);
        base = 10**18;
    }

    function setInitialRatio(uint256 stakeAmount) public isInitialRatioNotSet {
        require(totalShares == 0 && gedToken.balanceOf(address(this)) == 0, "Stakes and shares are non-zero");

        stakeholders.push(msg.sender);
        stakeholderToStake[msg.sender] = Stake({
            stakedGED: stakeAmount,
            shares: stakeAmount
        });
        totalStakes = stakeAmount;
        totalShares = stakeAmount;
        initialRatioFlag = true;

        require(gedToken.transferFrom(msg.sender, address(this), stakeAmount), "GED transfer failed");

        emit StakeAdded(msg.sender, stakeAmount, stakeAmount, block.timestamp);
    }

    function createStake(uint256 stakeAmount) public {
        uint256 shares = (stakeAmount * totalShares) / gedToken.balanceOf(address(this));

        require(gedToken.transferFrom(msg.sender, address(this), stakeAmount), "GED transfer failed");

        bool isNewStakeholder = stakeholderToStake[msg.sender].stakedGED == 0;
        if (isNewStakeholder) {
            stakeholders.push(msg.sender); 
        }

        stakeholderToStake[msg.sender].stakedGED += stakeAmount;
        stakeholderToStake[msg.sender].shares += shares;
        totalStakes += stakeAmount;
        totalShares += shares;

        emit StakeAdded(msg.sender, stakeAmount, shares, block.timestamp);
    }

    function removeStake(uint256 stakeAmount) public {
        uint256 stakeholderStake = stakeholderToStake[msg.sender].stakedGED;
        uint256 stakeholderShares = stakeholderToStake[msg.sender].shares;

        require(stakeholderStake >= stakeAmount, "Not enough staked!");

        uint256 sharesToWithdraw = (stakeAmount * stakeholderShares) / stakeholderStake;
        uint256 rewards = 0;

        if (sharesToWithdraw > 0) {
            rewards = sharesToWithdraw; 
            rewardNFT.mintNFT(msg.sender, rewards); 
        }

        stakeholderToStake[msg.sender].shares -= sharesToWithdraw;
        stakeholderToStake[msg.sender].stakedGED -= stakeAmount;
        totalStakes -= stakeAmount;
        totalShares -= sharesToWithdraw;

        require(gedToken.transfer(msg.sender, stakeAmount), "Stake transfer failed");

        emit StakeRemoved(msg.sender, stakeAmount, sharesToWithdraw, rewards, block.timestamp);
    }

}
