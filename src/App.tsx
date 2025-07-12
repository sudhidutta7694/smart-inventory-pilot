
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthSouthProvider, useAuthSouth } from "@/contexts/AuthSouthContext";
import { AuthEastProvider, useAuthEast } from "@/contexts/AuthEastContext";
import { WarehouseProvider } from "@/contexts/WarehouseContext";
import { InventoryProvider } from "@/contexts/InventoryContext";
import RequireAuth from "@/components/auth/RequireAuth";
import LandingPage from "./pages/LandingPage";
import SouthLogin from "./pages/SouthLogin";
import EastLogin from "./pages/EastLogin";
import Reports from "./pages/Reports";
import AllInsights from "./pages/AllInsights";
import Settings from "./pages/Settings";
import ProductDetails from "./pages/ProductDetails";
import SouthDashboard from "./pages/SouthDashboard";
import EastDashboard from "./pages/EastDashboard";
import ReroutingStatus from "./pages/ReroutingStatus";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Route guard components that use the appropriate context
const SouthWarehouseRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthSouth();
  
  return (
    <RequireAuth 
      isAuthenticated={isAuthenticated} 
      redirectTo="/south/login"
    >
      {children}
    </RequireAuth>
  );
};

const EastWarehouseRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthEast();
  
  return (
    <RequireAuth 
      isAuthenticated={isAuthenticated} 
      redirectTo="/east/login"
    >
      {children}
    </RequireAuth>
  );
};

const AnyWarehouseRoute = ({ children }: { children: React.ReactNode }) => {
  const southAuth = useAuthSouth();
  const eastAuth = useAuthEast();
  
  const isAuthenticated = southAuth.isAuthenticated || eastAuth.isAuthenticated;
  
  return (
    <RequireAuth 
      isAuthenticated={isAuthenticated} 
      redirectTo="/"
    >
      {children}
    </RequireAuth>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Landing page */}
      <Route path="/" element={<LandingPage />} />
      
      {/* South warehouse routes */}
      <Route path="/south/login" element={<SouthLogin />} />
      <Route 
        path="/south/dashboard" 
        element={
          <SouthWarehouseRoute>
            <SouthDashboard />
          </SouthWarehouseRoute>
        } 
      />
      
      {/* East warehouse routes */}
      <Route path="/east/login" element={<EastLogin />} />
      <Route 
        path="/east/dashboard" 
        element={
          <EastWarehouseRoute>
            <EastDashboard />
          </EastWarehouseRoute>
        } 
      />
      
      {/* Shared routes - accessible from both warehouses */}
      <Route 
        path="/reports" 
        element={
          <AnyWarehouseRoute>
            <Reports />
          </AnyWarehouseRoute>
        } 
      />
      <Route 
        path="/insights" 
        element={
          <AnyWarehouseRoute>
            <AllInsights />
          </AnyWarehouseRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <AnyWarehouseRoute>
            <Settings />
          </AnyWarehouseRoute>
        } 
      />
      <Route 
        path="/product/:productId" 
        element={
          <AnyWarehouseRoute>
            <ProductDetails />
          </AnyWarehouseRoute>
        } 
      />
      <Route 
        path="/rerouting-status" 
        element={
          <AnyWarehouseRoute>
            <ReroutingStatus />
          </AnyWarehouseRoute>
        } 
      />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <InventoryProvider>
        <WarehouseProvider>
          <AuthSouthProvider>
            <AuthEastProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <AppRoutes />
                </BrowserRouter>
              </TooltipProvider>
            </AuthEastProvider>
          </AuthSouthProvider>
        </WarehouseProvider>
      </InventoryProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
