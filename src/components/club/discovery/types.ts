export interface ClubDiscoveryItem {
  id: string
  name: string
  description?: string | null
  location: string | null
  activityPlace?: string | null
  category?: string | null
  thumbnailUrl: string | null
  thumbnailColor: string

  memberCount: number
  courtCount: number

  isAcceptingMembers?: boolean
  ownerName?: string | null
  isDemo?: boolean

  createdAt: string
}
