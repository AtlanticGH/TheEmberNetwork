import { requireSupabase } from './supabaseClient'

export async function listQuizQuestions(lessonId) {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data || []).map((q) => ({
    ...q,
    options: Array.isArray(q.options_json) ? q.options_json : [],
  }))
}

export async function createQuizQuestion({ lessonId, question, options, correctAnswer } = {}) {
  if (!lessonId) throw new Error('Missing lessonId')
  const q = String(question || '').trim()
  const opts = Array.isArray(options) ? options.map((x) => String(x || '').trim()).filter(Boolean) : []
  const ans = String(correctAnswer || '').trim()
  if (!q) throw new Error('Question is required')
  if (opts.length < 2) throw new Error('Provide at least 2 options')
  if (!ans) throw new Error('Correct answer is required')
  if (!opts.includes(ans)) throw new Error('Correct answer must match one of the options')

  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from('quizzes')
    .insert({
      lesson_id: lessonId,
      question: q,
      options_json: opts,
      correct_answer: ans,
    })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function deleteQuizQuestion(row) {
  const supabase = requireSupabase()
  const { error } = await supabase.from('quizzes').delete().eq('id', row.id)
  if (error) throw error
}

export async function submitQuizAttempt({ lessonId, answersByQuestionId } = {}) {
  if (!lessonId) throw new Error('Missing lessonId')
  const supabase = requireSupabase()

  const questions = await listQuizQuestions(lessonId)
  const total = questions.length
  const answers = answersByQuestionId && typeof answersByQuestionId === 'object' ? answersByQuestionId : {}
  let score = 0
  questions.forEach((q) => {
    const picked = String(answers[q.id] || '')
    if (picked && picked === q.correct_answer) score += 1
  })

  const { data: userRes, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  if (!userRes?.user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({
      user_id: userRes.user.id,
      lesson_id: lessonId,
      score,
      total,
      answers_json: answers,
    })
    .select('*')
    .single()
  if (error) throw error
  return { attempt: data, score, total }
}

export async function listMyQuizAttempts(lessonId, { limit = 10 } = {}) {
  if (!lessonId) return []
  const supabase = requireSupabase()
  const { data: userRes, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  if (!userRes?.user) return []
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', userRes.user.id)
    .eq('lesson_id', lessonId)
    .order('created_at', { ascending: false })
    .limit(Math.max(1, Math.min(50, limit)))
  if (error) throw error
  return data || []
}

