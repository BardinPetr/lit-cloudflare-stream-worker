import { Context, Router } from 'sunder'
import { JWTContent } from '../auth/models'
import verifyVideoToken from '../auth/verify'
import { Env } from '../bindings'
import { getVideo, modifyMetadata } from '../videos/cfstream'
import { VideoSetupRequest } from './models'

export function registerRoutes(router: Router<Env>): void {
  router.get(
    '/video/:id',
    async function (
      ctx: Context<
        {
          VIDEO_AUTH_META: KVNamespace
          CF_STREAM_ACCOUNT: string
          CF_STREAM_TOKEN: string
        },
        { id: string }
      >,
    ) {
      if (!ctx.data['authorized']) {
        ctx.response.status = 403
        return
      }
      const token = ctx.data['jwt'] as JWTContent
      if (token.orgId != ctx.env.CF_STREAM_ACCOUNT) {
        ctx.response.status = 404
        return
      }
      const videoId = token.extraData || 'ed3771762502aa8605c47dffaa01abf9'
      const v = await getVideo(ctx, videoId)
      console.log(v)

      ctx.response.body = v
    },
  )

  router.post(
    '/setup',
    async function (
      ctx: Context<{
        VIDEO_AUTH_META: KVNamespace
        CF_STREAM_ACCOUNT: string
        CF_STREAM_TOKEN: string
      }>,
    ) {
      if (!ctx.data['authorized']) {
        ctx.response.status = 403
        return
      }
      // const token = ctx.data['jwt'] as JWTContent
      const request = await ctx.request.json<VideoSetupRequest>()

      const cur = await getVideo(ctx, request.id)
      if (cur === null) return (ctx.response.status = 404)

      const res = await modifyMetadata(ctx, request.id, {
        requireSignedURLs: true,

        meta: {
          acc: JSON.stringify(request.acc),
          ...cur?.meta,
        },
      })
      if (res === null) ctx.response.status = 400
      ctx.response.body = res
    },
  )

  router.get('/robots.txt', (ctx) => {
    ctx.response.body = `Agent: *\nDisallow: /`
  })
}
