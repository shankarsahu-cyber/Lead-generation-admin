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

const BASE_URL = import.meta.env.VITE_API_URL || 'http://13.234.225.69:8888';

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
    features: JSON.stringify({ analytics: true, customBranding: false }),
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
      console.error("Error fetching plans:", error);
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
          title: "Plan Deleted",
          description: "The plan has been successfully deleted.",
        });
        fetchAllPlans();
      } catch (error) {
        console.error("Error deleting plan:", error);
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
      console.error("Failed to parse features JSON:", error);
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
      const response = await createPlan(formData);

      if (!response.success) {
        throw new Error(response.message || response.error || 'Failed to create plan');
      }

      toast({
        title: "Plan Created Successfully",
        description: `${formData.name} plan has been created and is now available`,
      });

      setFormData({
        name: '',
        description: '',
        price: '',
        billingCycle: '',
        maxForms: '',
        maxLeadsPerMonth: '',
        maxLocations: '',
        features: JSON.stringify({ analytics: true, customBranding: false }),
      });
      fetchAllPlans();
    } catch (error) {
      console.error("Error creating plan:", error);
      toast({
        title: "Error creating plan",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-background">
      <div className="max-w-4xl mx-auto w-full flex flex-col flex-1">
        {/* Page Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-foreground">Create New Plan</h1>
          <p className="text-muted-foreground">Design a new subscription plan for your merchants</p>
        </div>

        {/* Form */}
        <div className="createplanform-wide">
          <CreatePlanForm
            formData={formData}
            handleInputChange={handleInputChange}
            handleFeatureChange={handleFeatureChange}
            handleSubmit={handleSubmit}
          />
        </div>

        {/* All Plans List */}
        <Card className="border border-border mt-6">
          <CardHeader className="pb-2">
            <CardTitle>All Plans</CardTitle>
            <CardDescription>View and manage all existing plans</CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            {loadingPlans && <div className="text-center">Loading plans...</div>}
            {errorFetchingPlans && <div className="text-center text-destructive">Error: {errorFetchingPlans}</div>}
            {!loadingPlans && allPlans.length === 0 && !errorFetchingPlans && (
              <div className="text-center text-muted-foreground">No plans found.</div>
            )}
            {allPlans.map((plan) => (
              <div key={plan.id} className="p-4 border border-border rounded-lg mb-3 last:mb-0">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-foreground">{plan.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">
                      ${plan.price}/{plan.billingCycle.toLowerCase()}
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleDeletePlanClick(plan.id)}
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete Plan</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                {plan.description && <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>}
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <p>Max Forms: {plan.maxForms}</p>
                  <p>Max Leads/Month: {plan.maxLeadsPerMonth}</p>
                  <p>Max Locations: {plan.maxLocations}</p>
                </div>
                <div className="mt-2">
                  <p className="font-medium">Features:</p>
                  {JSON.parse(plan.features || '{}').analytics && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="h-3 w-3" /> Analytics
                    </div>
                  )}
                  {JSON.parse(plan.features || '{}').customBranding && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="h-3 w-3" /> Custom Branding
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" /> Confirm Plan Deletion
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this plan? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirmDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteAction}>
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
