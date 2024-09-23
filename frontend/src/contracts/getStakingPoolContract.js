import { ethers } from "ethers";
import StakingPoolABI from "../artifacts/contracts/StakingPool.sol/StakingPool.json"; // Adjust this path if necessary

const StakingPoolAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; // Replace with your deployed contract address

export const getContract = () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  return new ethers.Contract(StakingPoolAddress, StakingPoolABI.abi, signer);
};
