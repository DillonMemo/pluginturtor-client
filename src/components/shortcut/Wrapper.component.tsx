'use client'

import { Main } from './Shortcut.component'
import ToolContainer from './ToolContainer.component'
import TopContainer from './TopContainer.component'
import styled from 'styled-components'

export default function Wrapper() {
  return (
    <Main>
      <EditWrapper className={`edit-wrappe`}>
        <TopContainer />
        <ToolContainer />
      </EditWrapper>
    </Main>
  )
}

const EditWrapper = styled.div`
  * {
    outline: none;
  }

  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  gap: 3rem;

  overflow: hidden;

  max-width: 50rem;
  width: 100%;
  height: 100%;

  .video-container {
    user-select: none;

    display: flex;
    flex-grow: 1;
    position: relative;

    margin: 0;
    padding: 0;
    height: 100%;
    video {
      max-height: 16.25rem;
    }
  }
`
