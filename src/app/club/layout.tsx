import { Toaster } from 'sonner'

export default function ClubLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-[#beff00] focus:text-[#111] focus:font-bold focus:px-4 focus:py-2 focus:rounded-lg"
      >
        본문으로 바로가기
      </a>
      {children}
      <Toaster richColors position="bottom-center" />
    </>
  )
}
