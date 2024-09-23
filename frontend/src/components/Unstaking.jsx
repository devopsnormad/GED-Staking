// src/components/Unstaking.js

import { useState, useEffect } from "react";
import { getContract } from "../hooks/useContract";
import { ethers } from "ethers";

const Unstaking = () => {
  const [userStakes, setUserStakes] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const loadUserStakes = async () => {
      const { stakingPool } = getContract();
      const signer = stakingPool.signer;
      const userAddress = await signer.getAddress();

      const stakes = await stakingPool.getStakes(userAddress);
      setUserStakes(stakes);
    };

    loadUserStakes();
  }, []);

  const handleUnstake = async (stakeId) => {
    const { stakingPool } = getContract();
    try {
      setStatus("Unstaking tokens...");
      const unstakeTx = await stakingPool.unstake(stakeId);
      await unstakeTx.wait();

      setStatus("Unstake successful! You have received your NFT reward.");
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div className="unstaking bg-gray-100 p-4 rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Unstake Your Tokens</h2>

      {userStakes.length === 0 ? (
        <p>No active stakes found.</p>
      ) : (
        <ul>
          {userStakes.map((stake, index) => (
            <li key={index} className="mb-4">
              <p>Stake {index}: {ethers.utils.formatUnits(stake.amount, 18)} tokens in Pool {stake.poolId}</p>
              <button
                onClick={() => handleUnstake(stake.id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Unstake
              </button>
            </li>
          ))}
        </ul>
      )}

      {status && <p className="mt-4 text-sm text-gray-600">{status}</p>}
    </div>
  );
};

export default Unstaking;
