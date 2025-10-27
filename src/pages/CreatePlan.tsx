import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Plus, X, Check, Trash, AlertCircle } from 'lucide-react';
import CreatePlanForm from '@/components/CreatePlanForm';
import { createPlan, getAllPlans, Plan, deletePlan, updatePlan } from '../services/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.adpair.co/';

const CreatePlan: React.FC = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    billingCycle: '',
    maxForms: '',
    maxLeadsPerMonth: '',
    maxLocations: '',
    discountPercent: '',
    features: JSON.stringify({}),
    isActive: true, 
  });
  const [allPlans, setAllPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState<boolean>(true);
  const [errorFetchingPlans, setErrorFetchingPlans] = useState<string | null>(null);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [planToDeleteId, setPlanToDeleteId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [showActivePlans, setShowActivePlans] = useState<boolean | undefined>(undefined);
  const [filterApplied, setFilterApplied] = useState<boolean>(false);

  // Fetch all plans
  const fetchAllPlans = async () => {
    setLoadingPlans(true);
    setErrorFetchingPlans(null);
    try {
      const plans = await getAllPlans(showActivePlans);
      // Sort plans - active plans first, then inactive plans
      const sortedPlans = [...plans].sort((a, b) => {
        // If a is active and b is not, a comes first
        if (a.isActive !== false && b.isActive === false) return -1;
        // If a is not active and b is active, b comes first
        if (a.isActive === false && b.isActive !== false) return 1;
        // Otherwise keep original order
        return 0;
      });
      setAllPlans(sortedPlans);
    } catch (error) {
      setErrorFetchingPlans("Failed to load existing plans.");
      toast({
        title: "Error",
        description: "Failed to load existing plans.",
        variant: "destructive",
      });
    } finally {
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    fetchAllPlans();
  }, [showActivePlans]);

  // Handle toggle change
  const handleToggleChange = (checked: boolean) => {
    setFilterApplied(true);
    setShowActivePlans(checked);
  };

  // Delete flow
  const handleDeletePlanClick = (planId: string) => {
    setPlanToDeleteId(planId);
    setShowDeleteConfirmDialog(true);
  };

  const confirmDeleteAction = async () => {
    if (planToDeleteId) {
      try {
        await deletePlan(planToDeleteId);
        toast({
          title: "Plan Deleted Successfully! 🗑️",
          description: "The plan has been successfully deleted.",
          variant: "success",
        });
        fetchAllPlans();
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete plan.",
          variant: "destructive",
        });
      } finally {
        setShowDeleteConfirmDialog(false);
        setPlanToDeleteId(null);
      }
    }
  };

  // Input/Feature handlers
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFeatureChange = (featureName: string, checked: boolean) => {
    try {
      const currentFeatures = JSON.parse(formData.features);
      const updatedFeatures = { ...currentFeatures, [featureName]: checked };
      setFormData(prev => ({ ...prev, features: JSON.stringify(updatedFeatures) }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update feature due to data format error.",
        variant: "destructive",
      });
    }
  };

    // Handle Edit Plan Click
  const handleEditPlanClick = (plan: Plan) => {
    setIsEditMode(true);
    setEditingPlanId(plan.id);
    
    // Parse features from string to object
    let featuresObj = {};
    try {
      featuresObj = JSON.parse(plan.features || '{}');
    } catch (error) {
      // Error parsing features
    }
    
    // Set form data with plan values
    setFormData({
      name: plan.name,
      description: plan.description || '',
      price: plan.price.toString(),
      billingCycle: plan.billingCycle,
      maxForms: plan.maxForms.toString(),
      maxLeadsPerMonth: plan.maxLeadsPerMonth.toString(),
      maxLocations: plan.maxLocations.toString(),
      discountPercent: plan.discountPercent ? plan.discountPercent.toString() : '',
      features: JSON.stringify(featuresObj),
      isActive: plan.isActive !== false, // Default to true if not explicitly false
    });
    
    // Scroll to form
    const formElement = document.querySelector('.createplanform-wide');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.billingCycle) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert features stringified object to array of enabled feature keys
      let featuresArr = [];
      try {
        const featuresObj = JSON.parse(formData.features);
        featuresArr = Object.keys(featuresObj).filter(key => featuresObj[key]);
      } catch (err) {
        featuresArr = [];
      }
      
      const planData = { ...formData, features: JSON.stringify(featuresArr) };
      let response;
      
      if (isEditMode && editingPlanId) {
        // Update existing plan
        response = await updatePlan(editingPlanId, planData);
      } else {
        // Create new plan
        response = await createPlan(planData);
      }

      if (!response.success) {
        throw new Error(response.message || response.error || (isEditMode ? 'Failed to update plan' : 'Failed to create plan'));
      }

      toast({
        title: isEditMode ? "Plan Updated Successfully! 🎉" : "Plan Created Successfully! 🎉",
        description: isEditMode 
          ? `${formData.name} plan has been updated successfully`
          : `${formData.name} plan has been created and is now available`,
        variant: "success",
      });

      setFormData({
        name: '',
        description: '',
        price: '',
        billingCycle: '',
        maxForms: '',
        maxLeadsPerMonth: '',
        maxLocations: '',
        discountPercent: '',
        features: JSON.stringify({}),
        isActive: true, 
      });
      setIsEditMode(false);
      setEditingPlanId(null);
      fetchAllPlans();
    } catch (error) {
      toast({
        title: isEditMode ? "Error updating plan" : "Error creating plan",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-background p-0 sm:p-1ss">
      <div className="max-w-7xl mx-auto w-full flex flex-col flex-1">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Create New Plan</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Design a new subscription plan for your merchants</p>
        </div>

        {/* Form */}
        <div className="createplanform-wide mb-6 sm:mb-8">
          <CreatePlanForm
            formData={formData}
            handleInputChange={handleInputChange}
            handleFeatureChange={handleFeatureChange}
            handleSubmit={handleSubmit}
            isEditMode={isEditMode}
          />
        </div>

        {/* All Plans List */}
        <Card className="border border-border">
          <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg sm:text-xl">All Plans</CardTitle>
                <CardDescription className="text-sm">View and manage all existing plans</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="active-plans" 
                  checked={showActivePlans === true}
                  onCheckedChange={handleToggleChange}
                />
                <Label htmlFor="active-plans">
                  {filterApplied ? (showActivePlans ? "Active Plans" : "Inactive Plans") : "Filter Plans"}
                </Label>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-4 sm:pb-6 px-4 sm:px-6">
            {loadingPlans && (
              <div className="text-center py-8 text-sm sm:text-base flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            {errorFetchingPlans && <div className="text-center text-destructive py-8 text-sm sm:text-base">Error: {errorFetchingPlans}</div>}
            {!loadingPlans && allPlans.length === 0 && !errorFetchingPlans && (
              <div className="text-center text-muted-foreground py-8 text-sm sm:text-base">No plans found.</div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allPlans.map((plan) => (
                <div key={plan.id} className="p-3 sm:p-4 border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow relative min-h-[280px]">
                  <div className="absolute top-3 right-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-3 text-xs rounded-full bg-blue-500 text-white hover:bg-blue-600"
                    >
                      {plan.isActive !== false ? "Active" : "Inactive"}
                    </Button>
                  </div>
                  <div className="flex flex-col gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground text-sm sm:text-base truncate">{plan.name}</h4>
                      {plan.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{plan.description}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-3 flex-shrink-0">
                      <span className="font-bold text-primary text-sm sm:text-base">
                        ${plan.price}/{plan.billingCycle.toLowerCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm text-muted-foreground mb-3">
                    <p>Max Forms: <span className="font-medium">{plan.maxForms}</span></p>
                    <p>Max Leads: <span className="font-medium">{plan.maxLeadsPerMonth}</span></p>
                    <p>Max Locations: <span className="font-medium">{plan.maxLocations}</span></p>
                    <p>Discount: <span className="font-medium text-green-600">{plan.discountPercent}%</span></p>
                  </div>
                  
                  <div className="mt-3">
                    <p className="font-medium text-xs sm:text-sm mb-2">Features:</p>
                    <div className="flex flex-wrap gap-1">
                      {(() => {
                        let featuresArr = [];
                        try {
                          const parsed = JSON.parse(plan.features || '[]');
                          if (Array.isArray(parsed)) {
                            featuresArr = parsed;
                          } else if (parsed && typeof parsed === 'object') {
                            featuresArr = Object.keys(parsed).filter(key => parsed[key]);
                          }
                        } catch {
                          featuresArr = [];
                        }
                        const FEATURES_LIST = [
                          { value: 'analytics', label: 'Analytics' },
                          { value: 'customBranding', label: 'Custom Branding' },
                          { value: 'leadCaptureForms', label: 'Lead Capture Forms' },
                          { value: 'crmIntegration', label: 'CRM Integration' },
                          { value: 'emailMarketing', label: 'Email Marketing' },
                          { value: 'landingPages', label: 'Landing Pages' },
                          { value: 'leadNurturingAutomation', label: 'Lead Nurturing Automation' },
                          { value: 'leadAnalyticsReporting', label: 'Lead Analytics & Reporting' },
                          { value: 'leadScoring', label: 'Lead Scoring' },
                          { value: 'multiChannelCampaigns', label: 'Multi-Channel Campaigns' },
                          { value: 'conversionTracking', label: 'Conversion Tracking' },
                          { value: 'aiChatbots', label: 'AI Chatbots' },
                        ];
                        if (!featuresArr || featuresArr.length === 0) {
                          return <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">None</span>;
                        }
                        return featuresArr.map(fKey => {
                          const f = FEATURES_LIST.find(x => x.value === fKey);
                          return f ? (
                            <div key={f.value} className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-1 py-0.5 rounded border border-green-200">
                              <Check className="h-2 w-2 flex-shrink-0" /> 
                              <span className="truncate text-[10px]">{f.label}</span>
                            </div>
                          ) : (
                            <div key={fKey} className="flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-1 py-0.5 rounded border border-amber-200">
                              <span className="truncate text-[10px]">{fKey}</span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                  
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
                            onClick={() => handleEditPlanClick(plan)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 sm:h-4 sm:w-4">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit Plan</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
                            onClick={() => handleDeletePlanClick(plan.id)}
                          >
                            <Trash className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete Plan</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
          <DialogContent className="w-[95vw] max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive text-base sm:text-lg">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" /> 
                <span>Confirm Plan Deletion</span>
              </DialogTitle>
              <DialogDescription className="text-sm">
                Are you sure you want to delete this plan? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
              <Button variant="outline" onClick={() => setShowDeleteConfirmDialog(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteAction} className="w-full sm:w-auto">
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default CreatePlan;
