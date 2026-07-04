import type { ReactNode } from 'react'
import { useAuth, SignIn } from '@clerk/clerk-react'
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner'

interface Props {
  children: ReactNode
}

export default function ProtectedRoute({ children }: Props) {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) return <LoadingSpinner fullPage />

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-[80dvh]">
        <SignIn />
      </div>
    )
  }

  return <>{children}</>
}
