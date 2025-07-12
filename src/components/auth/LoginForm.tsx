
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Warehouse } from "lucide-react";

interface LoginFormProps {
  warehouse: 'South' | 'East';
  onLogin: (username: string, password: string) => Promise<boolean>;
  isLoading?: boolean;
}

const LoginForm = ({ warehouse, onLogin, isLoading = false }: LoginFormProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Login Error",
        description: "Please enter both username and password",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const success = await onLogin(username, password);
      
      if (success) {
        toast({
          title: "Login Successful",
          description: `Welcome to ${warehouse} Warehouse Dashboard`,
        });
        navigate(`/${warehouse.toLowerCase()}/dashboard`);
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid username or password",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const demoCredentials = warehouse === 'South' 
    ? { username: 'admin1', password: 'south123pass' }
    : { username: 'admin2', password: 'east123pass' };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className={`p-3 rounded-xl shadow-lg ${
            warehouse === 'South' ? 'bg-blue-500' : 'bg-green-500'
          }`}>
            <Warehouse className="h-6 w-6 text-white" />
          </div>
        </div>
        <CardTitle className="text-xl font-bold">{warehouse} Warehouse</CardTitle>
        <CardDescription>
          Admin Login for {warehouse} Operations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`username-${warehouse}`}>Username</Label>
            <Input
              id={`username-${warehouse}`}
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading || isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`password-${warehouse}`}>Password</Label>
            <Input
              id={`password-${warehouse}`}
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || isLoading}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || isLoading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs font-medium text-muted-foreground mb-1">Demo Credentials:</p>
          <div className="text-xs space-y-1">
            <p>Username: <code className="bg-muted px-1 rounded">{demoCredentials.username}</code></p>
            <p>Password: <code className="bg-muted px-1 rounded">{demoCredentials.password}</code></p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
