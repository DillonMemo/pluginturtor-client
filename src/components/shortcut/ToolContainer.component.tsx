import { editDataSourceState } from '@/src/recoil/atom'
import { useCallback } from 'react'
import { useRecoilState } from 'recoil'

export default function ToolContainer() {
  const [{ isEdit }, setEditDataSource] = useRecoilState(editDataSourceState)

  const onClickReset = useCallback(() => {
    setEditDataSource({
      isEdit: false,
      videoDataURI: '',
      videoMimeType: '',
    })
  }, [])

  return (
    <div className="tool-container">
      <div className="control-tools">
        <button type="button" role="button" onClick={onClickReset} disabled={!isEdit}>
          Reset
        </button>
      </div>
    </div>
  )
}
