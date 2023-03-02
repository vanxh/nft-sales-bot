import { default as axios } from 'axios';

export const truncateAddress = (address: string) => {
  if (address.length < 10) {
    throw new Error('Invalid Ethereum address.');
  }
  const prefix = address.slice(0, 6);
  const suffix = address.slice(-4);
  return `${prefix}...${suffix}`;
};

export const getETHPrice = async () => {
  const { data } = await axios.get(
    'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=USD&include_24hr_change=true'
  );
  return data.ethereum.usd as number;
};

export const formatPrice = (price: number): string => {
  let i = 0;
  let formatedPrice = price.toLocaleString('en-US', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });
  let lastIdx = formatedPrice.length - 1;

  while (formatedPrice[lastIdx] === '0' || formatedPrice[lastIdx] === '.') {
    i++;
    if (formatedPrice[lastIdx--] === '.') {
      break;
    }
  }

  if (i > 0) {
    formatedPrice = formatedPrice.slice(0, -i);
  }

  return formatedPrice === '' ? '0' : formatedPrice;
};
