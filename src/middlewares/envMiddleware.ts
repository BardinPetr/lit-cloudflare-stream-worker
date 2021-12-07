import { CFSAuthParams } from '@/videos/models'
import { Context, MiddlewareNextFunction } from 'sunder'
import { getKeys } from './storage'

export default async function envMiddleware(
  ctx: Context<{
    CF_ACCOUNT_ID: string
    CF_API_TOKEN: string
    CF_STREAM_JWK: string
    CF_STREAM_PEM: string
    CF_STREAM_KID: string
    REGISTER_SECRET: string
    VIDEO_AUTH_META: KVNamespace
  }>,
  next: MiddlewareNextFunction,
): Promise<void> {
  let auth: CFSAuthParams

  if (
    ctx.request.headers.has('CF_ACCOUNT') &&
    ctx.env.REGISTER_SECRET !== 'disable'
  ) {
    const res = await getKeys(
      ctx.env.VIDEO_AUTH_META,
      ctx.request.headers.get('CF_ACCOUNT') ?? '',
    )
    if (res === null) {
      ctx.response.status = 403
      return
    }
    auth = res
  } else {
    auth = {
      account: ctx.env.CF_ACCOUNT_ID,
      token: ctx.env.CF_API_TOKEN,
      jwk: ctx.env.CF_STREAM_JWK,
      pem: ctx.env.CF_STREAM_PEM,
      kid: ctx.env.CF_STREAM_KID,
    }
  }

  ctx.data['cfauth'] = auth
  await next()
}
