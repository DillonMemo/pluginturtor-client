import { Main } from './Shortcut.component'
import { useTranslations } from 'next-intl'

export default function UnsupportChrome() {
  const translate = useTranslations()

  return (
    <Main className="unsupported">
      <h1>{translate('unsupport_chrome_text')}</h1>
      <a
        className="flex items-center gap-2"
        href="https://www.google.com/intl/en_us/chrome/#updates">
        {translate('unsupport_chrome_link')}
        <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24">
          <g transform="translate(24 0) scale(-1 1)">
            <g
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2">
              <path strokeDasharray="20" strokeDashoffset="20" d="M21 12H3.5">
                <animate
                  fill="freeze"
                  attributeName="stroke-dashoffset"
                  dur="0.75s"
                  values="20;0"
                />
              </path>
              <path strokeDasharray="12" strokeDashoffset="12" d="M3 12L10 19M3 12L10 5">
                <animate
                  fill="freeze"
                  attributeName="stroke-dashoffset"
                  begin="0.75s"
                  dur="0.65s"
                  values="12;0"
                />
              </path>
            </g>
          </g>
        </svg>
      </a>
    </Main>
  )
}
