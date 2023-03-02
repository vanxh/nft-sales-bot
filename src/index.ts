import 'dotenv/config.js';
import { Auth, ENFT } from 'enft';

import { env } from './env/schema.js';

const auth = new Auth({
  alchemy: {
    apiKey: env.ALCHEMY_API_KEY,
  },
});

const enft = new ENFT(auth);

const CONTRACT_ADDRESS = '0xED5AF388653567Af2F388E6224dC7C4b3241C544';

(async () => {
  enft.onItemSold({
    contractAddress: CONTRACT_ADDRESS,
    discordWebhook: env.DISCORD_WEBHOOK_URL,
    etherscanApiKey: env.ETHERSCAN_API_KEY,
  });
})();
