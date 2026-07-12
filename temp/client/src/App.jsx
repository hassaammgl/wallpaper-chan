import { useEffect } from 'react'
import { RouterProvider } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { router } from './routes/router'
import apiRequest from './utils/apiRequest'
import UseAuthStore from './utils/authStore'

const queryClient = new QueryClient()

function App() {
  const { setCurrentUser, removeCurrentUser } = UseAuthStore()

  useEffect(() => {
    const hydrateAuth = async () => {
      try {
        const res = await apiRequest.get('/api/auth/me')
        setCurrentUser(res.data.data)
      } catch {
        removeCurrentUser()
      }
    }
    hydrateAuth()
  }, [setCurrentUser, removeCurrentUser])

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

export default App
