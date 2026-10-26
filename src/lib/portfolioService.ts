import { supabase } from '@/lib/supabase'

const fetchTable = async (table: string) => {
  const { data } = await supabase
    .from(table)
    .select('*')
    .order('created_at', { ascending: true })

  return data || []
}

export const fetchProjects = () => fetchTable('projects')
export const fetchCertificates = () => fetchTable('certificates')
export const fetchTechStacks = () => fetchTable('tech_stack')
