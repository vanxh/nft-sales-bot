import { Alchemy, Network } from 'alchemy-sdk';
import { env } from './env/schema';

export const debug = console.log;

const config = {
  apiKey: env.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};
export const alchemy = new Alchemy(config);

export const getNftMetadata = async (
  contractAddress: string,
  tokenId: string
) => {
  const data = await alchemy.nft.getNftMetadata(contractAddress, tokenId);

  return {
    name: data.rawMetadata?.name || data.title,
    image: data.media[0].gateway || data.media[0].raw,
    tokenId: data.tokenId,
    collection: {
      name: data.contract.name,
      symbol: data.contract.symbol,
      url: data.contract.openSea?.externalUrl,
      image: data.contract.openSea?.imageUrl,
    },
  };
};
