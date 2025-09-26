import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getMerchantDetails, Merchant, getMerchantSubscriptions, Subscription } from '../services/api';
import { Pencil } from 'lucide-react';

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
          setSubscriptions(data);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'destructive';
      case 'pending':
        return 'warning';
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
                    <CardTitle className="text-lg">Subscription Type: {sub.type}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <p><span className="font-medium">Status:</span> <Badge variant={sub.status === 'ACTIVE' ? 'default' : 'destructive'}>{sub.status}</Badge></p>
                    <p><span className="font-medium">Start Date:</span> {new Date(sub.startDate).toLocaleDateString()}</p>
                    {sub.endDate && <p><span className="font-medium">End Date:</span> {new Date(sub.endDate).toLocaleDateString()}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MerchantDetailsPage;
