"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Building2, Globe, Moon, Sparkles, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { useLocale } from "@/lib/i18n/provider"
import { LOCALE_META, LOCALES } from "@/lib/i18n/config"
import { NAV_INDEX } from "@/lib/nav"
import { useUi } from "@/lib/store"
import { useTenants } from "@/lib/data"
import { HUE_VAR } from "@/lib/hue"

/** calendar.jpg's ⌘F search, grown into a full command palette. */
export function CommandPalette() {
  const router = useRouter()
  const { t, locale, setLocale } = useLocale()
  const { tenants, tenantId, setTenantId } = useTenants()
  const { setTheme, resolvedTheme } = useTheme()
  const open = useUi((state) => state.commandOpen)
  const setOpen = useUi((state) => state.setCommandOpen)
  const setCopilotOpen = useUi((state) => state.setCopilotOpen)
  const toggleSidebar = useUi((state) => state.toggleSidebar)

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey
      if (!meta) return
      const key = event.key.toLowerCase()
      if (key === "k") {
        event.preventDefault()
        setOpen(!open)
      } else if (key === "j") {
        event.preventDefault()
        setCopilotOpen(true)
      } else if (key === "b") {
        event.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, setOpen, setCopilotOpen, toggleSidebar])

  const run = (action: () => void) => {
    action()
    setOpen(false)
  }

  const grouped = React.useMemo(() => {
    const map = new Map<string, typeof NAV_INDEX>()
    for (const entry of NAV_INDEX) {
      const key = t(entry.groupKey)
      map.set(key, [...(map.get(key) ?? []), entry])
    }
    return [...map.entries()]
  }, [t])

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      className="max-w-[560px]"
      title={t("shell.commandHint")}
      description={t("common.searchPlaceholder")}
    >
      <CommandInput placeholder={t("shell.commandHint")} />
      <CommandList className="max-h-[400px]">
        <CommandEmpty>{t("common.noResults")}</CommandEmpty>

        <CommandGroup heading={t("common.actions")}>
          <CommandItem
            onSelect={() => run(() => setCopilotOpen(true))}
            value="copilot ai assistant ask"
          >
            <Sparkles />
            {t("shell.openCopilot")}
            <CommandShortcut>⌘J</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"))
            }
            value="theme dark light appearance"
          >
            {resolvedTheme === "dark" ? <Sun /> : <Moon />}
            {t("shell.toggleTheme")}
          </CommandItem>
          {LOCALES.filter((code) => code !== locale).map((code) => (
            <CommandItem
              key={code}
              onSelect={() => run(() => setLocale(code))}
              value={`language ${LOCALE_META[code].label} ${LOCALE_META[code].nativeLabel}`}
            >
              <Globe />
              {t("shell.language")} · {LOCALE_META[code].nativeLabel}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={t("shell.switchProperty")}>
          {tenants.map((tenant) => (
            <CommandItem
              key={tenant.id}
              onSelect={() => run(() => setTenantId(tenant.id))}
              value={`property ${tenant.name.en} ${tenant.name.bn} ${tenant.city.en}`}
            >
              <span
                className="flex size-4 items-center justify-center rounded text-[0.5rem] font-semibold"
                style={{
                  background: `color-mix(in oklch, ${HUE_VAR[tenant.hue]} 18%, transparent)`,
                  color: HUE_VAR[tenant.hue],
                }}
              >
                {tenant.initials}
              </span>
              {tenant.name[locale]}
              <span className="ml-auto text-[0.625rem] text-muted-foreground">
                {tenant.city[locale]}
              </span>
              {tenant.id === tenantId ? (
                <Building2 className="size-3 text-primary" />
              ) : null}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {grouped.map(([heading, entries]) => (
          <CommandGroup key={heading} heading={heading}>
            {entries.map((entry) => (
              <CommandItem
                key={entry.href}
                onSelect={() => run(() => router.push(entry.href))}
                value={`${t(entry.labelKey)} ${entry.href} ${heading}`}
              >
                <entry.icon />
                {t(entry.labelKey)}
                <span className="ml-auto font-mono text-[0.625rem] text-muted-foreground">
                  {entry.href}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  )
}
