import { Multer } from '../type'
import { atom } from 'recoil'

export const loadingState = atom<boolean>({
  key: 'loading',
  default: false,
})

// export const isChromeState = atom<boolean>({
//   key: 'isChrome',
//   default: false,
// })

export type videoResource = {
  isEdit: boolean
  // videoDataURI: string
  // videoMimeType: string
  thumbnails: Multer.MulterFile[]
}
export const videoResourceState = atom<videoResource>({
  key: 'videoResource',
  default: {
    isEdit: false,
    thumbnails: [],
  },
})

export const videoElementState = atom<React.MutableRefObject<HTMLVideoElement>>({
  key: 'videoElement',
  default: undefined,
})
