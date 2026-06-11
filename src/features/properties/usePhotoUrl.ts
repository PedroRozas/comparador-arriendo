import { useEffect, useState } from 'react'
import { createPhotoSignedUrl } from './storage'

interface PhotoUrlState {
  url: string | null
  loadedPath: string | null
}

export const usePhotoUrl = (path: string | null) => {
  const [state, setState] = useState<PhotoUrlState>({ url: null, loadedPath: null })

  useEffect(() => {
    if (!path) {
      return
    }
    let isActive = true

    createPhotoSignedUrl(path)
      .then((signedUrl) => {
        if (isActive) {
          setState({ url: signedUrl, loadedPath: path })
        }
      })
      .catch(() => {
        if (isActive) {
          setState({ url: null, loadedPath: path })
        }
      })

    return () => {
      isActive = false
    }
  }, [path])

  const isLoaded = path !== null && state.loadedPath === path

  return {
    url: isLoaded ? state.url : null,
    isLoading: path !== null && !isLoaded,
  }
}
