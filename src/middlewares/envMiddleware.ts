import { CFSAuthParams } from '@/videos/models'
import { Context, MiddlewareNextFunction } from 'sunder'

export default async function envMiddleware(
  ctx: Context<{
    CF_ACCOUNT_ID: string
    CF_API_TOKEN: string
    CF_STREAM_JWK: string
    CF_STREAM_PEM: string
    CF_STREAM_KID: string
  }>,
  next: MiddlewareNextFunction,
): Promise<void> {
  const auth: CFSAuthParams = {
    account: ctx.env.CF_ACCOUNT_ID,
    token: ctx.env.CF_API_TOKEN,
    jwk: ctx.env.CF_STREAM_JWK,
    pem: ctx.env.CF_STREAM_PEM,
    kid: ctx.env.CF_STREAM_KID,
  }
  ctx.data['cfauth'] = auth
  await next()
}
