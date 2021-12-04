export interface JWTContent {
  sub: string
  chain: string
  iat: number
  iss: string
  exp: number
  baseUrl: string
  path: string
  orgId: string
  role: string
  extraData: string
}
export interface AccessControlCondition {
  contractAddress: string
  standardContractType: string
  chain: string
  method: string
  parameters: Array<string>
  returnValueTest: {
    comparator: string
    value: string
  }
}

export type AccessControlConditions = Array<AccessControlCondition>
