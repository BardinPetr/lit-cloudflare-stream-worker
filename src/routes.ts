import { Context, Router } from 'sunder'
import { JWTContent } from './auth/models'
import verifyVideoToken from './auth/verify'
import { Env } from './bindings'

export function registerRoutes(router: Router<Env>): void {
  router.get(
    '/video/:id',
    async (ctx: Context<{ VIDEO_AUTH_META: KVNamespace }, { id: string }>) => {
      if (!ctx.data['authed']) {
        ctx.response.status = 403
        return
      }
      console.log(ctx.data['jwt'] as JWTContent)
    },
  )

  router.get('/robots.txt', (ctx) => {
    ctx.response.body = `Agent: *\nDisallow: /`
  })
}
