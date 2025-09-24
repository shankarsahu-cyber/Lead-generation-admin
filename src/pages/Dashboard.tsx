import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, DollarSign, UserCheck, Clock, Target } from 'lucide-react';

const Dashboard: React.FC = () => {
  // Dummy stats data
  const stats = [
    {
      title: 'Total Leads',
      value: '2,847',
      change: '+12.5%',
      changeType: 'positive',
      icon: Users,
      color: 'dashboard-info',
    },
    {
      title: 'Converted',
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
      title: 'Conversion Rate',
      value: '42.3%',
      change: '-2.1%',
      changeType: 'negative',
      icon: Target,
      color: 'dashboard-warning',
    },
  ];

  // Dummy recent activities
  const recentActivities = [
    {
      id: 1,
      type: 'lead',
      message: 'New lead from TechCorp Inc.',
      time: '2 minutes ago',
      status: 'new',
    },
    {
      id: 2,
      type: 'conversion',
      message: 'Lead converted to customer',
      time: '15 minutes ago',
      status: 'success',
    },
    {
      id: 3,
      type: 'follow-up',
      message: 'Follow-up scheduled with ABC Company',
      time: '1 hour ago',
      status: 'pending',
    },
    {
      id: 4,
      type: 'merchant',
      message: 'New merchant subscription activated',
      time: '2 hours ago',
      status: 'success',
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'pending':
        return 'warning';
      default:
        return 'primary';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your lead management overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-${stat.color}/10`}>
                  <Icon className={`h-4 w-4 text-${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activities
            </CardTitle>
            <CardDescription>Latest updates and activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {activity.message}
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                <Badge variant={getStatusColor(activity.status) as any}>
                  {activity.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Follow-ups */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Follow-ups
            </CardTitle>
            <CardDescription>Scheduled meetings and calls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingFollowUps.map((followUp) => (
              <div key={followUp.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {followUp.company}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {followUp.contact} • {followUp.type}
                    </p>
                  </div>
                  <Badge variant={getPriorityColor(followUp.priority) as any}>
                    {followUp.priority}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{followUp.time}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Conversion Progress */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle>Monthly Goals Progress</CardTitle>
          <CardDescription>Track your progress towards monthly targets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Leads Generated</span>
              <span className="text-foreground">847 / 1000</span>
            </div>
            <Progress value={84.7} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Conversions</span>
              <span className="text-foreground">204 / 300</span>
            </div>
            <Progress value={68} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Revenue Target</span>
              <span className="text-foreground">$48,520 / $60,000</span>
            </div>
            <Progress value={80.9} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;