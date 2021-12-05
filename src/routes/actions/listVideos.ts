import { listVideos } from '@/videos/cfstream'
import { generateShortInfo } from '@/videos/models'
import { Context } from 'sunder'

export default async function (ctx: Context): Promise<void> {
  const v = await listVideos(ctx.data['cfauth'])
  if (v === null) {
    ctx.response.status = 404
    return
  }
  ctx.response.body = generateShortInfo(ctx.url.origin, v)
}
