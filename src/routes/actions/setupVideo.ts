import { getVideo, modifyMetadata } from '@/videos/cfstream'
import { Context } from 'sunder'
import { VideoSetupRequest } from '../models'

export default async function (ctx: Context): Promise<void> {
  if (!ctx.data['authorized']) {
    ctx.response.status = 403
    return
  }
  // const token = ctx.data['jwt'] as JWTContent
  const request = await ctx.request.json<VideoSetupRequest>()

  const cur = await getVideo(request.id, ctx.data['cfauth'])
  if (cur === null) {
    ctx.response.status = 404
    return
  }

  const res = await modifyMetadata(
    request.id,
    {
      requireSignedURLs: true,

      meta: {
        ...cur?.meta,
        acc: JSON.stringify(request.acc),
      },
    },
    ctx.data['cfauth'],
  )
  if (cur === null) {
    ctx.response.status = 500
    return
  }
  ctx.response.body = res
}
