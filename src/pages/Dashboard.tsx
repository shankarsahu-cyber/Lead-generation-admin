import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Users, TrendingUp, DollarSign, UserCheck, Clock, Target, CheckCircle, XCircle } from 'lucide-react';
import { getMerchants, updateMerchantStatus, Merchant } from '../services/api';

const Dashboard: React.FC = () => {
  const [pendingMerchants, setPendingMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch pending merchants on component mount
  useEffect(() => {
    fetchPendingMerchants();
  }, []);

  const fetchPendingMerchants = async () => {
    try {
      setLoading(true);
      const merchantListData = await getMerchants();
      
      // getMerchants returns MerchantListData with content property
      const merchants: Merchant[] = merchantListData?.content || [];
      
      // Filter merchants with PENDING status
      const pending = merchants.filter(merchant => merchant.status === 'PENDING');
      setPendingMerchants(pending);
      
      console.log('Fetched merchants:', merchants.length, 'Pending:', pending.length);
    } catch (error) {
      console.error('Failed to fetch pending merchants:', error);
      setPendingMerchants([]); // Set empty array on error
      toast({
        title: "Error",
        description: "Failed to load pending merchants.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (merchantId: string, newStatus: 'ACTIVE' | 'INACTIVE') => {
    try {
      await updateMerchantStatus(merchantId, newStatus);
      
      // Remove the merchant from pending list after approval/rejection
      setPendingMerchants(prev => prev.filter(m => m.id !== merchantId));
      
      toast({
        title: newStatus === 'ACTIVE' ? "Merchant Approved! ✅" : "Merchant Rejected ❌",
        description: `Merchant has been ${newStatus === 'ACTIVE' ? 'approved' : 'rejected'} successfully.`,
        variant: newStatus === 'ACTIVE' ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Failed to update merchant status:', error);
      toast({
        title: "Error",
        description: "Failed to update merchant status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Dummy stats data
  const stats = [
    {
      title: 'Total Merchant',
      value: '2,847',
      change: '+12.5%',
      changeType: 'positive',
      icon: Users,
      color: 'dashboard-info',
    },
    {
      title: 'Active Merchant',
      value: '1,204',
      change: '+8.2%',
      changeType: 'positive',
      icon: UserCheck,
      color: 'dashboard-stat',
    },
    {
      title: 'Revenue',
      value: '$48,520',
      change: '+15.3%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'dashboard-info',
    },
    {
      title: 'Total Subscription',
      value: '42.3%',
      change: '-2.1%',
      changeType: 'negative',
      icon: Target,
      color: 'dashboard-warning',
    },
  ];



  // Dummy follow-ups
  const upcomingFollowUps = [
    {
      id: 1,
      company: 'TechStart LLC',
      contact: 'John Smith',
      time: 'Today 2:00 PM',
      type: 'Demo Call',
      priority: 'high',
    },
    {
      id: 2,
      company: 'Growth Corp',
      contact: 'Sarah Johnson',
      time: 'Tomorrow 10:00 AM',
      type: 'Proposal Review',
      priority: 'medium',
    },
    {
      id: 3,
      company: 'Innovation Hub',
      contact: 'Mike Wilson',
      time: 'Tomorrow 3:30 PM',
      type: 'Contract Discussion',
      priority: 'high',
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      default:
        return 'secondary';
    }
  };



  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground">Welcome back! Here's your lead management overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-1.5 md:p-2 rounded-lg bg-${stat.color}/10`}>
                  <Icon className={`h-3 w-3 md:h-4 md:w-4 text-${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="text-xl md:text-2xl font-bold text-foreground">{stat.value}</div>
                <p className={`text-xs ${
                  stat.changeType === 'positive' ? 'text-success' : 'text-destructive'
                }`}>
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Pending Merchant Approvals */}
        <Card className="border border-border">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <UserCheck className="h-4 w-4 md:h-5 md:w-5" />
              Pending Merchant Approvals
            </CardTitle>
            <CardDescription className="text-sm">
              Merchants waiting for approval ({pendingMerchants.length} pending)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6 pt-0">
            {loading ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Loading pending merchants...</p>
              </div>
            ) : pendingMerchants.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No pending merchants at the moment! 🎉</p>
              </div>
            ) : (
              pendingMerchants.slice(0, 5).map((merchant) => (
                <div key={merchant.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {merchant.businessName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {merchant.email} • Applied: {new Date(merchant.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Contact: {merchant.contactNumber}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleStatusUpdate(merchant.id, 'ACTIVE')}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleStatusUpdate(merchant.id, 'INACTIVE')}
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))
            )}
            {pendingMerchants.length > 5 && (
              <div className="text-center pt-2">
                <p className="text-xs text-muted-foreground">
                  Showing 5 of {pendingMerchants.length} pending merchants
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Follow-ups */}
        <Card className="border border-border">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Clock className="h-4 w-4 md:h-5 md:w-5" />
              Upcoming Follow-ups
            </CardTitle>
            <CardDescription className="text-sm">Scheduled meetings and calls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6 pt-0">
            {upcomingFollowUps.map((followUp) => (
              <div key={followUp.id} className="space-y-2">
                <div className="flex items-start md:items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {followUp.company}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {followUp.contact} • {followUp.type}
                    </p>
                  </div>
                  <Badge variant={getPriorityColor(followUp.priority) as any} className="text-xs shrink-0">
                    {followUp.priority}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{followUp.time}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>


    </div>
  );
};

export default Dashboard;