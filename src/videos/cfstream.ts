import generateCFStoken from '@/auth/streamToken'
import { CFResponse, CFSAuthParams, CFVideoDetails, Optional } from './models'

const baseUrl = 'https://api.cloudflare.com/client/v4'

async function call<T>(
  auth: CFSAuthParams,
  path: string,
  method = 'GET',
  body = {},
): Promise<T | null> {
  const params: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${auth.token}`,
      'Content-Type': 'application/json',
    },
  }
  if (method != 'GET') params.body = JSON.stringify(body)
  else params
  const res = await fetch(
    `${baseUrl}/accounts/${auth.account}/stream/${path}`,
    params,
  )
  const data = await res.json<CFResponse<T>>()
  if (data.success) return data.result
  return null
}

export async function getVideoThumbnail(
  videoId: string,
  auth: CFSAuthParams,
): Promise<ReadableStream | null> {
  if (auth.jwk === undefined || auth.kid === undefined) return null
  const token = await generateCFStoken(auth.jwk, auth.kid, videoId)
  const res = await fetch(
    `https://videodelivery.net/${token}/thumbnails/thumbnail.jpg`,
  )
  return res.body
}

export const getVideo = (
  videoId: string,
  auth: CFSAuthParams,
): Promise<CFVideoDetails | null> => call<CFVideoDetails>(auth, videoId)

export const listVideos = (
  auth: CFSAuthParams,
): Promise<Array<CFVideoDetails> | null> =>
  call<Array<CFVideoDetails>>(auth, '?status=ready')

export const modifyMetadata = (
  videoId: string,
  params: Optional<CFVideoDetails>,
  auth: CFSAuthParams,
): Promise<CFVideoDetails | null> =>
  call<CFVideoDetails>(auth, videoId, 'POST', {
    uid: videoId,
    ...params,
  })
