import { CFJWKResponse, CFSAuthParams } from '@/videos/models'

export const setKeys = async (
  kv: KVNamespace,
  account: string,
  token: string,
  keys: CFJWKResponse,
): Promise<void> =>
  await kv.put(
    account,
    JSON.stringify({
      account,
      token,
      kid: keys.id,
      jwk: keys.jwk,
      pem: keys.pem,
    } as CFSAuthParams),
  )

export async function getKeys(
  kv: KVNamespace,
  account: string,
): Promise<CFSAuthParams | null> {
  const res = await kv.get(account)
  if (res !== null) return JSON.parse(res) as CFSAuthParams
  return null
}
