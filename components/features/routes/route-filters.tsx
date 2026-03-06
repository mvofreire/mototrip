'use client'

import { useState } from 'react'
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
  const categories = [
    { value: 'scenic', label: 'Scenic' },
    { value: 'mountain', label: 'Mountain' },
    { value: 'coastal', label: 'Coastal' },
    { value: 'weekend', label: 'Weekend' },
    { value: 'adventure', label: 'Adventure' },
  ]

  const difficulties = [
    { value: 'easy', label: 'Easy' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'challenging', label: 'Challenging' },
    { value: 'expert', label: 'Expert' },
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

  const handleReset = () => {
    onFiltersChange({})
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Filters</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Category</Label>
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
          <Label className="text-sm font-semibold">Difficulty</Label>
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

        {/* Distance Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Distance (km)</Label>
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
            <Label className="text-sm font-semibold">Duration (hours)</Label>
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
            <Label className="text-sm font-semibold">Minimum Rating</Label>
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
