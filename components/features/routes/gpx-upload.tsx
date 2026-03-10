'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { parseGPXFile, gpxPointsToGeoJSON, type GPXData } from '@/lib/gpx-parser'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, X, FileText, MapPin, TrendingUp, Mountain } from 'lucide-react'
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps'
import { useTranslations } from 'next-intl'

interface GPXUploadProps {
  onGPXParsed: (gpxData: GPXData, file: File, thumbnailDataUrl?: string) => void
  locale: string
}

export function GPXUpload({ onGPXParsed, locale }: GPXUploadProps) {
  const t = useTranslations('submit')
  const [file, setFile] = useState<File | null>(null)
  const [gpxData, setGpxData] = useState<GPXData | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.gpx')) {
      setError(t('gpxError'))
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const parsedData = await parseGPXFile(selectedFile)
      setFile(selectedFile)
      setGpxData(parsedData)
      
      // Generate thumbnail URL using Google Maps Static API
      const thumbnailUrl = generateMapThumbnail(parsedData.points, parsedData.bounds)
      
      onGPXParsed(parsedData, selectedFile, thumbnailUrl)
    } catch (err) {
      console.error('Error parsing GPX:', err)
      setError(err instanceof Error ? err.message : 'Erro ao processar arquivo GPX')
      setFile(null)
      setGpxData(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleClear = () => {
    setFile(null)
    setGpxData(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatDistance = (km: number) => {
    return km.toFixed(1)
  }

  const formatElevation = (m: number) => {
    return Math.round(m)
  }

  const generateMapThumbnail = (points: { lat: number; lng: number }[], bounds: any): string => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
    
    // Sample points to keep URL length reasonable (max 100 points)
    const sampledPoints = points.filter((_, i) => i % Math.ceil(points.length / 100) === 0)
    
    // Create path parameter for polyline
    const path = sampledPoints.map(p => `${p.lat},${p.lng}`).join('|')
    
    // Calculate center and zoom to fit bounds
    const centerLat = (bounds.north + bounds.south) / 2
    const centerLng = (bounds.east + bounds.west) / 2
    
    // Generate Static Maps API URL
    const url = `https://maps.googleapis.com/maps/api/staticmap?` +
      `center=${centerLat},${centerLng}&` +
      `zoom=10&` +
      `size=640x360&` +
      `scale=2&` +
      `maptype=roadmap&` +
      `path=color:0xff0000ff|weight:3|${path}&` +
      `key=${apiKey}`
    
    return url
  }

  if (gpxData && file) {
    return (
      <Card className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{file.name}</h3>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Route Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{formatDistance(gpxData.totalDistance)} km</div>
              <div className="text-xs text-muted-foreground">{t('gpxDistance')}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{formatElevation(gpxData.elevationGain)} m</div>
              <div className="text-xs text-muted-foreground">{t('gpxElevationGain')}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Mountain className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">
                {gpxData.maxElevation ? `${formatElevation(gpxData.maxElevation)} m` : 'N/A'}
              </div>
              <div className="text-xs text-muted-foreground">{t('gpxPoints')}</div>
            </div>
          </div>
        </div>

        {/* Map Preview */}
        <div className="h-[400px] rounded-lg overflow-hidden border">
          <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
            <Map
              defaultCenter={{
                lat: (gpxData.bounds.north + gpxData.bounds.south) / 2,
                lng: (gpxData.bounds.east + gpxData.bounds.west) / 2,
              }}
              defaultZoom={10}
              mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID'}
              gestureHandling="greedy"
              disableDefaultUI={false}
              mapTypeControl={false}
              streetViewControl={false}
            >
              <RoutePolyline points={gpxData.points} />
            </Map>
          </APIProvider>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onClick={() => !isLoading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".gpx"
          className="hidden"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0]
            if (selectedFile) handleFileSelect(selectedFile)
          }}
          disabled={isLoading}
        />

        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {isDragging
              ? t('gpxUploadTitle')
              : isLoading
              ? t('submitting')
              : t('gpxUploadTitle')}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('gpxUploadDesc')}
          </p>
        </div>

        {!isLoading && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={(e) => {
              e.stopPropagation()
              fileInputRef.current?.click()
            }}
          >
            {t('gpxSelectFile')}
          </Button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="text-xs text-muted-foreground space-y-1">
        <p><strong>{t('gpxTipTitle')}</strong> {t('gpxTipDescription')}</p>
        <ul className="list-disc list-inside ml-2 space-y-0.5">
          <li>{t('gpxTipApp1')}</li>
          <li>{t('gpxTipApp2')}</li>
          <li>{t('gpxTipApp3')}</li>
        </ul>
      </div>
    </Card>
  )
}

// Component to render the polyline on the map
function RoutePolyline({ points }: { points: { lat: number; lng: number }[] }) {
  const map = useMap()

  // Draw polyline when map is ready
  useEffect(() => {
    if (!map) return

    const polyline = new google.maps.Polyline({
      path: points,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 3,
    })

    polyline.setMap(map)

    // Fit bounds to show entire route
    const bounds = new google.maps.LatLngBounds()
    points.forEach(point => bounds.extend(point))
    map.fitBounds(bounds)

    return () => {
      polyline.setMap(null)
    }
  }, [map, points])

  return null
}
