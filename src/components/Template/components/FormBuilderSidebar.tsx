
import { ChevronRight, ChevronDown, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TreeNode } from "@/shared/form-schema"

interface FormBuilderSidebarProps {
  treeData: TreeNode[]
  selectedNodeId: string | null
  onNodeSelect: (nodeId: string) => void
  onToggleExpand: (nodeId: string) => void
}

function TreeNodeItem({
  node,
  level = 0,
  selectedNodeId,
  onNodeSelect,
  onToggleExpand,
}: {
  node: TreeNode
  level?: number
  selectedNodeId: string | null
  onNodeSelect: (nodeId: string) => void
  onToggleExpand: (nodeId: string) => void
}) {
  const hasChildren = node.children && node.children.length > 0
  const isSelected = selectedNodeId === node.id
  const paddingLeft = `${level * 1.5 + 0.75}rem`

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2.5 py-2.5 pr-3 cursor-pointer rounded-lg text-sm transition-all duration-200",
          "hover:bg-sidebar-accent/50 hover:shadow-sm",
          isSelected && "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm ring-1 ring-sidebar-accent/20",
        )}
        style={{ paddingLeft }}
        onClick={() => onNodeSelect(node.id)}
        data-testid={`sidebar-item-${node.id}`}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand(node.id)
            }}
            className="flex-shrink-0 p-0.5 hover:bg-sidebar-accent/30 rounded transition-colors"
            data-testid={`expand-button-${node.id}`}
          >
            {node.isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        ) : (
          <div className="w-4 flex-shrink-0" />
        )}

        {node.imageUrl ? (
          <div className="flex-shrink-0 w-8 h-8 rounded-md overflow-hidden bg-muted border border-border shadow-sm">
            <img
              src={node.imageUrl || "/placeholder.svg"}
              alt={node.label}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to icon if image fails to load
                e.currentTarget.style.display = "none"
                e.currentTarget.parentElement!.innerHTML =
                  '<div class="w-full h-full flex items-center justify-center bg-muted"><svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>'
              }}
            />
          </div>
        ) : (
          <div className="flex-shrink-0 w-8 h-8 rounded-md bg-muted border border-border flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-muted-foreground" />
          </div>
        )}

        <span className="flex-1 break-words font-medium leading-tight" data-testid={`node-label-${node.id}`}>
          {node.label}
        </span>

        {node.allowMultiple && (
          <span className="flex-shrink-0 text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full font-medium shadow-sm">
            Multi
          </span>
        )}
      </div>

      {hasChildren && node.isExpanded && (
        <div className="space-y-0.5">
          {node.children.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              level={level + 1}
              selectedNodeId={selectedNodeId}
              onNodeSelect={onNodeSelect}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function FormBuilderSidebar({
  treeData,
  selectedNodeId,
  onNodeSelect,
  onToggleExpand,
}: FormBuilderSidebarProps) {
  return (
    <div className="h-full p-4" data-testid="form-builder-sidebar">
      <div className="mb-4 pb-3 border-b border-sidebar-border">
        <h2 className="text-sm font-semibold text-sidebar-foreground">Form Structure</h2>
        <p className="text-xs text-muted-foreground mt-1">Navigate through your form items</p>
      </div>

      <div className="space-y-1">
        {treeData.map((node) => (
          <TreeNodeItem
            key={node.id}
            node={node}
            selectedNodeId={selectedNodeId}
            onNodeSelect={onNodeSelect}
            onToggleExpand={onToggleExpand}
          />
        ))}
      </div>
    </div>
  )
}