import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'
import { JoinCommunityPage } from './pages/JoinCommunityPage'
import { ContactPage } from './pages/ContactPage'
import { HomePage } from './pages/HomePage'
import { AboutPage } from './pages/AboutPage'
import { ProgramsPage } from './pages/ProgramsPage'
import { ProgramComponentsPage } from './pages/ProgramComponentsPage'
import { ResourcesPage } from './pages/ResourcesPage'
import { LegacyMemberCourseRedirect, LegacyMemberLessonRedirect } from './components/routing/LegacyMemberRedirects'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { SuperAdminRoute } from './components/auth/SuperAdminRoute'
import { AdminGate } from './pages/admin/AdminGate'

import {
  AdminAnnouncementsPage,
  AdminApplicationsPage,
  AdminCoursesPage,
  AdminContentPage,
  AdminCourseEditorPage,
  AdminLogsPage,
  AdminMediaPage,
  AdminMembersPage,
  AdminOverviewPage,
  AdminResourcesPage,
  AdminMemberProgressPage,
  AdminSessionsPage,
  AdminSettingsPage,
  CourseDetailsPage,
  CoursesPage,
  DashboardPage,
  LessonPage,
  MemberActivityPage,
  MemberLayout,
  ChangePasswordPage,
  PageFallback,
  ProfilePage,
} from './router/lazyPages'
import { queryClient } from './lib/queryClient'

// Dev-only sanity check: query profiles once on startup.
if (import.meta.env.DEV) {
  import('./lib/testSupabase')
    .then(({ testSupabase }) => testSupabase())
    .catch(() => {})
}

const memberCourseRoutes = [
  {
    path: 'courses',
    element: (
      <PageFallback>
        <CoursesPage />
      </PageFallback>
    ),
  },
  {
    path: 'courses/:courseId',
    element: (
      <PageFallback>
        <CourseDetailsPage />
      </PageFallback>
    ),
  },
  {
    path: 'courses/:courseId/lessons/:lessonId',
    element: (
      <PageFallback>
        <LessonPage />
      </PageFallback>
    ),
  },
]

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'programs', element: <ProgramsPage /> },
      { path: 'program-components', element: <ProgramComponentsPage /> },
      { path: 'community', element: <JoinCommunityPage /> },
      { path: 'resources', element: <ResourcesPage /> },
      {
        path: 'auth',
        lazy: async () => {
          const m = await import('./pages/Auth')
          return { Component: m.AuthPage }
        },
      },
      {
        path: 'dashboard',
        lazy: async () => {
          const m = await import('./pages/Dashboard')
          return {
            Component: () => (
              <ProtectedRoute>
                <PageFallback>
                  <m.DashboardPage />
                </PageFallback>
              </ProtectedRoute>
            ),
          }
        },
      },
      { path: 'join', element: <Navigate to="/community" replace /> },
      { path: 'contact', element: <ContactPage /> },
      {
        path: 'login',
        lazy: async () => {
          const m = await import('./pages/Login')
          return { Component: m.LoginPage }
        },
      },
      {
        path: 'apply',
        lazy: async () => {
          const m = await import('./pages/Apply')
          return { Component: m.ApplyPage }
        },
      },
      {
        path: 'forgot-password',
        lazy: async () => {
          const m = await import('./pages/ForgotPassword')
          return { Component: m.ForgotPasswordPage }
        },
      },
      {
        path: 'member',
        element: (
          <ProtectedRoute>
            <PageFallback>
              <MemberLayout />
            </PageFallback>
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: (
              <PageFallback>
                <DashboardPage />
              </PageFallback>
            ),
          },
          {
            path: 'change-password',
            element: (
              <PageFallback>
                <ChangePasswordPage />
              </PageFallback>
            ),
          },
          {
            path: 'profile',
            element: (
              <PageFallback>
                <ProfilePage />
              </PageFallback>
            ),
          },
          {
            path: 'activity',
            element: (
              <PageFallback>
                <MemberActivityPage />
              </PageFallback>
            ),
          },
          ...memberCourseRoutes,
        ],
      },
      // /dashboard is now a real page (see above). Keep /member as the default authed area.
      { path: 'profile', element: <Navigate to="/member/profile" replace /> },
      { path: 'courses', element: <Navigate to="/member/courses" replace /> },
      { path: 'courses/:courseId', element: <LegacyMemberCourseRedirect /> },
      { path: 'courses/:courseId/lessons/:lessonId', element: <LegacyMemberLessonRedirect /> },
      {
        path: 'admin',
        element: (
          <PageFallback>
            <AdminGate />
          </PageFallback>
        ),
        children: [
          { index: true, element: <Navigate to="/admin/dashboard" replace /> },
          { path: 'dashboard', element: <PageFallback><AdminOverviewPage /></PageFallback> },
          { path: 'applications', element: <PageFallback><AdminApplicationsPage /></PageFallback> },
          { path: 'users', element: <PageFallback><AdminMembersPage /></PageFallback> },
          { path: 'courses', element: <PageFallback><AdminCoursesPage /></PageFallback> },
          { path: 'courses/:courseId', element: <PageFallback><AdminCourseEditorPage /></PageFallback> },
          { path: 'announcements', element: <PageFallback><AdminAnnouncementsPage /></PageFallback> },
          { path: 'members', element: <Navigate to="/admin/users" replace /> },
          { path: 'sessions', element: <PageFallback><AdminSessionsPage /></PageFallback> },
          { path: 'content', element: <PageFallback><AdminContentPage /></PageFallback> },
          { path: 'resources', element: <PageFallback><AdminResourcesPage /></PageFallback> },
          { path: 'progress', element: <PageFallback><AdminMemberProgressPage /></PageFallback> },
          { path: 'media', element: <PageFallback><AdminMediaPage /></PageFallback> },
          { path: 'logs', element: <PageFallback><AdminLogsPage /></PageFallback> },
          {
            path: 'settings',
            element: (
              <PageFallback>
                <SuperAdminRoute>
                  <AdminSettingsPage />
                </SuperAdminRoute>
              </PageFallback>
            ),
          },
        ],
      },
      { path: 'index.html', element: <Navigate to="/" replace /> },
      { path: 'about.html', element: <Navigate to="/about" replace /> },
      { path: 'programs.html', element: <Navigate to="/programs" replace /> },
      { path: 'program-components.html', element: <Navigate to="/program-components" replace /> },
      { path: 'community.html', element: <Navigate to="/community" replace /> },
      { path: 'resources.html', element: <Navigate to="/resources" replace /> },
      { path: 'join.html', element: <Navigate to="/community" replace /> },
      { path: 'contact.html', element: <Navigate to="/contact" replace /> },
      { path: 'login.html', element: <Navigate to="/login" replace /> },
      { path: 'signup.html', element: <Navigate to="/apply" replace /> },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
