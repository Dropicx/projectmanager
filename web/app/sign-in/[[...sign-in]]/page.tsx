import { SignIn } from "@clerk/nextjs"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignIn />
    </div>
  )
}