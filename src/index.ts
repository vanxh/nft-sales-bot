/* eslint-disable @typescript-eslint/no-non-null-assertion */
import 'dotenv/config.js';
import { Auth, ENFT } from 'enft';

import { env } from './env/schema.js';
import { formatPrice, getETHPrice, truncateAddress } from './utils.js';
import {
  Colors,
  EmbedBuilder,
  WebhookClient,
  bold,
  hyperlink,
} from 'discord.js';

const auth = new Auth({
  alchemy: {
    apiKey: env.ALCHEMY_API_KEY,
  },
});

const enft = new ENFT(auth);

const webhook = new WebhookClient({
  url: env.DISCORD_WEBHOOK_URL,
});

const CONTRACT_ADDRESS = '0x6339e5E072086621540D0362C4e3Cea0d643E114';

(async () => {
  enft.onItemSold(
    {
      contractAddress: CONTRACT_ADDRESS,
      etherscanApiKey: env.ETHERSCAN_API_KEY,
    },
    async tx => {
      console.log(tx);
      const ethPrice = await getETHPrice();

      for (const tokenId of Object.keys(tx.tokens)) {
        const tokenData = tx.tokens[tokenId];

        if (tokenData.markets) {
          for (const market in tokenData.markets!) {
            const currentMarket = tokenData.markets[market];

            const embed = new EmbedBuilder()
              .setTitle(
                `${
                  tokenData.name ||
                  tx.contractData.name ||
                  tx.contractData.symbol
                } has just been sold for ${currentMarket.price.value} ${
                  currentMarket.price.currency.name
                } ($${(
                  parseFloat(currentMarket.price.value) * ethPrice
                ).toFixed(2)} USD)!`
              )
              .setURL(
                `https://opensea.io/assets/ethereum/${CONTRACT_ADDRESS}/${tokenId}`
              )
              .setColor(Colors.Blue)
              .setTimestamp()
              .setImage(tokenData.image)
              .setFooter({
                text: `Made by Vanxh`,
                iconURL: tokenData.image,
              }).setDescription(`
  ${bold('From')}
  ${hyperlink(
    tx.fromAddrName ?? (tx.fromAddr ? truncateAddress(tx.fromAddr!) : 'N / A'),
    `https://etherscan.io/address/${tx.fromAddr}`
  )}

  ${bold('To')}
  ${hyperlink(
    tx.toAddrName ?? (tx.toAddr ? truncateAddress(tx.toAddr!) : 'N / A'),
    `https://etherscan.io/address/${tx.fromAddr}`
  )}

  ${bold('Sold On')}
  ${hyperlink(currentMarket.market.displayName, currentMarket.market.site)}`);

            await webhook.send({
              embeds: [embed],
            });
          }
        } else {
          const embed = new EmbedBuilder()
            .setTitle(
              `${
                tokenData.name || tx.contractData.name || tx.contractData.symbol
              } has just been sold for ${formatPrice(tx.totalPrice)} ${
                tx.currency.name
              } ($${(tx.totalPrice * ethPrice).toFixed(2)} USD)!`
            )
            .setURL(
              `https://opensea.io/assets/ethereum/${CONTRACT_ADDRESS}/${tokenId}`
            )
            .setColor(Colors.Blue)
            .setTimestamp()
            .setImage(tokenData.image)
            .setFooter({
              text: `Made by Vanxh`,
              iconURL: tokenData.image,
            }).setDescription(`
  ${bold('From')}
  ${hyperlink(
    tx.fromAddrName ?? (tx.fromAddr ? truncateAddress(tx.fromAddr!) : 'N / A'),
    `https://etherscan.io/address/${tx.fromAddr}`
  )}

  ${bold('To')}
  ${hyperlink(
    tx.toAddrName ?? (tx.toAddr ? truncateAddress(tx.toAddr!) : 'N / A'),
    `https://etherscan.io/address/${tx.fromAddr}`
  )}

  ${bold('Sold On')}
  ${hyperlink(tx.interactedMarket.displayName, tx.interactedMarket.site)}`);

          await webhook.send({
            embeds: [embed],
          });
        }
      }
    }
  );
})();
