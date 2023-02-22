import { HTTP } from './HTTP';
import { env } from '../env/schema';
import {
  DataCloudQueryRes,
  GetNftMetadataRes,
  GetTxRes,
  NftTransfer,
} from '../types';
import { z } from 'zod';

export class Chainbase {
  public http: HTTP;

  constructor() {
    this.http = new HTTP({
      headers: {
        'x-api-key': env.CHAINBASE_API_KEY,
      },
    });
  }

  /**
   * @param contractAddress Contract address of NFT whose transfers you want to get
   * @param timeframeMinutes Minutes to look back for transfers
   * @param limit Max number of transfers to return
   */
  async getTransfers(
    contractAddress: string,
    timeframeMinutes = 1,
    limit = 10
  ): Promise<z.infer<typeof NftTransfer>[]> {
    const res = await this.http.send(
      'POST',
      `https://api.chainbase.online/v1/dw/query`,
      {
        // override the API key header, in next release chainbase would combine both API keys
        'x-api-key': env.CHAINBASE_DATACLOUD_API_KEY,
      },
      {
        query: `
    SELECT
        _from as from,
        _to as to,
        _value as tokenId,
        block_timestamp as timestamp,
        transaction_hash
    FROM
        ethereum.erc721_transfer
    WHERE
        contract_address = '${contractAddress}'
        AND block_timestamp >= (NOW() - INTERVAL ${timeframeMinutes} MINUTE)
    ORDER BY
        block_timestamp DESC
    LIMIT ${limit}`,
      }
    );

    const isError =
      (res.data as z.infer<typeof DataCloudQueryRes>).data.err_msg !== '';
    if (isError) {
      throw new Error(
        (res.data as z.infer<typeof DataCloudQueryRes>).data.err_msg
      );
    }

    const data = DataCloudQueryRes.parse(res.data);

    return z.array(NftTransfer).parse(data.data.result);
  }

  /**
   * @param txHash Transaction hash of the transaction you want to get
   */
  async getTxByHash(txHash: string) {
    const res = await this.http.send(
      'POST',
      `https://ethereum-mainnet.s.chainbase.online/v1/${env.CHAINBASE_ETH_MAINNET_KEY}`,
      {
        'x-api-key': env.CHAINBASE_ETH_MAINNET_KEY,
      },
      {
        jsonrpc: '2.0',
        method: 'eth_getTransactionByHash',
        params: [txHash],
      }
    );

    const data = GetTxRes.parse(res.data);

    return data.result;
  }

  async getNftMetadata(contractAddress: string, tokenId: string) {
    const res = await this.http.send(
      'GET',
      `https://api.chainbase.online/v1/nft/metadata?chain_id=1&contract_address=${contractAddress}&token_id=${tokenId}`
    );

    const data = GetNftMetadataRes.parse(res.data);

    return data.data;
  }
}
