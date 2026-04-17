import { redirect } from 'next/navigation'

export default function DemoPage() {
  redirect('/login?next=%2Fclub%2Fhome')
}
