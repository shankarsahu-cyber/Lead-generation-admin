import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
          console.error("Failed to fetch merchant details:", err);
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

          const isExpired = (sub: Subscription) => new Date(sub.endDate) < new Date();

          // Sort subscriptions: Active first, then Pending, then Expired, then others
          const sortedSubscriptions = data.sort((a, b) => {
            const getStatusPriority = (sub: Subscription) => {
              if (sub.status === 'ACTIVE' && !isExpired(sub)) return 1; // Truly active
              if (sub.status === 'PENDING') return 2;
              if (isExpired(sub)) return 3; // Explicitly expired
              return 4; // Other statuses (INACTIVE, CANCELLED, or active but expired)
            };
            return getStatusPriority(a) - getStatusPriority(b);
          });
          setSubscriptions(sortedSubscriptions);
        } catch (err) {
          console.error("Failed to fetch merchant subscriptions:", err);
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

  const handleForceActivate = (subscriptionId: string) => {
    setSubscriptionToForceActivate(subscriptionId);
    setIsForceActivateDialogOpen(true);
  };

  const confirmForceActivate = async () => {
    if (!merchantId || !subscriptionToForceActivate) return;
    setLoadingSubscriptions(true);
    try {
      await forceActivateSubscription(subscriptionToForceActivate, merchantId, "NULL");
      // Refresh subscriptions after update
      const updatedSubscriptions = await getMerchantSubscriptions(merchantId);
      setSubscriptions(updatedSubscriptions);
      toast({
        title: "Subscription Activated",
        description: "Subscription has been force activated.",
      });
    } catch (err) {
      console.error("Failed to force activate subscription:", err);
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
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => navigate('/merchants')} className="mr-4">
          Back
        </Button>
        <h1 className="text-3xl font-bold text-foreground">{merchant.companyName} Details</h1>
        <Button variant="outline" onClick={() => navigate(`/merchants/${merchant.id}/edit`)}>
          <Pencil className="h-4 w-4 mr-2" /> Edit Details
        </Button>
      </div>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle>Merchant Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Company Name:</p>
              <p className="text-muted-foreground">{merchant.companyName}</p>
            </div>
            <div>
              <p className="font-medium">Email:</p>
              <p className="text-muted-foreground">{merchant.email}</p>
            </div>
            <div>
              <p className="font-medium">First Name:</p>
              <p className="text-muted-foreground">{merchant.firstName}</p>
            </div>
            <div>
              <p className="font-medium">Last Name:</p>
              <p className="text-muted-foreground">{merchant.lastName}</p>
            </div>
            <div>
              <p className="font-medium">Website:</p>
              <p className="text-muted-foreground">{merchant.website}</p>
            </div>
            <div>
              <p className="font-medium">Timezone:</p>
              <p className="text-muted-foreground">{merchant.timezone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle>Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingSubscriptions ? (
            <div className="text-center py-4">Loading subscriptions...</div>
          ) : subscriptionError ? (
            <div className="text-center py-4 text-destructive">Error: {subscriptionError}</div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No subscriptions found for this merchant.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subscriptions.map((sub) => (
                <Card key={sub.id} className="border">
                  <CardHeader>
                    <CardTitle className="text-lg">Subscription Type: {sub.planName}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div><span className="font-medium">Status:</span> <Badge variant={getStatusColor(sub.status, sub.endDate)}>{sub.status}</Badge></div>
                    <p><span className="font-medium">Start Date:</span> {new Date(sub.startDate).toLocaleDateString()}</p>
                    {sub.endDate && <p><span className="font-medium">End Date:</span> {new Date(sub.endDate).toLocaleDateString()}</p>}
                    {sub.status === 'PENDING' && (
                      <div className="flex justify-end mt-2">
                        <Button
                          className="text-xs px-2 py-1"
                          onClick={() => handleForceActivate(sub.id)}
                        >
                          Force Activate
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isForceActivateDialogOpen} onOpenChange={setIsForceActivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Force Activation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to force activate this subscription? It will expire the current active plan and all other attached add-ons plans.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmForceActivate} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Force Activate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MerchantDetailsPage;
