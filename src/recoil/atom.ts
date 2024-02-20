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
  videoDataURI: string
  videoMimeType: string
  videoRef: React.MutableRefObject<HTMLVideoElement | undefined>
}
export const videoResourceState = atom<videoResource>({
  key: 'videoResource',
  default: {
    isEdit: false,
    videoDataURI: '',
    videoMimeType: '',
    videoRef: { current: undefined },
  },
})

export const videoElementState = atom<React.MutableRefObject<HTMLVideoElement>>({
  key: 'videoElement',
  default: undefined,
})
