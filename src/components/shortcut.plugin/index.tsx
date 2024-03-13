'use client'

import * as d3 from 'd3'
import { CustomVideoElement, Multer, SliderArgs, SliderLayout } from '@/src/type'
import React, { useCallback, useEffect, useRef } from 'react'
import { findClosestRatio, slider } from '@/src/utils'
import { loadingState, videoResourceState } from '@/src/recoil/atom'
import Loading from '../Loading'
import VideoControl from './VideoControl.component'
import styled from 'styled-components'
import { useRecoilState } from 'recoil'

const Shortcut: React.FC = () => {
  const [loading, setLoading] = useRecoilState(loadingState)
  const [{ isEdit, thumbnails }, setVideoResource] = useRecoilState(videoResourceState)

  const videoRef = useRef() as React.MutableRefObject<CustomVideoElement>
  const svgRef = useRef() as React.MutableRefObject<SVGSVGElement>
  const wrapperRef = useRef() as React.MutableRefObject<HTMLDivElement>

  const layout: SliderLayout = {
    width:
      wrapperRef.current && wrapperRef.current instanceof HTMLElement
        ? Math.min(wrapperRef.current.offsetWidth, 1000)
        : 600,
    height: 140,
    expandHeight: 2,
    margin: {
      top: 30,
      right: 20,
      bottom: 30,
      left: 20,
    },
  }

  console.log(
    '1',
    wrapperRef.current && wrapperRef.current.clientWidth,
    wrapperRef.current && Math.min(wrapperRef.current.offsetWidth, 1000)
  )

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
                ...(thumbnails.length > 0 ? { thumbnails } : { thumbnails: [] }),
              }))

              const source = document.createElement('source')
              source.type = video.mimetype
              source.src = `data:${video.mimetype};base64,${base64Data}`
              videoRef.current.appendChild(source)
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

  const onLoadedMetadata = useCallback(() => {
    const { duration, videoWidth, videoHeight } = videoRef.current
    const args: SliderArgs = {
      layout,
      min: 0,
      max: duration,
    }

    videoRef.current.style.aspectRatio = findClosestRatio(videoWidth, videoHeight)

    slider(svgRef, videoRef, args, thumbnails)
  }, [thumbnails, layout])

  const onTimeUpdate = useCallback(
    (event: Event) => {
      const { target } = event
      if (target instanceof HTMLVideoElement) {
        const ref = target as CustomVideoElement
        if (target.paused) return

        const xScale = d3
          .scaleLinear()
          .domain([0, ref.duration])
          .range([0, layout.width - layout.margin.left - layout.margin.right])

        const cursorNode = d3.select('.cursor').node()
        if (cursorNode instanceof SVGGElement) {
          const { width, height } = cursorNode.getBoundingClientRect()
          const [defaultX, defaultY] = [
            Math.floor(layout.margin.left - width / 2),
            Math.floor(layout.margin.top - (height + layout.expandHeight)),
          ]
          const endTime = ref.timeRange[1]

          if (target.currentTime > endTime) {
            ref.pause()
            ref.currentTime = endTime
            d3.select('.cursor')
              .attr(
                'transform',
                `translate(${Math.floor(xScale(endTime) + defaultX)}, ${defaultY})`
              )
              .attr('x', Math.floor(xScale(endTime) + defaultX))
            setVideoResource((prev) => ({ ...prev, isPaused: true }))
          } else {
            d3.select('.cursor')
              .attr(
                'transform',
                `translate(${Math.floor(xScale(target.currentTime) + defaultX)}, ${defaultY})`
              )
              .attr('x', Math.floor(xScale(target.currentTime) + defaultX))
          }
        }
      }
    },
    [layout]
  )

  useEffect(() => {
    if (!isEdit || !svgRef.current || !videoRef.current) return

    videoRef.current.addEventListener('loadedmetadata', onLoadedMetadata)
    videoRef.current.addEventListener('timeupdate', onTimeUpdate)

    return () => {
      videoRef.current.removeEventListener('loadedmetadata', onLoadedMetadata)
      videoRef.current.removeEventListener('timeupdate', onTimeUpdate)
    }
  }, [isEdit])

  useEffect(() => {
    console.log('currentTie effect', videoRef.current.currentTime, videoRef.current.readyState)
    if (!videoRef.current.readyState) return
  }, [videoRef.current])

  return (
    <Main margin={layout.margin}>
      <div ref={wrapperRef} className="wrapper">
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
            <video ref={videoRef} preload="metadata">
              {/* {isEdit && <source src={videoDataURI} type={videoMimeType} />} */}
            </video>
          </div>
        </div>
        {isEdit && (
          <div className="control-wrapper">
            <div className="button-group">
              <VideoControl videoRef={videoRef} />
            </div>
          </div>
        )}
      </div>
      {isEdit && (
        <ToolWrapper layout={layout}>
          <div className="tool-container">
            <svg ref={svgRef}></svg>
          </div>
        </ToolWrapper>
      )}
    </Main>
  )
}

export const Main = styled.main<{ margin: SliderLayout['margin'] }>`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  outline: none;

  width: 100%;
  min-height: 100vh;

  padding: 2rem 2.5rem;

  .wrapper {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: ${({ margin }) => `0 ${margin.right}px 0 ${margin.left}px`};
    .video-wrapper {
      user-select: none;

      position: relative;
      display: flex;

      .video-container {
        video {
          max-width: 30rem;
          max-height: 25rem;
          aspect-ratio: 1;
          object-fit: contain;
        }
      }
    }

    .control-wrapper {
      display: flex;
      flex-flow: row nowrap;
      .button-group {
        display: inline-flex;
        flex-flow: row nowrap;
      }
    }
  }
`

const ToolWrapper = styled.div<{ layout: SliderLayout }>`
  width: ${({ layout }) => layout.width + 'px'};
  height: ${({ layout }) => layout.height + 'px'};
  .tool-container {
    position: relative;
  }
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
