
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { WarehouseProvider } from "@/contexts/WarehouseContext";
import { InventoryProvider } from "@/contexts/InventoryContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import AllInsights from "./pages/AllInsights";
import Settings from "./pages/Settings";
import ProductDetails from "./pages/ProductDetails";
import SouthDashboard from "./pages/SouthDashboard";
import EastDashboard from "./pages/EastDashboard";
import ReroutingStatus from "./pages/ReroutingStatus";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

const DashboardRedirect = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return <Navigate to={`/${user.warehouse.toLowerCase()}/dashboard`} replace />;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<DashboardRedirect />} />
      <Route path="/dashboard" element={<DashboardRedirect />} />
      
      <Route 
        path="/south/dashboard" 
        element={
          <ProtectedRoute>
            <SouthDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/east/dashboard" 
        element={
          <ProtectedRoute>
            <EastDashboard />
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
        path="/insights" 
        element={
          <ProtectedRoute>
            <AllInsights />
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
      <Route 
        path="/product/:productId" 
        element={
          <ProtectedRoute>
            <ProductDetails />
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
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <AuthProvider>
        <InventoryProvider>
          <WarehouseProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </TooltipProvider>
          </WarehouseProvider>
        </InventoryProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
