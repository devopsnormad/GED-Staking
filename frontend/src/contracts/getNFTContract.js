// src/contracts/getNFTContract.js
import { ethers } from "ethers";
import NFTABI from "../artifacts/contracts/GEDNFT.sol/GEDNFT.json";

const NFTAddress = "YOUR_NFT_ADDRESS"; // Replace with your deployed NFT contract address

export const getNFTContract = () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  return new ethers.Contract(NFTAddress, NFTABI.abi, signer);
};
