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
import { getMerchants, updateMerchantStatus, Merchant } from '../services/api';
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
  const { user } = useAuth(); // Keeping user here for potential future use or display logic, but not for direct token access in API calls
  // Removed states related to merchant details dialog

  const fetchMerchants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMerchants(undefined, undefined, searchTerm, page, size); // Fetch all merchants for table, then filter if searchTerm exists
      setMerchants(response.content);
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

  useEffect(() => {
    fetchMerchants();
    fetchAllMerchantsForStats(); // Fetch all merchants for stats on initial mount
  }, [fetchMerchants, fetchAllMerchantsForStats]);

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
          <div className="rounded-md border border-border">
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
                    <TableHead>Merchant</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
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
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(merchant.status) as any}>
                          {merchant.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
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

      {/* Removed Merchant Details Dialog */}
    </div>
  );
};

export default AllMerchants;