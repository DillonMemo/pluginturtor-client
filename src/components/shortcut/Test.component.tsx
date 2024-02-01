'use client'

// import { fetchFile, toBlobURL } from '@ffmpeg/util'
// import { useRef, useState } from 'react'
// import { FFmpeg } from '@ffmpeg/ffmpeg'
import { Main } from './Shortcut.component'
// import styled from 'styled-components'

export default function Test() {
  //   const translate = useTranslations()
  //   const [loaded, setLoaded] = useState(false)
  //   const [isLoading, setIsLoading] = useState(false)
  //   const ffmpegRef = useRef(new FFmpeg())
  //   const videoRef = useRef<HTMLVideoElement | null>(null)
  //   const messageRef = useRef<HTMLParagraphElement | null>(null)

  //   const load = async () => {
  //     setIsLoading(true)
  //     const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
  //     const ffmpeg = ffmpegRef.current
  //     ffmpeg.on('progress', ({ progress, time }) => {
  //       if (messageRef.current)
  //         messageRef.current.innerHTML = `${+(progress * 100).toFixed(2)} % (transcoded time: ${time / 1000000} s)`
  //     })

  //     await ffmpeg.load({
  //       coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
  //       wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  //     })

  //     setLoaded(true)
  //     setIsLoading(false)
  //   }

  //   const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //     const fileList = e.target.files
  //     if (fileList && fileList.length > 0) {
  //       const ffmpeg = ffmpegRef.current
  //       await ffmpeg.writeFile('input.mp4', await fetchFile(fileList[0]))

  //       for (let i = 0; i < 20; i++) {
  //         const imageName = `output_frame_${i}.png`
  //         await ffmpeg.exec(['-i', 'input.mp4', '-ss', `${i + 1}`, '-vframes', '1', imageName])
  //         const data = (await ffmpeg.readFile(imageName)) as Uint8Array
  //         const blob = new Blob([data.buffer], { type: 'image/png' })
  //         const img = document.createElement('img')
  //         img.src = URL.createObjectURL(blob)
  //         const framesNode = document.querySelector('.frames')
  //         if (framesNode) {
  //           const frameNode = document.createElement('div')
  //           frameNode.classList.add('frame')
  //           frameNode.appendChild(img)
  //           framesNode.appendChild(frameNode)
  //         }
  //       }
  //     }
  //   }

  return (
    <Main>
      {/* {loaded ? (
        <>
          <div className="video-container">
            <input
              type="file"
              name="video-file"
              id="video-file"
              onChange={onChange}
              accept="video/*"
            />
            <video ref={videoRef} controls style={{ maxHeight: 400 }}></video>
            <br />
            <p ref={messageRef}></p>
          </div>
          <VideoNavigationWrapper>
            <div className="storyboard">
              <div className="frames"></div>
            </div>
          </VideoNavigationWrapper>
        </>
      ) : (
        <button
          className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex items-center bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
          //   onClick={load}
        >
          Load ffmpeg-core
          {isLoading && (
            <span className="animate-spin ml-3">
              <svg
                viewBox="0 0 1024 1024"
                focusable="false"
                data-icon="loading"
                width="1em"
                height="1em"
                fill="currentColor"
                aria-hidden="true">
                <path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"></path>
              </svg>
            </span>
          )}
        </button>
      )} */}
    </Main>
  )
}

// const VideoNavigationWrapper = styled.div`
//   position: relative;
//   display: flex;
//   width: 100%;
//   margin-top: 3rem;

//   .storyboard {
//     position: relative;
//     z-index: 1;
//     min-height: 3.75rem;
//     width: 30%;
//     background-color: red;

//     .frames {
//       display: flex;
//       width: 100%;
//       overflow: hidden;

//       .frame {
//         background-color: rgba(0, 0, 0, 0.8);
//         width: 3rem;
//         height: 4.6875rem;
//         background-image: url('data:image/svg+xml;utf8,<svg width="200px" height="200px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="lds-eclipse" style="animation-play-state: running; animation-delay: 0s; background: none;"><path stroke="none" d="M10 50A40 40 0 0 0 90 50A40 42 0 0 1 10 50" fill="%2300E0FF" style="animation-play-state: running; animation-delay: 0s;"><animateTransform attributeName="transform" type="rotate" calcMode="linear" values="0 50 51;360 50 51" keyTimes="0;1" dur="1s" begin="0s" repeatCount="indefinite" style="animation-play-state: running; animation-delay: 0s;"></animateTransform></path></svg>');
//         background-size: 25%;
//         background-position: 50%;
//         background-repeat: no-repeat;
//         flex-shrink: 0;
//         flex-grow: 0;
//         pointer-events: none;

//         &.loaded {
//           background-image: none;
//         }

//         img {
//           width: 100%;
//           display: block;
//           overflow-clip-margin: content-box;
//           overflow: clip;
//         }
//       }
//     }
//   }
// `
