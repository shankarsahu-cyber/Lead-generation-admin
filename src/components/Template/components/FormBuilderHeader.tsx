import { Plus, Edit2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useState } from "react"
import LinkPopover from "./LinkPopover"

interface BreadcrumbItem {
  id: string
  label: string
  isActive: boolean
}

interface FormOption {
  id: number
  name: string
  isPublished: boolean
  publishedSnippet?: string
  publishedURL?: string
}

interface FormBuilderHeaderProps {
  breadcrumbs: BreadcrumbItem[]
  onBreadcrumbClick: (id: string) => void
  onNewItem: () => void
  onSave: () => void
  isSaving?: boolean
  allForms: FormOption[]
  currentFormIndex: number
  onFormSelect: (formIndex: number) => void
  onNewForm: () => void
  isNewForm?: boolean
  isEditingFormName?: boolean
  newFormName?: string
  onFormNameEdit?: () => void
  onFormNameSave?: (name: string) => void
  onFormNameCancel?: () => void
  onPublish?: () => void
}

export default function FormBuilderHeader({
  breadcrumbs,
  onBreadcrumbClick,
  onNewItem,
  onSave,
  isSaving = false,
  allForms,
  currentFormIndex,
  onFormSelect,
  onNewForm,
  isNewForm = false,
  isEditingFormName = false,
  newFormName = "New Form",
  onFormNameEdit,
  onFormNameSave,
  onFormNameCancel,
  onPublish,
}: FormBuilderHeaderProps) {
  const [editingName, setEditingName] = useState(newFormName)

  const currentForm = currentFormIndex >= 0 ? allForms[currentFormIndex] : null

  const getCurrentFormName = () => {
    if (currentFormIndex === -1) return newFormName
    if (currentFormIndex >= 0 && allForms && allForms.length > 0 && currentFormIndex < allForms.length) {
      return allForms[currentFormIndex].name
    }
    return "Select Form"
  }

  const handleNameSave = () => {
    if (onFormNameSave && editingName.trim()) {
      onFormNameSave(editingName.trim())
    }
  }

  const handleNameCancel = () => {
    setEditingName(newFormName)
    if (onFormNameCancel) {
      onFormNameCancel()
    }
  }

  const handleNameEdit = () => {
    setEditingName(newFormName)
    if (onFormNameEdit) {
      onFormNameEdit()
    }
  }

  return (
    <>
      <div
        className="flex items-center justify-between p-4 border-b border-border bg-background"
        data-testid="form-builder-header"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isNewForm && isEditingFormName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-48"
                  placeholder="Enter form name"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleNameSave()
                    } else if (e.key === "Escape") {
                      handleNameCancel()
                    }
                  }}
                  autoFocus
                />
                <Button size="sm" variant="outline" onClick={handleNameSave} disabled={!editingName.trim()}>
                  <Check className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={handleNameCancel}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Select
                  value={currentFormIndex === -1 ? "new" : currentFormIndex.toString()}
                  onValueChange={(value) => {
                    if (value === "new") {
                      onNewForm()
                    } else {
                      onFormSelect(Number.parseInt(value))
                    }
                  }}
                >
                  <SelectTrigger className="w-48" data-testid="select-form">
                    <SelectValue>{getCurrentFormName()}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new" data-testid="option-new-form">
                      + New Form
                    </SelectItem>
                    {allForms.map((form, index) => (
                      <SelectItem key={form.id} value={index.toString()} data-testid={`option-form-${form.id}`}>
                        {form.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isNewForm && (
                  <Button size="sm" variant="outline" onClick={handleNameEdit} title="Rename form">
                    <Edit2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onSave} disabled={isSaving} data-testid="button-save-form">
            {isSaving ? (isNewForm ? "Creating..." : "Updating...") : isNewForm ? "Save Form" : "Update Form"}
          </Button>

          <Button onClick={onNewItem} className="gap-2" data-testid="button-new-item">
            <Plus className="h-4 w-4" /> New Item
          </Button>

          <Button
            onClick={onPublish}
            className={`gap-2 ${
              currentForm?.isPublished ? "bg-green-500 hover:bg-green-700" : "bg-blue-500 hover:bg-blue-600"
            } text-white`}
            data-testid="button-publish"
          >
            {currentForm?.isPublished ? "Published" : "Publish"}
          </Button>

          {currentForm?.isPublished && (
            <LinkPopover publishedSnippet={currentForm.publishedSnippet} publishedURL={currentForm.publishedURL} />
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2 px-4" data-testid="breadcrumbs">
        {breadcrumbs.map((item, index) => (
          <div key={item.id} className="flex items-center gap-2">
            <button
              onClick={() => onBreadcrumbClick(item.id)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md transition-colors hover-elevate",
                item.isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
              )}
              data-testid={`breadcrumb-${item.id}`}
            >
              {item.label}
            </button>
            {index < breadcrumbs.length - 1 && <span className="text-muted-foreground">{">"}</span>}
          </div>
        ))}
      </div>
    </>
  )
}