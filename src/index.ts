/* eslint-disable @typescript-eslint/no-non-null-assertion */
import 'dotenv/config.js';
import fs from 'fs';
import {
  Colors,
  EmbedBuilder,
  WebhookClient,
  bold,
  hyperlink,
  formatEmoji,
} from 'discord.js';
import { NftSaleMarketplace, SortingOrder } from 'alchemy-sdk';

import { env } from './env/schema';
import { alchemy, getNftMetadata, getETHPrice } from './utils';

const webhook = new WebhookClient({
  url: env.DISCORD_WEBHOOK_URL,
});

const CONTRACT_ADDRESS = '0x0000000005756b5a03e751bd0280e3a55bc05b6e';
const CHECK_EVERY_MINUTES = 1;
let alreadySent: string[] = [];

export const checkForSales = async () => {
  const response = await alchemy.nft
    .getNftSales({
      contractAddress: CONTRACT_ADDRESS,
      limit: 3,
      order: SortingOrder.DESCENDING,
      marketplace: NftSaleMarketplace.SEAPORT,
    })
    .catch(() => null);
  if (!response) return;

  console.log(
    `Found ${
      response.nftSales.filter(s => !alreadySent.includes(s.transactionHash))
        .length
    } new sales...`
  );

  for (const {
    buyerAddress,
    sellerAddress,
    transactionHash,
    tokenId,
    sellerFee,
    royaltyFee,
    protocolFee,
  } of response.nftSales) {
    if (!tokenId || alreadySent.includes(transactionHash)) {
      continue;
    }

    const nft = await getNftMetadata(CONTRACT_ADDRESS, tokenId as string);

    const ethPrice = await getETHPrice();
    const ethValue =
      parseInt(sellerFee.amount) / 10 ** 18 +
      (protocolFee ? parseInt(protocolFee.amount) / 10 ** 18 : 0) +
      (royaltyFee ? parseInt(royaltyFee.amount) / 10 ** 18 : 0);
    const usdValue = ethPrice * ethValue;

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
      }).setDescription(`${bold('Item')}
${nft.name}

${bold('Price')}
${ethValue.toFixed(3)} ETH ($${usdValue.toFixed(2)} USD)

${bold('From')}
${hyperlink(sellerAddress, `https://etherscan.io/address/${sellerAddress}`)}

${bold('To')}
${hyperlink(buyerAddress, `https://etherscan.io/address/${buyerAddress}`)}

${bold('Sold On')} ${formatEmoji('1078371921982402592')}`);

    await webhook.send({
      embeds: [embed],
    });

    alreadySent.push(transactionHash);
    await fs.promises.writeFile(
      './cache.json',
      JSON.stringify(
        {
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
    alreadySent = cache.alreadySent ?? [];
  }

  console.log(
    `Listening for sales on ${CONTRACT_ADDRESS} every ${CHECK_EVERY_MINUTES} minute(s)...`
  );

  await checkForSales();
  setInterval(checkForSales, CHECK_EVERY_MINUTES * 60 * 1000);
})();
