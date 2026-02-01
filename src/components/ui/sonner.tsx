"use client"

import { useTheme } from "next-themes"
import type { ToasterProps } from "sonner"
import { Toaster as Sonner } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      gap={8}
      {...props}
    />
  )
}

export { Toaster }
