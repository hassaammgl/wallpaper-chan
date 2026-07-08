import { useEffect } from 'react'
import { RouterProvider } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { router } from './router'
import apiRequest from './utils/apiRequest'
import useAuthStore from './utils/authStore'

const queryClient = new QueryClient()

function App() {
  const { setCurrentUser, removeCurrentUser } = useAuthStore()

  useEffect(() => {
    const hydrate = async () => {
      try {
        const res = await apiRequest.get('/api/auth/me')
        const user = res.data.data
        if (user.role !== 'admin') {
          removeCurrentUser()
          return
        }
        setCurrentUser(user)
      } catch {
        removeCurrentUser()
      }
    }
    hydrate()
  }, [setCurrentUser, removeCurrentUser])

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

export default App
