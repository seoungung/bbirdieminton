import { LoginButton } from './LoginButton'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center space-y-8 max-w-sm w-full">
        <div>
          <h1 className="text-3xl font-bold mb-2">🏸 버디민턴</h1>
          <p className="text-sm text-gray-500">배드민턴 동호회 운영 SaaS</p>
        </div>
        <LoginButton />
      </div>
    </main>
  )
}
