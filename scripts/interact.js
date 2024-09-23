const { ethers } = require("hardhat");

async function main() {
    const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Token Address
    const nftAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // NFT Address
    const stakingPoolAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; // Staking Pool Address

    const stakingPoolABI = require("../artifacts/contracts/GEDStaking.sol/StakingPool.json").abi;
    const tokenABI = require("../artifacts/contracts/GEDToken.sol/GEDStakingToken.json").abi; // Ensure this matches your actual file name
    const nftABI = require("../artifacts/contracts/GEDNFT.sol/GEDNFT.json").abi;

    // Get the signer using the specific account
    const [deployer] = await ethers.getSigners(); // Get the default signer

    // Check if the deployer is the correct account
    console.log("Using account:", deployer.address); // Log the address to verify

    // Initialize contracts with addresses and ABI
    const stakingPool = new ethers.Contract(stakingPoolAddress, stakingPoolABI, deployer);
    const token = new ethers.Contract(tokenAddress, tokenABI, deployer);
    const nft = new ethers.Contract(nftAddress, nftABI, deployer);

    // Example: Staking tokens (staking 100 tokens into Pool 0)
    const stakeAmount = ethers.parseUnits("100", 18); // 100 tokens, assuming 18 decimals
    const poolId = 0; // Pool ID to stake in

    // Approve tokens for staking contract
    const approveTx = await token.approve(stakingPoolAddress, stakeAmount);
    await approveTx.wait(); // Wait for the approval transaction to be mined
    console.log(`Approved ${stakeAmount.toString()} tokens to the staking contract.`);

    // Stake tokens in Pool 0
    const stakeTx = await stakingPool.stake(poolId, stakeAmount);
    await stakeTx.wait(); // Wait for the staking transaction to be mined
    console.log(`Successfully staked ${stakeAmount.toString()} tokens in pool ${poolId}`);

   // Call the mint function
   const svg = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iIj4KPHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9InJlZ2JlciIgLz48L3N2Zz4K";
   const amount = 1; // Amount to mint
   const toAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; 
   try {
    const mintTx = await nft.mintNFT(deployer.address, amount, svg); // Use 'amount' instead of 'amountToMint'
    await mintTx.wait(); // Wait for the minting transaction to be mined
    console.log(`Minted ${amount} NFT(s) to ${deployer.address}`); // Use 'amount' here as well
} catch (error) {
    console.error("Error minting NFT:", error);
}

    // Example: Unstaking tokens from Pool 0
    const unstakeTx = await stakingPool.unstake(poolId);
    await unstakeTx.wait(); // Wait for the unstaking transaction to be mined
    console.log(`Successfully unstaked from pool ${poolId}`);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
