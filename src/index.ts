import 'dotenv/config.js';
import Web3 from 'web3';
import BN from 'bignumber.js';
import { Colors, EmbedBuilder, WebhookClient, hyperlink } from 'discord.js';

import { env } from './env/schema';

import { Chainbase } from './lib';
import { debug } from './utils';

const webhook = new WebhookClient({
  url: env.DISCORD_WEBHOOK_URL,
});

const CONTRACT_ADDRESS = '0x0000000005756b5a03e751bd0280e3a55bc05b6e';
const chainbase = new Chainbase();

const checkForNewTransfers = async () => {
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
          value: hyperlink(
            transfer.from,
            `https://etherscan.io/address/${transfer.from}`
          ),
        },
        {
          name: 'To',
          value: hyperlink(
            transfer.to,
            `https://etherscan.io/address/${transfer.to}`
          ),
        },
      ]);

    await webhook.send({
      embeds: [embed],
    });
  }
};

(async () => {
  setInterval(async () => {
    try {
      await checkForNewTransfers();
    } catch (err) {
      debug(err);
    }
  }, 1 * 60 * 60 * 1000);
})();
