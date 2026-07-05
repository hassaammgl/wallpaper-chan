import React, { Suspense } from 'react'
import { createBrowserRouter } from 'react-router'
import MainLayout from './layouts/MainLayout'

const HomePage = React.lazy(() => import('./homePage/HomePage'))
const CreatePage = React.lazy(() => import('./createPage/CreatePage'))
const PostPage = React.lazy(() => import('./postPage/PostPage'))
const AuthPage = React.lazy(() => import('./authPage/AuthPage'))
const SearchPage = React.lazy(() => import('./searchPage/SearchPage'))
const ProfilePage = React.lazy(() => import('./profilePage/ProfilePage'))

const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<div>Loading...</div>}>
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
      { path: "/:userName", element: <SuspenseWrapper><ProfilePage /></SuspenseWrapper> },
      { path: "/search", element: <SuspenseWrapper><SearchPage /></SuspenseWrapper> },
    ]
  },
  { path: "/auth", element: <SuspenseWrapper><AuthPage type="login" /></SuspenseWrapper> },
  { path: "/register", element: <SuspenseWrapper><AuthPage type="register" /></SuspenseWrapper> },
])
