import { AccessControlConditions } from '@/auth/models'
import { getVideo } from '@/videos/cfstream'
import { ShortVideoInfo } from '@/videos/models'
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

  const res: ShortVideoInfo = {
    id: v.uid,
    height: v.input.height,
    width: v.input.width,
    name: (v.meta.name || '') as string,
    preview: v.preview,
    thumbnail: v.thumbnail,
    stream: v.playback.hls || v.playback.dash || '',
    acc: JSON.parse((v.meta.acc || '{}') as string) as AccessControlConditions,
  }
  ctx.response.body = res
}
