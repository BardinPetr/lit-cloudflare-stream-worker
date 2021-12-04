import { Context, MiddlewareNextFunction } from 'sunder'
import { verifyJwt } from './verify'

export default async function JWTAuthMiddleware(
  ctx: Context,
  next: MiddlewareNextFunction,
): Promise<void> {
  ctx.data['authed'] = false
  if (ctx.request.headers.has('authorization')) {
    let auth = ctx.request.headers.get('authorization')
    if (auth?.startsWith('Bearer ')) {
      auth = auth.split(' ')[1]
      const verified = await verifyJwt(auth)
      if (verified !== null) {
        ctx.data['tokenRaw'] = auth
        ctx.data['jwt'] = verified
        ctx.data['authed'] = true
      } else {
        ctx.response.status = 403
        return
      }
    }
  }
  await next()
}
