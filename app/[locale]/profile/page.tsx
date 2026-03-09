import { ProfileForm } from '@/components/profile/profile-form'
import { ProtectedRoute } from '@/components/auth/protected-route'

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
        </div>
      </div>
    </ProtectedRoute>
  )
}
