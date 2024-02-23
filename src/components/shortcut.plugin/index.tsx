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
  const [{ isEdit, videoDataURI, videoMimeType, videoRef }, setVideoResource] =
    useRecoilState(videoResourceState)

  const videoPreRef = useRef() as React.MutableRefObject<HTMLVideoElement>

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
    if (!isEdit) return
    // function contains([[x0, y0], [x1, y1]]: number[][], [x, y]: number[]) {
    //   return x >= x0 && x < x1 && y >= y0 && y < y1
    // }
    // function brushed(selection: any) {
    //   point.attr('fill', selection && ((d) => (contains(selection, d) ? 'red' : null)))
    // }
    // function brushended(event: d3.D3BrushEvent<SVGElement>) {
    //   if (!event.sourceEvent) return
    //   const brushEl = document.querySelector('.brush-group')
    //   console.log('1', defaultExtent, [[100,100],[200, 200]])
    //   d3.select(brushEl)
    //     .transition()
    //     .delay(100)
    //     .duration(event.selection ? 750 : 0)
    //     .call(brush.move, defaultExtent)
    // }
    // const width = 600,
    //   height = 600,
    //   data = Array.from({ length: 1000 }, () => [Math.random() * width, Math.random() * height]),
    //   defaultExtent = [
    //     [width * 0.1, width * 0.1],
    //     [width * 0.3, width * 0.3],
    //   ]
    // const brush = d3
    //   .brush()
    //   .on('start brush', ({ selection }) => brushed(selection))
    //   .on('end', brushended)
    // const svg = d3.create('svg').attr('viewBox', [0, 0, width, height])
    // const point = svg
    //   .append('g')
    //   .attr('fill', '#ccc')
    //   .attr('stroke', '#777')
    //   .selectAll('circle')
    //   .data(data)
    //   .join('circle')
    //   .attr('cx', (d) => d[0])
    //   .attr('cy', (d) => d[1])
    //   .attr('r', 3.5)

    // svg
    //   .append('g')
    //   .attr('class', 'brush-group')
    //   .call(brush as any)
    //   .call(brush.move as any, defaultExtent)

    // document.querySelector('.test-d3')?.appendChild(svg.node())

    const margin = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
      },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom

    const svg = d3
      .select('.test-d3')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top}`)

    svg.append('rect').attr('class', 'grid-background').attr('width', width).attr('height', height)
    const gBrushes = svg.append('g').attr('class', 'brushes')

    const brushes: { id: number; brush: d3.BrushBehavior<any> }[] = []

    function newBrush() {
      const brush = d3.brush().on('end', brushend)

      brushes.push({ id: brushes.length, brush })
      function brushend() {
        // Figure out if our latest brush has a selection
        const lastBrushID = brushes[brushes.length - 1].id
        const lastBrush = document.getElementById('brush-' + lastBrushID)

        const selection = d3.brushSelection(lastBrush as any)

        if (selection && selection[0] !== selection[1]) {
          newBrush()
        }

        drawBrushes()
      }
    }

    function drawBrushes() {
      const brushSelection = gBrushes.selectAll('.brush').data(brushes, function (d: any) {
        return d
      })

      // Set up new brushes
      brushSelection.enter()
    }
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
          <button
            onClick={() => {
              console.log('test', videoRef.current && videoRef.current.duration)
              videoRef.current && (videoRef.current.currentTime = 5.7)
            }}>
            w: 0 ~ 100
          </button>
          <button>w: 60 ~ 100</button>

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
      {isEdit && <div className="test-d3"></div>}
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
