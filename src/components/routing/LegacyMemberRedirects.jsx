import { Navigate, useParams } from 'react-router-dom'

export function LegacyMemberCourseRedirect() {
  const { courseId } = useParams()
  return <Navigate to={`/member/courses/${courseId}`} replace />
}

export function LegacyMemberLessonRedirect() {
  const { courseId, lessonId } = useParams()
  return <Navigate to={`/member/courses/${courseId}/lessons/${lessonId}`} replace />
}
