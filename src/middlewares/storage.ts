import { AccessControlConditions } from '@/auth/models'
import { RegisterRequest } from '@/routes/models'
import {
  CFJWKResponse,
  CFSAuthParams,
  StoredAccountData,
} from '@/videos/models'

export const setAccountData = async (
  kv: KVNamespace,
  data: RegisterRequest,
  keys: CFJWKResponse,
): Promise<void> =>
  await kv.put(
    data.account,
    JSON.stringify({
      auth: {
        account: data.account,
        token: data.token,
        kid: keys.id,
        jwk: keys.jwk,
        pem: keys.pem,
      },
      accUpload: data.accUpload,
      accSetup: data.accSetup,
    } as StoredAccountData),
  )

export async function getAccountData(
  kv: KVNamespace,
  account: string,
): Promise<StoredAccountData | null> {
  const res = await kv.get(account)
  if (res !== null) return JSON.parse(res) as StoredAccountData
  return null
}
