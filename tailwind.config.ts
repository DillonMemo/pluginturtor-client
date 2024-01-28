import type { Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultTheme'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    screens: {
      sm: '30rem', // 480px
      md: '48rem', // 768px
      lg: '61rem', // 976px
      xl: '90rem', // 1440px
    },
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
    fontFamily: {
      pretendard: ['Pretendard', ...fontFamily.sans],
    },
  },
  plugins: [],
}
export default config
