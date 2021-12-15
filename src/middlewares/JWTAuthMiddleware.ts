import { isUnauthedRoute } from '@/routes/routes'
import { Context, MiddlewareNextFunction } from 'sunder'
import { verifyJwt } from '../auth/verify'

export default async function JWTAuthMiddleware(
  ctx: Context,
  next: MiddlewareNextFunction,
): Promise<void> {
  ctx.data['authorized'] = false
  if (ctx.request.headers.has('authorization') && !isUnauthedRoute(ctx.url)) {
    let auth = ctx.request.headers.get('authorization')
    if (auth?.startsWith('Bearer ')) {
      auth = auth.split(' ')[1]
      let verified
      try {
        verified = await verifyJwt(auth)
      } catch {
        await next()
        return
      }
      if (
        verified === null ||
        ctx.data['cfauth'].account !== verified.orgId ||
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
