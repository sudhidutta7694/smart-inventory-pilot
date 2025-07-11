import React from 'react';
import { motion } from 'framer-motion';
import { useSupplyChainStore } from '@/stores/supplyChainStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  Truck, 
  Clock, 
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const EnhancedMetricsOverview = () => {
  const { 
    analytics, 
    products, 
    tasks, 
    reroutes,
    insights,
    activeWarehouse,
    refreshAnalytics,
    isLoading 
  } = useSupplyChainStore();

  // Calculate real-time metrics from store data
  const warehouseProducts = products.filter(p => p.zone === activeWarehouse);
  const warehouseTasks = tasks.filter(t => t.warehouse === activeWarehouse);
  const warehouseReroutes = reroutes.filter(r => 
    r.fromWarehouse === activeWarehouse || r.toWarehouse === activeWarehouse
  );
  const warehouseInsights = insights.filter(i => i.zone === activeWarehouse);

  // Real-time calculated metrics
  const totalStock = warehouseProducts.reduce((sum, p) => sum + p.stock, 0);
  const totalValue = warehouseProducts.reduce((sum, p) => sum + (p.stock * p.unit_cost), 0);
  const lowStockItems = warehouseProducts.filter(p => p.stock <= p.reorder_point).length;
  const overstockItems = warehouseProducts.filter(p => p.stock > p.forecast_demand * 2).length;
  const pendingTasks = warehouseTasks.filter(t => t.status === 'pending').length;
  const inTransitReroutes = warehouseReroutes.filter(r => r.status === 'in_transit').length;
  const criticalInsights = warehouseInsights.filter(i => i.priority === 'high').length;

  // Chart data preparations
  const chartData = analytics.slice(-7); // Last 7 days
  
  const categoryData = warehouseProducts.reduce((acc, product) => {
    const existing = acc.find(item => item.category === product.category);
    if (existing) {
      existing.count += 1;
      existing.value += product.stock * product.unit_cost;
    } else {
      acc.push({
        category: product.category,
        count: 1,
        value: product.stock * product.unit_cost
      });
    }
    return acc;
  }, [] as Array<{category: string, count: number, value: number}>);

  const stockLevelData = [
    { name: 'Good Stock', value: warehouseProducts.filter(p => 
      p.stock > p.reorder_point && p.stock <= p.forecast_demand * 2
    ).length, color: '#10b981' },
    { name: 'Low Stock', value: lowStockItems, color: '#f59e0b' },
    { name: 'Overstock', value: overstockItems, color: '#6366f1' },
    { name: 'Critical', value: warehouseProducts.filter(p => 
      p.stock <= p.reorder_point * 0.5
    ).length, color: '#ef4444' }
  ];

  const handleRefreshAnalytics = () => {
    refreshAnalytics();
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-8 w-24 mb-4" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Inventory</p>
                  <p className="text-2xl font-bold">{totalStock.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    ${totalValue.toLocaleString()} value
                  </p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
              <div className="mt-4">
                <Progress value={75} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">75% capacity</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Tasks</p>
                  <p className="text-2xl font-bold">{pendingTasks}</p>
                  <div className="flex gap-1 mt-1">
                    {criticalInsights > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {criticalInsights} Critical
                      </Badge>
                    )}
                  </div>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
              <div className="mt-4">
                <Progress value={(pendingTasks / (warehouseTasks.length || 1)) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {warehouseTasks.length} total tasks
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Stock Alerts</p>
                  <p className="text-2xl font-bold">{lowStockItems}</p>
                  <div className="flex gap-1 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {overstockItems} Overstock
                    </Badge>
                  </div>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="mt-4">
                <Progress 
                  value={(lowStockItems / warehouseProducts.length) * 100} 
                  className="h-2" 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {warehouseProducts.length} total items
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Transit</p>
                  <p className="text-2xl font-bold">{inTransitReroutes}</p>
                  <p className="text-xs text-muted-foreground">
                    {warehouseReroutes.filter(r => r.status === 'pending').length} pending approval
                  </p>
                </div>
                <Truck className="h-8 w-8 text-blue-500" />
              </div>
              <div className="mt-4">
                <Progress value={65} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {warehouseReroutes.length} total reroutes
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Inventory Turnover
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshAnalytics}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: number) => [value.toFixed(1), 'Turnover']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="inventoryTurnover" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ fill: '#8884d8' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Stock Level Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={stockLevelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stockLevelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value, 'Items']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Daily Orders & Fulfillment</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="avgDailyOrders" 
                    stackId="1"
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'value' ? `$${value.toLocaleString()}` : value,
                      name === 'value' ? 'Value' : 'Count'
                    ]}
                  />
                  <Bar dataKey="count" fill="#8884d8" name="Items" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EnhancedMetricsOverview;