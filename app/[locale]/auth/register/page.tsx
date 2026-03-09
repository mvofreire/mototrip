import { RegisterForm } from '@/components/auth/register-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage({ params }: { params: { locale: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
          <CardDescription>
            Crie sua conta para começar a compartilhar rotas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm locale={params.locale} />
        </CardContent>
      </Card>
    </div>
  )
}
