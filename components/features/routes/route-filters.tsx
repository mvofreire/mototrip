'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { RouteFilters as RouteFiltersType } from '@/types'

interface RouteFiltersProps {
  filters: RouteFiltersType
  onFiltersChange: (filters: RouteFiltersType) => void
}

export function RouteFilters({ filters, onFiltersChange }: RouteFiltersProps) {
  const t = useTranslations('filters')
  const tCategories = useTranslations('categories')
  const tDifficulty = useTranslations('difficulty')
  const tCountries = useTranslations('submit')
  
  const categories = [
    { value: 'scenic', label: tCategories('scenic') },
    { value: 'mountain', label: tCategories('mountain') },
    { value: 'coastal', label: tCategories('coastal') },
    { value: 'weekend', label: tCategories('weekend') },
    { value: 'adventure', label: tCategories('adventure') },
  ]

  const difficulties = [
    { value: 'easy', label: tDifficulty('easy') },
    { value: 'moderate', label: tDifficulty('moderate') },
    { value: 'challenging', label: tDifficulty('challenging') },
    { value: 'expert', label: tDifficulty('expert') },
  ]

  const countries = [
    { value: 'PT', label: '🇵🇹 ' + tCountries('countryPortugal') },
    { value: 'ES', label: '🇪🇸 ' + tCountries('countrySpain') },
  ]

  const routeTypes = [
    { value: 'loop', label: '🔄 ' + tCountries('routeTypeLoop') },
    { value: 'out_and_back', label: '⇄ ' + tCountries('routeTypeOutAndBack') },
  ]

  const handleCategoryChange = (category: string, checked: boolean) => {
    const current = filters.category || []
    const updated = checked
      ? [...current, category as any]
      : current.filter(c => c !== category)
    onFiltersChange({ ...filters, category: updated })
  }

  const handleDifficultyChange = (difficulty: string, checked: boolean) => {
    const current = filters.difficulty || []
    const updated = checked
      ? [...current, difficulty as any]
      : current.filter(d => d !== difficulty)
    onFiltersChange({ ...filters, difficulty: updated })
  }

  const handleCountryChange = (country: string, checked: boolean) => {
    const current = filters.country || []
    const updated = checked
      ? [...current, country]
      : current.filter(c => c !== country)
    onFiltersChange({ ...filters, country: updated })
  }

  const handleRouteTypeChange = (routeType: string, checked: boolean) => {
    const current = filters.route_type || []
    const updated = checked
      ? [...current, routeType as 'loop' | 'out_and_back']
      : current.filter(rt => rt !== routeType)
    onFiltersChange({ ...filters, route_type: updated })
  }

  const handleReset = () => {
    onFiltersChange({})
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('title')}</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            {t('reset')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">{t('category')}</Label>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.value}`}
                  checked={filters.category?.includes(category.value as any)}
                  onCheckedChange={(checked) =>
                    handleCategoryChange(category.value, checked as boolean)
                  }
                />
                <label
                  htmlFor={`category-${category.value}`}
                  className="text-sm cursor-pointer"
                >
                  {category.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Difficulty Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">{t('difficulty')}</Label>
          <div className="space-y-2">
            {difficulties.map((difficulty) => (
              <div key={difficulty.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`difficulty-${difficulty.value}`}
                  checked={filters.difficulty?.includes(difficulty.value as any)}
                  onCheckedChange={(checked) =>
                    handleDifficultyChange(difficulty.value, checked as boolean)
                  }
                />
                <label
                  htmlFor={`difficulty-${difficulty.value}`}
                  className="text-sm cursor-pointer"
                >
                  {difficulty.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Country Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">{tCountries('country')}</Label>
          <div className="space-y-2">
            {countries.map((country) => (
              <div key={country.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`country-${country.value}`}
                  checked={filters.country?.includes(country.value)}
                  onCheckedChange={(checked) =>
                    handleCountryChange(country.value, checked as boolean)
                  }
                />
                <label
                  htmlFor={`country-${country.value}`}
                  className="text-sm cursor-pointer"
                >
                  {country.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Route Type Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">{tCountries('routeType')}</Label>
          <div className="space-y-2">
            {routeTypes.map((routeType) => (
              <div key={routeType.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`route-type-${routeType.value}`}
                  checked={filters.route_type?.includes(routeType.value as any)}
                  onCheckedChange={(checked) =>
                    handleRouteTypeChange(routeType.value, checked as boolean)
                  }
                />
                <label
                  htmlFor={`route-type-${routeType.value}`}
                  className="text-sm cursor-pointer"
                >
                  {routeType.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Distance Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">{t('distance')}</Label>
            <span className="text-sm text-muted-foreground">
              {filters.min_distance || 0} - {filters.max_distance || 500}
            </span>
          </div>
          <Slider
            min={0}
            max={500}
            step={10}
            value={[filters.min_distance || 0, filters.max_distance || 500]}
            onValueChange={([min, max]) =>
              onFiltersChange({ ...filters, min_distance: min, max_distance: max })
            }
          />
        </div>

        <Separator />

        {/* Duration Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">{t('duration')}</Label>
            <span className="text-sm text-muted-foreground">
              {(filters.min_duration || 0) / 60} - {(filters.max_duration || 720) / 60}
            </span>
          </div>
          <Slider
            min={0}
            max={720}
            step={30}
            value={[filters.min_duration || 0, filters.max_duration || 720]}
            onValueChange={([min, max]) =>
              onFiltersChange({ ...filters, min_duration: min, max_duration: max })
            }
          />
        </div>

        <Separator />

        {/* Scenic Score Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">{t('minimumRating')}</Label>
            <span className="text-sm text-muted-foreground">
              {filters.min_scenic_score || 0}+
            </span>
          </div>
          <Slider
            min={0}
            max={10}
            step={0.5}
            value={[filters.min_scenic_score || 0]}
            onValueChange={([value]) =>
              onFiltersChange({ ...filters, min_scenic_score: value })
            }
          />
        </div>
      </CardContent>
    </Card>
  )
}
