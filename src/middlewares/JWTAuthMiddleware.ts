import { Context, MiddlewareNextFunction } from 'sunder'
import { verifyJwt } from '../auth/verify'

export default async function JWTAuthMiddleware(
  ctx: Context,
  next: MiddlewareNextFunction,
): Promise<void> {
  ctx.data['authorized'] = false
  if (ctx.request.headers.has('authorization')) {
    let auth = ctx.request.headers.get('authorization')
    if (auth?.startsWith('Bearer ')) {
      auth = auth.split(' ')[1]
      const verified = await verifyJwt(auth)
      if (
        verified === null ||
        ctx.env.CF_ACCOUNT_ID !== verified.orgId ||
        ctx.url.hostname !== verified.baseUrl ||
        ctx.url.pathname !== verified.path
      ) {
        ctx.response.status = 403
        return
      }
      ctx.data['tokenRaw'] = auth
      ctx.data['jwt'] = verified
      ctx.data['authorized'] = true
    }
  }
  await next()
}
