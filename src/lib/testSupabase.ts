import { supabase } from './supabase'

export async function testSupabase() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1)

  if (error) {
    console.error('❌ Supabase error:', error.message)
  } else {
    console.log('✅ Supabase connected:', data)
  }
}

