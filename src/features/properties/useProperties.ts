import { useCallback, useEffect, useState } from 'react'
import { getErrorMessage } from '../../lib/errors'
import { fetchProperties } from './api'
import type { PropertyWithRelations } from './types'

interface PropertiesState {
  properties: PropertyWithRelations[]
  error: string | null
  loadedToken: number
}

const initialState: PropertiesState = {
  properties: [],
  error: null,
  loadedToken: -1,
}

export const useProperties = () => {
  const [reloadToken, setReloadToken] = useState(0)
  const [state, setState] = useState<PropertiesState>(initialState)

  useEffect(() => {
    let isActive = true

    fetchProperties()
      .then((properties) => {
        if (isActive) {
          setState({ properties, error: null, loadedToken: reloadToken })
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setState({ properties: [], error: getErrorMessage(error), loadedToken: reloadToken })
        }
      })

    return () => {
      isActive = false
    }
  }, [reloadToken])

  const refetch = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  const isLoading = state.loadedToken !== reloadToken

  return {
    properties: state.properties,
    error: isLoading ? null : state.error,
    isLoading,
    refetch,
  }
}
