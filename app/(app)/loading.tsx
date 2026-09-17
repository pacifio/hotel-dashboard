export default function AppLoading() {
  return (
    <div className="flex h-full flex-col gap-3 p-5">
      <div className="h-[86px] animate-pulse rounded-xl bg-muted/60" />
      <div className="grid flex-1 gap-3 lg:grid-cols-[1.6fr_1fr]">
        <div className="animate-pulse rounded-xl bg-muted/60" />
        <div className="animate-pulse rounded-xl bg-muted/60" />
      </div>
    </div>
  )
}
