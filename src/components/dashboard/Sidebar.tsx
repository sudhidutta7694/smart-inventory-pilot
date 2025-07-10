
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  FileText, 
  Settings, 
  LogOut, 
  Home,
  TrendingUp,
  Truck,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { 
      label: "Dashboard", 
      icon: Home, 
      path: "/dashboard" 
    },
    { 
      label: "Reports", 
      icon: FileText, 
      path: "/reports" 
    },
    { 
      label: "AI Insights", 
      icon: TrendingUp, 
      path: "/insights" 
    },
    { 
      label: "Rerouting", 
      icon: Truck, 
      path: "/rerouting-status" 
    },
    { 
      label: "Analytics", 
      icon: BarChart3, 
      path: "/analytics" 
    },
    { 
      label: "Settings", 
      icon: Settings, 
      path: "/settings" 
    }
  ];

  const warehouseItems = [
    { 
      label: "South Warehouse", 
      icon: Home, 
      path: "/south/dashboard" 
    },
    { 
      label: "East Warehouse", 
      icon: Home, 
      path: "/east/dashboard" 
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={`bg-background border-r border-border h-screen transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    } flex flex-col`}>
      
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <h2 className="text-lg font-semibold text-foreground">
              Supply Chain
            </h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="ml-auto"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        
        {/* Main Navigation */}
        <div className="space-y-1">
          {!collapsed && (
            <p className="text-xs font-medium text-muted-foreground px-2 py-1">
              Main Navigation
            </p>
          )}
          {navigationItems.map((item) => (
            <Button
              key={item.path}
              variant={isActive(item.path) ? "secondary" : "ghost"}
              className={`w-full justify-start ${collapsed ? 'px-2' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="h-4 w-4" />
              {!collapsed && <span className="ml-2">{item.label}</span>}
            </Button>
          ))}
        </div>

        {/* Warehouse Dashboards */}
        <div className="space-y-1 pt-4">
          {!collapsed && (
            <p className="text-xs font-medium text-muted-foreground px-2 py-1">
              Warehouse Views
            </p>
          )}
          {warehouseItems.map((item) => (
            <Button
              key={item.path}
              variant={isActive(item.path) ? "secondary" : "ghost"}
              className={`w-full justify-start ${collapsed ? 'px-2' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="h-4 w-4" />
              {!collapsed && <span className="ml-2">{item.label}</span>}
            </Button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <div className="flex items-center justify-center">
          <ThemeToggle />
        </div>
        
        <Button
          variant="ghost"
          className={`w-full justify-start ${collapsed ? 'px-2' : ''}`}
          onClick={() => navigate('/')}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
