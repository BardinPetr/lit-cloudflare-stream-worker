import { Context, MiddlewareNextFunction } from 'sunder'

export default async function catchMiddleware(
  ctx: Context,
  next: MiddlewareNextFunction,
): Promise<void> {
  try {
    await next()
  } catch (e) {
    console.error(e)
    ctx.response.status = 500
  }
}
