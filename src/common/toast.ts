import { OptionsObject, SnackbarMessage, useSnackbar } from 'notistack'

export const useToast = () => {
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
