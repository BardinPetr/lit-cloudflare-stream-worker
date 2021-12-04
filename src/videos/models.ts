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
  thumbnail?: string
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
