import { ProfileForm } from '@/components/profile/profile-form'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { SavedRoutes } from '@/components/profile/saved-routes'

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Meu Perfil</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie suas informações e preferências
            </p>
          </div>
          <ProfileForm />
          <div className="mt-12">
            <SavedRoutes />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
