
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { WarehouseProvider } from "@/contexts/WarehouseContext";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <WarehouseProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/south/dashboard" element={<SouthDashboard />} />
              <Route path="/east/dashboard" element={<EastDashboard />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/insights" element={<AllInsights />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/product/:productId" element={<ProductDetails />} />
              <Route path="/rerouting-status" element={<ReroutingStatus />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </WarehouseProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
