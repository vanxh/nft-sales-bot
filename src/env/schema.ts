import { z, ZodFormattedError } from 'zod';

export const formatErrors = (
  errors: ZodFormattedError<Map<string, string>, string>
) =>
  Object.entries(errors)
    .map(([name, value]) => {
      if (value && '_errors' in value)
        return `${name}: ${value._errors.join(', ')}\n`;
    })
    .filter(Boolean);

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  CHAINBASE_API_KEY: z.string(),
  CHAINBASE_DATACLOUD_API_KEY: z.string(),
  CHAINBASE_ETH_MAINNET_KEY: z.string(),
});

export const envParsed = envSchema.safeParse(process.env);

if (!envParsed.success) {
  console.error(
    '❌ Invalid environment variables:\n',
    ...formatErrors(envParsed.error.format())
  );
  throw new Error('Invalid environment variables');
}

export const env = envParsed.data;
