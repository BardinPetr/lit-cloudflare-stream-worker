import { Context, MiddlewareNextFunction } from 'sunder'

export default async function corsMiddleware(
  ctx: Context,
  next: MiddlewareNextFunction,
): Promise<void> {
  ctx.response.headers.set('Access-Control-Allow-Origin', '*')
  ctx.response.headers.set(
    'Access-Control-Allow-Headers',
    'Origin, Content-Type, X-Auth-Token, Authorization, CF_ACCOUNT',
  )
  ctx.response.headers.set('Access-Control-Allow-Methods', 'GET, POST')

  if (ctx.request.method === 'OPTIONS') {
    ctx.response.status = 200
    return
  }

  await next()
}
