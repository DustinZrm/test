import { Platform, NativeModules } from 'react-native'

type DndController = { setEnabled: (enabled: boolean) => Promise<void> }

export async function setDnd(enabled: boolean) {
  if (Platform.OS === 'android') {
    const m: DndController | undefined = (NativeModules as any).StudustinDnd
    if (m && typeof m.setEnabled === 'function') {
      try { await m.setEnabled(enabled) } catch {}
    }
  }
}