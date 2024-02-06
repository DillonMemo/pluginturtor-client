'use client'

import { isChromeState, loadingState } from '@/src/recoil/atom'
import ChromeRequired from './ChromeRequired.component'
import Loading from '../Loading'
import SSRWrapper from './SSRWrapper.component'
import dynamic from 'next/dynamic'
import styled from 'styled-components'
import { useEffect } from 'react'
import { useRecoilState } from 'recoil'

const Shortcut: React.FC = () => {
  const [loading, setLoading] = useRecoilState(loadingState)
  const SSRTest = dynamic(() => Promise.resolve(SSRWrapper), { ssr: false })
  const [isChrome, setIsChrome] = useRecoilState(isChromeState)

  useEffect(() => {
    const handle = (isChrome: boolean) => {
      setIsChrome(isChrome)
      setLoading(false)
    }

    if (typeof navigator !== 'undefined') {
      const isChrome =
        /Chrome/.test(navigator.userAgent) ||
        /CriOS/.test(navigator.userAgent) ||
        /Google Inc/.test(navigator.vendor)

      const timeset = setTimeout(() => handle(isChrome), 1000)

      return () => clearTimeout(timeset)
    }
  }, [])

  if (loading)
    return (
      <Main>
        <Loading />
      </Main>
    )
  if (!isChrome) return <ChromeRequired />

  return <SSRTest />
}

export const Main = styled.main`
  width: 100%;
  min-height: 100vh;

  padding: 2rem 2.5rem;
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
