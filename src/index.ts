import 'dotenv/config.js';
import Web3 from 'web3';
import BN from 'bignumber.js';
import { Colors, EmbedBuilder, WebhookClient } from 'discord.js';

import { env } from './env/schema';

import { Chainbase } from './lib';

const webhook = new WebhookClient({
  url: env.DISCORD_WEBHOOK_URL,
});

const CONTRACT_ADDRESS = '0x0000000005756b5a03e751bd0280e3a55bc05b6e';
const chainbase = new Chainbase();

(async () => {
  const transfers = await chainbase.getTransfers(CONTRACT_ADDRESS);

  for (const transfer of transfers) {
    const tx = await chainbase.getTxByHash(transfer.transaction_hash);
    const value = new BN(Web3.utils.fromWei(tx.value, 'ether')).toFixed();
    const nft = await chainbase.getNftMetadata(
      CONTRACT_ADDRESS,
      transfer.tokenId
    );

    const embed = new EmbedBuilder()
      .setTitle(`${nft.metadata.name} has just been sold!`)
      .setURL(nft.token_uri)
      .setColor(Colors.Blue)
      .setTimestamp()
      .setImage(nft.image_uri)
      .setFooter({
        text: `Made by Vanxh`,
        iconURL: nft.image_uri,
      })
      .addFields([
        {
          name: 'Item',
          value: nft.metadata.name,
        },
        {
          name: 'Price',
          value: `${value} ETH`,
        },
        {
          name: 'From',
          value: transfer.from,
        },
        {
          name: 'To',
          value: transfer.to,
        },
      ]);

    await webhook.send({
      embeds: [embed],
    });
  }
})();
