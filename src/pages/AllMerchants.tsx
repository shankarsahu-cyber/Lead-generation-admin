import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  // Removed states related to merchant details dialog
  const [activeMerchantPlan, setActiveMerchantPlan] = useState<Plan | null>(null);
  const [activeMerchantRegularPlan, setActiveMerchantRegularPlan] = useState<Plan | null>(null); // New state for regular plan in assign dialog
  const [isPlanDetailsDialogOpen, setIsPlanDetailsDialogOpen] = useState<boolean>(false); // New state for plan details dialog
  const [selectedPlanDetails, setSelectedPlanDetails] = useState<Plan | null>(null); // New state for selected plan details

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
            // First try to find active regular subscription (MONTHLY/YEARLY)
            const activeRegularSubscription = subscriptions.find(
              (sub) => sub.status === 'ACTIVE' && (sub.billingCycle === 'MONTHLY' || sub.billingCycle === 'YEARLY')
            );
            
            // If no regular subscription found, look for any active subscription
            const anyActiveSubscription = subscriptions.find(
              (sub) => sub.status === 'ACTIVE'
            );
            
            const activePlan = activeRegularSubscription || anyActiveSubscription;
            
            // Format plan name with type indicator for addon plans
            let displayPlanName = 'N/A';
            if (activePlan) {
              displayPlanName = activePlan.planName;
              if (activePlan.billingCycle === 'ADDON' && !activeRegularSubscription) {
                displayPlanName = `${activePlan.planName} (Add-on)`;
              }
            }
            
            return { ...merchant, activePlanName: displayPlanName };
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
          title: "Status Updated Successfully! 🔄",
          description: `${selectedMerchant.companyName}'s status has been updated to ${newStatus}`,
          variant: "success",
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
          title: "Plan Assigned Successfully! 🎉",
          description: `${selectedMerchant.companyName}'s plan has been assigned to ${plans.find(p => p.id === selectedPlanId)?.name}`,
          variant: "success",
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
          title: "Voucher Applied Successfully! 🎁",
          description: `${selectedMerchant.companyName}'s voucher plan has been applied to ${plans.find(p => p.id === selectedVoucherPlanId)?.name}`,
          variant: "success",
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
      
      // Find the active subscription (prioritize MONTHLY/YEARLY)
      let activeSubscription = subscriptions.find(sub => 
        sub.status === 'ACTIVE' && (sub.billingCycle === 'MONTHLY' || sub.billingCycle === 'YEARLY')
      );
      
      // If no MONTHLY/YEARLY subscription found, look for any active subscription
      if (!activeSubscription) {
        activeSubscription = subscriptions.find(sub => sub.status === 'ACTIVE');
      }
      
      if (activeSubscription) {
        const activePlan = plans.find(plan => plan.name === activeSubscription.planName);
        setActiveMerchantPlan(activePlan || null);
      } else {
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
      const activeRegularSubscription = subscriptions.find(
        (sub) => sub.status === 'ACTIVE' && (sub.billingCycle === 'MONTHLY' || sub.billingCycle === 'YEARLY')
      );

      if (activeRegularSubscription) {
        const activePlan = plans.find(p => p.name === activeRegularSubscription.planName);
        setActiveMerchantRegularPlan(activePlan || null);
      } else {
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

  const handlePlanClick = useCallback((planName: string) => {
    if (planName === 'N/A' || planName === 'Error') return;
    
    // Remove (Add-on) suffix if present
    const cleanPlanName = planName.replace(' (Add-on)', '');
    
    // Find the plan details
    const planDetails = plans.find(plan => plan.name === cleanPlanName);
    
    if (planDetails) {
      setSelectedPlanDetails(planDetails);
      setIsPlanDetailsDialogOpen(true);
    } else {
      toast({
        title: "Plan Not Found",
        description: "Could not find details for this plan.",
        variant: "destructive",
      });
    }
  }, [plans, toast]);

  // Removed useEffect related to merchant details dialog

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-4 sm:space-y-6 bg-gradient-to-br from-gray-50/50 via-white to-sky-50/30 min-h-screen p-4 sm:p-6"
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50/20 via-transparent to-blue-50/20 pointer-events-none" />
      
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="px-1 relative z-10"
      >
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-sky-700 bg-clip-text text-transparent"
        >
          All Merchants
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-sm sm:text-base text-gray-600 mt-2"
        >
          Manage and monitor all merchant accounts
        </motion.p>
      </motion.div>

      {/* Search and Stats */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="flex flex-col sm:flex-row gap-4 sm:gap-6 relative z-10"
      >
        <div className="flex-1">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search merchants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full bg-white/80 backdrop-blur-sm border-gray-200 focus:border-sky-400 focus:ring-sky-400/20 shadow-sm hover:shadow-md transition-all duration-200"
            />
          </motion.div>
        </div>
        <div className="flex gap-2 sm:gap-4">
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="px-3 py-2 sm:px-4 sm:py-3 bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200">
              <div className="text-xs sm:text-sm text-gray-500">Total</div>
              <div className="text-lg sm:text-xl font-bold text-gray-800">{allMerchantsForStats.length}</div>
            </Card>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-sm hover:shadow-lg transition-all duration-200">
              <div className="text-xs sm:text-sm text-green-600">Active</div>
              <div className="text-lg sm:text-xl font-bold text-green-700">{allMerchantsForStats.filter(m => m.status === 'ACTIVE').length}</div>
            </Card>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-br from-red-50 to-rose-50 border-red-200 shadow-sm hover:shadow-lg transition-all duration-200">
              <div className="text-xs sm:text-sm text-red-600">Pending</div>
              <div className="text-lg sm:text-xl font-bold text-red-700">{allMerchantsForStats.filter(m => m.status === 'PENDING').length}</div>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="relative z-10"
      >
        <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-gray-50/50 to-sky-50/30 border-b border-gray-100">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <CardTitle className="text-lg sm:text-xl bg-gradient-to-r from-gray-800 to-sky-700 bg-clip-text text-transparent">Merchant Directory</CardTitle>
              <CardDescription className="text-sm text-gray-600">View and manage all merchant accounts</CardDescription>
              <div className="relative w-full sm:max-w-sm">
                <Search className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search merchants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 text-sm bg-white/80 backdrop-blur-sm border-gray-200 focus:border-sky-400 focus:ring-sky-400/20"
                />
              </div>
            </motion.div>
          </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {/* Mobile Card Layout */}
          <div className="block sm:hidden space-y-4 p-4">
            {loading ? (
              <div className="text-center py-8">Loading merchants...</div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">Error: {error}</div>
            ) : merchants.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No merchants found.</div>
            ) : (
              filteredMerchants.map((merchant) => (
                <Card key={merchant.id} className="border border-border">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <div className="font-medium text-foreground text-sm">{merchant.companyName}</div>
                        <div className="text-xs text-muted-foreground">{merchant.email}</div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={getStatusColor(merchant.status) as any} className="text-xs">
                          {merchant.status}
                        </Badge>
                        <Badge 
                          variant={getPlanColor(merchant.activePlanName || '')} 
                          className="text-xs cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handlePlanClick(merchant.activePlanName || '')}
                        >
                          {merchant.activePlanName || 'N/A'}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => navigate(`/merchants/${merchant.id}`)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-8"
                              onClick={() => setSelectedMerchant(merchant)}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-[95vw] max-w-md">
                            <DialogHeader>
                              <DialogTitle className="text-lg">Update Merchant Status</DialogTitle>
                              <DialogDescription className="text-sm">
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
                        <Dialog open={isAssignPlanDialogOpen} onOpenChange={setIsAssignPlanDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-8"
                              onClick={() => handleOpenAssignPlanDialog(merchant)}
                            >
                              Plan
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-[95vw] max-w-md">
                            <DialogHeader>
                              <DialogTitle className="text-lg">Assign Plan</DialogTitle>
                              <DialogDescription className="text-sm">
                                Select a new plan for {selectedMerchant?.companyName}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
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
                          className="text-xs h-8"
                          onClick={() => handleOpenVoucherDialog(merchant)}
                        >
                          Voucher
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden sm:block rounded-md border border-border overflow-x-auto">
            {loading ? (
              <div className="text-center py-8">Loading merchants...</div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">Error: {error}</div>
            ) : merchants.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No merchants found.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-100 bg-gray-50/50">
                    <TableHead className="min-w-[200px] text-left font-medium text-gray-600 px-4 py-3">Merchant</TableHead>
                    <TableHead className="min-w-[100px] text-left font-medium text-gray-600 px-4 py-3">Status</TableHead>
                    <TableHead className="min-w-[120px] text-left font-medium text-gray-600 px-4 py-3">Plan</TableHead>
                    <TableHead className="min-w-[200px] text-left font-medium text-gray-600 px-4 py-3">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredMerchants.map((merchant, index) => (
                      <motion.tr
                        key={merchant.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-sky-50/30 hover:to-blue-50/20 transition-all duration-200"
                      >
                        <TableCell>
                          <motion.div 
                            whileHover={{ x: 5 }}
                            className="flex items-center space-x-3"
                          >
                            <motion.div 
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className="w-8 h-8 bg-gradient-to-br from-sky-100 to-blue-100 rounded-full flex items-center justify-center shadow-sm"
                            >
                              <span className="text-sm font-medium text-sky-700">
                                {merchant.companyName.charAt(0).toUpperCase()}
                              </span>
                            </motion.div>
                            <div>
                              <div className="font-medium text-gray-800">{merchant.companyName}</div>
                              <div className="text-sm text-gray-500">{merchant.email}</div>
                            </div>
                          </motion.div>
                        </TableCell>
                        <TableCell>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Badge variant={getStatusColor(merchant.status) as any}>
                              {merchant.status}
                            </Badge>
                          </motion.div>
                        </TableCell>
                        <TableCell>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Badge 
                              variant={getPlanColor(merchant.activePlanName || '')}
                              className="cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => handlePlanClick(merchant.activePlanName || '')}
                            >
                              {merchant.activePlanName || 'N/A'}
                            </Badge>
                          </motion.div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 flex-wrap">
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/merchants/${merchant.id}`)}
                                className="bg-white/80 border-gray-200 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 transition-all duration-200"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </motion.div>
                            <Dialog>
                              <DialogTrigger asChild>
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedMerchant(merchant)}
                                    className="bg-white/80 border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </motion.div>
                              </DialogTrigger>
                              <DialogContent className="w-[95vw] max-w-md">
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
                            <Dialog open={isAssignPlanDialogOpen} onOpenChange={setIsAssignPlanDialogOpen}>
                              <DialogTrigger asChild>
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenAssignPlanDialog(merchant)}
                                    className="bg-white/80 border-gray-200 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all duration-200"
                                  >
                                    Assign Plan
                                  </Button>
                                </motion.div>
                              </DialogTrigger>
                              <DialogContent className="w-[95vw] max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Assign Plan to {selectedMerchant?.companyName}</DialogTitle>
                                  <DialogDescription>
                                    Select a new plan for {selectedMerchant?.companyName}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
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
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenVoucherDialog(merchant)}
                                className="bg-white/80 border-gray-200 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all duration-200"
                              >
                                Voucher
                              </Button>
                            </motion.div>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            )}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 px-4 sm:px-0">
              <Pagination className="justify-center">
                <PaginationContent className="flex-wrap gap-1">
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(page - 1)}
                      className={`text-xs sm:text-sm ${page === 0 ? "pointer-events-none opacity-50" : ""}`}
                    />
                  </PaginationItem>
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    const pageNum = totalPages <= 5 ? i : 
                      page < 3 ? i : 
                      page > totalPages - 3 ? totalPages - 5 + i : 
                      page - 2 + i;
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNum)}
                          isActive={pageNum === page}
                          className="text-xs sm:text-sm min-w-[32px] h-8 sm:h-10"
                        >
                          {pageNum + 1}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(page + 1)}
                      className={`text-xs sm:text-sm ${page === totalPages - 1 ? "pointer-events-none opacity-50" : ""}`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
      </motion.div>

      {/* Voucher Plan Dialog */}
      <Dialog open={isVoucherDialogOpen} onOpenChange={setIsVoucherDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Assign Voucher</DialogTitle>
            <DialogDescription className="text-sm">
              Select a voucher plan for {selectedMerchant?.companyName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
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

      {/* Plan Details Dialog */}
      <Dialog open={isPlanDetailsDialogOpen} onOpenChange={setIsPlanDetailsDialogOpen}>
        <DialogContent className="w-[95vw] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg">Plan Details</DialogTitle>
            <DialogDescription className="text-sm">
              Detailed information about the selected plan
            </DialogDescription>
          </DialogHeader>
          {selectedPlanDetails && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Plan Name</label>
                  <p className="text-sm font-semibold">{selectedPlanDetails.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Price</label>
                  <p className="text-sm font-semibold">${selectedPlanDetails.price}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Billing Cycle</label>
                  <p className="text-sm font-semibold">{selectedPlanDetails.billingCycle}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Max Forms</label>
                  <p className="text-sm font-semibold">{selectedPlanDetails.maxForms}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Max Leads/Month</label>
                  <p className="text-sm font-semibold">{selectedPlanDetails.maxLeadsPerMonth}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Max Locations</label>
                  <p className="text-sm font-semibold">{selectedPlanDetails.maxLocations}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-sm mt-1">{selectedPlanDetails.description}</p>
              </div>
              
              {selectedPlanDetails.features && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Features</label>
                  <div className="mt-1">
                    {(() => {
                      try {
                        const features = JSON.parse(selectedPlanDetails.features);
                        return (
                          <ul className="text-sm space-y-1">
                            {features.map((feature: string, index: number) => (
                              <li key={index} className="flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        );
                      } catch {
                        return <p className="text-sm">{selectedPlanDetails.features}</p>;
                      }
                    })()}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <label>Created At</label>
                  <p>{new Date(selectedPlanDetails.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label>Updated At</label>
                  <p>{new Date(selectedPlanDetails.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AllMerchants;