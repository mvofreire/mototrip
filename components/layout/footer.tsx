import Link from "next/link"
import { MapPin, Github, Twitter, Instagram } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export function Footer() {
  return (
    <footer className="border-t bg-sand-50">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <div className="h-8 w-8 rounded-md bg-gradient-sunshine flex items-center justify-center">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <span>MotoTrip</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Discover and share the best motorcycle riding routes around the world.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Routes */}
          <div>
            <h3 className="font-semibold mb-4">Routes</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/explore?category=scenic" className="text-muted-foreground hover:text-foreground transition-colors">
                  Scenic Rides
                </Link>
              </li>
              <li>
                <Link href="/explore?category=mountain" className="text-muted-foreground hover:text-foreground transition-colors">
                  Mountain Passes
                </Link>
              </li>
              <li>
                <Link href="/explore?category=coastal" className="text-muted-foreground hover:text-foreground transition-colors">
                  Coastal Routes
                </Link>
              </li>
              <li>
                <Link href="/explore?category=adventure" className="text-muted-foreground hover:text-foreground transition-colors">
                  Adventure Trails
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-semibold mb-4">Community</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/submit" className="text-muted-foreground hover:text-foreground transition-colors">
                  Submit a Route
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-muted-foreground hover:text-foreground transition-colors">
                  Popular Routes
                </Link>
              </li>
              <li>
                <Link href="/riders" className="text-muted-foreground hover:text-foreground transition-colors">
                  Top Riders
                </Link>
              </li>
              <li>
                <Link href="/guidelines" className="text-muted-foreground hover:text-foreground transition-colors">
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col gap-4 text-center text-sm text-muted-foreground md:flex-row md:justify-between">
          <p>© 2026 MotoTrip. All rights reserved.</p>
          <p>Built for riders, by riders 🏍️</p>
        </div>
      </div>
    </footer>
  )
}
