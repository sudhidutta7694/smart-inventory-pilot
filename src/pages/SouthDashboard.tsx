
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import EnhancedAIInsightPanel from "@/components/dashboard/EnhancedAIInsightPanel";
import AdminTaskWindow from "@/components/dashboard/AdminTaskWindow";
import MetricsOverview from "@/components/dashboard/MetricsOverview";
import EnhancedInventoryTable from "@/components/dashboard/EnhancedInventoryTable";
import { NotificationsPanel } from "@/components/rerouting/NotificationsPanel";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const SouthDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, logout } = useAuth();

  // Auto-switch to South user if available
  useEffect(() => {
    const southUser = localStorage.getItem('user_south');
    if (southUser && (!user || user.warehouse !== 'South')) {
      try {
        const parsedUser = JSON.parse(southUser);
        localStorage.setItem('currentUser', southUser);
        window.location.reload(); // Refresh to apply auth change
      } catch (error) {
        console.error('Error loading South user:', error);
      }
    }
  }, [user]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background flex"
    >
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        >
          <div className="flex h-14 items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold">South Warehouse Dashboard</h1>
              {user && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">Live</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <NotificationsPanel />
              <span className="text-sm text-muted-foreground">
                {user?.name || 'South Admin'}
              </span>
              <Button variant="ghost" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Top Row - AI Insights & Admin Tasks */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <EnhancedAIInsightPanel />
            <AdminTaskWindow />
          </motion.div>

          {/* Middle Row - Metrics Overview */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <MetricsOverview />
          </motion.div>

          {/* Bottom Row - Inventory Table */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <EnhancedInventoryTable />
          </motion.div>
          
        </main>
      </div>
    </motion.div>
  );
};

export default SouthDashboard;
