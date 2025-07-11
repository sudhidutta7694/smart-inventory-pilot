
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/EnhancedAuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect to the appropriate dashboard based on user's warehouse
      if (user.warehouse === 'South') {
        navigate('/south/dashboard', { replace: true });
      } else if (user.warehouse === 'East') {
        navigate('/east/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } else {
      // Redirect to login if not authenticated
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};

export default Index;
