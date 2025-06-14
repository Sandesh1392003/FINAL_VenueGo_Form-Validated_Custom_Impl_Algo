import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import Loader from "../pages/common/Loader";

const ProtectedAdmin = ({ children }) => {
    const { isAuthenticated, user, loading } = useContext(AuthContext);

    // Still loading: show spinner
    if (loading || user === null) return <Loader />;

    // Not an admin: redirect
    if (!isAuthenticated || user.role !== "Admin") {
        return <Navigate to="/" />;
    }

    return children;
};

export default ProtectedAdmin;
