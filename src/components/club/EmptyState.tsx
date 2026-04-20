import { Users, Wallet, Trophy, CalendarDays } from 'lucide-react'

export function EmptyMembers() {
  return (
    <div role="status" className="py-12 text-center">
      <Users size={40} className="text-[#ccc] mx-auto mb-3" strokeWidth={1.5} />
      <p className="font-bold text-[#111] mb-1">아직 멤버가 없어요</p>
      <p className="text-sm text-[#999]">멤버를 초대해 모임을 시작해보세요</p>
    </div>
  )
}

export function EmptyDues() {
  return (
    <div role="status" className="py-12 text-center">
      <Wallet size={40} className="text-[#ccc] mx-auto mb-3" strokeWidth={1.5} />
      <p className="font-bold text-[#111] mb-1">회비 내역이 없어요</p>
      <p className="text-sm text-[#999]">회비 금액을 설정하면 내역이 표시돼요</p>
    </div>
  )
}

export function EmptyRanking() {
  return (
    <div role="status" className="py-12 text-center">
      <Trophy size={40} className="text-[#ccc] mx-auto mb-3" strokeWidth={1.5} />
      <p className="font-bold text-[#111] mb-1">아직 경기 기록이 없어요</p>
      <p className="text-sm text-[#999]">경기를 진행하면 랭킹이 집계돼요</p>
    </div>
  )
}

export function EmptyEvents() {
  return (
    <div role="status" className="py-12 text-center">
      <CalendarDays size={40} className="text-[#ccc] mx-auto mb-3" strokeWidth={1.5} />
      <p className="font-bold text-[#111] mb-1">등록된 일정이 없어요</p>
      <p className="text-sm text-[#999]">운영진이 일정을 등록하면 표시돼요</p>
    </div>
  )
}
