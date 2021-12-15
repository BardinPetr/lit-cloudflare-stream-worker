import { getAccountData } from '@/middlewares/storage'
import { Context } from 'sunder'
import { ACCResponse } from '../models'

export default async function (
  ctx: Context<{ VIDEO_AUTH_META: KVNamespace }>,
): Promise<void> {
  const data = await getAccountData(
    ctx.env.VIDEO_AUTH_META,
    ctx.data['cfauth'].account,
  )
  if (data === null) {
    ctx.response.status = 400
    return
  }
  ctx.response.body = {
    accSetup: data?.accSetup,
    accUpload: data?.accUpload,
  } as ACCResponse
}
