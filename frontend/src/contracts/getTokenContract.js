// src/contracts/getTokenContract.js
import { ethers } from "ethers";
import TokenABI from "../artifacts/contracts/GEDStakingToken.sol/GEDStakingToken.json";

const TokenAddress = "YOUR_TOKEN_ADDRESS"; // Replace with your deployed token contract address

export const getTokenContract = () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  return new ethers.Contract(TokenAddress, TokenABI.abi, signer);
};
