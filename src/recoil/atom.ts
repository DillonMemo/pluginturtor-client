import { atom } from 'recoil'

export const loadingState = atom<boolean>({
  key: 'loading',
  default: true,
})

export const isChromeState = atom<boolean>({
  key: 'isChrome',
  default: false,
})

export const isEditState = atom<boolean>({
  key: 'isEdit',
  default: false,
})

export type EditDataSource = {
  videoDataURI: string
  videoMimeType: string
}
export const editDataSourceState = atom<EditDataSource>({
  key: 'editDataSource',
  default: {
    videoDataURI: '',
    videoMimeType: '',
  },
})
