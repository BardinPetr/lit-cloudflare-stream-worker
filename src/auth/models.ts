export interface JWTContent {
  sub: string
  chain: string
  iat: number
  exp: number
  baseUrl: string
  path: string
  orgId: string
  role: string
  extraData: string
}
