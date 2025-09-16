import { SignUp } from "@clerk/nextjs"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignUp />
    </div>
  )
}