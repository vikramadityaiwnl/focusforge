import { NextUIProvider } from '@nextui-org/react'
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { HashRouter } from 'react-router-dom';

export function Providers({children}: { children: React.ReactNode }) {
  return (
    <HashRouter>
      <NextUIProvider>
        <NextThemesProvider attribute="class" defaultTheme="dark">
          {children}
        </NextThemesProvider>
      </NextUIProvider>
    </HashRouter>
  )
}