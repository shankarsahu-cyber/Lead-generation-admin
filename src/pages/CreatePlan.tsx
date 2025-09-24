import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, X, Check, Trash, AlertCircle } from 'lucide-react'; // Added AlertCircle for dialog
import { createPlan, getAllPlans, Plan, deletePlan } from '../services/api';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'; // Import dialog components
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; // Import tooltip components

const BASE_URL = import.meta.env.VITE_API_URL || 'http://13.234.225.69:8888'; // Assuming Vite or similar build tool

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

  // Function to fetch all plans
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

  // Fetch plans on component mount
  React.useEffect(() => {
    fetchAllPlans();
  }, []);

  // Function to delete a plan
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
        fetchAllPlans(); // Re-fetch plans after deletion
        setShowDeleteConfirmDialog(false);
        setPlanToDeleteId(null);
      } catch (error) {
        console.error("Error deleting plan:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete plan.",
          variant: "destructive",
        });
        setShowDeleteConfirmDialog(false);
        setPlanToDeleteId(null);
      }
    }
  };

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

  const removeFeature = (featureName: string) => {
    try {
      const currentFeatures = JSON.parse(formData.features);
      const updatedFeatures = { ...currentFeatures };
      delete updatedFeatures[featureName];
      setFormData(prev => ({ ...prev, features: JSON.stringify(updatedFeatures) }));
    } catch (error) {
      console.error("Failed to parse features JSON:", error);
      toast({
        title: "Error",
        description: "Failed to remove feature due to data format error.",
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

      // Reset form and refetch plans
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
      fetchAllPlans(); // Refetch plans after successful creation
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
    <div className="space-y-6 w-full overflow-x-hidden">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create New Plan</h1>
        <p className="text-muted-foreground">Design a new subscription plan for your merchants</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2"> {/* Adjusted grid columns */}
        {/* Form */}
        <div className="lg:col-span-2"> {/* Adjusted column span for form */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Plan Details</CardTitle>
              <CardDescription>Configure your new subscription plan</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Professional"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="e.g., 99"
                      type="number"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe what this plan includes..."
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="billingCycle">Billing Cycle *</Label>
                    <Select 
                      value={formData.billingCycle} 
                      onValueChange={(value) => handleInputChange('billingCycle', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select cycle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="YEARLY">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxForms">Max Forms</Label>
                    <Input
                      id="maxForms"
                      value={formData.maxForms}
                      onChange={(e) => handleInputChange('maxForms', e.target.value)}
                      placeholder="e.g., 50"
                      type="number"
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="maxLeadsPerMonth">Max Leads Per Month</Label>
                    <Input
                      id="maxLeadsPerMonth"
                      value={formData.maxLeadsPerMonth}
                      onChange={(e) => handleInputChange('maxLeadsPerMonth', e.target.value)}
                      placeholder="e.g., 1000"
                      type="number"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxLocations">Max Locations</Label>
                    <Input
                      id="maxLocations"
                      value={formData.maxLocations}
                      onChange={(e) => handleInputChange('maxLocations', e.target.value)}
                      placeholder="e.g., 5"
                      type="number"
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <Label>Features</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="feature-analytics">Analytics</Label>
                      <Switch
                        id="feature-analytics"
                        checked={JSON.parse(formData.features).analytics}
                        onCheckedChange={(checked) => handleFeatureChange('analytics', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="feature-custom-branding">Custom Branding</Label>
                      <Switch
                        id="feature-custom-branding"
                        checked={JSON.parse(formData.features).customBranding}
                        onCheckedChange={(checked) => handleFeatureChange('customBranding', checked)}
                      />
                    </div>
                  </div>
                </div>

                {/* Plan Options */}
                <div className="flex gap-4">
                  <Button type="submit" className="flex-1">
                    Create New Plan
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* All Plans List - Moved Below the Main Grid */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle>All Plans</CardTitle>
          <CardDescription>View and manage all existing plans</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingPlans && <div className="text-center">Loading plans...</div>}
          {errorFetchingPlans && <div className="text-center text-destructive">Error: {errorFetchingPlans}</div>}
          {!loadingPlans && allPlans.length === 0 && !errorFetchingPlans && (
            <div className="text-center text-muted-foreground">No plans found.</div>
          )}
          {allPlans.map((plan) => (
            <div key={plan.id} className="p-4 border border-border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-foreground">{plan.name}</h4>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-primary">${plan.price}/{plan.billingCycle.toLowerCase()}</span>
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
              <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <p>Max Forms: {plan.maxForms}</p>
                <p>Max Leads/Month: {plan.maxLeadsPerMonth}</p>
                <p>Max Locations: {plan.maxLocations}</p>
              </div>
              <div className="mt-2 space-y-1">
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
            <DialogTitle className="flex items-center gap-2 text-destructive"><AlertCircle className="h-5 w-5" /> Confirm Plan Deletion</DialogTitle>
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
  );
};

export default CreatePlan;
