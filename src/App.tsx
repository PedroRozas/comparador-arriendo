import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthProvider'
import { LoginPage } from './features/auth/LoginPage'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { SignupPage } from './features/auth/SignupPage'
import { BenchmarkPage } from './features/benchmark/BenchmarkPage'
import { PropertiesListPage } from './features/properties/PropertiesListPage'
import { PropertyDetailPage } from './features/properties/PropertyDetailPage'
import { PropertyFormPage } from './features/properties/PropertyFormPage'
import { AppLayout } from './layout/AppLayout'

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<PropertiesListPage />} />
            <Route path="/properties/new" element={<PropertyFormPage />} />
            <Route path="/properties/:id" element={<PropertyDetailPage />} />
            <Route path="/properties/:id/edit" element={<PropertyFormPage />} />
            <Route path="/benchmark" element={<BenchmarkPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
)

export default App
