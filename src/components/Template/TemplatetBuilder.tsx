
import { useState, useCallback, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import ItemGrid from "./components/ItemGrid"
import type { GridItem } from "./components/ItemGrid"
import { TreeNode } from "@/shared/form-schema"
import FormBuilderLayout from "./components/FormBuilderLayout"
import FormBuilderSidebar from "./components/FormBuilderSidebar"
import FormBuilderHeader from "./components/FormBuilderHeader"

import EditItemDialog from "./components/EditItemDialog"
import ImageUploadDialog from "./components/ImageUploadDialog"
import { Button } from "@/components/ui/button"
import AddLocation from "./components/AddLocation"



interface EditingItem {
  id: string
  label: string
  allowMultiple: boolean
}

interface ApiForm {
  id: number
  name: string
  description: string
  formPayload: string
  isPublished: boolean
  embedCode: string
  submissionCount: number
  createdAt: string
  updatedAt: string
  isActive: boolean
  publishedAt: string | null
  locations: any[]
  publishedUrl: string
  jsSnippet: string
}

interface ApiResponse {
  success: boolean
  message: string
  data: ApiForm[]
  error: any
}

export default function FormBuilderPage() {
  const [allForms, setAllTemplates] = useState<ApiForm[]>([])
  const [currentFormIndex, setCurrentFormIndex] = useState<number>(0)
  const [treeData, setTreeData] = useState<TreeNode[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [imageUploadItemId, setImageUploadItemId] = useState<string | null>(null)
  const [isEditingFormName, setIsEditingFormName] = useState(false)
  const [newFormName, setNewFormName] = useState("New Form")
  const { toast } = useToast()
  const [showPublishConfirm, setShowPublishConfirm] = useState(false)
  const [showUnpublishConfirm, setShowUnpublishConfirm] = useState(false)
  const [redirectUrl, setRedirectUrl] = useState("")
  const [contactTypes, setContactTypes] = useState<string[]>([])
  const [currentFormID, setCurrentFormID] = useState<number | null>(null)

  // Convert API format back to tree structure
  const convertApiToTreeFormat = useCallback((formData: any): TreeNode[] => {
    if (!formData || !formData.steps || formData.steps.length === 0) {
      return []
    }

    const steps = formData.steps
    const step1 = steps.find((step: any) => step.stepId === "step1")

    if (!step1 || !step1.fields || step1.fields.length === 0) {
      return []
    }

    // Recursive function to process options at any depth
    const processOptions = (options: any[], steps: any[]): TreeNode[] => {
      return options.map((option: any) => {
        const node: TreeNode = {
          id: option.optionId,
          label: option.label,
          type: "option",
          allowMultiple: false,
          isExpanded: true,
          imageUrl: option.imageUrl,
          children: [],
        }

        // Find the next step for this option
        const nextStepId = option.nextFieldId
        if (nextStepId && nextStepId !== "step_final") {
          const nextStep = steps.find((step: any) => step.stepId === nextStepId)
          if (nextStep && nextStep.fields && nextStep.fields[0] && nextStep.fields[0].options) {
            const nextField = nextStep.fields[0]
            node.allowMultiple = nextField.type === "checkbox"

            // Recursively process child options
            node.children = processOptions(nextField.options, steps)
          }
        }

        return node
      })
    }

    const mainField = step1.fields[0]
    const rootNode: TreeNode = {
      id: "root-1",
      label: formData.name || "Form",
      type: "root",
      allowMultiple: false,
      isExpanded: true,
      children: [],
    }

    // Process main options from step1 recursively
    if (mainField.options) {
      rootNode.children = processOptions(mainField.options, steps)
    }

    return [rootNode]
  }, [])

  // Load specific form by index
  const loadForm = useCallback(
    (formIndex: number) => {
      if (formIndex >= 0 && formIndex < allForms.length) {
        localStorage.setItem("lastFormIndex", formIndex.toString()) // Save index
        const currentForm = allForms[formIndex]
        setCurrentFormIndex(formIndex)

        try {
          const formPayload = JSON.parse(currentForm.formPayload)
          const treeStructure = convertApiToTreeFormat(formPayload)
          setTreeData(treeStructure)

          if (treeStructure.length > 0) {
            setSelectedNodeId(treeStructure[0].id)
          }

          toast({
            title: "Form Loaded",
            description: `Successfully loaded "${currentForm.name}"`,
          })
        } catch (parseError) {
          toast({
            title: "Parse Error",
            description: "Error parsing form data from server.",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Invalid Form",
          description: "Selected form index is out of range.",
          variant: "destructive",
        })
      }
    },
    [allForms, convertApiToTreeFormat, toast],
  )

  // Create new empty form
  const createNewTemplate = useCallback(() => {
    const emptyRoot: TreeNode = {
      id: "root-1",
      label: newFormName,
      type: "root",
      allowMultiple: false,
      isExpanded: true,
      children: [],
    }
    setTreeData([emptyRoot])
    setSelectedNodeId("root-1")
    setCurrentFormIndex(-1) // -1 indicates new form

    toast({
      title: "New Form Created",
      description: "You can now start building your form.",
    })
  }, [toast, newFormName])

  // Fetch forms from API
  const fetchTemplates = useCallback(async () => {
    setIsLoading(true)
    try {
        const storedUser = localStorage.getItem('user');
const authToken = storedUser ? JSON.parse(storedUser).token : null;
    
      if (!authToken) {
        throw new Error("Authentication token not found. Please log in first.")
      }

      const response = await fetch("http://15.206.69.231:8888/api/admin/templates?category", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch forms: ${response.status} ${response.statusText}`)
      }

      const apiResponse: ApiResponse = await response.json()

      if (apiResponse.success && apiResponse.data && apiResponse.data.length > 0) {
        // Store all forms
        setAllTemplates(apiResponse.data)

        let lastIndex = Number(localStorage.getItem("lastFormIndex"))
        if (isNaN(lastIndex) || lastIndex < 0 || lastIndex >= apiResponse.data.length) {
          lastIndex = apiResponse.data.length - 1
        }

        setCurrentFormIndex(lastIndex)
        const lastForm = apiResponse.data[lastIndex]
        try {
          const formPayload = JSON.parse(lastForm.formPayload)

          const treeStructure = convertApiToTreeFormat(formPayload)
          setTreeData(treeStructure)

          if (treeStructure.length > 0) {
            setSelectedNodeId(treeStructure[0].id)
          }
        } catch (parseError) {
          toast({
            title: "Parse Error",
            description: "Error parsing first form data from server.",
            variant: "destructive",
          })
        }
      } else {
        // No forms found, start with empty structure

        setAllTemplates([])
        createNewTemplate()
      }
    } catch (error) {
      toast({
        title: "Load Failed",
        description: error instanceof Error ? error.message : "Failed to load forms from server.",
        variant: "destructive",
      })

      // Fallback to empty form
      setAllTemplates([])
      createNewTemplate()
    } finally {
      setIsLoading(false)
    }
  }, [convertApiToTreeFormat, toast, createNewTemplate])

  // Load forms on component mount
  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  // Get current node and its children for display
  const findNodeById = useCallback((nodes: TreeNode[], id: string): TreeNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node
      const found = findNodeById(node.children, id)
      if (found) return found
    }
    return null
  }, [])

  const currentNode = selectedNodeId ? findNodeById(treeData, selectedNodeId) : null

  // Convert tree data to grid items
  const gridItems: GridItem[] =
    currentNode?.children.map((child) => ({
      id: child.id,
      label: child.label,
      imageUrl: child.imageUrl,
      allowMultiple: child.allowMultiple,
    })) || []

  // Generate breadcrumbs
  const generateBreadcrumbs = useCallback(
    (nodeId: string | null) => {
      if (!nodeId) return []

      const breadcrumbs: Array<{ id: string; label: string; isActive: boolean }> = []

      const findPath = (nodes: TreeNode[], targetId: string, path: TreeNode[] = []): TreeNode[] | null => {
        for (const node of nodes) {
          const currentPath = [...path, node]
          if (node.id === targetId) return currentPath

          const found = findPath(node.children, targetId, currentPath)
          if (found) return found
        }
        return null
      }

      const path = findPath(treeData, nodeId)
      if (path) {
        return path.map((node, index) => ({
          id: node.id,
          label: node.label,
          isActive: index === path.length - 1,
        }))
      }

      return []
    },
    [treeData],
  )

  const breadcrumbs = generateBreadcrumbs(selectedNodeId)

  // Update tree node
  const updateTreeNode = useCallback((nodes: TreeNode[], nodeId: string, updates: Partial<TreeNode>): TreeNode[] => {
    return nodes.map((node) => {
      if (node.id === nodeId) {
        return { ...node, ...updates }
      }
      if (node.children.length > 0) {
        return {
          ...node,
          children: updateTreeNode(node.children, nodeId, updates),
        }
      }
      return node
    })
  }, [])

  // Remove tree node
  const removeTreeNode = useCallback((nodes: TreeNode[], nodeId: string): TreeNode[] => {
    return nodes
      .filter((node) => {
        if (node.id === nodeId) return false
        if (node.children.length > 0) {
          return {
            ...node,
            children: removeTreeNode(node.children, nodeId),
          }
        }
        return true
      })
      .map((node) => ({
        ...node,
        children: removeTreeNode(node.children, nodeId),
      }))
  }, [])

  // Event handlers
  const handleNodeSelect = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId)
  }, [])

  const handleToggleExpand = useCallback(
    (nodeId: string) => {
      setTreeData((nodes) =>
        updateTreeNode(nodes, nodeId, {
          isExpanded: !findNodeById(nodes, nodeId)?.isExpanded,
        }),
      )
    },
    [findNodeById, updateTreeNode],
  )

  const handleBreadcrumbClick = useCallback((id: string) => {
    setSelectedNodeId(id)
  }, [])

  const handleNewItem = useCallback(() => {
    if (!currentNode) return

    const newId = `new-item-${Date.now()}`
    const newItem: TreeNode = {
      id: newId,
      label: "New Item",
      type: "option",
      allowMultiple: false,
      isExpanded: true,
      children: [],
    }

    setTreeData((nodes) =>
      updateTreeNode(nodes, currentNode.id, {
        children: [...currentNode.children, newItem],
      }),
    )

    toast({
      title: "Item Created",
      description: "New item has been added successfully.",
    })
  }, [currentNode, updateTreeNode, toast])

  // Convert tree structure to API format
  const convertTreeToApiFormat = useCallback(() => {
    const steps: any[] = []
    const rootNode = treeData[0]

    if (!rootNode || rootNode.children.length === 0) {
      return {
        name: rootNode?.label || "Untitled Form",
        description: "Form created with dynamic form builder",
        steps: [],
        settings: {
          successMessage: "Thank you for your submission!",
        },
      }
    }

    let stepCounter = 2 // Start from 2 since step1 is the root level

    // Recursive function to process nodes and create steps
    const processNode = (node: TreeNode, parentStepPrefix = "step"): string => {
      if (node.children.length === 0) {
        return "step_final"
      }

      const currentStepId = `${parentStepPrefix}${stepCounter}_${node.id}`
      stepCounter++

      const step = {
        stepId: currentStepId,
        title: `Choose ${node.label} Type`,
        fields: [
          {
            fieldId: `${node.id}_selection`,
            type: node.allowMultiple ? ("checkbox" as const) : ("radio" as const),
            label: `Select ${node.label} option`,
            options: node.children.map((child) => {
              const nextFieldId = processNode(child, "step")
              return {
                optionId: child.id,
                label: child.label,
                value: child.label.toLowerCase().replace(/\s+/g, "_"),
                imageUrl: child.imageUrl || "",
                nextFieldId: nextFieldId,
              }
            }),
          },
        ],
      }
console.log(step,"step")
      steps.push(step)
      return currentStepId
    }

    // Create step 1 with root level options
    const step1 = {
      stepId: "step1",
      title: rootNode.label,
      fields: [
        {
          fieldId: "main_selection",
          type: "image_select" as const,
          label: "Choose an option",
          required: true,
          options: rootNode.children.map((child) => {
            const nextFieldId = processNode(child, "step")
           
            return {
              optionId: child.id,
              label: child.label,
              value: child.label.toLowerCase().replace(/\s+/g, "_"),
              imageUrl: child.imageUrl || "",
              nextFieldId: nextFieldId,
            }
          }),
        },
      ],
    }
    steps.unshift(step1) // Add step1 at the beginning

    // Add final user details step
    const finalStep = {
      stepId: "step_final",
      title: "Your Details",
      fields: [
        { fieldId: "name", type: "text" as const, label: "Your Name", required: true },
        { fieldId: "email", type: "email" as const, label: "Email Address", required: true },
        { fieldId: "phone", type: "text" as const, label: "Phone Number", required: true },
        { fieldId: "message", type: "text" as const, label: "Additional Message", required: false },
      ],
      isLastStep: true,
    }
    steps.push(finalStep)

    return {
      name: rootNode.label,
      description: `Find the best ${rootNode.label.toLowerCase()} for you`,
      steps,
      settings: {
        successMessage: `Thanks! We'll recommend the best ${rootNode.label.toLowerCase()} for you.`,
      },
    }
  }, [treeData])

  const handleSave = useCallback(async () => {
    setIsSaving(true)

    try {
      const formData = convertTreeToApiFormat()

      // Get auth token from localStorage
     const storedUser = localStorage.getItem('user');
const authToken = storedUser ? JSON.parse(storedUser).token : null;
      if (!authToken) {
        throw new Error("Authentication token not found. Please log in first.")
      }

      let response
      let result

      if (currentFormIndex === -1) {
        // Creating a new form - use POST
        response = await fetch("http://15.206.69.231:8888/api/admin/templates?category=TRAVEL", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          throw new Error(`Create API request failed: ${response.status} ${response.statusText}`)
        }

        result = await response.json()

        toast({
          title: "Form Created Successfully",
          description: "Your new form has been created and saved to the server.",
        })

        // Refresh the forms list to include the new form
        await fetchTemplates()
      } else {
        // Updating an existing form - use PUT
        const currentForm = allForms[currentFormIndex]
        if (!currentForm || !currentForm.id) {
          throw new Error("No form ID found for update operation.")
        }
       
        // console.log(JSON.stringify(formData))

        response = await fetch(`http://15.206.69.231:8888/api/merchant/forms/${currentForm.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(formData),
        })
        const result = await response.json()

        if (!result.success) {
          toast({
            title: "Update Failed",
            description: result.message || result.error || "Failed to update form.",
            variant: "destructive",
          })
          throw new Error(result.message || result.error || "Failed to update form.")
        }

        toast({
          title: "Form Updated Successfully",
          description: `"${currentForm.name}" has been updated successfully.`,
        })

        // Refresh the forms list to get the latest data
        await fetchTemplates()
      }
    } catch (error) {
      console.error("Save error:", error.error || error)
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "There was an error saving your form.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }, [convertTreeToApiFormat, toast, currentFormIndex, allForms, fetchTemplates])

  const handleItemEdit = useCallback(
    (id: string) => {
      const node = findNodeById(treeData, id)
      if (node) {
        setEditingItem({
          id: node.id,
          label: node.label,
          allowMultiple: node.allowMultiple,
        })
      }
    },
    [findNodeById, treeData],
  )

  const handleItemDelete = useCallback(
    (id: string) => {
      setTreeData((nodes) => removeTreeNode(nodes, id))
      toast({
        title: "Item Deleted",
        description: "The item has been removed successfully.",
      })
    },
    [removeTreeNode, toast],
  )

  const handleItemImageUpload = useCallback((id: string) => {
    setImageUploadItemId(id)
  }, [])

  const handleImageUploaded = useCallback(
    (imageUrl: string) => {
      if (!imageUploadItemId) return

      setTreeData((nodes) =>
        updateTreeNode(nodes, imageUploadItemId, {
          imageUrl: imageUrl || undefined,
        }),
      )

      setImageUploadItemId(null)
    },
    [imageUploadItemId, updateTreeNode],
  )

  const handleImageRemove = useCallback(
    (id: string) => {
      setTreeData((nodes) =>
        updateTreeNode(nodes, id, {
          imageUrl: undefined,
        }),
      )

      toast({
        title: "Image Removed",
        description: "The image has been removed from this item.",
      })
    },
    [updateTreeNode, toast],
  )

  const handleItemClick = useCallback((id: string) => {
    setSelectedNodeId(id)
  }, [])

  const handleEditSave = useCallback(
    (data: { label: string; allowMultiple: boolean }) => {
      if (!editingItem) return

      setTreeData((nodes) =>
        updateTreeNode(nodes, editingItem.id, {
          label: data.label,
          allowMultiple: data.allowMultiple,
        }),
      )

      setEditingItem(null)

      toast({
        title: "Item Changed",
        description: "The item has been updated successfully.",
      })
    },
    [editingItem, updateTreeNode, toast],
  )

  const handleFormNameEdit = useCallback(() => {
    setIsEditingFormName(true)
  }, [])

  const handleFormNameSave = useCallback(
    (newName: string) => {
      setNewFormName(newName)
      setIsEditingFormName(false)

      // Update the root node label if it's a new form
      if (currentFormIndex === -1 && treeData.length > 0) {
        setTreeData((nodes) =>
          updateTreeNode(nodes, "root-1", {
            label: newName,
          }),
        )
      }

      toast({
        title: "Form Name Updated",
        description: `Form name changed to "${newName}".`,
      })
    },
    [currentFormIndex, treeData, updateTreeNode, toast],
  )

  const handleFormNameCancel = useCallback(() => {
    setIsEditingFormName(false)
  }, [])

  const confirmPublish = useCallback(() => {
    if (currentFormIndex === -1) return

    const currentForm = allForms[currentFormIndex]
    if (!currentForm) return

    if (currentForm.isPublished) {
      // Show unpublish confirmation
      setShowUnpublishConfirm(true)
    } else {
      // Show publish confirmation with options
      setShowPublishConfirm(true)
      setCurrentFormID(allForms[currentFormIndex]?.id)
    }
  }, [currentFormIndex, allForms])

  const handlePublish = useCallback(async () => {
    setShowPublishConfirm(false)
    setShowUnpublishConfirm(false)

    if (currentFormIndex === -1) {
      toast({
        title: "Cannot Publish",
        description: "You must create & save the form before publishing.",
        variant: "destructive",
      })
      return
    }

    const currentForm = allForms[currentFormIndex]
    if (!currentForm?.id) {
      toast({
        title: "Action Failed",
        description: "No form id found.",
        variant: "destructive",
      })
      return
    }

    const action = currentForm.isPublished ? "unpublish" : "publish"

    try {
         const storedUser = localStorage.getItem('user');
const authToken = storedUser ? JSON.parse(storedUser).token : null;
   
      if (!authToken) throw new Error("Authentication token not found.")

      // Build query parameters
      const queryParams = new URLSearchParams()
      if (redirectUrl.trim()) {
        queryParams.append("redirectUrl", redirectUrl.trim())
      }
      contactTypes.forEach((type) => {
        queryParams.append("contactTypes", type)
      })

      const queryString = queryParams.toString()
      const apiUrl = `http://15.206.69.231:8888/api/merchant/forms/${currentForm.id}/${action}${queryString ? "?" + queryString : ""}`

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || `Failed to ${action} form.`)
      }

      toast({
        title: currentForm.isPublished ? "Form Unpublished" : "Form Published",
        description: `"${currentForm.name}" has been ${currentForm.isPublished ? "unpublished" : "published"} successfully.`,
      })

      // Reset form options after successful publish
      setRedirectUrl("")
      setContactTypes([])

      await fetchTemplates()
    } catch (err) {
      toast({
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} Failed`,
        description: err instanceof Error ? err.message : `Failed to ${action} form.`,
        variant: "destructive",
      })
    }
  }, [currentFormIndex, allForms, fetchTemplates, toast, redirectUrl, contactTypes])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground" data-testid="text-loading">
            Loading forms...
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <FormBuilderLayout
        sidebar={
          <FormBuilderSidebar
            treeData={treeData}
            selectedNodeId={selectedNodeId}
            onNodeSelect={handleNodeSelect}
            onToggleExpand={handleToggleExpand}
          />
        }
        header={
          <FormBuilderHeader
            breadcrumbs={breadcrumbs}
            onBreadcrumbClick={handleBreadcrumbClick}
            onNewItem={handleNewItem}
            onSave={handleSave}
            isSaving={isSaving}
            allForms={allForms.map((form) => ({
              id: form.id,
              name: form.name,
              isPublished: form.isPublished,
              publishedURL: form.publishedUrl,
              publishedSnippet: form.jsSnippet,
            }))}
            currentFormIndex={currentFormIndex}
            onFormSelect={loadForm}
            onNewForm={createNewTemplate}
            isNewForm={currentFormIndex === -1}
            isEditingFormName={isEditingFormName}
            newFormName={newFormName}
            onFormNameEdit={handleFormNameEdit}
            onFormNameSave={handleFormNameSave}
            onFormNameCancel={handleFormNameCancel}
            onPublish={confirmPublish}
          />
        }
      >
        <ItemGrid
          items={gridItems}
          selectedItemId={undefined}
          onItemEdit={handleItemEdit}
          onItemDelete={handleItemDelete}
          onItemImageUpload={handleItemImageUpload}
          onItemImageRemove={handleImageRemove}
          onItemClick={handleItemClick}
        />
      </FormBuilderLayout>

      {editingItem && (
        <EditItemDialog
          isOpen={true}
          onClose={() => setEditingItem(null)}
          onSave={handleEditSave}
          initialData={editingItem}
        />
      )}

      {imageUploadItemId && (
        <ImageUploadDialog
          isOpen={true}
          onClose={() => setImageUploadItemId(null)}
          onImageUploaded={handleImageUploaded}
          currentImageUrl={findNodeById(treeData, imageUploadItemId)?.imageUrl}
        />
      )}

      {showPublishConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full animate-fade-in max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Confirm Publish</h3>
            <p className="mb-4 text-gray-600 text-sm">
              Once you publish this form, you won't be able to edit it. To make changes, you will need to unpublish the
              form first.
            </p>

            {/* Redirect URL Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Redirect URL (Optional)</label>
              <input
                type="url"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                placeholder="https://example.com/thank-you"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Customers will be redirected to this link after submitting the form
              </p>
            </div>

            {/* Contact Type Checkboxes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Methods (Optional)</label>
              <div className="space-y-2">
                {["SMS", "WHATSAPP", "CALL"].map((type) => (
                  <label key={type} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contactTypes.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setContactTypes([...contactTypes, type])
                        } else {
                          setContactTypes(contactTypes.filter((t) => t !== type))
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Customers can choose how they want to be contacted</p>
            </div>

            <div>
              <AddLocation formId={currentFormID && currentFormID} />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPublishConfirm(false)
                  setRedirectUrl("")
                  setContactTypes([])
                }}
                className="px-4 py-2"
              >
                Cancel
              </Button>
              <Button onClick={handlePublish} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white">
                Publish
              </Button>
            </div>
          </div>
        </div>
      )}

      {showUnpublishConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full animate-fade-in">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Confirm Unpublish</h3>
            <p className="mb-6 text-gray-600 text-sm">
              Unpublishing this form will make it inactive and remove it from public access. You can republish it later
              if needed.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowUnpublishConfirm(false)} className="px-4 py-2">
                Cancel
              </Button>
              <Button onClick={handlePublish} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white">
                Unpublish
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}