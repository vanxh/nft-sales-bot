import 'dotenv/config.js';
import fs from 'fs';
import { Colors, EmbedBuilder, WebhookClient, hyperlink } from 'discord.js';
import {
  AssetTransfersCategory,
  fromHex,
  SortingOrder,
  toHex,
  Utils,
} from 'alchemy-sdk';

import { env } from './env/schema';
import { alchemy, getNftMetadata } from './utils';

const webhook = new WebhookClient({
  url: env.DISCORD_WEBHOOK_URL,
});

const CONTRACT_ADDRESS = '0x0000000005756b5a03e751bd0280e3a55bc05b6e';
const CHECK_EVERY_MINUTES = 1;
let lastBlock = 0;
let alreadySent: string[] = [];

export const checkForSales = async () => {
  const response = await alchemy.core.getAssetTransfers({
    fromBlock: toHex(lastBlock),
    contractAddresses: [CONTRACT_ADDRESS],
    category: [AssetTransfersCategory.ERC721],
    excludeZeroValue: false,
    order: SortingOrder.DESCENDING,
    maxCount: 3,
  });

  for (const {
    from,
    to,
    hash,
    tokenId,
    erc721TokenId,
    blockNum,
  } of response.transfers) {
    if ((!tokenId && !erc721TokenId) || !to || alreadySent.includes(hash)) {
      continue;
    }

    const tx = await alchemy.core.getTransaction(hash);

    const nft = await getNftMetadata(
      CONTRACT_ADDRESS,
      (tokenId ?? erc721TokenId) as string
    );

    const embed = new EmbedBuilder()
      .setTitle(`${nft.name} has just been sold!`)
      .setURL(
        `https://opensea.io/assets/ethereum/${CONTRACT_ADDRESS}/${nft.tokenId}`
      )
      .setColor(Colors.Blue)
      .setTimestamp()
      .setImage(nft.image)
      .setFooter({
        text: `Made by Vanxh`,
        iconURL: nft.image,
      })
      .addFields([
        {
          name: 'Item',
          value: nft.name,
        },
        {
          name: 'Price',
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          value: `${Utils.formatEther(tx!.value)} ETH`,
        },
        {
          name: 'From',
          value: hyperlink(from, `https://etherscan.io/address/${from}`),
        },
        {
          name: 'To',
          value: hyperlink(to, `https://etherscan.io/address/${to}`),
        },
      ]);

    await webhook.send({
      embeds: [embed],
    });

    lastBlock = fromHex(blockNum);
    alreadySent.push(hash);
    await fs.promises.writeFile(
      './cache.json',
      JSON.stringify(
        {
          lastBlock,
          alreadySent,
        },
        null,
        4
      )
    );
  }
};

(async () => {
  if (!fs.existsSync('./cache.json')) {
    await fs.promises.writeFile(
      './cache.json',
      JSON.stringify(
        {
          lastBlock,
          alreadySent,
        },
        null,
        4
      )
    );
  } else {
    const cache = JSON.parse(
      await fs.promises.readFile('./cache.json', 'utf-8')
    );
    lastBlock = cache.lastBlock ?? 0;
    alreadySent = cache.alreadySent ?? [];
  }

  await checkForSales();
  setInterval(checkForSales, CHECK_EVERY_MINUTES * 60 * 1000);
})();
