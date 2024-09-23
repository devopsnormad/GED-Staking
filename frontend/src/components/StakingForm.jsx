// src/components/StakingForm.js

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getContract } from "../hooks/useContract";

const StakingForm = () => {
  const [amount, setAmount] = useState("");
  const [selectedPool, setSelectedPool] = useState(0);
  const [pools, setPools] = useState([]);
  const [status, setStatus] = useState("");

  // Load pools on component mount
  useEffect(() => {
    const loadPools = async () => {
      const { stakingPool } = getContract();
      const poolCount = await stakingPool.getPoolCount();
      const loadedPools = [];
      for (let i = 0; i < poolCount; i++) {
        const [apy, maturityTime] = await stakingPool.getPoolDetails(i);
        loadedPools.push({ apy, maturityTime });
      }
      setPools(loadedPools);
    };

    loadPools();
  }, []);

  const handleStake = async () => {
    const { stakingPool, token } = getContract();
    try {
      // Check if user has approved the staking token transfer
      const signer = stakingPool.signer;
      const userAddress = await signer.getAddress();

      const allowance = await token.allowance(userAddress, stakingPool.address);
      if (allowance.lt(ethers.utils.parseEther(amount))) {
        setStatus("Approving tokens for staking...");
        const approveTx = await token.approve(stakingPool.address, ethers.utils.parseEther(amount));
        await approveTx.wait();
      }

      setStatus("Staking tokens...");
      const stakeTx = await stakingPool.stake(selectedPool, ethers.utils.parseEther(amount));
      await stakeTx.wait();

      setStatus("Stake successful!");
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div className="staking-form bg-gray-100 p-4 rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Stake Your Tokens</h2>

      <div className="mb-4">
        <label htmlFor="amount" className="block text-sm font-medium">
          Amount to Stake
        </label>
        <input
          type="number"
          id="amount"
          className="mt-1 p-2 border border-gray-300 rounded w-full"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="pool" className="block text-sm font-medium">
          Select Pool
        </label>
        <select
          id="pool"
          className="mt-1 p-2 border border-gray-300 rounded w-full"
          value={selectedPool}
          onChange={(e) => setSelectedPool(e.target.value)}
        >
          {pools.map((pool, index) => (
            <option key={index} value={index}>
              Pool {index} - APY: {pool.apy}%, Maturity: {pool.maturityTime} seconds
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleStake}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Stake Tokens
      </button>

      {status && <p className="mt-4 text-sm text-gray-600">{status}</p>}
    </div>
  );
};

export default StakingForm;
