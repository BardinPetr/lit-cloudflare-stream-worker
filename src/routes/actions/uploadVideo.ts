import { getUploadUrl } from '@/videos/cfstream'
import { Context } from 'sunder'

export default async function (
  ctx: Context<{ MAX_VIDEO_DURATION: string }>,
): Promise<void> {
  if (!ctx.data['authorized']) {
    ctx.response.status = 403
    return
  }
  const res = await getUploadUrl(
    ctx.data['cfauth'],
    parseInt(ctx.env.MAX_VIDEO_DURATION),
  )
  if (res === null) {
    ctx.response.status = 404
    return
  }
  ctx.response.body = res
}
