import { isSupabaseConfigured, supabase } from './supabase'

const ADMIN_SESSION_KEY = 'team-collector-admin-auth'
const PIN_NOT_CONFIGURED_MESSAGE = 'Admin PIN is not configured in Supabase yet.'

const mapRpcErrorMessage = (error) => {
  const message = error?.message || ''
  if (message.includes('ADMIN_PIN_NOT_CONFIGURED')) {
    return `${PIN_NOT_CONFIGURED_MESSAGE} Run supabase/nghtt_manage_lock.sql.`
  }
  if (
    message.includes('function crypt(text, text) does not exist') ||
    message.includes('function gen_salt(text) does not exist')
  ) {
    return `${PIN_NOT_CONFIGURED_MESSAGE} Re-run supabase/nghtt_manage_lock.sql to fix extension function paths.`
  }
  if (
    message.includes('Could not find the function public.verify_admin_pin') ||
    message.includes('Could not find the function public.get_manage_edit_lock_state') ||
    message.includes('Could not find the function public.set_manage_edit_lock')
  ) {
    return `${PIN_NOT_CONFIGURED_MESSAGE} Run supabase/nghtt_manage_lock.sql.`
  }
  return message || 'Could not connect to Supabase admin auth.'
}

const requireSupabase = () => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured for admin access.')
  }
}

export const restoreAdminSession = async () =>
  sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true'

export const signInAdmin = async ({ password }) => {
  requireSupabase()
  const cleanPin = String(password || '').trim()
  if (!cleanPin) {
    throw new Error('Enter admin PIN.')
  }

  const { data, error } = await supabase.rpc('verify_admin_pin', { p_pin: cleanPin })
  if (error) {
    throw new Error(mapRpcErrorMessage(error))
  }
  if (!data) {
    throw new Error('Incorrect admin PIN.')
  }

  sessionStorage.setItem(ADMIN_SESSION_KEY, 'true')
}

export const signOutAdmin = async () => {
  sessionStorage.removeItem(ADMIN_SESSION_KEY)
}

export const getManageEditLockState = async () => {
  requireSupabase()
  const { data, error } = await supabase.rpc('get_manage_edit_lock_state')
  if (error) {
    throw new Error(mapRpcErrorMessage(error))
  }
  return data !== false
}

export const setManageEditLockState = async ({ pin, locked }) => {
  requireSupabase()
  const cleanPin = String(pin || '').trim()
  if (!cleanPin) {
    throw new Error('Enter admin PIN.')
  }

  const { data, error } = await supabase.rpc('set_manage_edit_lock', {
    p_pin: cleanPin,
    p_locked: Boolean(locked),
  })
  if (error) {
    throw new Error(mapRpcErrorMessage(error))
  }
  if (!data) {
    throw new Error('Incorrect admin PIN.')
  }

  if (locked) {
    sessionStorage.removeItem(ADMIN_SESSION_KEY)
  } else {
    sessionStorage.setItem(ADMIN_SESSION_KEY, 'true')
  }
}
