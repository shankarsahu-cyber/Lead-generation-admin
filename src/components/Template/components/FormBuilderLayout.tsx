import type React from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

interface FormBuilderLayoutProps {
  sidebar: React.ReactNode
  header: React.ReactNode
  children: React.ReactNode
}

export default function FormBuilderLayout({ sidebar, header, children }: FormBuilderLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex-shrink-0">{header}</div>

      {/* Main content with resizable sidebar */}
      <ResizablePanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        <ResizablePanel
          defaultSize={20}
          minSize={15}
          maxSize={40}
          className="bg-sidebar border-r border-sidebar-border"
        >
          <div className="h-full overflow-y-auto">{sidebar}</div>
        </ResizablePanel>

        <ResizableHandle withHandle className="hover:bg-primary/10 transition-colors" />

        <ResizablePanel defaultSize={80} minSize={60}>
          <div className="h-full overflow-y-auto bg-background">{children}</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}