import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDistance(km: number): string {
  return `${km.toFixed(1)} km`
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours === 0) {
    return `${mins}min`
  }
  
  if (mins === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${mins}min`
}

export function formatElevation(meters: number): string {
  return `${meters.toFixed(0)}m`
}

export function getDifficultyColor(difficulty: string): string {
  const colors = {
    easy: 'text-green-600 bg-green-50 border-green-200',
    moderate: 'text-sunshine-yellow-600 bg-sunshine-yellow-50 border-sunshine-yellow-200',
    challenging: 'text-sunshine-orange-600 bg-sunshine-orange-50 border-sunshine-orange-200',
    expert: 'text-red-600 bg-red-50 border-red-200',
  }
  return colors[difficulty as keyof typeof colors] || colors.moderate
}

export function getCategoryColor(category: string): string {
  const colors = {
    scenic: 'text-sunshine-pink-600 bg-sunshine-pink-50 border-sunshine-pink-200',
    mountain: 'text-blue-600 bg-blue-50 border-blue-200',
    coastal: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    weekend: 'text-sunshine-coral-600 bg-sunshine-coral-50 border-sunshine-coral-200',
    adventure: 'text-sunshine-orange-600 bg-sunshine-orange-50 border-sunshine-orange-200',
  }
  return colors[category as keyof typeof colors] || colors.scenic
}

export function formatRating(rating: number): string {
  return rating.toFixed(1)
}

export function getStopIcon(type: string): string {
  const icons = {
    viewpoint: '🏔️',
    cafe: '☕',
    gas_station: '⛽',
    restaurant: '🍽️',
    landmark: '🏛️',
    accommodation: '🏨',
  }
  return icons[type as keyof typeof icons] || '📍'
}
