import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex h-svh flex-col items-center justify-center gap-3 bg-background text-center">
      <p className="figure text-5xl text-muted-foreground">404</p>
      <p className="text-sm font-medium">This page does not exist</p>
      <Button
        size="sm"
        nativeButton={false}
        render={<Link href="/dashboard" />}
        className="mt-1"
      >
        Back to dashboard
      </Button>
    </div>
  )
}
