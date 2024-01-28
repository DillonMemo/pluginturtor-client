import RecoilRootProvider from './recoil.provider'
import StyledComponentsRegistry from './styledComponent.provider'

export default function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <RecoilRootProvider>
      <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
    </RecoilRootProvider>
  )
}
