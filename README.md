# NFT Sales Bot
NFT Sales notification bot using https://chainbase.online API

**Create an account on Chainbase**
We will be using [chainbase](https://chainbase.online/) for the whole process so make sure to create an account on chainbase.

**Get Chainbase API Key**
Get a chainbase API key from [here](https://console.chainbase.online/web3ApiService).
Note it as `CHAINBASE_API_KEY`.

**Get a Chainbase ETH network API key**
Get ETH network API key from [here](https://console.chainbase.online/chainNetwork).
Note it as `CHAINBASE_ETH_MAINNET_KEY`.

**Get chainbase data cloud API key**
Get the Data Cloud api key by writing any SQL [here](https://console.chainbase.online/dataCloud) and clicking `Generate API`.
Note it as `CHAINBASE_DATACLOUD_API_KEY`.

**Clone this github repo**
```bash
git clone git@github.com:vanxh/nft-sales-bot.git
# or using HTTPS
git clone
```

**Create a `.env` file and enter the API keys we created above**
```env
CHAINBASE_API_KEY="FROM THE STEPS ABOVE"
CHAINBASE_DATACLOUD_API_KEY="FROM THE STEPS ABOVE"
CHAINBASE_ETH_MAINNET_KEY="FROM THE STEPS ABOVE"
DISCORD_WEBHOOK_URL=""
```

**Install modules**
```bash
yarn install
# or npm
npm install
```

**Update contract address in `src/index.ts`**
Update this line with contract address of NFT you want to track.
```ts
const CONTRACT_ADDRESS = '0x0000000005756b5a03e751bd0280e3a55bc05b6e';
```

**Build the project**
```bash
yarn build
```

**Run the project**
```
yarn start
```