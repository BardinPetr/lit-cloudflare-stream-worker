import { setAccountData, getAccountData } from '@/middlewares/storage'
import { getStreamKeys } from '@/videos/cfstream'
import { Context } from 'sunder'
import { RegisterRequest } from '../models'

export default async function (
  ctx: Context<{ REGISTER_SECRET: string; VIDEO_AUTH_META: KVNamespace }>,
): Promise<void> {
  if (
    ctx.env.REGISTER_SECRET === 'disabled' ||
    !ctx.request.headers.has('authorization') ||
    ctx.request.headers.get('authorization') !==
      `Bearer ${ctx.env.REGISTER_SECRET}`
  ) {
    ctx.response.status = 403
    return
  }
  const request = await ctx.request.json<RegisterRequest>()

  const data = await getAccountData(ctx.env.VIDEO_AUTH_META, request.account)
  if (data !== null) {
    ctx.response.status = 400
    return
  }

  const keys = await getStreamKeys(request.account, request.token)

  if (keys === null) {
    ctx.response.status = 500
    return
  }

  await setAccountData(ctx.env.VIDEO_AUTH_META, request, keys)

  ctx.response.status = 200
}
