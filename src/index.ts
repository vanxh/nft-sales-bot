/* eslint-disable @typescript-eslint/no-non-null-assertion */
import 'dotenv/config.js';
import {
  Colors,
  EmbedBuilder,
  WebhookClient,
  bold,
  hyperlink,
} from 'discord.js';
import { Auth, ENFT } from 'enft';

import { env } from './env/schema.js';
import { getETHPrice, truncateAddress, formatPrice } from './utils.js';

const webhook = new WebhookClient({
  url: env.DISCORD_WEBHOOK_URL,
});

const auth = new Auth({
  alchemy: {
    apiKey: env.ALCHEMY_API_KEY,
  },
});

const enft = new ENFT(auth);

const CONTRACT_ADDRESS = '0xED5AF388653567Af2F388E6224dC7C4b3241C544';

(async () => {
  enft.onItemSold(
    {
      contractAddress: CONTRACT_ADDRESS,
    },
    async tx => {
      console.log(tx);
      const ethPrice = await getETHPrice();

      const tokenId = Object.keys(tx.tokens)[0];
      const tokenData = tx.tokens[tokenId];
      const price = formatPrice(tx.totalPrice);

      const embed = new EmbedBuilder()
        .setTitle(
          `${
            tx.contractData.name || tx.contractData.symbol || tokenData.name
          } has just been sold!`
        )
        .setURL(
          `https://opensea.io/assets/ethereum/${CONTRACT_ADDRESS}/${tokenId}`
        )
        .setColor(Colors.Blue)
        .setTimestamp()
        .setImage(tokenData.image)
        .setFooter({
          text: `${tx.interactedMarket.displayName} | Made by Vanxh`,
          iconURL: tx.interactedMarket.iconURL,
        }).setDescription(`${bold('Item')}
${tx.contractData.name || tx.contractData.symbol || tokenData.name}

${bold('Price')}
${price} ${tx.currency.name} ($${(
        tx.totalPrice * ethPrice
      ).toLocaleString()} USD)

${bold('From')}
${hyperlink(
  tx.fromAddrName ?? tx.fromAddr ? truncateAddress(tx.fromAddr!) : 'N / A',
  `https://etherscan.io/address/${tx.fromAddr}`
)}

${bold('To')}
${hyperlink(
  tx.toAddrName ?? tx.toAddr ? truncateAddress(tx.toAddr!) : 'N / A',
  `https://etherscan.io/address/${tx.fromAddr}`
)}

${bold('Sold On')} ${hyperlink(
        tx.interactedMarket.displayName,
        tx.interactedMarket.site
      )}`);

      await webhook.send({
        embeds: [embed],
      });
    }
  );
})();
