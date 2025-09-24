import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getMerchantDetails, Merchant, updateMerchantDetails } from '../services/api';

const EditMerchantPage: React.FC = () => {
  const { merchantId } = useParams<{ merchantId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Merchant>>({});

  useEffect(() => {
    if (merchantId) {
      setLoading(true);
      setError(null);
      const fetchDetails = async () => {
        try {
          const data = await getMerchantDetails(merchantId);
          setMerchant(data);
          setFormData(data);
        } catch (err) {
          console.error("Failed to fetch merchant details:", err);
          setError("Failed to load merchant details.");
          toast({
            title: "Error",
            description: "Failed to load merchant details for editing.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [merchantId, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!merchantId) {
        throw new Error("Merchant ID not found.");
      }
      await updateMerchantDetails(merchantId, formData);
      toast({
        title: "Merchant Updated",
        description: "Merchant details have been successfully updated.",
      });
      navigate(`/merchants/${merchantId}`);
    } catch (err) {
      console.error("Failed to update merchant details:", err);
      setError("Failed to update merchant details.");
      toast({
        title: "Error",
        description: "Failed to update merchant details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading merchant details for editing...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-destructive">Error: {error}</div>;
  }

  if (!merchant) {
    return <div className="text-center py-8 text-muted-foreground">No merchant found for editing.</div>;
  }

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-3xl font-bold text-foreground">Edit Merchant: {merchant.companyName}</h1>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle>Merchant Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" value={formData.companyName || ''} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email || ''} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value={formData.firstName || ''} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={formData.lastName || ''} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" value={formData.website || ''} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input id="timezone" value={formData.timezone || ''} onChange={handleChange} />
              </div>
              {/* Add other editable fields as needed */}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate(`/merchants/${merchantId}`)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditMerchantPage;
