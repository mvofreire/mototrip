'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { Calendar, Camera, LayoutGrid, Shield } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { isStaff } from '@/lib/auth/roles'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ProfileAvatar } from './profile-avatar'

// The editor (canvas, slider, upload) only loads once the camera is tapped
const AvatarEditor = dynamic(() => import('./avatar-editor'), { ssr: false })

/** Contour lines + the dashed red road: inline SVG, no image request on the LCP path */
function CoverArt() {
  return (
    <svg
      viewBox="0 0 400 200"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full text-border"
    >
      {[0, 1, 2, 3, 4, 5].map((k) => (
        <path
          key={k}
          d={`M-20 ${150 - k * 22} C 80 ${110 - k * 24}, 160 ${190 - k * 20}, 260 ${120 - k * 22} S 380 ${90 - k * 18}, 440 ${130 - k * 22}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
        />
      ))}
      <path
        d="M-20 160 C 90 120, 170 200, 270 128 S 380 96, 440 140"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2.5"
        strokeDasharray="2 8"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        className="profile-road"
      />
    </svg>
  )
}

/** Cover, photo (with the camera to change it), name, role, member since and e-mail */
export function ProfileHero({ onNotice }: { onNotice: (message: string) => void }) {
  const t = useTranslations('account')
  const tRoles = useTranslations('admin.users.roles')
  const tNav = useTranslations('nav')
  const locale = useLocale()
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [editorLoaded, setEditorLoaded] = useState(false)

  if (!user) return null
  const profile = user.profile
  const name = profile?.full_name
  const since = profile?.created_at
    ? new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' }).format(new Date(profile.created_at))
    : null

  const openEditor = () => {
    setEditorLoaded(true)
    setEditing(true)
  }

  return (
    <div>
      <div className="relative h-32 overflow-hidden bg-[radial-gradient(120%_140%_at_85%_0%,hsl(var(--primary)/0.35),transparent_55%),linear-gradient(180deg,hsl(var(--secondary)),hsl(var(--background)))] md:h-48">
        <CoverArt />
      </div>

      <div className="container relative -mt-12 flex flex-col gap-3 md:-mt-16 md:flex-row md:items-end md:gap-6">
        <div className="relative w-fit">
          <button
            type="button"
            onClick={openEditor}
            aria-label={t('changePhoto')}
            className="block rounded-full ring-4 ring-background focus-visible:outline-none focus-visible:ring-primary"
          >
            <ProfileAvatar
              src={profile?.avatar_url}
              name={name || user.email}
              size={128}
              sizes="(min-width: 768px) 128px, 96px"
              priority
              className="h-24 w-24 md:h-32 md:w-32"
            />
          </button>
          <button
            type="button"
            onClick={openEditor}
            aria-label={t('changePhoto')}
            className="absolute -bottom-0.5 -right-0.5 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-background bg-primary text-primary-foreground transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h1 className={cn('mb-2.5 break-words text-[34px] font-extrabold leading-[0.95] md:text-5xl', !name && 'text-muted-foreground')}>
              {name || t('noName')}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full border bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                <Shield className="h-3 w-3" />
                {tRoles(profile?.role ?? 'contributor')}
              </span>
              {since && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {t('memberSince', { date: since })}
                </span>
              )}
            </div>
            <p className="mt-1.5 break-all text-[13px] text-muted-foreground">{user.email}</p>
          </div>
          {isStaff(user) && (
            <Button asChild size="sm" variant="outline">
              <Link href={`/${locale}/profile/admin`}>
                <LayoutGrid className="mr-2 h-4 w-4" />
                {tNav('admin')}
              </Link>
            </Button>
          )}
        </div>
      </div>

      {editorLoaded && <AvatarEditor open={editing} onOpenChange={setEditing} onSaved={onNotice} />}
    </div>
  )
}
