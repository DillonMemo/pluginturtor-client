import { atom } from 'recoil'

export const loadingState = atom<boolean>({
  key: 'loading',
  default: true,
})

export const isChromeState = atom<boolean>({
  key: 'isChrome',
  default: false,
})
