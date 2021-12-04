import { Context } from 'sunder'
import { CFResponse, CFVideoDetails, Optional } from './models'

const baseUrl = 'https://api.cloudflare.com/client/v4'

async function call<T>(
  ctx: Context<{
    CF_STREAM_ACCOUNT: string
    CF_STREAM_TOKEN: string
  }>,
  path: string,
  method = 'GET',
  body = {},
): Promise<T | null> {
  const params: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${ctx.env.CF_STREAM_TOKEN}`,
      'Content-Type': 'application/json',
    },
  }
  if (method != 'GET') params.body = JSON.stringify(body)
  const res = await fetch(
    `${baseUrl}/accounts/${ctx.env.CF_STREAM_ACCOUNT}/stream/${path}`,
    params,
  )
  const data = await res.json<CFResponse<T>>()
  if (data.success) return data.result
  return null
}

export const getVideo = (
  ctx: Context<{
    CF_STREAM_ACCOUNT: string
    CF_STREAM_TOKEN: string
  }>,
  videoId: string,
): Promise<CFVideoDetails | null> => call<CFVideoDetails>(ctx, videoId)

export const modifyMetadata = (
  ctx: Context<{
    CF_STREAM_ACCOUNT: string
    CF_STREAM_TOKEN: string
  }>,
  videoId: string,
  params: Optional<CFVideoDetails>,
): Promise<CFVideoDetails | null> =>
  call<CFVideoDetails>(ctx, videoId, 'POST', {
    uid: videoId,
    ...params,
  })
