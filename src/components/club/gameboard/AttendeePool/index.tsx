'use client'

import type { ClubMemberWithUser } from '@/types/club'
import type { PlayerEntry } from '../types'
import { SetupModePool } from './SetupModePool'
import { PlayingModePool } from './PlayingModePool'

type AttendeePoolProps =
  | {
      mode: 'setup'
      members: ClubMemberWithUser[]
      selectedPlayers: Set<string>
      onTogglePlayer: (memberId: string) => void
    }
  | {
      mode: 'playing'
      players: PlayerEntry[]
    }

/**
 * 회원 풀 — setup / playing 두 phase 모두에서 재사용.
 * - setup: 토글 그리드 (출석자 선택). lime 강조.
 * - playing: 읽기 전용 칩 strip (참가자 한눈에). court green / neutral.
 *
 * 등급 필터(8명+)와 visible 목록 계산은 각 mode 컴포넌트가 자체 관리합니다.
 */
export function AttendeePool(props: AttendeePoolProps) {
  if (props.mode === 'setup') {
    return (
      <SetupModePool
        members={props.members}
        selectedPlayers={props.selectedPlayers}
        onTogglePlayer={props.onTogglePlayer}
      />
    )
  }
  return <PlayingModePool players={props.players} />
}
