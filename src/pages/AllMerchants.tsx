import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Search, Edit, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getMerchants, updateMerchantStatus, Merchant, getAllPlans, Plan, createMerchantSubscription, getMerchantSubscriptions, assignMerchantPlan } from '../services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AllMerchants: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [allMerchantsForStats, setAllMerchantsForStats] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [plans, setPlans] = useState<Plan[]>([]); // State to store fetched plans
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null); // State for selected plan in dialog
  const [isAssignPlanDialogOpen, setIsAssignPlanDialogOpen] = useState<boolean>(false); // State for plan assignment dialog
  const [isVoucherDialogOpen, setIsVoucherDialogOpen] = useState<boolean>(false); // New state for voucher assignment dialog
  const [selectedVoucherPlanId, setSelectedVoucherPlanId] = useState<string | null>(null); // New state for selected voucher plan
  const { user } = useAuth(); // Keeping user here for potential future use or display logic, but not for direct token access in API calls
  // Removed states related to merchant details dialog
  const [activeMerchantPlan, setActiveMerchantPlan] = useState<Plan | null>(null);
  const [activeMerchantRegularPlan, setActiveMerchantRegularPlan] = useState<Plan | null>(null); // New state for regular plan in assign dialog

  // Filter plans into regular and addon types
  const regularPlans = plans.filter(p => p.billingCycle === 'MONTHLY' || p.billingCycle === 'YEARLY');
  const addonPlans = plans.filter(p => p.billingCycle === 'ADDON');

  const fetchMerchants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMerchants(undefined, undefined, searchTerm, page, size); // Fetch all merchants for table, then filter if searchTerm exists
      const merchantsWithActivePlans = await Promise.all(
        response.content.map(async (merchant) => {
          try {
            const subscriptions = await getMerchantSubscriptions(merchant.id);
            const activeRegularSubscription = subscriptions.find(
              (sub) => sub.status === 'ACTIVE' && (sub.billingCycle === 'MONTHLY' || sub.billingCycle === 'YEARLY')
            );
            return { ...merchant, activePlanName: activeRegularSubscription?.planName || 'N/A' };
          } catch (subErr) {
            console.error("Failed to fetch subscriptions for merchant", merchant.id, subErr);
            return { ...merchant, activePlanName: 'Error' };
          }
        })
      );
      setMerchants(merchantsWithActivePlans);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error("Failed to fetch merchants:", err, (err as any).response?.data);
      setError("Failed to load merchants.");
      toast({
        title: "Error",
        description: "Failed to load merchants data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [page, size, searchTerm, toast]);

  const fetchAllMerchantsForStats = useCallback(async () => {
    try {
      // Fetch all merchants for statistics, no pagination or specific status filter
      const response = await getMerchants(undefined, undefined, undefined, 0, 1000); // Fetch a large number or adjust size as needed
      setAllMerchantsForStats(response.content);
    } catch (err) {
      console.error("Failed to fetch all merchants for stats:", err, (err as any).response?.data);
      // Optionally set an error state or toast for stats fetching
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      const fetchedPlans = await getAllPlans();
      setPlans(fetchedPlans);
    } catch (err) {
      console.error("Failed to fetch plans:", err, (err as any).response?.data);
      toast({
        title: "Error",
        description: "Failed to load plans data.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchMerchants();
    fetchAllMerchantsForStats(); // Fetch all merchants for stats on initial mount
    fetchPlans(); // Fetch plans on initial mount
  }, [fetchMerchants, fetchAllMerchantsForStats, fetchPlans]);

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 0 && pageNumber < totalPages) {
      setPage(pageNumber);
    }
  };

  const filteredMerchants = merchants.filter(merchant =>
    merchant.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    merchant.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'destructive';
      case 'PENDING':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName) {
      case 'Enterprise':
        return 'primary';
      case 'Premium':
        return 'secondary';
      case 'Standard':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const handleStatusUpdate = async () => {
    if (selectedMerchant && newStatus) {
      setLoading(true);
      setError(null);
      try {
        await updateMerchantStatus(selectedMerchant.id, newStatus as any);
        setMerchants((prevMerchants) =>
          prevMerchants.map((merchant) =>
            merchant.id === selectedMerchant.id ? { ...merchant, status: newStatus as any } : merchant
          )
        );
        fetchAllMerchantsForStats(); // Refresh stats after status update
        toast({
          title: "Status Updated",
          description: `${selectedMerchant.companyName}'s status has been updated to ${newStatus}`,
        });
        setSelectedMerchant(null);
        setNewStatus('');
      } catch (err) {
        console.error("Failed to update merchant status:", err);
        setError("Failed to update merchant status.");
        toast({
          title: "Error",
          description: "Failed to update merchant status. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAssignPlan = async () => {
    if (selectedMerchant && selectedPlanId) {
      setLoading(true);
      setError(null);
      try {
        await assignMerchantPlan(selectedMerchant.id, selectedPlanId); // Call the new API function
        setMerchants((prevMerchants) =>
          prevMerchants.map((merchant) =>
            merchant.id === selectedMerchant.id ? { ...merchant, plan: plans.find(p => p.id === selectedPlanId)?.name || merchant.plan } : merchant
          )
        );
        toast({
          title: "Plan Assigned",
          description: `${selectedMerchant.companyName}'s plan has been assigned to ${plans.find(p => p.id === selectedPlanId)?.name}`,
        });
        setIsAssignPlanDialogOpen(false);
        setSelectedMerchant(null);
        setSelectedPlanId(null);
      } catch (err) {
        console.error("Failed to assign plan:", err);
        setError("Failed to assign plan.");
        toast({
          title: "Error",
          description: "Failed to assign plan. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleApplyVoucher = async () => {
    if (!selectedMerchant) {
      toast({
        title: "Error",
        description: "No merchant selected for voucher assignment.",
        variant: "destructive",
      });
      return;
    }
    if (!activeMerchantPlan) {
      toast({
        title: "Error",
        description: "Voucher can only be assigned to merchants with an active plan.",
        variant: "destructive",
      });
      return;
    }
    if (!selectedVoucherPlanId) {
      toast({
        title: "Error",
        description: "Please select a voucher plan.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    setError(null);
    try {
        await createMerchantSubscription(selectedMerchant.id, selectedVoucherPlanId);
        fetchMerchants(); // Refresh merchants to show new subscription if relevant
        toast({
          title: "Voucher Applied",
          description: `${selectedMerchant.companyName}'s voucher plan has been applied to ${plans.find(p => p.id === selectedVoucherPlanId)?.name}`,
        });
        setIsVoucherDialogOpen(false);
        setSelectedMerchant(null);
        setSelectedVoucherPlanId(null);
        setActiveMerchantPlan(null);
      } catch (err) {
        console.error("Failed to apply voucher:", err);
        setError("Failed to apply voucher.");
        toast({
          title: "Error",
          description: "Failed to apply voucher. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
  };

  const handleOpenVoucherDialog = useCallback(async (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    setSelectedVoucherPlanId(null); // Clear previous selection
    setIsVoucherDialogOpen(true); // Open the voucher dialog

    try {
      const subscriptions = await getMerchantSubscriptions(merchant.id);
      console.log("Voucher Dialog: Fetched subscriptions for merchant", merchant.id, ":", subscriptions);
      console.log("Voucher Dialog: All available plans:", plans);
      // Prioritize active MONTHLY or YEARLY plans
      let activeSubscription = subscriptions.find(
        (sub) => sub.status === 'ACTIVE' && (sub.billingCycle === 'MONTHLY' || sub.billingCycle === 'YEARLY')
      );
      console.log("Voucher Dialog: Attempted to find active MONTHLY/YEARLY subscription:", activeSubscription);

      // If no active MONTHLY/YEARLY plan, find any active subscription (e.g., an ADDON that might be active)
      if (!activeSubscription) {
        activeSubscription = subscriptions.find((sub) => sub.status === 'ACTIVE');
        console.log("Voucher Dialog: Falling back to any active subscription:", activeSubscription);
      }

      if (activeSubscription) {
        const activePlan = plans.find(p => p.name === activeSubscription.planName);
        console.log("Voucher Dialog: Matched Plan object for active subscription:", activePlan);
        setActiveMerchantPlan(activePlan || null);
      } else {
        console.log("Voucher Dialog: No active subscription found.");
        setActiveMerchantPlan(null);
      }
    } catch (err) {
      console.error("Failed to fetch merchant subscriptions:", err, (err as any).response?.data);
      toast({
        title: "Error",
        description: "Failed to load merchant's current plan.",
        variant: "destructive",
      });
      setActiveMerchantPlan(null);
    }
  }, [plans, toast]);

  const handleOpenAssignPlanDialog = useCallback(async (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    setSelectedPlanId(null); // Clear previous selection
    setIsAssignPlanDialogOpen(true);

    try {
      const subscriptions = await getMerchantSubscriptions(merchant.id);
      console.log("Assign Plan Dialog: Fetched subscriptions for merchant", merchant.id, ":", subscriptions);
      console.log("Assign Plan Dialog: All available plans:", plans);
      const activeRegularSubscription = subscriptions.find(
        (sub) => sub.status === 'ACTIVE' && (sub.billingCycle === 'MONTHLY' || sub.billingCycle === 'YEARLY')
      );
      console.log("Assign Plan Dialog: Identified active regular subscription:", activeRegularSubscription);

      if (activeRegularSubscription) {
        const activePlan = plans.find(p => p.name === activeRegularSubscription.planName);
        console.log("Assign Plan Dialog: Matched Plan object for active regular subscription:", activePlan);
        setActiveMerchantRegularPlan(activePlan || null);
      } else {
        console.log("Assign Plan Dialog: No active MONTHLY/YEARLY subscription found.");
        setActiveMerchantRegularPlan(null);
      }
    } catch (err) {
      console.error("Failed to fetch merchant subscriptions for assign plan dialog:", err, (err as any).response?.data);
      toast({
        title: "Error",
        description: "Failed to load merchant's current plan.",
        variant: "destructive",
      });
      setActiveMerchantRegularPlan(null);
    }
  }, [plans, toast]);

  // Removed useEffect related to merchant details dialog

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">All Merchants</h1>
        <p className="text-muted-foreground">Manage and monitor all merchant accounts</p>
      </div>

      {/* Search and Stats */}
      <div className="grid gap-6 md:grid-cols-2"> {/* Adjusted to 2 columns */}
        <Card className="border border-border">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-foreground">
              {allMerchantsForStats.filter(m => m.status === 'ACTIVE').length}
            </div>
            <p className="text-xs text-muted-foreground">Active Merchants</p>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-foreground">
              {allMerchantsForStats.filter(m => m.status === 'PENDING').length}
            </div>
            <p className="text-xs text-muted-foreground">Pending Approval</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle>Merchant Directory</CardTitle>
          <CardDescription>View and manage all merchant accounts</CardDescription>
          <div className="relative max-w-sm">
            <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search merchants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-x-auto">
            {loading ? (
              <div className="text-center py-8">Loading merchants...</div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">Error: {error}</div>
            ) : merchants.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No merchants found.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Merchant</TableHead><TableHead>Status</TableHead><TableHead>Plan</TableHead><TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMerchants.map((merchant) => (
                    <TableRow key={merchant.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-foreground">{merchant.companyName}</div>
                          <div className="text-sm text-muted-foreground">{merchant.email}</div>
                        </div>
                      </TableCell><TableCell>
                        <Badge variant={getStatusColor(merchant.status) as any}>
                          {merchant.status}
                        </Badge>
                      </TableCell><TableCell>
                        <Badge variant={getPlanColor(merchant.activePlanName || '')}>{merchant.activePlanName || 'N/A'}</Badge>
                      </TableCell><TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigate(`/merchants/${merchant.id}`);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedMerchant(merchant)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Update Merchant Status</DialogTitle>
                                <DialogDescription>
                                  Change the status for {selectedMerchant?.companyName}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Current Status</label>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedMerchant?.status}
                                  </p>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">New Status</label>
                                  <Select value={newStatus} onValueChange={setNewStatus}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="PENDING">Pending</SelectItem>
                                      <SelectItem value="ACTIVE">Active</SelectItem>
                                      <SelectItem value="SUSPENDED">Suspended</SelectItem>
                                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button onClick={handleStatusUpdate} className="w-full">
                                  Update Status
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          {/* Assign Plan Dialog Trigger */}
                          <Dialog open={isAssignPlanDialogOpen} onOpenChange={setIsAssignPlanDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenAssignPlanDialog(merchant)}
                              >
                                Assign Plan
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Assign Plan to {selectedMerchant?.companyName}</DialogTitle>
                                <DialogDescription>
                                  Select a new plan for {selectedMerchant?.companyName}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Current Plan</label>
                                  <p className="text-sm text-muted-foreground">
                                    {activeMerchantRegularPlan ? `${activeMerchantRegularPlan.name} (${activeMerchantRegularPlan.billingCycle.toLowerCase()})` : "No active monthly/yearly plan"}
                                  </p>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Select New Plan</label>
                                  <Select
                                    value={selectedPlanId || ''}
                                    onValueChange={(value) => setSelectedPlanId(value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a plan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {regularPlans.map((planItem) => (
                                        <SelectItem key={planItem.id} value={planItem.id}>
                                          {planItem.name} - ${planItem.price}/{planItem.billingCycle.toLowerCase()}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button onClick={handleAssignPlan} className="w-full">
                                  Assign Plan
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenVoucherDialog(merchant)}
                          >
                            Voucher
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(page - 1)}
                    className={page === 0 ? "pointer-events-none opacity-50" : undefined}
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => handlePageChange(i)}
                      isActive={i === page}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(page + 1)}
                    className={page === totalPages - 1 ? "pointer-events-none opacity-50" : undefined}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>

      {/* Voucher Plan Dialog */}
      <Dialog open={isVoucherDialogOpen} onOpenChange={setIsVoucherDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Voucher</DialogTitle>
            <DialogDescription>
              Select a voucher plan for {selectedMerchant?.companyName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Plan</label>
              <p className="text-sm text-muted-foreground">
                {activeMerchantPlan ? `${activeMerchantPlan.name} (${activeMerchantPlan.billingCycle.toLowerCase()})` : "No active plan"}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Voucher Plan (Addon)</label>
              <Select
                value={selectedVoucherPlanId || ''}
                onValueChange={(value) => setSelectedVoucherPlanId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an addon plan" />
                </SelectTrigger>
                <SelectContent>
                  {addonPlans.map((planItem) => (
                    <SelectItem key={planItem.id} value={planItem.id}>
                      {planItem.name} - ${planItem.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleApplyVoucher} className="w-full">
              Apply Voucher
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Removed Merchant Details Dialog */}
    </div>
  );
};

export default AllMerchants;