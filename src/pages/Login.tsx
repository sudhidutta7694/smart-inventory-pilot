
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Warehouse, ShieldCheck, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (warehouse: 'South' | 'East') => {
    setIsLoading(true);

    // Mock authentication delay
    setTimeout(() => {
      login(warehouse);
      toast({
        title: "Login Successful",
        description: `Welcome to ${warehouse} Warehouse Dashboard`,
      });
      navigate(`/${warehouse.toLowerCase()}/dashboard`);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/20 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Branding & Features */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-primary to-primary-glow rounded-xl shadow-lg">
                <Warehouse className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  SupplyChain AI
                </h1>
                <p className="text-muted-foreground">Intelligence Platform</p>
              </div>
            </div>
            <p className="text-lg text-muted-foreground">
              Transform your warehouse operations with AI-powered insights and predictive analytics
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-success/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Predictive Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Forecast demand patterns and optimize inventory levels with machine learning
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Warehouse className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Real-time Monitoring</h3>
                <p className="text-sm text-muted-foreground">
                  Track inventory levels, shipments, and warehouse operations in real-time
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-2 bg-warning/10 rounded-lg">
                <ShieldCheck className="h-6 w-6 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Smart Alerts</h3>
                <p className="text-sm text-muted-foreground">
                  Get notified about critical stock levels and potential supply chain disruptions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Warehouse Selection */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader className="space-y-2 text-center">
              <div className="flex justify-center lg:hidden mb-4">
                <div className="p-3 bg-gradient-to-r from-primary to-primary-glow rounded-xl shadow-lg">
                  <Warehouse className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Select Your Warehouse</CardTitle>
              <CardDescription>
                Choose your warehouse location to access the admin dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* South Warehouse */}
              <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold">South Warehouse</h3>
                      <p className="text-sm text-muted-foreground">Admin: Sarah Johnson</p>
                      <p className="text-xs text-muted-foreground">Atlanta, GA</p>
                    </div>
                    <Button 
                      onClick={() => handleLogin('South')}
                      disabled={isLoading}
                      variant="outline"
                    >
                      {isLoading ? "Signing in..." : "Access"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* East Warehouse */}
              <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold">East Warehouse</h3>
                      <p className="text-sm text-muted-foreground">Admin: Mike Chen</p>
                      <p className="text-xs text-muted-foreground">New York, NY</p>
                    </div>
                    <Button 
                      onClick={() => handleLogin('East')}
                      disabled={isLoading}
                      variant="outline"
                    >
                      {isLoading ? "Signing in..." : "Access"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground text-center mb-2">Demo System</p>
                <div className="text-xs space-y-1 text-center">
                  <p>Each warehouse has its own admin dashboard</p>
                  <p>Cross-warehouse rerouting requests and approvals</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
