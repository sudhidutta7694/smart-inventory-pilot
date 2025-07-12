
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Warehouse, TrendingUp, ShieldCheck, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/20">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-primary to-primary/80 rounded-xl shadow-lg">
              <Warehouse className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            SupplyChain AI
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Intelligence Platform for Multi-Warehouse Operations
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage your South and East warehouses simultaneously with AI-powered insights, 
            real-time inventory tracking, and seamless cross-warehouse operations.
          </p>
        </div>

        {/* Warehouse Login Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          <Card className="shadow-xl hover:shadow-2xl transition-shadow cursor-pointer" 
                onClick={() => navigate('/south/login')}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                  <Warehouse className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl text-blue-600">South Warehouse</CardTitle>
              <CardDescription>
                Access the South Warehouse dashboard and management tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/south/login')}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                Login to South Warehouse
              </Button>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs font-medium text-blue-700 mb-1">Demo Credentials:</p>
                <div className="text-xs text-blue-600 space-y-1">
                  <p>Username: <code className="bg-blue-100 px-1 rounded">admin1</code></p>
                  <p>Password: <code className="bg-blue-100 px-1 rounded">south123pass</code></p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl hover:shadow-2xl transition-shadow cursor-pointer"
                onClick={() => navigate('/east/login')}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                  <Warehouse className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl text-green-600">East Warehouse</CardTitle>
              <CardDescription>
                Access the East Warehouse dashboard and management tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/east/login')}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                Login to East Warehouse
              </Button>
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-xs font-medium text-green-700 mb-1">Demo Credentials:</p>
                <div className="text-xs text-green-600 space-y-1">
                  <p>Username: <code className="bg-green-100 px-1 rounded">admin2</code></p>
                  <p>Password: <code className="bg-green-100 px-1 rounded">east123pass</code></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Platform Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="p-3 bg-success/10 rounded-lg inline-block mb-4">
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
              <h3 className="font-semibold mb-2">Predictive Analytics</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered forecasting and demand prediction across warehouses
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="p-3 bg-primary/10 rounded-lg inline-block mb-4">
                <Warehouse className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Cross-Warehouse Operations</h3>
              <p className="text-sm text-muted-foreground">
                Seamless inventory rerouting and coordination between locations
              </p>
            </div>

            <div className="text-center p-6">
              <div className="p-3 bg-warning/10 rounded-lg inline-block mb-4">
                <ShieldCheck className="h-8 w-8 text-warning" />
              </div>
              <h3 className="font-semibold mb-2">Real-time Monitoring</h3>
              <p className="text-sm text-muted-foreground">
                Live updates and notifications for critical inventory events
              </p>
            </div>
          </div>
        </div>

        {/* Demo Instructions */}
        <div className="max-w-2xl mx-auto mt-12">
          <Card className="bg-muted/50">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Demo Instructions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>• <strong>Open two browser tabs</strong> to simulate parallel admin sessions</p>
              <p>• <strong>Tab 1:</strong> Login to South Warehouse</p>
              <p>• <strong>Tab 2:</strong> Login to East Warehouse</p>
              <p>• <strong>Demo rerouting:</strong> Create reroute requests in one warehouse and approve them in the other</p>
              <p>• <strong>Real-time sync:</strong> Watch notifications and updates appear instantly across warehouses</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
