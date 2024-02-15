import { atom } from 'recoil'

export const loadingState = atom<boolean>({
  key: 'loading',
  default: true,
})

export const isChromeState = atom<boolean>({
  key: 'isChrome',
  default: false,
})

export type EditDataSource = {
  isEdit: boolean
  videoDataURI: string
  videoMimeType: string
}
export const editDataSourceState = atom<EditDataSource>({
  key: 'editDataSource',
  default: {
    isEdit: false,
    videoDataURI: '',
    videoMimeType: '',
  },
})
