import VideoUpload from './VideoUpload.component'
import { editDataSourceState } from '@/src/recoil/atom'
import { useRecoilValue } from 'recoil'

export default function TopContainer() {
  const { isEdit, videoDataURI, videoMimeType } = useRecoilValue(editDataSourceState)

  return (
    <div className="video-container">
      {!isEdit && !videoDataURI ? (
        <VideoUpload />
      ) : (
        <video>
          <source src={videoDataURI} type={videoMimeType} />
        </video>
      )}
    </div>
  )
}
