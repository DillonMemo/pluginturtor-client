'use client'

import { editDataSourceState, isEditState } from '@/src/recoil/atom'
import { Main } from './Shortcut.component'
import VideoUpload from './VideoUpload.component'
import styled from 'styled-components'
import { useRecoilValue } from 'recoil'

export default function Wrapper() {
  const isEdit = useRecoilValue(isEditState)
  const editDataSource = useRecoilValue(editDataSourceState)

  return (
    <Main>
      {!isEdit && <VideoUpload />}

      <EditWrapper className={`edit-wrapper ${!isEdit && 'hidden'}`}>
        {editDataSource.videoDataURI && (
          <video className="edit-video">
            <source src={editDataSource.videoDataURI} type={editDataSource.videoMimeType} />
          </video>
        )}

        <h2 style={{ color: 'white' }}>HELLO VIDEO</h2>
      </EditWrapper>
    </Main>
  )
}

const EditWrapper = styled.div`
  video.edit-video {
    max-height: 16.25rem;
  }
`
