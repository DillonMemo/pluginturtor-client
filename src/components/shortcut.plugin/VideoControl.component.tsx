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
      <PlayIcon />
    </button>
  ) : (
    <button
      onClick={() => {
        const { timeRange, currentTime } = videoRef.current
        currentTime === timeRange[1] && (videoRef.current.currentTime = timeRange[0])
        videoRef.current.play()
        setVideoResource((prev) => ({ ...prev, isPaused: !prev.isPaused }))
      }}>
      <PauseIcon />
    </button>
  )
}
