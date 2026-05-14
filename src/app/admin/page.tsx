import { createAdminClient } from '@/lib/supabase/admin'

export default async function AdminPage() {
  const admin = createAdminClient()

  const [
    { count: usersCount },
    { count: clubsCount },
    { count: sessionsCount },
    { count: matchesCount },
  ] = await Promise.all([
    admin.from('users').select('*', { count: 'exact', head: true }),
    admin.from('clubs').select('*', { count: 'exact', head: true }),
    admin.from('sessions').select('*', { count: 'exact', head: true }),
    admin.from('matches').select('*', { count: 'exact', head: true }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">버디민턴 어드민 (v3)</h1>
        <p className="text-sm text-gray-600 mt-1">PRD §4 기준 신규 스키마</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="유저" value={usersCount ?? 0} />
        <StatCard label="모임" value={clubsCount ?? 0} />
        <StatCard label="세션" value={sessionsCount ?? 0} />
        <StatCard label="매치" value={matchesCount ?? 0} />
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-bold mt-1">{value.toLocaleString()}</div>
    </div>
  )
}
