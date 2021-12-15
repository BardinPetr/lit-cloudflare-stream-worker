import { AccessControlConditions } from '@/auth/models'
import { getVideo } from '@/videos/cfstream'
import { generateShortInfo, ShortVideoInfo } from '@/videos/models'
import { Context } from 'sunder'

export default async function (
  ctx: Context<unknown, { id: string }>,
): Promise<void> {
  const v = await getVideo(ctx.params.id, ctx.data['cfauth'])
  if (v === null) {
    ctx.response.status = 404
    return
  }
  if (ctx.data['authorized']) {
    ctx.response.body = v
    return
  }
  ctx.response.body = generateShortInfo(
    ctx.url.origin,
    ctx.data['cfauth'].account,
    [v],
  )[0]
}
