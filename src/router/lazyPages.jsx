import { Suspense, lazy } from 'react'

export const DashboardPage = lazy(() => import('../pages/Dashboard').then((m) => ({ default: m.DashboardPage })))
export const ProfilePage = lazy(() => import('../pages/Profile').then((m) => ({ default: m.ProfilePage })))
export const CoursesPage = lazy(() => import('../pages/Courses').then((m) => ({ default: m.CoursesPage })))
export const CourseDetailsPage = lazy(() => import('../pages/CourseDetails').then((m) => ({ default: m.CourseDetailsPage })))
export const LessonPage = lazy(() => import('../pages/Lesson').then((m) => ({ default: m.LessonPage })))

export const AdminLayout = lazy(() => import('../pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })))
export const AdminOverviewPage = lazy(() => import('../pages/admin/AdminOverview').then((m) => ({ default: m.AdminOverviewPage })))
export const AdminApplicationsPage = lazy(() => import('../pages/admin/AdminApplications').then((m) => ({ default: m.AdminApplicationsPage })))
export const AdminCoursesPage = lazy(() => import('../pages/admin/AdminCourses').then((m) => ({ default: m.AdminCoursesPage })))
export const AdminAnnouncementsPage = lazy(() => import('../pages/admin/AdminAnnouncements').then((m) => ({ default: m.AdminAnnouncementsPage })))
export const AdminMembersPage = lazy(() => import('../pages/admin/AdminMembers').then((m) => ({ default: m.AdminMembersPage })))
export const AdminSessionsPage = lazy(() => import('../pages/admin/AdminSessions').then((m) => ({ default: m.AdminSessionsPage })))
export const AdminContentPage = lazy(() => import('../pages/admin/AdminContent').then((m) => ({ default: m.AdminContentPage })))
export const AdminCourseEditorPage = lazy(() => import('../pages/admin/AdminCourseEditor').then((m) => ({ default: m.AdminCourseEditorPage })))
export const AdminMediaPage = lazy(() => import('../pages/admin/AdminMedia').then((m) => ({ default: m.AdminMediaPage })))
export const AdminLogsPage = lazy(() => import('../pages/admin/AdminLogsPage').then((m) => ({ default: m.AdminLogsPage })))
export const AdminSettingsPage = lazy(() => import('../pages/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage })))
export const AdminResourcesPage = lazy(() => import('../pages/admin/AdminResources').then((m) => ({ default: m.AdminResourcesPage })))
export const AdminMemberProgressPage = lazy(() => import('../pages/admin/AdminMemberProgress').then((m) => ({ default: m.AdminMemberProgressPage })))

export const MemberLayout = lazy(() => import('../pages/member/MemberLayout').then((m) => ({ default: m.MemberLayout })))
export const MemberActivityPage = lazy(() => import('../pages/member/MemberActivityPage').then((m) => ({ default: m.MemberActivityPage })))
export const ChangePasswordPage = lazy(() => import('../pages/member/ChangePasswordPage').then((m) => ({ default: m.ChangePasswordPage })))

export function PageFallback({ children }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-8 pb-16 pt-32 md:px-12 lg:px-10">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
            <p className="text-sm text-zinc-600 dark:text-zinc-300">Loading…</p>
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

