import { useState } from "react";
import { ethers } from "ethers";

const ConnectWallet = ({ setAddress }) => {
  const [error, setError] = useState("");

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setAddress(accounts[0]);
      } else {
        setError("Please install MetaMask!");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <button onClick={connectWallet} className="bg-blue-500 text-white py-2 px-4 rounded">
        Connect Wallet
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default ConnectWallet;
