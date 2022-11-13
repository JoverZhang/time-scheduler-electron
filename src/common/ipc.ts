import { FocusOptions, ipcRenderer } from 'electron'

export const ipcAppForce = () => {
  ipcRenderer.send('app-force', { steal: true } as FocusOptions)
}


export default {
  ipcAppForce,
}
