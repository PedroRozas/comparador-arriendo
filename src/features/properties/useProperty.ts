import { useCallback, useEffect, useState } from 'react'
import { getErrorMessage } from '../../lib/errors'
import { fetchProperty } from './api'
import type { PropertyWithRelations } from './types'

interface PropertyState {
  property: PropertyWithRelations | null
  error: string | null
  loadedKey: string | null
}

const initialState: PropertyState = {
  property: null,
  error: null,
  loadedKey: null,
}

export const useProperty = (id: string | undefined) => {
  const [reloadToken, setReloadToken] = useState(0)
  const [state, setState] = useState<PropertyState>(initialState)

  const key = id ? `${id}#${reloadToken}` : null

  useEffect(() => {
    if (!id) {
      return
    }
    let isActive = true
    const currentKey = `${id}#${reloadToken}`

    fetchProperty(id)
      .then((property) => {
        if (isActive) {
          setState({ property, error: null, loadedKey: currentKey })
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setState({ property: null, error: getErrorMessage(error), loadedKey: currentKey })
        }
      })

    return () => {
      isActive = false
    }
  }, [id, reloadToken])

  const refetch = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  const isLoaded = key !== null && state.loadedKey === key

  return {
    property: isLoaded ? state.property : null,
    error: isLoaded ? state.error : null,
    isLoading: key !== null && !isLoaded,
    refetch,
  }
}
