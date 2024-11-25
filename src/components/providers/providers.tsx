import { NextUIProvider } from '@nextui-org/react'
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { BrowserRouter } from 'react-router-dom';

export function Providers({children}: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <NextUIProvider>
        <NextThemesProvider attribute="class" defaultTheme="dark">
          {children}
        </NextThemesProvider>
      </NextUIProvider>
    </BrowserRouter>
  )
}