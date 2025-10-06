import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
        title: "Merchant Updated Successfully! ✅",
        description: "Merchant details have been successfully updated.",
        variant: "success",
      });
      navigate(`/merchants/${merchantId}`);
    } catch (err) {
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
        className="relative z-10"
      >
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-sky-700 bg-clip-text text-transparent"
        >
          Edit Merchant: {merchant.companyName}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-sm sm:text-base text-gray-600 mt-2"
        >
          Update merchant information and settings
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="relative z-10"
      >
        <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-gray-50/50 to-sky-50/30 border-b border-gray-100">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <CardTitle className="text-lg sm:text-xl bg-gradient-to-r from-gray-800 to-sky-700 bg-clip-text text-transparent">
                Merchant Information
              </CardTitle>
            </motion.div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.6, duration: 0.6 }}
               className="grid grid-cols-1 md:grid-cols-2 gap-4"
             >
               <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.7, duration: 0.5 }}
                 className="space-y-2"
               >
                 <Label htmlFor="companyName" className="text-sm font-medium text-gray-700">Company Name</Label>
                 <Input 
                   id="companyName" 
                   value={formData.companyName || ''} 
                   onChange={handleChange} 
                   required 
                   className="bg-white/80 border-gray-200 focus:border-sky-400 focus:ring-sky-400/20 transition-all duration-200"
                 />
               </motion.div>
               <motion.div 
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.7, duration: 0.5 }}
                 className="space-y-2"
               >
                 <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                 <Input 
                   id="email" 
                   type="email" 
                   value={formData.email || ''} 
                   onChange={handleChange} 
                   required 
                   className="bg-white/80 border-gray-200 focus:border-sky-400 focus:ring-sky-400/20 transition-all duration-200"
                 />
               </motion.div>
               <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.8, duration: 0.5 }}
                 className="space-y-2"
               >
                 <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
                 <Input 
                   id="firstName" 
                   value={formData.firstName || ''} 
                   onChange={handleChange} 
                   className="bg-white/80 border-gray-200 focus:border-sky-400 focus:ring-sky-400/20 transition-all duration-200"
                 />
               </motion.div>
               <motion.div 
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.8, duration: 0.5 }}
                 className="space-y-2"
               >
                 <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
                 <Input 
                   id="lastName" 
                   value={formData.lastName || ''} 
                   onChange={handleChange} 
                   className="bg-white/80 border-gray-200 focus:border-sky-400 focus:ring-sky-400/20 transition-all duration-200"
                 />
               </motion.div>
               <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.9, duration: 0.5 }}
                 className="space-y-2"
               >
                 <Label htmlFor="website" className="text-sm font-medium text-gray-700">Website</Label>
                 <Input 
                   id="website" 
                   value={formData.website || ''} 
                   onChange={handleChange} 
                   className="bg-white/80 border-gray-200 focus:border-sky-400 focus:ring-sky-400/20 transition-all duration-200"
                 />
               </motion.div>
               <motion.div 
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.9, duration: 0.5 }}
                 className="space-y-2"
               >
                 <Label htmlFor="timezone" className="text-sm font-medium text-gray-700">Timezone</Label>
                 <Input 
                   id="timezone" 
                   value={formData.timezone || ''} 
                   onChange={handleChange} 
                   className="bg-white/80 border-gray-200 focus:border-sky-400 focus:ring-sky-400/20 transition-all duration-200"
                 />
               </motion.div>
               {/* Add other editable fields as needed */}
             </motion.div>

            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 1.0, duration: 0.5 }}
               className="flex justify-end gap-2"
             >
               <motion.div
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
               >
                 <Button 
                   type="button" 
                   variant="outline" 
                   onClick={() => navigate(`/merchants/${merchantId}`)}
                   className="bg-white/80 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                 >
                   Cancel
                 </Button>
               </motion.div>
               <motion.div
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
               >
                 <Button 
                   type="submit"
                   className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                 >
                   Save Changes
                 </Button>
               </motion.div>
             </motion.div>
          </form>
         </CardContent>
       </Card>
       </motion.div>
     </motion.div>
  );
};

export default EditMerchantPage;
