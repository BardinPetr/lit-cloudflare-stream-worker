import { AccessControlConditions } from '@/auth/models'

export interface VideoSetupRequest {
  id: string
  acc: AccessControlConditions
}

export interface RegisterRequest {
  account: string
  token: string
  accSetup: AccessControlConditions
  accUpload: AccessControlConditions
}

export interface ACCResponse {
  accSetup: AccessControlConditions
  accUpload: AccessControlConditions
}
