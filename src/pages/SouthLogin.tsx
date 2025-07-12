
import { useAuthSouth } from "@/contexts/AuthSouthContext";
import LoginForm from "@/components/auth/LoginForm";
import { Navigate } from "react-router-dom";

const SouthLogin = () => {
  const { login, isAuthenticated } = useAuthSouth();

  if (isAuthenticated) {
    return <Navigate to="/south/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LoginForm 
          warehouse="South" 
          onLogin={login}
        />
      </div>
    </div>
  );
};

export default SouthLogin;
