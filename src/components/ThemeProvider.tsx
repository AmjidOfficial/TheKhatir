import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  resolvedTheme: "dark" | "light"
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

const isTheme = (value: unknown): value is Theme =>
  value === "dark" || value === "light" || value === "system"

const readStoredTheme = (storageKey: string, fallback: Theme): Theme => {
  try {
    const stored = window.localStorage.getItem(storageKey)
    return isTheme(stored) ? stored : fallback
  } catch {
    return fallback
  }
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() =>
    readStoredTheme(storageKey, defaultTheme)
  )
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("light")

  useEffect(() => {
    const root = window.document.documentElement
    const media = window.matchMedia("(prefers-color-scheme: dark)")

    const apply = () => {
      const next: "dark" | "light" =
        theme === "system" ? (media.matches ? "dark" : "light") : theme

      root.classList.remove("light", "dark")
      root.classList.add(next)
      root.style.colorScheme = next
      setResolvedTheme(next)
    }

    apply()

    if (theme !== "system") return
    media.addEventListener("change", apply)
    return () => media.removeEventListener("change", apply)
  }, [theme])

  // Keep tabs/windows of the same site in sync.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) return
      setThemeState(isTheme(event.newValue) ? event.newValue : defaultTheme)
    }

    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [storageKey, defaultTheme])

  const value: ThemeProviderState = {
    theme,
    resolvedTheme,
    setTheme: (next: Theme) => {
      try {
        window.localStorage.setItem(storageKey, next)
      } catch {
        // storage unavailable (private mode) — keep in-memory state
      }
      setThemeState(next)
    },
  }

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
