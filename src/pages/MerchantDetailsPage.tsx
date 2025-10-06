import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getMerchantDetails, Merchant, getMerchantSubscriptions, Subscription, updateSubscriptionStatus, forceActivateSubscription } from '../services/api';
import { Pencil } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const MerchantDetailsPage: React.FC = () => {
  const { merchantId } = useParams<{ merchantId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState<boolean>(true);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const [isForceActivateDialogOpen, setIsForceActivateDialogOpen] = useState<boolean>(false);
  const [subscriptionToForceActivate, setSubscriptionToForceActivate] = useState<string | null>(null);

  useEffect(() => {
    if (merchantId) {
      setLoading(true);
      setError(null);
      const fetchDetails = async () => {
        try {
          const data = await getMerchantDetails(merchantId);
          setMerchant(data);
        } catch (err) {
          setError("Failed to load merchant details.");
          toast({
            title: "Error",
            description: "Failed to load merchant details.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [merchantId, toast]);

  useEffect(() => {
    if (merchantId) {
      setLoadingSubscriptions(true);
      setSubscriptionError(null);
      const fetchSubscriptions = async () => {
        try {
          const data = await getMerchantSubscriptions(merchantId);
          // Use helper function for consistent sorting
          const sortedSubscriptions = sortSubscriptions(data);
          setSubscriptions(sortedSubscriptions);
        } catch (err) {
          setSubscriptionError("Failed to load subscriptions.");
          toast({
            title: "Error",
            description: "Failed to load merchant subscriptions.",
            variant: "destructive",
          });
        } finally {
          setLoadingSubscriptions(false);
        }
      };
      fetchSubscriptions();
    }
  }, [merchantId, toast]);

  const getStatusColor = (status: Subscription['status'], endDate: string) => {
    const isSubscriptionExpired = new Date(endDate) < new Date();

    if (isSubscriptionExpired) { // Explicitly mark as expired (red)
      return 'destructive';
    }

    switch (status.toLowerCase()) {
      case 'active':
        return 'success'; // Green
      case 'pending':
        return 'warning'; // Orange
      case 'inactive':
      case 'cancelled':
        return 'destructive'; // Red
      default:
        return 'secondary';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
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

  // Helper function to format date in DD/MM/YYYY format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Helper function for consistent subscription sorting with proper date sequence
  const sortSubscriptions = (subscriptions: Subscription[]) => {
    const isExpired = (sub: Subscription) => new Date(sub.endDate) < new Date();
    
    return subscriptions.sort((a, b) => {
      const getStatusPriority = (sub: Subscription) => {
        // Check if subscription is truly active (status ACTIVE and not expired)
        if (sub.status === 'ACTIVE' && !isExpired(sub)) return 1; // Active plans first
        if (sub.status === 'PENDING') return 2; // Pending plans second
        if (isExpired(sub) || sub.status === 'EXPIRED') return 3; // Expired plans last
        return 4; // Other statuses (INACTIVE, CANCELLED, etc.)
      };
      
      const priorityA = getStatusPriority(a);
      const priorityB = getStatusPriority(b);
      
      // If same priority, sort by start date in proper sequence
      if (priorityA === priorityB) {
        // For pending subscriptions, show in chronological order (oldest start date first)
        if (a.status === 'PENDING' && b.status === 'PENDING') {
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        }
        // For active subscriptions, show by start date (newest first)
        if (a.status === 'ACTIVE' && b.status === 'ACTIVE') {
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        }
        // For expired subscriptions, show by end date (most recently expired first)
        if ((isExpired(a) || a.status === 'EXPIRED') && (isExpired(b) || b.status === 'EXPIRED')) {
          return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
        }
        // Default: sort by start date
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      }
      
      return priorityA - priorityB;
    });
  };

  const handleForceActivate = (subscriptionId: string) => {
    setSubscriptionToForceActivate(subscriptionId);
    setIsForceActivateDialogOpen(true);
  };

  const confirmForceActivate = async () => {
    if (!merchantId || !subscriptionToForceActivate) return;
    setLoadingSubscriptions(true);
    try {
      await forceActivateSubscription(subscriptionToForceActivate, merchantId, "NULL");
      // Refresh subscriptions after update with consistent sorting
      const updatedSubscriptions = await getMerchantSubscriptions(merchantId);
      const sortedUpdatedSubscriptions = sortSubscriptions(updatedSubscriptions);
      setSubscriptions(sortedUpdatedSubscriptions);
      toast({
        title: "Subscription Activated! 🎉",
        description: "Subscription has been force activated successfully!",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to force activate subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingSubscriptions(false);
      setIsForceActivateDialogOpen(false); // Close the dialog
      setSubscriptionToForceActivate(null); // Clear the selected subscription
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading merchant details...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-destructive">Error: {error}</div>;
  }

  if (!merchant) {
    return <div className="text-center py-8 text-muted-foreground">No merchant found.</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6 p-4 sm:p-6 bg-gradient-to-br from-gray-50/50 via-white to-sky-50/30 min-h-screen"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50/20 via-transparent to-blue-50/20 pointer-events-none" />
      
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 relative z-10"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button 
            variant="outline" 
            onClick={() => navigate('/merchants')} 
            className="bg-white/80 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          >
            Back
          </Button>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center flex-1"
        >
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-sky-700 bg-clip-text text-transparent">
            {merchant.companyName} Details
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Comprehensive merchant information and subscription management
          </p>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button 
            variant="outline" 
            onClick={() => navigate(`/merchants/${merchant.id}/edit`)}
            className="bg-white/80 border-gray-200 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 transition-all duration-200"
          >
            <Pencil className="h-4 w-4 mr-2" /> Edit Details
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="relative z-10"
      >
        <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-gray-50/50 to-sky-50/30 border-b border-gray-100">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <CardTitle className="text-lg sm:text-xl bg-gradient-to-r from-gray-800 to-sky-700 bg-clip-text text-transparent">
                Merchant Information
              </CardTitle>
            </motion.div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm"
            >
              <motion.div
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                transition={{ duration: 0.2 }}
                className="p-3 rounded-lg border border-gray-100 hover:border-sky-200 transition-all duration-200"
              >
                <p className="font-semibold text-gray-700 mb-1">Company Name:</p>
                <p className="text-gray-600">{merchant.companyName}</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                transition={{ duration: 0.2 }}
                className="p-3 rounded-lg border border-gray-100 hover:border-sky-200 transition-all duration-200"
              >
                <p className="font-semibold text-gray-700 mb-1">Email:</p>
                <p className="text-gray-600">{merchant.email}</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                transition={{ duration: 0.2 }}
                className="p-3 rounded-lg border border-gray-100 hover:border-sky-200 transition-all duration-200"
              >
                <p className="font-semibold text-gray-700 mb-1">First Name:</p>
                <p className="text-gray-600">{merchant.firstName}</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                transition={{ duration: 0.2 }}
                className="p-3 rounded-lg border border-gray-100 hover:border-sky-200 transition-all duration-200"
              >
                <p className="font-semibold text-gray-700 mb-1">Last Name:</p>
                <p className="text-gray-600">{merchant.lastName}</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                transition={{ duration: 0.2 }}
                className="p-3 rounded-lg border border-gray-100 hover:border-sky-200 transition-all duration-200"
              >
                <p className="font-semibold text-gray-700 mb-1">Website:</p>
                <p className="text-gray-600">{merchant.website}</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                transition={{ duration: 0.2 }}
                className="p-3 rounded-lg border border-gray-100 hover:border-sky-200 transition-all duration-200"
              >
                <p className="font-semibold text-gray-700 mb-1">Timezone:</p>
                <p className="text-gray-600">{merchant.timezone}</p>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="relative z-10"
      >
        <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-gray-50/50 to-sky-50/30 border-b border-gray-100">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <CardTitle className="text-lg sm:text-xl bg-gradient-to-r from-gray-800 to-sky-700 bg-clip-text text-transparent">
                Subscriptions
              </CardTitle>
            </motion.div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {loadingSubscriptions ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center py-8"
              >
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
                <p className="ml-3 text-gray-600">Loading subscriptions...</p>
              </motion.div>
            ) : subscriptionError ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-red-600">Error loading subscriptions: {subscriptionError}</p>
              </motion.div>
            ) : subscriptions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200"
              >
                <p className="text-gray-600">No subscriptions found for this merchant.</p>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {subscriptions.map((sub, index) => (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="group"
                  >
                    <Card className="border border-gray-200 bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 group-hover:border-sky-300">
                      <CardHeader className="p-4 bg-gradient-to-r from-gray-50/30 to-sky-50/20 border-b border-gray-100">
                        <CardTitle className="text-base sm:text-lg text-gray-800 group-hover:text-sky-700 transition-colors duration-200">
                          Subscription Type: {sub.planName}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 text-sm space-y-3">
                        <motion.div 
                          className="flex items-center gap-2"
                          whileHover={{ scale: 1.05 }}
                        >
                          <span className="font-medium text-gray-700">Status:</span> 
                          <Badge variant={getStatusColor(sub.status, sub.endDate)} className="transition-all duration-200">
                            {sub.status}
                          </Badge>
                        </motion.div>
                        <motion.p 
                          className="text-gray-600"
                          whileHover={{ scale: 1.02, color: '#0369a1' }}
                        >
                          <span className="font-medium text-gray-700">Start Date:</span> {formatDate(sub.startDate)}
                        </motion.p>
                        {sub.endDate && (
                          <motion.p 
                            className="text-gray-600"
                            whileHover={{ scale: 1.02, color: '#0369a1' }}
                          >
                            <span className="font-medium text-gray-700">End Date:</span> {formatDate(sub.endDate)}
                          </motion.p>
                        )}
                        {sub.status === 'PENDING' && (
                          <motion.div 
                            className="flex justify-end mt-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2 + index * 0.1 }}
                          >
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                className="text-xs px-3 py-1.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
                                onClick={() => handleForceActivate(sub.id)}
                              >
                                Force Activate
                              </Button>
                            </motion.div>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence>
        {isForceActivateDialogOpen && (
          <AlertDialog open={isForceActivateDialogOpen} onOpenChange={setIsForceActivateDialogOpen}>
            <AlertDialogContent className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-lg font-semibold bg-gradient-to-r from-gray-800 to-red-600 bg-clip-text text-transparent">
                    Confirm Force Activation
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-600 mt-2">
                    Are you sure you want to force activate this subscription? It will expire the current active plan and all other attached add-ons plans.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-3 mt-6">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 transition-all duration-200">
                      Cancel
                    </AlertDialogCancel>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <AlertDialogAction 
                      onClick={confirmForceActivate} 
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      Force Activate
                    </AlertDialogAction>
                  </motion.div>
                </AlertDialogFooter>
              </motion.div>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MerchantDetailsPage;
