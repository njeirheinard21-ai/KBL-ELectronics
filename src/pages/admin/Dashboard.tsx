import { Helmet } from "react-helmet-async";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Activity 
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { orderService } from "../../services/orderService";
import { userService } from "../../services/userService";


const REVENUE_DATA = [
  { name: "Jan", total: 15000 },
  { name: "Feb", total: 23000 },
  { name: "Mar", total: 18000 },
  { name: "Apr", total: 32000 },
  { name: "May", total: 28000 },
  { name: "Jun", total: 45000 },
  { name: "Jul", total: 42000 },
];

const SALES_DATA = [
  { name: "Mon", sales: 120 },
  { name: "Tue", sales: 150 },
  { name: "Wed", sales: 180 },
  { name: "Thu", sales: 140 },
  { name: "Fri", sales: 210 },
  { name: "Sat", sales: 250 },
  { name: "Sun", sales: 200 },
];

export function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ['admin', 'dashboardStats'],
    queryFn: () => orderService.getDashboardStats(),
  });
  
    const totalRevenue = stats?.totalRevenue || 0;
  const totalOrders = stats?.totalOrders || 0;

  const { data: customers = [] } = useQuery({
    queryKey: ['admin', 'customers'],
    queryFn: () => userService.getAllUsers(),
  });

  
  
  const STATS = [
    {
      title: "Total Revenue",
      value: `${totalRevenue.toFixed(2)}`,
      change: "+20.1%",
      isPositive: true,
      icon: DollarSign
    },
    {
      title: "Orders",
      value: totalOrders.toString(),
      change: "+180.1%",
      isPositive: true,
      icon: ShoppingBag
    },
    {
      title: "Active Customers",
      value: customers.length.toString(),
      change: "+19%",
      isPositive: true,
      icon: Users
    },
    {
      title: "Active Now",
      value: "1",
      change: "0",
      isPositive: true,
      icon: Activity
    }
  ];

  return (
    <div className="space-y-8">
      <Helmet>
        <title>Admin Dashboard - KBL Electronics</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Dashboard</h1>
          <p className="text-fg-muted text-sm mt-1">Overview of your store's performance</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-lg bg-white/10 text-white">
                <stat.icon className="h-5 w-5" />
              </div>
              <div className={`flex items-center text-xs font-bold ${stat.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {stat.isPositive ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
                {stat.change}
              </div>
            </div>
            <h3 className="text-fg-muted text-sm font-medium">{stat.title}</h3>
            <div className="text-2xl font-bold text-white mt-1">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-6">Revenue Overview</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={REVENUE_DATA} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="total" stroke="#facc15" strokeWidth={3} dot={{ r: 4, fill: '#facc15' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-6">Weekly Sales</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SALES_DATA} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="sales" fill="#facc15" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
