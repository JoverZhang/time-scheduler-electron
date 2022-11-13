import { OptionsObject, SnackbarMessage, useSnackbar } from 'notistack'


interface Toast {
  success(message: SnackbarMessage, options?: OptionsObject): void

  warning(message: SnackbarMessage, options?: OptionsObject): void

  error(message: SnackbarMessage, options?: OptionsObject): void
}

export const useToast = (): Toast => {
  const snackbar = useSnackbar()

  return {
    success(message: SnackbarMessage, options?: OptionsObject) {
      snackbar.enqueueSnackbar(message, { variant: 'success', ...options })
    },
    warning(message: SnackbarMessage, options?: OptionsObject) {
      snackbar.enqueueSnackbar(message, { variant: 'warning', ...options })
    },
    error(message: SnackbarMessage, options?: OptionsObject) {
      snackbar.enqueueSnackbar(message, { variant: 'error', ...options })
    },
  }
}
