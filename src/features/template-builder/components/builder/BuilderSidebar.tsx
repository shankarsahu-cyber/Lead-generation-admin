import { useState, useEffect } from 'react';
import { FormData, FormStep, FormField, TreeNode } from '../../types/form-builder';
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

  const addNewStep = () => {
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

  const renderTreeNode = (nodeId: string): React.ReactNode => {
    const node = treeNodes.get(nodeId);
    if (!node) return null;

    const isExpanded = expandedNodes.has(nodeId);
    const isSelected = node.type === 'step' 
      ? node.stepId === selectedStepId && selectedFieldPath.length === 0
      : node.stepId === selectedStepId && selectedFieldPath.join('.') === nodeId.split('.').slice(1).join('.');

    const hasChildren = node.children.length > 0;
    const IndentComponent = () => <div style={{ width: `${(node.level - 1) * 16}px` }} />;

    return (
      <div key={nodeId}>
        <div
          className={`flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-muted/50 rounded-sm group transition-colors ${
            isSelected ? 'bg-primary/10 text-primary font-medium' : ''
          }`}
          onClick={() => handleNodeClick(nodeId)}
        >
          <IndentComponent />
          
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0"
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
          
          {!hasChildren && <div className="w-4" />}
          
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {node.type === 'step' ? (
              isExpanded ? <FolderOpen className="h-4 w-4 text-primary" /> : <Folder className="h-4 w-4 text-primary" />
            ) : (
              <FileText className="h-4 w-4 text-muted-foreground" />
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
                className="flex-1 bg-transparent text-sm truncate border-b border-primary-foreground focus:outline-none focus:border-primary"
                autoFocus
              />
            ) : (
              <span 
                className="text-sm truncate flex-1"
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
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingNodeId(node.id);
                }}
                aria-label={`Edit step ${node.label}`}
                disabled={!isFormDetailsComplete} // Disable if form details are not complete
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteStep(node.id);
                }}
                aria-label={`Delete step ${node.label}`}
                disabled={!isFormDetailsComplete} // Disable if form details are not complete
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </>
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
    <aside
      className={cn(
        "flex flex-col bg-card border-r border-border transition-transform duration-200 ease-in-out",
        "fixed inset-y-0 left-0 z-50 w-full md:w-80",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:relative md:translate-x-0"
      )}
    >
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Form Structure</h2>
          <Button
            size="sm"
            onClick={addNewStep}
            className="h-8 gap-1 bg-gradient-to-r from-builder-primary to-builder-secondary hover:opacity-90"
            disabled={!isFormDetailsComplete} // Disable if form details are not complete
          >
            <Plus className="h-3 w-3" />
            Step
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {renderTreeNode('root')}
        </div>
      </ScrollArea>
    </aside>
  );
};