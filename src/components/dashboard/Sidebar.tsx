
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  LogOut, 
  Warehouse,
  ChevronLeft,
  ChevronRight,
  User,
  Eye
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate("/");
  };

  const navItems = [
    { 
      to: "/dashboard", 
      icon: LayoutDashboard, 
      label: "Dashboard", 
      active: true 
    },
    { 
      to: "/reports", 
      icon: FileText, 
      label: "Reports", 
      active: false 
    },
    { 
      to: "/insights", 
      icon: Eye, 
      label: "AI Insights", 
      active: false 
    },
    { 
      to: "/settings", 
      icon: Settings, 
      label: "Settings", 
      active: false 
    },
  ];

  return (
    <div className={`bg-card border-r border-border transition-all duration-300 flex flex-col h-full ${
      collapsed ? "w-16" : "w-64"
    }`}>
      
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-primary to-primary-glow rounded-lg">
                <Warehouse className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-bold text-sm">SupplyChain AI</h2>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Profile Section */}
      {!collapsed && (
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-r from-primary to-primary-glow rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">Admin User</p>
                <p className="text-xs text-muted-foreground">Warehouse Manager</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 p-4">
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                } ${collapsed ? "justify-center" : ""}`
              }
            >
              <item.icon className="h-5 w-5" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Theme toggle for collapsed state */}
      {collapsed && (
        <div className="p-4 border-t border-border flex justify-center">
          <ThemeToggle />
        </div>
      )}

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className={`w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent ${
            collapsed ? "px-0 justify-center" : ""
          }`}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
