
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { EnhancedAuthProvider, useAuth } from "./contexts/EnhancedAuthContext";
import { WarehouseProvider } from "./contexts/WarehouseContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SouthDashboard from "./pages/SouthDashboard";
import EastDashboard from "./pages/EastDashboard";
import AllInsights from "./pages/AllInsights";
import ReroutingStatus from "./pages/ReroutingStatus";
import ProductDetails from "./pages/ProductDetails";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Warehouse Route Component
const WarehouseRoute = ({ 
  children, 
  warehouse 
}: { 
  children: React.ReactNode;
  warehouse: 'South' | 'East';
}) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Allow access if user matches warehouse or if no specific user is set
  if (user && user.warehouse !== warehouse) {
    return <Navigate to={`/${user.warehouse.toLowerCase()}/dashboard`} replace />;
  }
  
  return <>{children}</>;
};

function AppContent() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        
        {/* General Dashboard (redirects to specific warehouse) */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Warehouse-specific dashboards */}
        <Route 
          path="/south/dashboard" 
          element={
            <WarehouseRoute warehouse="South">
              <SouthDashboard />
            </WarehouseRoute>
          } 
        />
        
        <Route 
          path="/east/dashboard" 
          element={
            <WarehouseRoute warehouse="East">
              <EastDashboard />
            </WarehouseRoute>
          } 
        />
        
        {/* Protected routes */}
        <Route 
          path="/insights" 
          element={
            <ProtectedRoute>
              <AllInsights />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/rerouting-status" 
          element={
            <ProtectedRoute>
              <ReroutingStatus />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/products/:id" 
          element={
            <ProtectedRoute>
              <ProductDetails />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <EnhancedAuthProvider>
        <WarehouseProvider>
          <TooltipProvider>
            <BrowserRouter>
              <AppContent />
              <Toaster />
              <Sonner />
            </BrowserRouter>
          </TooltipProvider>
        </WarehouseProvider>
      </EnhancedAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
