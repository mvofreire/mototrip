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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

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
    category: route.category,
    route_type: route.route_type || '',
    published: route.published,
    featured: route.featured,
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setFormData({
      title: route.title,
      description: route.description || '',
      difficulty: route.difficulty,
      distance_km: route.distance_km,
      duration_minutes: route.duration_minutes,
      category: route.category,
      route_type: route.route_type || '',
      published: route.published,
      featured: route.featured,
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

  const difficulties = [
    { value: 'easy', label: translations.difficulties?.easy || 'Easy' },
    { value: 'moderate', label: translations.difficulties?.moderate || 'Moderate' },
    { value: 'challenging', label: translations.difficulties?.challenging || 'Challenging' },
    { value: 'expert', label: translations.difficulties?.expert || 'Expert' },
  ]

  const categories = [
    { value: 'scenic', label: translations.categories?.scenic || 'Scenic' },
    { value: 'mountain', label: translations.categories?.mountain || 'Mountain' },
    { value: 'coastal', label: translations.categories?.coastal || 'Coastal' },
    { value: 'weekend', label: translations.categories?.weekend || 'Weekend' },
    { value: 'adventure', label: translations.categories?.adventure || 'Adventure' },
  ]

  const routeTypes = [
    { value: 'loop', label: '🔄 Loop (Circular)' },
    { value: 'out_and_back', label: '⇄ ' + (translations.outAndBack || 'Vai e Volta') },
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{translations.editRoute || 'Editar Rota'}</DialogTitle>
          <DialogDescription>
            {translations.editRouteDescription || 'Faça alterações na rota abaixo.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{translations.title || 'Título'}</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{translations.description || 'Descrição'}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">{translations.difficulty || 'Dificuldade'}</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData({ ...formData, difficulty: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a dificuldade" />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((difficulty) => (
                    <SelectItem key={difficulty.value} value={difficulty.value}>
                      {difficulty.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">{translations.category || 'Categoria'}</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="route_type">{translations.routeType || 'Tipo de Rota'}</Label>
            <Select
              value={formData.route_type || undefined}
              onValueChange={(value) => setFormData({ ...formData, route_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={translations.selectRouteType || "Selecione o tipo de rota"} />
              </SelectTrigger>
              <SelectContent>
                {routeTypes.map((routeType) => (
                  <SelectItem key={routeType.value} value={routeType.value}>
                    {routeType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="distance">{translations.distance || 'Distância (km)'}</Label>
              <Input
                id="distance"
                type="number"
                step="0.1"
                value={formData.distance_km}
                onChange={(e) =>
                  setFormData({ ...formData, distance_km: parseFloat(e.target.value) || 0 })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">{translations.duration || 'Duração (min)'}</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration_minutes}
                onChange={(e) =>
                  setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="published"
                checked={formData.published}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, published: checked as boolean })
                }
              />
              <Label htmlFor="published">
                {translations.published || 'Publicada'}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, featured: checked as boolean })
                }
              />
              <Label htmlFor="featured">
                {translations.featured || 'Em destaque'}
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              {translations.cancel || 'Cancelar'}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (translations.saving || 'Salvando...') : (translations.save || 'Salvar')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
