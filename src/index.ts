import 'dotenv/config.js';
import Web3 from 'web3';
import BN from 'bignumber.js';

import { Chainbase } from './lib';

const CONTRACT_ADDRESS = '0x0000000005756b5a03e751bd0280e3a55bc05b6e';
const chainbase = new Chainbase();

(async () => {
  const transfers = await chainbase.getTransfers(CONTRACT_ADDRESS, 120);
  console.log(transfers);

  for (const transfer of transfers) {
    const tx = await chainbase.getTxByHash(transfer.transaction_hash);
    console.log(tx);
    const value = new BN(Web3.utils.fromWei(tx.value, 'ether')).toFixed();
    console.log(value);
  }
})();
