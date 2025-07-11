
import React, { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import AIInsightPanel from "@/components/dashboard/AIInsightPanel";
import AdminTaskWindow from "@/components/dashboard/AdminTaskWindow";
import MetricsOverview from "@/components/dashboard/MetricsOverview";
import InventoryTable from "@/components/dashboard/InventoryTable";
import { NotificationsPanel } from "@/components/rerouting/NotificationsPanel";
import { useWarehouse } from "@/contexts/WarehouseContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const SouthDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { setCurrentWarehouse } = useWarehouse();
  const { user, logout } = useAuth();

  useEffect(() => {
    setCurrentWarehouse('South');
  }, [setCurrentWarehouse]);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold">South Warehouse Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationsPanel />
              <span className="text-sm text-muted-foreground">
                {user?.name}
              </span>
              <Button variant="ghost" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Top Row - AI Insights & Admin Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AIInsightPanel />
            <AdminTaskWindow />
          </div>

          {/* Middle Row - Metrics Overview */}
          <MetricsOverview />

          {/* Bottom Row - Inventory Table */}
          <InventoryTable />
          
        </main>
      </div>
    </div>
  );
};

export default SouthDashboard;
