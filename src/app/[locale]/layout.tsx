import './globals.css'
import { NextIntlClientProvider, useMessages } from 'next-intl'
import type { Metadata } from 'next'
import RootProvider from '@/src/lib'

export const metadata: Metadata = {
  title: 'Short Cut',
  description: 'Plugin Tutor with Shortcuts',
}

export default function RootLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode
  params: { locale: string }
}>) {
  const messages = useMessages()
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <RootProvider>{children}</RootProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
