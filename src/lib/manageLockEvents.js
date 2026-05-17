export const MANAGE_LOCK_STATE_CHANGED_EVENT = 'nghtt-manage-lock-state-changed'
export const MANAGE_LOCK_TOGGLE_REQUESTED_EVENT = 'nghtt-manage-lock-toggle-requested'
export const MANAGE_LOCK_STATE_REQUESTED_EVENT = 'nghtt-manage-lock-state-requested'

export const emitManageLockState = (locked) => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent(MANAGE_LOCK_STATE_CHANGED_EVENT, {
      detail: { locked: Boolean(locked) },
    }),
  )
}

export const requestManageLockToggle = () => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(MANAGE_LOCK_TOGGLE_REQUESTED_EVENT))
}

export const requestManageLockState = () => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(MANAGE_LOCK_STATE_REQUESTED_EVENT))
}
