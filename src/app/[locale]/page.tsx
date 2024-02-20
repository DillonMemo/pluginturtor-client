import type { Metadata } from 'next'
import Shortcut from '@/src/components/shortcut.plugin'

export const metadata: Metadata = {
  title: 'Short Cut',
  description: 'Plugin Tutor with Shortcuts',
}

export default function Home() {
  return <Shortcut />
}
