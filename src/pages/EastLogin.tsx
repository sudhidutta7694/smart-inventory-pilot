
import { useAuthEast } from "@/contexts/AuthEastContext";
import LoginForm from "@/components/auth/LoginForm";
import { Navigate } from "react-router-dom";

const EastLogin = () => {
  const { login, isAuthenticated } = useAuthEast();

  if (isAuthenticated) {
    return <Navigate to="/east/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LoginForm 
          warehouse="East" 
          onLogin={login}
        />
      </div>
    </div>
  );
};

export default EastLogin;
