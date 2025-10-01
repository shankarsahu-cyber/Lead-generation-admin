import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Calendar, DollarSign, Users, TrendingUp } from 'lucide-react';

interface Subscription {
  id: string;
  merchantName: string;
  plan: string;
  status: 'active' | 'expired' | 'cancelled' | 'trial';
  startDate: string;
  endDate: string;
  amount: string;
  billingCycle: 'monthly' | 'yearly';
  autoRenew: boolean;
}

const Subscriptions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Dummy subscriptions data
  const subscriptions: Subscription[] = [
    {
      id: 'SUB-001',
      merchantName: 'TechCorp Solutions',
      plan: 'Premium',
      status: 'active',
      startDate: '2024-01-15',
      endDate: '2025-01-15',
      amount: '$299',
      billingCycle: 'yearly',
      autoRenew: true,
    },
    {
      id: 'SUB-002',
      merchantName: 'StartUp Hub',
      plan: 'Basic',
      status: 'active',
      startDate: '2024-02-01',
      endDate: '2024-03-01',
      amount: '$29',
      billingCycle: 'monthly',
      autoRenew: true,
    },
    {
      id: 'SUB-003',
      merchantName: 'Growth Dynamics',
      plan: 'Standard',
      status: 'trial',
      startDate: '2024-03-10',
      endDate: '2024-03-24',
      amount: '$0',
      billingCycle: 'monthly',
      autoRenew: false,
    },
    {
      id: 'SUB-004',
      merchantName: 'Innovation Labs',
      plan: 'Premium',
      status: 'expired',
      startDate: '2023-12-05',
      endDate: '2024-02-05',
      amount: '$299',
      billingCycle: 'yearly',
      autoRenew: false,
    },
    {
      id: 'SUB-005',
      merchantName: 'Digital Ventures',
      plan: 'Enterprise',
      status: 'active',
      startDate: '2023-11-20',
      endDate: '2024-11-20',
      amount: '$999',
      billingCycle: 'yearly',
      autoRenew: true,
    },
    {
      id: 'SUB-006',
      merchantName: 'Quick Solutions',
      plan: 'Basic',
      status: 'cancelled',
      startDate: '2024-01-01',
      endDate: '2024-02-15',
      amount: '$29',
      billingCycle: 'monthly',
      autoRenew: false,
    },
  ];

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.merchantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.plan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expired':
        return 'destructive';
      case 'cancelled':
        return 'secondary';
      case 'trial':
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

  // Calculate stats
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
  const totalRevenue = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + parseInt(s.amount.replace(/[$,]/g, '')), 0);
  const trialSubscriptions = subscriptions.filter(s => s.status === 'trial').length;
  const monthlyRevenue = subscriptions
    .filter(s => s.status === 'active' && s.billingCycle === 'monthly')
    .reduce((sum, s) => sum + parseInt(s.amount.replace(/[$,]/g, '')), 0);

  const filterByStatus = (status?: string) => {
    if (!status) return filteredSubscriptions;
    return filteredSubscriptions.filter(sub => sub.status === status);
  };

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Subscriptions</h1>
        <p className="text-sm md:text-base text-muted-foreground">Monitor and manage all merchant subscriptions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-border">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl md:text-2xl font-bold text-foreground">{activeSubscriptions}</div>
                <p className="text-xs text-muted-foreground">Active Subscriptions</p>
              </div>
              <Users className="h-6 w-6 md:h-8 md:w-8 text-dashboard-stat" />
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl md:text-2xl font-bold text-foreground">${totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
              </div>
              <DollarSign className="h-6 w-6 md:h-8 md:w-8 text-dashboard-info" />
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl md:text-2xl font-bold text-foreground">{trialSubscriptions}</div>
                <p className="text-xs text-muted-foreground">Trial Users</p>
              </div>
              <Calendar className="h-6 w-6 md:h-8 md:w-8 text-dashboard-warning" />
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl md:text-2xl font-bold text-foreground">${monthlyRevenue}</div>
                <p className="text-xs text-muted-foreground">Monthly Revenue</p>
              </div>
              <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-dashboard-stat" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-lg">Subscription Management</CardTitle>
          <CardDescription className="text-sm">Track and manage all subscription plans</CardDescription>
          <div className="relative max-w-full sm:max-w-sm">
            <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subscriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <Tabs defaultValue="all" className="space-y-4 md:space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto">
              <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
              <TabsTrigger value="active" className="text-xs sm:text-sm">Active</TabsTrigger>
              <TabsTrigger value="trial" className="text-xs sm:text-sm">Trial</TabsTrigger>
              <TabsTrigger value="expired" className="text-xs sm:text-sm">Expired</TabsTrigger>
              <TabsTrigger value="cancelled" className="text-xs sm:text-sm">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <SubscriptionTable subscriptions={filterByStatus()} />
            </TabsContent>
            <TabsContent value="active">
              <SubscriptionTable subscriptions={filterByStatus('active')} />
            </TabsContent>
            <TabsContent value="trial">
              <SubscriptionTable subscriptions={filterByStatus('trial')} />
            </TabsContent>
            <TabsContent value="expired">
              <SubscriptionTable subscriptions={filterByStatus('expired')} />
            </TabsContent>
            <TabsContent value="cancelled">
              <SubscriptionTable subscriptions={filterByStatus('cancelled')} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

interface SubscriptionTableProps {
  subscriptions: Subscription[];
}

const SubscriptionTable: React.FC<SubscriptionTableProps> = ({ subscriptions }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expired':
        return 'destructive';
      case 'cancelled':
        return 'secondary';
      case 'trial':
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

  return (
    <>
      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4">
        {subscriptions.map((subscription) => (
          <Card key={subscription.id} className="border border-border">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-foreground text-sm">{subscription.merchantName}</p>
                    <p className="text-xs text-muted-foreground font-mono">{subscription.id}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge variant={getPlanColor(subscription.plan) as any} className="text-xs">
                      {subscription.plan}
                    </Badge>
                    <Badge variant={getStatusColor(subscription.status) as any} className="text-xs">
                      {subscription.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Amount:</span>
                    <p className="font-medium">{subscription.amount}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Billing:</span>
                    <p className="font-medium">{subscription.billingCycle}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">End Date:</span>
                    <p className="font-medium">{new Date(subscription.endDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Auto Renew:</span>
                    <Badge variant={subscription.autoRenew ? "default" : "secondary"} className="text-xs mt-1">
                      {subscription.autoRenew ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs lg:text-sm">Subscription ID</TableHead>
              <TableHead className="text-xs lg:text-sm">Merchant</TableHead>
              <TableHead className="text-xs lg:text-sm">Plan</TableHead>
              <TableHead className="text-xs lg:text-sm">Status</TableHead>
              <TableHead className="text-xs lg:text-sm">Amount</TableHead>
              <TableHead className="text-xs lg:text-sm">Billing</TableHead>
              <TableHead className="text-xs lg:text-sm">End Date</TableHead>
              <TableHead className="text-xs lg:text-sm">Auto Renew</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((subscription) => (
              <TableRow key={subscription.id}>
                <TableCell className="font-mono text-xs lg:text-sm">{subscription.id}</TableCell>
                <TableCell className="font-medium text-foreground text-xs lg:text-sm">
                  {subscription.merchantName}
                </TableCell>
                <TableCell>
                  <Badge variant={getPlanColor(subscription.plan) as any} className="text-xs">
                    {subscription.plan}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(subscription.status) as any} className="text-xs">
                    {subscription.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium text-foreground text-xs lg:text-sm">
                  {subscription.amount}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs lg:text-sm">
                  {subscription.billingCycle}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs lg:text-sm">
                  {new Date(subscription.endDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge variant={subscription.autoRenew ? "default" : "secondary"} className="text-xs">
                    {subscription.autoRenew ? "Yes" : "No"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default Subscriptions;