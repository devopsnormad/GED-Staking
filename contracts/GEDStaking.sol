// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./GEDToken.sol";
import "./GEDNFT.sol";
import "./Ownable.sol";

contract StakingPool is Ownable {
    GEDStakingToken public stakingToken;
    GEDNFT public rewardNFT;

    struct Pool {
        uint256 apy;
        uint256 maturityTime;
    }

    struct Stake {
        uint256 amount;
        uint256 timestamp;
        uint256 poolId;
        bool withdrawn;
    }

    Pool[] public pools;
    mapping(address => Stake[]) public stakes;

    uint256 public constant DAY = 86400;
    uint256 public constant NFT_REWARD_ID = 1;

    event Staked(address indexed user, uint256 poolId, uint256 amount);
    event Unstaked(
        address indexed user,
        uint256 poolId,
        uint256 amount,
        bool rewardIssued
    );
    event RewardMinted(address indexed user, uint256 nftId, uint256 quantity);
    event PoolAdded(uint256 poolId, uint256 apy, uint256 maturityTime);

    modifier validatePool(uint256 poolId) {
        require(poolId < pools.length, "Invalid pool ID");
        _;
    }

    constructor(address _stakingToken, address _rewardNFT) {
        stakingToken = GEDStakingToken(_stakingToken);
        rewardNFT = GEDNFT(_rewardNFT);

        // Initialize pools with duration and APY
        addPool(2, DAY * 7); // Pool 1: 7 days, 2% APY
        addPool(25, DAY * 14); // Pool 2: 14 days, 2.5% APY
        addPool(3, DAY * 21); // Pool 3: 21 days, 3% APY
        addPool(35, DAY * 30); // Pool 4: 30 days, 3.5% APY
    }

    function stake(
        uint256 poolId,
        uint256 amount
    ) external validatePool(poolId) {
        require(amount > 0, "Amount must be greater than 0");

        stakingToken.transferFrom(msg.sender, address(this), amount);

        stakes[msg.sender].push(
            Stake({
                amount: amount,
                timestamp: block.timestamp,
                poolId: poolId,
                withdrawn: false
            })
        );

        emit Staked(msg.sender, poolId, amount);
    }

  function unstake(uint256 poolId) external validatePool(poolId) {
    Stake storage userStake = stakes[msg.sender][poolId];
    require(userStake.amount > 0, "No stake found");
    require(!userStake.withdrawn, "Already withdrawn");

    bool rewardIssued = false;
    uint256 rewardQuantity = 0;

    // Check if the stake has matured
    if (block.timestamp >= userStake.timestamp + pools[poolId].maturityTime) {
        // Calculate rewards based on the staked amount and APY
        rewardQuantity = calculateReward(userStake.amount, pools[poolId].apy);

        // Define your SVG (or fetch it from somewhere)
        string memory svg = "<svg>Your SVG content here</svg>"; // Replace with actual SVG

        // Mint the NFT reward to the user
        rewardNFT.mintNFT(msg.sender, rewardQuantity, svg);
        rewardIssued = true;
    }

    // Return the staked tokens to the user
    stakingToken.transfer(msg.sender, userStake.amount);
    userStake.withdrawn = true;

    // Emit the Unstaked event with rewardIssued as true or false
    emit Unstaked(msg.sender, poolId, userStake.amount, rewardIssued);
}


    function calculateReward(
        uint256 amount,
        uint256 apy
    ) internal pure returns (uint256) {
        return (amount * apy) / 100;
    }

    function addPool(uint256 apy, uint256 maturityTime) internal {
        pools.push(Pool({apy: apy, maturityTime: maturityTime}));
        emit PoolAdded(pools.length - 1, apy, maturityTime);
    }

    function getUserStake(
        address user,
        uint256 poolId
    ) external view validatePool(poolId) returns (uint256) {
        Stake[] storage userStakes = stakes[user];
        require(poolId < userStakes.length, "No stake found for this pool");
        return userStakes[poolId].amount;
    }

    function getPoolBalance() external view returns (uint256) {
        return stakingToken.balanceOf(address(this));
    }

    function getStakes(address user) external view returns (Stake[] memory) {
        return stakes[user];
    }
}
