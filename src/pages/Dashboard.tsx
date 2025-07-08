import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import AIInsightPanel from "@/components/dashboard/AIInsightPanel";
import AdminTaskWindow from "@/components/dashboard/AdminTaskWindow";
import MetricsOverview from "@/components/dashboard/MetricsOverview";
import InventoryTable from "@/components/dashboard/InventoryTable";

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
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

export default Dashboard;