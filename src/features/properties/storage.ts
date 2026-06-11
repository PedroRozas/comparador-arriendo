import { supabase } from '../../lib/supabase'

const PHOTO_BUCKET = 'property-photos'
const SIGNED_URL_TTL_SECONDS = 3600

export const uploadPropertyPhoto = async (userId: string, file: File): Promise<string> => {
  const extension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg'
  const path = `${userId}/${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, file, {
    contentType: file.type !== '' ? file.type : undefined,
    upsert: false,
  })
  if (error) {
    throw new Error(`No se pudo subir la foto: ${error.message}`)
  }
  return path
}

export const createPhotoSignedUrl = async (path: string): Promise<string> => {
  const { data, error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS)
  if (error) {
    throw new Error(`No se pudo generar la URL de la foto: ${error.message}`)
  }
  return data.signedUrl
}

export const removePropertyPhoto = async (path: string): Promise<void> => {
  const { error } = await supabase.storage.from(PHOTO_BUCKET).remove([path])
  if (error) {
    throw new Error(`No se pudo eliminar la foto: ${error.message}`)
  }
}
