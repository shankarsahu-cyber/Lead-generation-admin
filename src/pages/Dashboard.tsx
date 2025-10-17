import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Users, TrendingUp, DollarSign, UserCheck, Clock, Target, CheckCircle, XCircle, CreditCard, Activity } from 'lucide-react';
import { getMerchants, updateMerchantStatus, Merchant, getAnalytics, AnalyticsData } from '../services/api';

const Dashboard: React.FC = () => {
  const [pendingMerchants, setPendingMerchants] = useState<Merchant[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch data on component mount
  useEffect(() => {
    fetchPendingMerchants();
    fetchAnalytics();
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

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const data = await getAnalytics();
      setAnalyticsData(data);

    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data.",
        variant: "destructive",
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleStatusUpdate = async (merchantId: string, newStatus: 'ACTIVE' | 'CANCELLED') => {
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

  // Analytics cards data
  const getAnalyticsCards = () => {
    if (!analyticsData) return [];
    
    return [
      {
          title: 'Merchant Statistics',
          icon: Users,
          color: 'blue',
          stats: [
            { label: 'Total Merchants', value: String(analyticsData.merchantStats.totalMerchants || 0) },
            { label: 'Active Merchants', value: String(analyticsData.merchantStats.activeMerchants || 0) },
            { label: 'Pending Merchants', value: String(analyticsData.merchantStats.pendingMerchants || 0) },
            { label: 'Suspended Merchants', value: String(analyticsData.merchantStats.suspendedMerchants || 0) },
            { label: 'Cancelled Merchants', value: String(analyticsData.merchantStats.cancelledMerchants || 0) },
          ]
        },
        {
          title: 'Subscription Statistics',
          icon: CreditCard,
          color: 'green',
          stats: [
            { label: 'Total Subscriptions', value: String(analyticsData.subscriptionStats.totalSubscriptions || 0) },
            { label: 'Active Subscriptions', value: String(analyticsData.subscriptionStats.activeSubscriptions || 0) },
            { label: 'Expired Subscriptions', value: String(analyticsData.subscriptionStats.expiredSubscriptions || 0) },
            { label: 'Cancelled Subscriptions', value: String(analyticsData.subscriptionStats.cancelledSubscriptions || 0) },
            { label: 'Suspended Subscriptions', value: String(analyticsData.subscriptionStats.suspendedSubscriptions || 0) },
            { label: 'Pending Subscriptions', value: String(analyticsData.subscriptionStats.pendingSubscriptions || 0) },
          ]
        },
      {
          title: 'Revenue Statistics',
          icon: DollarSign,
          color: 'purple',
          stats: [
            { label: 'Total Revenue', value: `$${(analyticsData.revenueStats.totalRevenue || 0).toLocaleString()}` },
            { label: 'Today Revenue', value: `$${(analyticsData.revenueStats.todayRevenue || 0).toLocaleString()}` },
            { label: 'This Week Revenue', value: `$${(analyticsData.revenueStats.thisWeekRevenue || 0).toLocaleString()}` },
            { label: 'This Month Revenue', value: `$${(analyticsData.revenueStats.thisMonthRevenue || 0).toLocaleString()}` },
            { label: 'This Year Revenue', value: `$${(analyticsData.revenueStats.thisYearRevenue || 0).toLocaleString()}` },
          ]
        }
    ];
  };



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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 md:space-y-6 p-0.5 mt-1 bg-gradient-to-br from-sky-50/30 via-white to-blue-50/20 min-h-screen"
    >

      {/* Analytics Cards */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="grid gap-2 md:gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 mb-3 md:mb-4"
      >
        {analyticsLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className="border-0 bg-gradient-to-br from-white via-gray-50/50 to-white shadow-xl rounded-3xl overflow-hidden h-full">
                <CardHeader className="p-6 md:p-8">
                  <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
                    <div className="h-6 w-6 md:h-8 md:w-8 bg-gray-300 rounded-2xl animate-pulse"></div>
                    <div className="h-6 bg-gray-300 rounded-xl animate-pulse w-32"></div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8 pt-0">
                  <div className="space-y-4">
                    <div className="h-5 bg-gray-300 rounded-lg animate-pulse w-20"></div>
                    <div className="h-5 bg-gray-300 rounded-lg animate-pulse w-24"></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          getAnalyticsCards().map((card, index) => {
            const Icon = card.icon;
            const gradientColors = {
              blue: 'from-blue-500 to-cyan-500',
              green: 'from-emerald-500 to-teal-500', 
              purple: 'from-purple-500 to-pink-500'
            };
            const bgGradients = {
              blue: 'from-blue-50/80 via-cyan-50/40 to-blue-50/60',
              green: 'from-emerald-50/80 via-teal-50/40 to-emerald-50/60',
              purple: 'from-purple-50/80 via-pink-50/40 to-purple-50/60'
            };
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  delay: index * 0.15, 
                  duration: 0.6,
                  type: "spring",
                  stiffness: 120,
                  damping: 15
                }}

                className="h-full"
              >
                <Card className={`border-0 bg-gradient-to-br ${bgGradients[card.color as keyof typeof bgGradients]} shadow-xl rounded-3xl overflow-hidden group h-full relative flex flex-col`}>
                  {/* Animated background pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent_50%)]"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/15 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
                  </div>
                  
                  {/* Hover overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${bgGradients[card.color as keyof typeof bgGradients]} opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
                  
                  <CardHeader className="pb-1 p-2 md:p-3 relative z-10">
                    <CardTitle className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm">
                      <motion.div 
                        className={`p-1 md:p-1.5 rounded-md bg-gradient-to-br ${gradientColors[card.color as keyof typeof gradientColors]} shadow-md`}
                      >
                        <Icon className="h-2.5 w-2.5 md:h-3 md:w-3 text-white drop-shadow-sm" />
                      </motion.div>
                      <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent font-bold tracking-tight">
                        {card.title}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 md:p-3 pt-0 relative z-10 pb-2 md:pb-3 flex-1 flex flex-col">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 flex-1 content-start">
                      {card.stats.map((stat, statIndex) => (
                        <motion.div 
                          key={statIndex} 
                          className="p-1.5 md:p-2 rounded-md bg-white/50 backdrop-blur-sm border border-white/30 group h-fit"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: (index * 0.1) + (statIndex * 0.05), duration: 0.3 }}
                        >
                          <div className="text-center h-fit">
                            <div className="text-sm md:text-base font-bold text-gray-900 mb-0.5 h-fit">
                              {stat.label.toLowerCase().includes('revenue') || stat.label.toLowerCase().includes('$') ? (
                                <CountUp
                                  start={0}
                                  end={parseFloat(String(stat.value || '0').replace(/[^0-9.-]+/g, "")) || 0}
                                  duration={2.5}
                                  delay={index * 0.3}
                                  prefix={String(stat.value || '').includes('$') ? '$' : ''}
                                  suffix={String(stat.value || '').includes('%') ? '%' : ''}
                                  separator=","
                                  decimals={String(stat.value || '').includes('.') ? 2 : 0}
                                />
                              ) : stat.label.toLowerCase().includes('total') || stat.label.toLowerCase().includes('active') ? (
                                <CountUp
                                  start={0}
                                  end={parseInt(String(stat.value || '0').replace(/[^0-9]/g, "")) || 0}
                                  duration={2.5}
                                  delay={index * 0.3}
                                  separator=","
                                />
                              ) : (
                                stat.value
                              )}
                            </div>
                            <div className="text-xs text-gray-600 font-medium leading-tight h-fit">
                              {stat.label}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="grid gap-3 md:gap-4 grid-cols-1 xl:grid-cols-2 2xl:grid-cols-2"
      >
        {/* Pending Merchant Approvals */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.6, type: "spring", stiffness: 120 }}

          className="h-full"
        >
          <Card className="border-0 bg-gradient-to-br from-emerald-50/80 via-green-50/40 to-emerald-50/60 shadow-xl rounded-3xl overflow-hidden group h-full relative">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.3),transparent_50%)]"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/30 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-200/25 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
            </div>
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-green-50/30 opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
            
            <CardHeader className="p-3 md:p-4 relative z-10">
              <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                <motion.div
                  className="p-1.5 md:p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg"

                >
                  <UserCheck className="h-3 w-3 md:h-4 md:w-4 text-white drop-shadow-sm" />
                </motion.div>
                <div>
                  <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent font-bold tracking-tight block text-sm">
                    Pending Merchant Approvals
                  </span>
                  <CardDescription className="text-xs text-gray-600">
                    {pendingMerchants.length} merchants waiting for approval
                  </CardDescription>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 md:space-y-2 p-2 md:p-3 pt-0 relative z-10">
              {loading ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-3"
                >
                  <p className="text-xs text-muted-foreground">Loading pending merchants...</p>
                </motion.div>
              ) : pendingMerchants.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-3"
                >
                  <p className="text-xs text-muted-foreground">No pending merchants at the moment! 🎉</p>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {pendingMerchants.slice(0, 3).map((merchant, index) => (
                    <motion.div 
                      key={merchant.id} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2 border border-gray-200/50 rounded-lg bg-white/50 backdrop-blur-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {merchant.businessName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {merchant.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {merchant.contactNumber}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-200 text-xs px-2 py-1"
                            onClick={() => handleStatusUpdate(merchant.id, 'ACTIVE')}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-md hover:shadow-lg transition-all duration-200 text-xs px-2 py-1"
                            onClick={() => handleStatusUpdate(merchant.id, 'CANCELLED')}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
              {pendingMerchants.length > 3 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center pt-1"
                >
                  <p className="text-xs text-muted-foreground">
                    Showing 3 of {pendingMerchants.length} pending merchants
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Follow-ups */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.6, type: "spring", stiffness: 120 }}
          whileHover={{ y: -2, scale: 1.01 }}
          className="h-full"
        >
          <Card className="border-0 bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-blue-50/60 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden group h-full relative">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.3),transparent_50%)]"></div>
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-transparent rounded-full -translate-y-16 -translate-x-16"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tr from-indigo-200/25 to-transparent rounded-full translate-y-12 translate-x-12"></div>
            </div>
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
            
            <CardHeader className="p-3 md:p-4 relative z-10">
              <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                <motion.div
                  className="p-1.5 md:p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg"
                  whileHover={{ scale: 1.15, rotate: 10 }}
                  transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                >
                  <Clock className="h-3 w-3 md:h-4 md:w-4 text-white drop-shadow-sm" />
                </motion.div>
                <div>
                  <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent font-bold tracking-tight block text-sm">
                    Upcoming Follow-ups
                  </span>
                  <CardDescription className="text-xs text-gray-600">
                    Scheduled meetings and calls
                  </CardDescription>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 md:space-y-2 p-2 md:p-3 pt-0 relative z-10">
              <AnimatePresence>
                {upcomingFollowUps.map((followUp, index) => (
                  <motion.div 
                    key={followUp.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    className="space-y-1 p-2 border border-gray-200/50 rounded-lg bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all duration-200"
                  >
                    <div className="flex items-start md:items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground truncate">
                          {followUp.company}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {followUp.contact} • {followUp.type}
                        </p>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Badge variant={getPriorityColor(followUp.priority) as any} className="text-xs shrink-0 shadow-sm">
                          {followUp.priority}
                        </Badge>
                      </motion.div>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{followUp.time}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>


    </motion.div>
  );
};

export default Dashboard;