
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { SouthWarehouseProvider } from "@/contexts/SouthWarehouseContext";
import { EastWarehouseProvider } from "@/contexts/EastWarehouseContext";
import Login from "./pages/Login";
import SouthDashboard from "./pages/SouthDashboard";
import EastDashboard from "./pages/EastDashboard";
import Reports from "./pages/Reports";
import AllInsights from "./pages/AllInsights";
import Settings from "./pages/Settings";
import ProductDetails from "./pages/ProductDetails";
import ReroutingStatus from "./pages/ReroutingStatus";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Login />} />
              
              <Route 
                path="/south/dashboard" 
                element={
                  <SouthWarehouseProvider>
                    <SouthDashboard />
                  </SouthWarehouseProvider>
                } 
              />
              
              <Route 
                path="/east/dashboard" 
                element={
                  <EastWarehouseProvider>
                    <EastDashboard />
                  </EastWarehouseProvider>
                } 
              />
              
              <Route 
                path="/south/reports" 
                element={
                  <SouthWarehouseProvider>
                    <Reports />
                  </SouthWarehouseProvider>
                } 
              />
              
              <Route 
                path="/east/reports" 
                element={
                  <EastWarehouseProvider>
                    <Reports />
                  </EastWarehouseProvider>
                } 
              />
              
              <Route 
                path="/south/insights" 
                element={
                  <SouthWarehouseProvider>
                    <AllInsights />
                  </SouthWarehouseProvider>
                } 
              />
              
              <Route 
                path="/east/insights" 
                element={
                  <EastWarehouseProvider>
                    <AllInsights />
                  </EastWarehouseProvider>
                } 
              />
              
              <Route 
                path="/south/settings" 
                element={
                  <SouthWarehouseProvider>
                    <Settings />
                  </SouthWarehouseProvider>
                } 
              />
              
              <Route 
                path="/east/settings" 
                element={
                  <EastWarehouseProvider>
                    <Settings />
                  </EastWarehouseProvider>
                } 
              />
              
              <Route 
                path="/south/product/:productId" 
                element={
                  <SouthWarehouseProvider>
                    <ProductDetails />
                  </SouthWarehouseProvider>
                } 
              />
              
              <Route 
                path="/east/product/:productId" 
                element={
                  <EastWarehouseProvider>
                    <ProductDetails />
                  </EastWarehouseProvider>
                } 
              />
              
              <Route 
                path="/south/rerouting-status" 
                element={
                  <SouthWarehouseProvider>
                    <ReroutingStatus />
                  </SouthWarehouseProvider>
                } 
              />
              
              <Route 
                path="/east/rerouting-status" 
                element={
                  <EastWarehouseProvider>
                    <ReroutingStatus />
                  </EastWarehouseProvider>
                } 
              />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
