import { useState, useEffect } from 'react';
import { FormData, FormStep, FormField, TreeNode } from '../../types/template-builder';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
// TreeView component is integrated directly in this file
import {
  Plus,
  Folder,
  FolderOpen,
  FileText,
  ChevronRight,
  ChevronDown,
  Trash2,
  Edit2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BuilderSidebarProps {
  formData: FormData;
  selectedStepId: string;
  selectedFieldPath: string[];
  onStepSelect: (stepId: string) => void;
  onFieldSelect: (fieldPath: string[]) => void;
  onFormDataChange: (data: FormData) => void;
  onDeleteStep: (stepId: string) => void; // Add onDeleteStep prop
  onStepTitleChange: (stepId: string, newTitle: string) => void; // Add onStepTitleChange prop
  treeNodes: Map<string, TreeNode>;
  onTreeNodesChange: (nodes: Map<string, TreeNode>) => void;
  isOpen: boolean; // Add isOpen prop
  isFormDetailsComplete: boolean; // New prop
}

export const BuilderSidebar = ({
  formData,
  selectedStepId,
  selectedFieldPath,
  onStepSelect,
  onFieldSelect,
  onFormDataChange,
  onDeleteStep, // Destructure onDeleteStep prop
  onStepTitleChange, // Destructure onStepTitleChange prop
  treeNodes,
  onTreeNodesChange,
  isOpen,
  isFormDetailsComplete // Destructure new prop
}: BuilderSidebarProps) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']));
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  // Build tree structure from form data
  useEffect(() => {
    const newNodes = new Map<string, TreeNode>();
    
    // Add root node
    newNodes.set('root', {
      id: 'root',
      type: 'step',
      label: formData.name,
      children: formData.steps.map(step => step.stepId),
      level: 0,
      isExpanded: true
    });

    // Add step nodes
    formData.steps.forEach((step, stepIndex) => {
      const stepNode: TreeNode = {
        id: step.stepId,
        type: 'step',
        label: step.title,
        parent: 'root',
        children: step.fields.map(field => `${step.stepId}.${field.fieldId}`),
        level: 1,
        stepId: step.stepId,
        isExpanded: expandedNodes.has(step.stepId)
      };
      newNodes.set(step.stepId, stepNode);

      // Add field nodes recursively
      const addFieldNodes = (fields: FormField[], parentId: string, level: number, pathPrefix: string) => {
        fields.forEach((field, fieldIndex) => {
          const fieldId = `${pathPrefix}.${field.fieldId}`;
          const fieldNode: TreeNode = {
            id: fieldId,
            type: level === 2 ? 'field' : 'subfield',
            label: field.label,
            parent: parentId,
            children: field.subFields.map(subField => `${fieldId}.${subField.fieldId}`),
            level,
            stepId: step.stepId,
            fieldId: field.fieldId,
            isExpanded: expandedNodes.has(fieldId)
          };
          newNodes.set(fieldId, fieldNode);

          // Add sub-field nodes recursively
          if (field.subFields.length > 0) {
            addFieldNodes(field.subFields, fieldId, level + 1, fieldId);
          }
        });
      };

      addFieldNodes(step.fields, step.stepId, 2, step.stepId);
    });

    onTreeNodesChange(newNodes);
  }, [formData, expandedNodes]);

  const toggleExpanded = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleNodeClick = (nodeId: string) => {
    const node = treeNodes.get(nodeId);
    if (!node) return;

    if (node.type === 'step' && node.stepId) {
      onStepSelect(node.stepId);
      onFieldSelect([]);
    } else if ((node.type === 'field' || node.type === 'subfield') && node.stepId) {
      // Build field path from node hierarchy
      const path: string[] = [];
      let currentNode = node;
      
      while (currentNode && currentNode.type !== 'step') {
        if (currentNode.fieldId) {
          path.unshift(currentNode.fieldId);
        }
        const parentId = currentNode.parent;
        if (parentId) {
          currentNode = treeNodes.get(parentId);
        } else {
          break;
        }
      }
      
      onStepSelect(node.stepId);
      onFieldSelect(path);
    }
  };

  const handleAddStep = () => {
    const newStepId = `step${formData.steps.length + 1}`;
    const newStep: FormStep = {
      stepId: newStepId,
      title: `Step ${formData.steps.length + 1}`,
      fields: []
    };
    
    const newFormData = {
      ...formData,
      steps: [...formData.steps, newStep]
    };
    
    onFormDataChange(newFormData);
    onStepSelect(newStepId);
  };

  const handleDeleteStep = (stepId: string) => {
    onDeleteStep(stepId);
  };

  const getTotalFieldCount = (): number => {
    let count = 0;
    const countFields = (fields: FormField[]): number => {
      let fieldCount = 0;
      fields.forEach(field => {
        fieldCount += 1;
        if (field.subFields && field.subFields.length > 0) {
          fieldCount += countFields(field.subFields);
        }
      });
      return fieldCount;
    };

    formData.steps.forEach(step => {
      count += countFields(step.fields);
    });

    return count;
  };

  const renderTreeNode = (nodeId: string): React.ReactNode => {
    const node = treeNodes.get(nodeId);
    if (!node) return null;

    const isExpanded = expandedNodes.has(nodeId);
    const isSelected = node.type === 'step' 
      ? node.stepId === selectedStepId && selectedFieldPath.length === 0
      : node.stepId === selectedStepId && selectedFieldPath.join('.') === nodeId.split('.').slice(1).join('.');

    const hasChildren = node.children.length > 0;
    const IndentComponent = () => <div style={{ width: `${(node.level - 1) * 12}px` }} className="flex-shrink-0" />;

    return (
      <div key={nodeId}>
        <div
          className={cn(
            "flex items-center gap-1 px-2 py-1.5 cursor-pointer hover:bg-muted/50 rounded-sm group transition-colors text-sm",
            isSelected && "bg-primary/10 text-primary font-medium"
          )}
          onClick={() => handleNodeClick(nodeId)}
        >
          <IndentComponent />
          
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(nodeId);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          )}
          
          {!hasChildren && <div className="w-4 flex-shrink-0" />}
          
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {node.type === 'step' ? (
              isExpanded ? <FolderOpen className="h-3.5 w-3.5 text-primary flex-shrink-0" /> : <Folder className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            ) : (
              <FileText className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            )}
            {node.type === 'step' && editingNodeId === node.id ? (
              <input
                type="text"
                value={node.label}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  onStepTitleChange(node.id, newTitle);
                }}
                onBlur={() => setEditingNodeId(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setEditingNodeId(null);
                  }
                }}
                onClick={(e) => e.stopPropagation()} // Prevent node click when editing
                className="flex-1 bg-transparent text-xs sm:text-sm truncate border-b border-primary-foreground focus:outline-none focus:border-primary min-w-0"
                autoFocus
              />
            ) : (
              <span 
                className="text-xs sm:text-sm truncate flex-1 min-w-0"
                onDoubleClick={(e) => {
                  if (node.type === 'step') {
                    e.stopPropagation();
                    setEditingNodeId(node.id);
                  }
                }}
              >
                {node.label}
              </span>
            )}
          </div>
          {node.type === 'step' && node.id !== 'root' && (
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingNodeId(node.id);
                }}
                aria-label={`Edit step ${node.label}`}
                disabled={!isFormDetailsComplete} // Disable if form details are not complete
              >
                <Edit2 className="h-2.5 w-2.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteStep(node.id);
                }}
                aria-label={`Delete step ${node.label}`}
                disabled={!isFormDetailsComplete} // Disable if form details are not complete
              >
                <Trash2 className="h-2.5 w-2.5" />
              </Button>
            </div>
          )}
        </div>
        
        {isExpanded && hasChildren && (
          <div>
            {node.children.map(childId => renderTreeNode(childId))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm sm:text-base font-semibold text-foreground truncate">
            Form Structure
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddStep}
            className="h-6 sm:h-7 px-1.5 sm:px-2 text-xs"
            disabled={!isFormDetailsComplete}
          >
            <Plus className="h-3 w-3 mr-1" />
            <span className="hidden sm:inline">Step</span>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {formData.steps.length} step{formData.steps.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Tree View */}
      <ScrollArea className="flex-1 p-2 sm:p-3">
        <div className="space-y-0.5">
          {treeNodes.get('root') && renderTreeNode('root')}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 sm:p-4 border-t border-border bg-muted/30">
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between items-center">
            <span>Total Fields:</span>
            <span className="font-medium">{getTotalFieldCount()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Steps:</span>
            <span className="font-medium">{formData.steps.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};