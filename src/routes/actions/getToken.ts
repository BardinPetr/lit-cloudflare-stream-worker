import { JWTContent } from '@/auth/models'
import generateCFStoken from '@/auth/streamToken'
import { getVideo } from '@/videos/cfstream'
import { Context } from 'sunder'

export default async function (
  ctx: Context<
    {
      CF_STREAM_KID: string
      CF_STREAM_JWK: string
    },
    { id: string }
  >,
): Promise<void> {
  if (!ctx.data['authorized']) {
    ctx.response.status = 403
    return
  }
  const v = await getVideo(ctx.params.id, ctx.data['cfauth'])
  if (v === null) {
    ctx.response.status = 404
    return
  }
  const res = await generateCFStoken(
    ctx.env.CF_STREAM_JWK,
    ctx.env.CF_STREAM_KID,
    ctx.params.id,
  )
  ctx.response.body = res
}
