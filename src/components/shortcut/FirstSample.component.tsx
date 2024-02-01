'use client'

import { Main } from './Shortcut.component'
import styled from 'styled-components'

export default function FirstSample() {
  const onFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('file upload', e)
  }
  return (
    <Main>
      <VideoUploadInput
        type="file"
        name="video-upload"
        id="video-upload"
        onChange={onFileUpload}
        accept="video/*"
      />
      <UploadButton className="upload-button" type="button">
        <label htmlFor="video-upload">
          <svg
            className="upload-button-border"
            xmlns="http://www.w3.org/2000/svg"
            width="120px"
            height="50px"
            viewBox="0 0 120 50"
            role="presentation">
            <rect
              x="-2"
              y="-2"
              width="124"
              height="54"
              rx="27"
              ry="27"
              fill="none"
              stroke="#000"
              strokeWidth="4"
              strokeDasharray="0 310"
              opacity="0"
            />
          </svg>
          <span className="upload-button-text">Upload</span>
        </label>
      </UploadButton>
    </Main>
  )
}

const VideoUploadInput = styled.input`
  display: none;
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
    width: 6rem;
    padding: 0.5rem 1rem;
    border-radius: 1.25rem;
    transition: all 0.1s linear;

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
  }
`
