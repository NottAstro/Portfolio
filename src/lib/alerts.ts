import Swal, { SweetAlertOptions } from 'sweetalert2'

// SweetAlert styled for the dark admin panel.
export const darkAlert = (options: SweetAlertOptions, background = '#111') =>
  Swal.fire({ background, color: '#fff', ...options })

export const confirmDelete = (
  title: string,
  text: string,
  background = '#111',
  overrides: SweetAlertOptions = {}
) =>
  darkAlert(
    {
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#27272a',
      reverseButtons: true,
      ...overrides,
    },
    background
  )

export const successToast = (title: string, text: string, background = '#111', timer = 1800) =>
  darkAlert({ title, text, icon: 'success', timer, showConfirmButton: false }, background)

export const errorAlert = (title: string, text: string, background = '#111') =>
  darkAlert({ title, text, icon: 'error' }, background)
