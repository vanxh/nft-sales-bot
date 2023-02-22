import { z } from 'zod';
import { AxiosError } from 'axios';

export type KeyValuePair<T> = {
  [key: string]: T;
};

export type HTTPResponse<T> = {
  data?: T;
  error?: AxiosError;
};

export const DataCloudQueryRes = z.object({
  code: z.number(),
  message: z.string(),
  data: z.object({
    task_id: z.string(),
    rows: z.number(),
    rows_read: z.number(),
    bytes_read: z.number(),
    elapsed: z.number(),
    meta: z.array(
      z.object({
        name: z.string(),
        type: z.string(),
      })
    ),
    result: z.array(
      z.record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
    ),
    err_msg: z.string(),
  }),
});

export const NftTransfer = z.object({
  from: z.string(),
  to: z.string(),
  tokenId: z.string(),
  timestamp: z.string(),
  transaction_hash: z.string(),
});

export const GetTxRes = z.object({
  id: z.string().nullable(),
  jsonrpc: z.string().default(''),
  result: z.object({
    blockHash: z.string(),
    chainId: z.string(),
    from: z.string(),
    gas: z.string(),
    gasPrice: z.string(),
    hash: z.string(),
    to: z.string(),
    value: z.string(),
  }),
});
