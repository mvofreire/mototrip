'use client'

import { useState, useEffect } from 'react'
import { AdminRouteWithUser } from '@/lib/services/admin.service'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

interface EditRouteDialogProps {
  open: boolean
  route: AdminRouteWithUser
  onClose: () => void
  onSave: (updates: any) => Promise<void>
  translations: any
}

export function EditRouteDialog({
  open,
  route,
  onClose,
  onSave,
  translations,
}: EditRouteDialogProps) {
  const [formData, setFormData] = useState({
    title: route.title,
    description: route.description || '',
    difficulty: route.difficulty,
    distance_km: route.distance_km,
    duration_minutes: route.duration_minutes,
    elevation_gain_m: route.elevation_gain_m || 0,
    region: route.region || '',
    category: route.category,
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setFormData({
      title: route.title,
      description: route.description || '',
      difficulty: route.difficulty,
      distance_km: route.distance_km,
      duration_minutes: route.duration_minutes,
      elevation_gain_m: route.elevation_gain_m || 0,
      region: route.region || '',
      category: route.category,
    })
  }, [route])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave(formData)
    } catch (error) {
      console.error('Error saving route:', error)
    } finally {
      setLoading(false)
    }
  }

  const difficulties = ['easy', 'moderate', 'challenging', 'expert']
  const categories = ['scenic', 'mountain', 'coastal', 'weekend', 'adventure']

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{translations.editTitle}</DialogTitle>
          <DialogDescription>
            {translations.editDescription}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{translations.titleLabel}</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{translations.descriptionLabel}</Label>
            <textarea
              id="description"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">{translations.difficultyLabel}</Label>
              <div className="flex flex-wrap gap-2">
                {difficulties.map((diff) => (
                  <Badge
                    key={diff}
                    className="cursor-pointer"
                    variant={formData.difficulty === diff ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, difficulty: diff as any })}
                  >
                    {translations.difficulties[diff]}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">{translations.categoryLabel}</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Badge
                    key={cat}
                    className="cursor-pointer"
                    variant={formData.category === cat ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, category: cat as any })}
                  >
                    {translations.categories[cat]}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="distance">{translations.distanceLabel}</Label>
              <Input
                id="distance"
                type="number"
                step="0.1"
                value={formData.distance_km}
                onChange={(e) =>
                  setFormData({ ...formData, distance_km: parseFloat(e.target.value) })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">{translations.durationLabel}</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration_minutes}
                onChange={(e) =>
                  setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="elevation">{translations.elevationLabel}</Label>
              <Input
                id="elevation"
                type="number"
                value={formData.elevation_gain_m}
                onChange={(e) =>
                  setFormData({ ...formData, elevation_gain_m: parseInt(e.target.value) })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="region">{translations.regionLabel}</Label>
            <Input
              id="region"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {translations.cancel}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? translations.saving : translations.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
