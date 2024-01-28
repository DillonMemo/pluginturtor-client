'use client'

import { chromeVersionState, loadingState } from '@/src/recoil/atom'
import ChromeRequired from './ChromeRequired.component'
import Image from 'next/image'
import Loading from '../Loading'
import UnsupportChrome from './UnsupportChrome.component'
import styled from 'styled-components'
import { useEffect } from 'react'
import { useRecoilState } from 'recoil'

const Shortcut: React.FC = () => {
  const [loading, setLoading] = useRecoilState(loadingState)
  const [chromeVersion, setChromeVersion] = useRecoilState(chromeVersionState)

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const isChrome = /Chrome/.test(navigator.userAgent)
      if (isChrome) {
        const version = parseInt(navigator.userAgent.match(/Chrome\/(\d+)/)![1], 10)

        setChromeVersion(version)
      }

      setLoading(false)
    }
  }, [])

  if (loading)
    return (
      <Main>
        <Loading />
      </Main>
    )

  if (typeof chromeVersion === 'undefined') return <ChromeRequired />
  if (chromeVersion < 116) return <UnsupportChrome />

  return (
    <Main>
      <h1>Hello Plugin Turtor</h1>
      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
        <Image
          className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
      </div>
    </Main>
  )
}

export const Main = styled.main`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;

  &.unsupported {
    gap: 2rem;
    h1 {
      font-size: 2rem;
      text-align: center;
    }
    a {
      transition: 0.3s ease;

      &:hover {
        opacity: 0.5;
      }
    }
  }
`

export default Shortcut
