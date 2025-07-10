
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
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const warehouseRoute = user?.warehouse.toLowerCase() || 'south';

  const navigationItems = [
    { 
      label: "Dashboard", 
      icon: Home, 
      path: `/${warehouseRoute}/dashboard` 
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

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={`bg-background border-r border-border h-screen transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    } flex flex-col`}>
      
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Supply Chain AI
              </h2>
              <p className="text-xs text-muted-foreground">
                {user?.warehouse} Warehouse
              </p>
            </div>
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
        <div className="space-y-1">
          {!collapsed && (
            <p className="text-xs font-medium text-muted-foreground px-2 py-1">
              Navigation
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
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <div className="flex items-center justify-center">
          <ThemeToggle />
        </div>
        
        <Button
          variant="ghost"
          className={`w-full justify-start ${collapsed ? 'px-2' : ''}`}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
