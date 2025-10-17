import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Plus, X, Check, Trash, AlertCircle } from 'lucide-react';
import CreatePlanForm from '@/components/CreatePlanForm';
import { createPlan, getAllPlans, Plan, deletePlan } from '../services/api';
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
  });
  const [allPlans, setAllPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState<boolean>(true);
  const [errorFetchingPlans, setErrorFetchingPlans] = useState<string | null>(null);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [planToDeleteId, setPlanToDeleteId] = useState<string | null>(null);

  // Fetch all plans
  const fetchAllPlans = async () => {
    setLoadingPlans(true);
    setErrorFetchingPlans(null);
    try {
      const plans = await getAllPlans();
      setAllPlans(plans);
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
  }, []);

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
      const response = await createPlan(planData);

      if (!response.success) {
        throw new Error(response.message || response.error || 'Failed to create plan');
      }

      toast({
        title: "Plan Created Successfully! ",
        description: `${formData.name} plan has been created and is now available`,
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
      });
      fetchAllPlans();
    } catch (error) {
      toast({
        title: "Error creating plan",
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
          />
        </div>

        {/* All Plans List */}
        <Card className="border border-border">
          <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
            <CardTitle className="text-lg sm:text-xl">All Plans</CardTitle>
            <CardDescription className="text-sm">View and manage all existing plans</CardDescription>
          </CardHeader>
          <CardContent className="pb-4 sm:pb-6 px-4 sm:px-6">
            {loadingPlans && <div className="text-center py-8 text-sm sm:text-base">Loading plans...</div>}
            {errorFetchingPlans && <div className="text-center text-destructive py-8 text-sm sm:text-base">Error: {errorFetchingPlans}</div>}
            {!loadingPlans && allPlans.length === 0 && !errorFetchingPlans && (
              <div className="text-center text-muted-foreground py-8 text-sm sm:text-base">No plans found.</div>
            )}
            <div className="space-y-4">
              {allPlans.map((plan) => (
                <div key={plan.id} className="p-3 sm:p-4 border border-border rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground text-sm sm:text-base truncate">{plan.name}</h4>
                      {plan.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{plan.description}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                      <span className="font-bold text-primary text-sm sm:text-base">
                        ${plan.price}/{plan.billingCycle.toLowerCase()}
                      </span>
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
                  
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs sm:text-sm text-muted-foreground mb-3">
                    <p>Max Forms: <span className="font-medium">{plan.maxForms}</span></p>
                    <p>Max Leads/Month: <span className="font-medium">{plan.maxLeadsPerMonth}</span></p>
                    <p>Max Locations: <span className="font-medium">{plan.maxLocations}</span></p>
                    <p>Discount: <span className="font-medium text-green-600">{plan.discountPercent}%</span></p>
                  </div>
                  
                  <div className="mt-3">
                    <p className="font-medium text-xs sm:text-sm mb-2">Features:</p>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
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
                            <div key={f.value} className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200">
                              <Check className="h-3 w-3 flex-shrink-0" /> 
                              <span className="truncate">{f.label}</span>
                            </div>
                          ) : null;
                        });
                      })()}
                    </div>
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
