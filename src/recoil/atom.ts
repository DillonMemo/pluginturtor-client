import { atom } from 'recoil'

export const loadingState = atom<boolean>({
  key: 'loading',
  default: true,
})

export const chromeVersionState = atom<number | undefined>({
  key: 'chromeVersion',
  default: undefined,
})
