import React, { Suspense } from 'react'
import { createBrowserRouter } from 'react-router'
import MainLayout from './layouts/MainLayout'

const HomePage = React.lazy(() => import('./homePage/HomePage'))
const CreatePage = React.lazy(() => import('./createPage/CreatePage'))
const PostPage = React.lazy(() => import('./postPage/PostPage'))
const AuthPage = React.lazy(() => import('./authPage/AuthPage'))
const SearchPage = React.lazy(() => import('./searchPage/SearchPage'))
const ProfilePage = React.lazy(() => import('./profilePage/ProfilePage'))

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent" />
        <p className="text-sm text-muted">Loading...</p>
      </div>
    </div>
  )
}

const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<PageLoader />}>
    {children}
  </Suspense>
)

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: "/", element: <SuspenseWrapper><HomePage /></SuspenseWrapper> },
      { path: "/create", element: <SuspenseWrapper><CreatePage /></SuspenseWrapper> },
      { path: "/pins/:id", element: <SuspenseWrapper><PostPage /></SuspenseWrapper> },
      { path: "/search", element: <SuspenseWrapper><SearchPage /></SuspenseWrapper> },
      { path: "/:userName", element: <SuspenseWrapper><ProfilePage /></SuspenseWrapper> },
    ]
  },
  { path: "/auth", element: <SuspenseWrapper><AuthPage type="login" /></SuspenseWrapper> },
  { path: "/register", element: <SuspenseWrapper><AuthPage type="register" /></SuspenseWrapper> },
])
