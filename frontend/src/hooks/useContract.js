import { ethers } from "ethers";
import StakingPoolABI from "../artifacts/contracts/StakingPool.sol/StakingPool.json";
import TokenABI from "../artifacts/contracts/GEDStakingToken.sol/GEDStakingToken.json";
import NFTABI from "../artifacts/contracts/GEDNFT.sol/GEDNFT.json";

const StakingPoolAddress = "YOUR_STAKING_POOL_ADDRESS";
const TokenAddress = "YOUR_TOKEN_ADDRESS";
const NFTAddress = "YOUR_NFT_ADDRESS";

export const getContract = () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  return {
    stakingPool: new ethers.Contract(StakingPoolAddress, StakingPoolABI.abi, signer),
    token: new ethers.Contract(TokenAddress, TokenABI.abi, signer),
    nft: new ethers.Contract(NFTAddress, NFTABI.abi, signer),
  };
};
