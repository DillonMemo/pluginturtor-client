'use client'

import React, { useCallback, useEffect, useRef } from 'react'
import { loadingState, videoResourceState } from '@/src/recoil/atom'
import CursorIconSvg from '@/src/lib/svgs/CursorIconSvg'
import Loading from '../Loading'
import { Multer } from '@/src/type'
import { convertMillisecondsToTime } from '@/src/utils'
import styled from 'styled-components'
import { useRecoilState } from 'recoil'
import * as d3 from 'd3'

const Shortcut: React.FC = () => {
  const [loading, setLoading] = useRecoilState(loadingState)
  const [{ isEdit, videoDataURI, videoMimeType, videoRef, thumbnails }, setVideoResource] =
    useRecoilState(videoResourceState)

  const videoPreRef = useRef() as React.MutableRefObject<HTMLVideoElement>
  const svgRef = useRef() as React.MutableRefObject<SVGSVGElement>

  const onFileUpload = useCallback(
    async ({ target: { files } }: React.ChangeEvent<HTMLInputElement>) => {
      try {
        setLoading(true)

        if (files) {
          const file = files[0]

          const formData = new FormData()
          formData.append('file', file, file.name)

          const url =
            process.env.NODE_ENV === 'development'
              ? 'http://localhost:4001/shortcut/upload'
              : 'https://localhost:4001/shortcut/upload'
          const response = await fetch(url, {
            method: 'POST',
            body: formData,
          })
          if (response.status === 200) {
            const {
              success,
              video,
              thumbnails,
            }: { success: boolean; thumbnails: Multer.MulterFile[]; video: Multer.MulterFile } =
              await response.json()
            if (success) {
              const buffer = Buffer.from(video.buffer.data)
              const base64Data = buffer.toString('base64')

              setVideoResource((prev) => ({
                ...prev,
                isEdit: true,
                videoDataURI: `data:${video.mimetype};base64,${base64Data}`,
                videoMimeType: video.mimetype,
                videoRef: videoPreRef,
                ...(thumbnails.length > 0 ? { thumbnails } : { thumbnails: [] }),
              }))
            }
          }
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    },
    [videoRef]
  )

  //   const onMouseDownCursor = useCallback(() => {
  //     const cursor = document.querySelector('.cursor-group')
  //     cursor instanceof HTMLDivElement && cursor.classList.add('active')
  //   }, [])
  //   const onMouseUpCursor = useCallback(() => {
  //     const cursor = document.querySelector('.cursor-group')
  //     cursor instanceof HTMLDivElement && cursor.classList.remove('active')
  //   }, [])
  //   const onMouseMoveCursor = useCallback(
  //     (event: React.MouseEvent<HTMLDivElement>) => {
  //       const { clientX } = event
  //       const cursor = document.querySelector('.cursor-group')
  //       const container = document.querySelector('.tool-container')
  //       if (
  //         !(cursor instanceof HTMLDivElement) ||
  //         !(container instanceof HTMLDivElement) ||
  //         typeof videoRef.current === 'undefined'
  //       )
  //         return
  //       if (!cursor.classList.contains('active')) return
  //       const position = clientX - container.getBoundingClientRect().left
  //       const time = (position / container.clientWidth) * videoRef.current.duration
  //       if (time < 0 || time > videoRef.current.duration) return

  //       const timeIndicator = document.querySelector('.time-indicator')
  //       if (!(timeIndicator instanceof HTMLDivElement)) return
  //       timeIndicator.textContent = convertMillisecondsToTime(time)

  //       const initialPosition = (time / videoRef.current.duration) * container.clientWidth
  //       cursor.style.transform = `translateX(${initialPosition}px)`
  //       timeIndicator.style.transform = `translateX(${initialPosition}px)`

  //       videoRef.current.currentTime = time
  //     },
  //     [videoRef]
  //   )

  //   useEffect(() => {
  //     window.addEventListener('mouseup', onMouseUpCursor)

  //     return () => window.removeEventListener('mouseup', onMouseUpCursor)
  //   }, [])

  useEffect(() => {
    if (!isEdit || !svgRef.current) return

    const layout = {
      width: 300,
      height: 300,
      margin: {
        top: 130,
        bottom: 35,
        left: 40,
        right: 40,
      },
    }
    const range = [0, 13.96]
    const starting_range = [0, 13.96]
    const width = layout.width - layout.margin.left - layout.margin.right
    const height = layout.height - layout.margin.top - layout.margin.bottom

    const xAxis = d3.scaleLinear().domain(range).range([0, width])
    const svg = d3.select(svgRef.current)
    const g = svg
      .append('g')
      .attr('transform', `translate(${layout.margin.left}, ${layout.margin.top}})`)

    const brush = d3
      .brushX()
      .extent([
        [0, 0],
        [width, height],
      ])
      .on('brush', function () {
        const s = d3.event.selection
        // update and move labels
        // labelL.attr('x', s[0])
        //   .text((x.invert(s[0]).toFixed(2)))
        // labelR.attr('x', s[1])
        //   .text((x.invert(s[1]).toFixed(2)))
        // move brush handles
        handle.attr('display', null).attr('transform', function (d, i) {
          return 'translate(' + [s[i], -height] + ')'
        })
        // update view
        // if the view should only be updated after brushing is over,
        // move these two lines into the on('end') part below
        const node = svg.node()
        if (node instanceof SVGSVGElement) {
          node.nodeValue = s.map(function (d: any) {
            const temp = x.invert(d)
            return +temp.toFixed(2)
          })
          node.dispatchEvent(new CustomEvent('input'))
        }
      })

    console.log(d3.select(svgRef.current))
  }, [isEdit])

  return (
    <Main>
      <div className="video-wrapper">
        <div className={`upload-container` + (isEdit ? ' hidden' : '')}>
          {/* video file type must be MP4 */}
          <input
            type="file"
            name="video-upload"
            id="video-upload"
            className="hidden"
            onChange={onFileUpload}
            accept="video/*"
          />

          <UploadButton className="upload-button" type="button" role="button">
            <label htmlFor="video-upload">
              {loading ? <Loading /> : <span className="upload-button-text">Video Upload</span>}
            </label>
          </UploadButton>
        </div>
        <div className={`video-container` + (isEdit ? '' : ' hidden')}>
          <video ref={videoPreRef}>
            {isEdit && <source src={videoDataURI} type={videoMimeType} />}
          </video>
        </div>
      </div>
      {isEdit && (
        <div className="tool-wrapper">
          <div className="button-group">
            <button
              onClick={() => {
                console.log('button 1', videoRef.current && videoRef.current.duration)
                videoRef.current && (videoRef.current.currentTime = 5.7)
              }}>
              w: 0 ~ 100
            </button>
            <button
              onClick={() => {
                console.log('button 2')
              }}>
              w: 60 ~ 100
            </button>
          </div>

          {/* <div className="tool-container" onMouseMove={onMouseMoveCursor}>
            <div className="scroll-wrap">
              <div className="axis-container"></div>
            </div>
            <div className="cursor-control">
              <div
                className="cursor-group"
                onMouseDown={onMouseDownCursor}
                onMouseUp={onMouseUpCursor}>
                <div className="cursor-header">
                  <CursorIconSvg />
                </div>
                <div className="cursor"></div>
              </div>

              <div className="time-indicator">00:00:00</div>
            </div>
          </div> */}
        </div>
      )}
      {/* {isEdit && <div className="test-d3" style={{ opacity: 1 }}></div>} */}
      {isEdit && (
        <div className="test">
          <svg ref={svgRef}></svg>
        </div>
      )}
    </Main>
  )
}

// const CURSOR_WIDTH = '0.75rem'
// const CURSOR_HEIGHT = '5rem'
// const EXPANDED_CURSOR_HEIGHT = '1rem'
export const Main = styled.main`
  outline: none;

  width: 100%;
  min-height: 100vh;

  padding: 2rem 2.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: column nowrap;
  gap: 1.25rem;

  .video-wrapper {
    user-select: none;

    position: relative;
    display: flex;

    .video-container {
      video {
        width: 16.25rem;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  /* .tool-wrapper {
     .tool-container {
      min-width: 25rem;
      width: 100%;
      height: 10rem;

      position: relative;
      border: 1px solid red;

      .scroll-wrap {
        display: block;
        overflow: scroll hidden;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;

        border: 1px solid lightblue;
      }
      .cursor-control {
        position: relative;

        user-select: none;
        width: 100%;

        border: 1px solid lightgreen;
        color: orange;
        .cursor-group {
          cursor: pointer;
          position: absolute;
          top: -${EXPANDED_CURSOR_HEIGHT};
          width: ${CURSOR_WIDTH};
          height: calc(${CURSOR_HEIGHT} + ${EXPANDED_CURSOR_HEIGHT} + 1rem);
          .cursor {
            background-color: orange;
            position: relative;
            left: 5px;
            top: -1px;
            width: 0.125rem;
            height: calc(100% - 17px);
          }
        }
        .time-indicator {
          display: inline-block;
          position: relative;
          top: calc(${CURSOR_HEIGHT} + 1.25rem);
          left: -1.625rem;
        }
      }
    } 
  } */
`

const UploadButton = styled.button`
  /* Animations */
  @keyframes flyIn1 {
    from {
      opacity: 0;
      transform: translateY(33%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @keyframes flyIn2 {
    from {
      opacity: 0;
      /* (buttonWidth / 2 - rightPadding) + (lastDigit + "%") */
      transform: translate(calc(-2em + 2ch), 33%);
    }
    to {
      opacity: 1;
      transform: translate(calc(-2em + 2ch), 0);
    }
  }
  @keyframes pulseIn {
    from {
      transform: scale(0);
    }
    33% {
      transform: scale(2.17, 2.17);
    }
    67% {
      transform: scale(1.17, 1.17);
    }
    to {
      transform: scale(1.5);
    }
  }
  @keyframes sinkInA {
    from {
      transform: scale(1, 1);
    }
    25%,
    to {
      /* 120/124, 50/54 */
      transform: scale(0.968, 0.925);
    }
  }
  @keyframes sinkInB {
    from {
      stroke-width: 4;
    }
    25%,
    to {
      stroke-width: 0;
    }
  }

  --dur: 0.25s;

  cursor: pointer;
  position: relative;
  text-align: center;

  -webkit-tap-highlight-color: #0000;
  -webkit-appearance: none;
  appearance: none;

  &:disabled {
    cursor: not-allowed;
  }

  &.upload-button-ready {
    .upload-button-text {
      animation: flyIn1 var(--dur) ease-in forwards;
    }
  }
  &.upload-button-running {
    text-align: right;
    .upload-button-text {
      animation: flyIn2 var(--dur) ease-in forwards;
    }
  }
  &.upload-button-done {
    .upload-button-border {
      animation: sinkInA var(--dur) ease-in forwards;

      rect {
        animation: sinkInB var(--dur) ease-in forwards;
      }
    }

    .upload-btn-text {
      animation: pulseIn var(--dur) linear forwards;
      color: #25f42f;
    }
  }

  > label {
    cursor: pointer;
    background: #255ff4;
    color: #fff;
    padding: 1rem 1.25rem;
    border-radius: 1.25rem;

    &:has(.loading-svg) {
      padding: 1rem 3rem;
    }

    &:focus {
      outline: transparent;
    }

    &:not(:disabled):focus,
    &:not(:disabled):hover {
      background: #0b46da;
    }

    .upload-button-border {
      display: block;
      overflow: visible;
      pointer-events: none;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: auto;

      rect {
        stroke: #86a6f9;
      }
    }
    .upload-button-text {
      display: inline-block;
    }

    .loading-svg {
      display: inline-block;
      width: 1.5rem;
      height: 1.5rem;
    }
  }
`

export default Shortcut
