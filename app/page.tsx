import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-2xl flex-col justify-center gap-6 px-4 py-16 md:px-6">
      <p className="font-mono text-xs text-muted-foreground">
        page-gen template
      </p>
      <h1 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
        Describe the screen you want. The agent writes a brief, builds it, and
        checks it in a real browser.
      </h1>
      <p className="leading-relaxed text-pretty text-muted-foreground">
        Every shadcn/ui component is installed. Unused ones are removed with
        knip when you ship.
      </p>
      <div>
        <Button>
          Start building
          <ArrowRight />
        </Button>
      </div>
    </main>
  )
}
