import { fromString } from 'uint8arrays/from-string'
import { toString } from 'uint8arrays/to-string'

import { verify } from '@noble/bls12-381'
import { JWTContent } from './models'

export const NETWORK_PUB_KEY = fromString(
  '9971e835a1fe1a4d78e381eebbe0ddc84fde5119169db816900de796d10187f3c53d65c1202ac083d099a517f34a9b62',
  'base16',
)

export async function verifyJwt(jwt: string): Promise<JWTContent | null> {
  try {
    const jwtParts = jwt.split('.')
    const header = JSON.parse(toString(fromString(jwtParts[0], 'base64url')))
    const payload = JSON.parse(
      toString(fromString(jwtParts[1], 'base64url')),
    ) as JWTContent

    if (
      header.alg != 'BLS12-381' ||
      header.typ != 'JWT' ||
      payload.iss != 'LIT' ||
      Date.now() > payload.exp * 1000
    )
      return null

    const verified = await verify(
      fromString(jwtParts[2], 'base64url'),
      fromString(`${jwtParts[0]}.${jwtParts[1]}`),
      NETWORK_PUB_KEY,
    )
    if (!verified) return null
    return payload
  } catch {
    return null
  }
}
