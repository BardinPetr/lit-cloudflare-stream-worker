import { getVideoThumbnail } from '@/videos/cfstream'
import { Context } from 'sunder'

export default async function (
  ctx: Context<unknown, { id: string }>,
): Promise<void> {
  const img = await getVideoThumbnail(ctx.params.id, ctx.data['cfauth'])
  if (img === null) {
    ctx.response.status = 404
    return
  }
  ctx.response.body = img
}
