import { useEffect, useState } from "react";
import { getContract } from "../hooks/useContract";

const Pools = () => {
  const [pools, setPools] = useState([]);

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

  return (
    <div>
      <h2 className="text-xl font-bold">Available Pools</h2>
      <ul>
        {pools.map((pool, index) => (
          <li key={index}>
            Pool {index}: APY - {ethers.utils.formatUnits(pool.apy, 18)}%, Maturity - {pool.maturityTime} seconds
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Pools;
