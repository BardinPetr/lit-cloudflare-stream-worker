const arrayBufferToBase64Url = (buffer: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

const objectToBase64url = (payload: Record<string, unknown>) =>
  arrayBufferToBase64Url(new TextEncoder().encode(JSON.stringify(payload)))

// Generates JWT token for videoId which will be accepted for videos with requireSignedURLs
export default async function generateCFStoken(
  jwk: string,
  keyId: string,
  videoId: string,
  downloadable = false,
  expireAfterSeconds = 600,
): Promise<string | null> {
  const encoder = new TextEncoder()

  const headers = {
    alg: 'RS256',
    kid: keyId,
  }
  const data = {
    sub: videoId,
    kid: keyId,
    exp: Math.floor(Date.now() / 1000) + expireAfterSeconds,
    downloadable,
    accessRules: [
      {
        type: 'any',
        action: 'allow',
      },
    ],
  }

  const token = `${objectToBase64url(headers)}.${objectToBase64url(data)}`
  const jwk_data = JSON.parse(atob(jwk))
  const key = await crypto.subtle.importKey(
    'jwk',
    jwk_data,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign'],
  )

  const signature = await crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    key,
    encoder.encode(token),
  )

  return `${token}.${arrayBufferToBase64Url(signature)}`
}
