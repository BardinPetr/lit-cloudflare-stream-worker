import { AccessControlConditions } from '@/auth/models'

export interface CFSAuthParams {
  token: string
  account: string
  jwk?: string
  pem?: string
  kid?: string
}

export interface StoredAccountData {
  auth: CFSAuthParams
  accSetup: AccessControlConditions
  accUpload: AccessControlConditions
}

export interface CFResponse<T> {
  success: boolean
  errors: Array<unknown>
  messages: Array<string>
  result: T
}

export interface CFVideoDetails {
  allowedOrigins: Array<string>
  created: string
  duration: number
  input: {
    height: number
    width: number
  }
  maxDurationSeconds: number
  meta: Record<string, unknown>
  modified: string
  uploadExpiry: string
  playback: {
    hls: string
    dash: string
  }
  preview: string
  readyToStream: boolean
  requireSignedURLs: boolean
  size: number
  status: {
    state?: string
    pctComplete?: number
    errorReasonCode?: string
    errorReasonText?: string
  }
  thumbnail: string
  thumbnailTimestampPct?: number
  uid: string
  liveInput?: string
  uploaded?: string
  watermark?: {
    uid: string
    size: number
    height: number
    width: number
    created: string
    downloadedFrom?: string
    name: string
    opacity: number
    padding: number
    scale: number
    position: string
  }
  nft?: {
    contract: string
    token: number
  }
}

export type Optional<Type> = {
  [Property in keyof Type]+?: Type[Property]
}

export interface ShortVideoInfo {
  id: string
  name: string
  height: number
  width: number
  thumbnail: string
  stream: string
  acc: AccessControlConditions
}

export const generateShortInfo = (
  hostname: string,
  userId: string,
  videos: Array<CFVideoDetails>,
): Array<ShortVideoInfo> =>
  videos.map((v) => {
    return {
      id: v.uid,
      height: v.input.height,
      width: v.input.width,
      name: (v.meta.name || '') as string,
      thumbnail: v.requireSignedURLs
        ? `${hostname}/thumb/${v.uid}?user_id=${userId}`
        : v.thumbnail,
      stream: v.playback.hls || v.playback.dash || '',
      acc: JSON.parse(
        (v.meta.acc || '[]') as string,
      ) as AccessControlConditions,
    } as ShortVideoInfo
  })

export interface CFJWKResponse {
  id: string
  pem: string
  jwk: string
  created: string
}

export interface CFDirectUploadResponse {
  uploadURL: string
  uid: string
}
