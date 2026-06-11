import { lazy, Suspense } from 'react'
import { EnvSetupScreen } from './components/ui/EnvSetupScreen'
import { missingEnvKeys } from './lib/env'

const App = lazy(() => import('./App'))

export const Root = () => {
  if (missingEnvKeys.length > 0) {
    return <EnvSetupScreen missingKeys={missingEnvKeys} />
  }

  return (
    <Suspense fallback={null}>
      <App />
    </Suspense>
  )
}
