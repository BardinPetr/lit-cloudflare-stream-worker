import { AccessControlConditions } from '@/auth/models'

export interface VideoSetupRequest {
  id: string
  acc: AccessControlConditions
}
