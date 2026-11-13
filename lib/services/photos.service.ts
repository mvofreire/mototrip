import { supabase } from '@/lib/supabase/client'
import type { RoutePhoto } from '@/types'
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES, prepareImage } from '@/lib/images/prepare-image'

const BUCKET = 'route_photos'
const MAX_BYTES = MAX_IMAGE_BYTES
export const ACCEPTED_PHOTO_TYPES = ACCEPTED_IMAGE_TYPES

function storagePathFromUrl(url: string): string | null {
  const marker = `/${BUCKET}/`
  const i = url.indexOf(marker)
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length))
}

export class InvalidPhotoError extends Error {}

export const PhotosService = {
  async upload(routeId: string, userId: string, file: File, orderIndex: number): Promise<RoutePhoto> {
    if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) throw new InvalidPhotoError()
    const blob = await prepareImage(file)
    if (blob.size > MAX_BYTES) throw new InvalidPhotoError()

    const path = `${routeId}/${crypto.randomUUID()}.jpg`
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000' })
    if (uploadError) throw uploadError

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(path)

    const { data, error } = await supabase
      .from('route_photos')
      .insert({ route_id: routeId, user_id: userId, url: publicUrl, order_index: orderIndex } as never)
      .select()
      .single()

    if (error) {
      // Don't leave an orphan file behind
      await supabase.storage.from(BUCKET).remove([path])
      throw error
    }
    return data as RoutePhoto
  },

  async remove(photo: RoutePhoto) {
    const { error } = await supabase.from('route_photos').delete().eq('id', photo.id)
    if (error) throw error
    const path = storagePathFromUrl(photo.url)
    if (path) await supabase.storage.from(BUCKET).remove([path])
  },
}
