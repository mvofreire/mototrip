import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MapPin } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container flex items-center justify-center min-h-[600px]">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-full bg-gradient-sunshine flex items-center justify-center">
            <MapPin className="h-12 w-12 text-white" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">404</h1>
          <h2 className="text-2xl font-semibold">Route Not Found</h2>
          <p className="text-muted-foreground">
            Looks like this road doesn't exist. Let's get you back on track.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-gradient-sunshine hover:opacity-90">
            <Link href="/">
              Back to Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/explore">
              Explore Routes
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
