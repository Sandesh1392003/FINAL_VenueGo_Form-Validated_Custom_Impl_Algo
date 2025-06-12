import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import Loader from "../pages/common/Loader";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user , loading} = useContext(AuthContext);

  if(loading) return <Loader/>

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (user === null) {
    return <div>Loading...</div>; // Prevent redirect before user loads
  }

  return children;
};

export default ProtectedRoute;
