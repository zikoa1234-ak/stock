import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider } from './contexts/AuthContext'
import { queryClient } from './lib/queryClient'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Layout from './components/layout/Layout'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import UserForm from './pages/UserForm'
import Inventory from './pages/Inventory'
import ItemForm from './pages/ItemForm'
import Categories from './pages/Categories'
import Movements from './pages/Movements'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import Unauthorized from './pages/Unauthorized'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users">
                <Route index element={<Users />} />
                <Route path="new" element={<UserForm />} />
                <Route path=":id/edit" element={<UserForm />} />
              </Route>
              <Route path="inventory">
                <Route index element={<Inventory />} />
                <Route path="new" element={<ItemForm />} />
                <Route path=":id/edit" element={<ItemForm />} />
              </Route>
              <Route path="categories" element={<Categories />} />
              <Route path="movements" element={<Movements />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App