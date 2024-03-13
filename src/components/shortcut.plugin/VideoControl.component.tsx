import { CustomVideoElement } from '@/src/type'
import PauseIcon from '@/src/icons/PauseIcon'
import PlayIcon from '@/src/icons/PlayIcon'
import { useRecoilState } from 'recoil'
import { videoResourceState } from '@/src/recoil/atom'

interface Props {
  videoRef: React.MutableRefObject<CustomVideoElement>
}

export default function VideoControl({ videoRef }: Props) {
  const [{ isPaused }, setVideoResource] = useRecoilState(videoResourceState)
  return !isPaused ? (
    <button
      onClick={() => {
        videoRef.current.pause()
        setVideoResource((prev) => ({ ...prev, isPaused: !prev.isPaused }))
      }}>
      <PauseIcon />
    </button>
  ) : (
    <button
      onClick={() => {
        videoRef.current.play()
        setVideoResource((prev) => ({ ...prev, isPaused: !prev.isPaused }))
      }}>
      <PlayIcon />
    </button>
  )
}
