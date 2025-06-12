import { createContext, useEffect, useState } from "react";
import { useMutation, useQuery, useApolloClient } from "@apollo/client";
import { Cloudinary } from "@cloudinary/url-gen";
import { ME_QUERY } from "../components/Graphql/query/meGql";
import { LOGOUT_USER } from "../components/Graphql/mutations/AuthGql";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
  const CID = new Cloudinary({ cloud: { cloudName: CLOUD_NAME } });
  const client = useApolloClient();

  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("authToken"));
  const [user, setUser] = useState(null);

  const { data, loading, error, refetch } = useQuery(ME_QUERY, {
    fetchPolicy: "network-only",
    skip: !isAuthenticated && !localStorage.getItem("authToken"),
  });

  const [logoutUser] = useMutation(LOGOUT_USER);

  useEffect(() => {
    if (isAuthenticated) {
      refetch().then(({ data }) => {
        if (data?.me) {
          setUser(data.me);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      });
    }
  }, [isAuthenticated]);

  const login = async (token) => {
    localStorage.setItem("authToken", token);
    setIsAuthenticated(true);
    const { data } = await refetch();
    if (data?.me) setUser(data.me);
  };

  const logout = async () => {
    try {
      const response = await logoutUser();
      const { success } = response.data?.logout || {};

      if (success) {
        localStorage.removeItem("authToken");
        await client.resetStore();
        setIsAuthenticated(false);
        setUser(null);
      } else {
        console.error("Logout failed");
      }
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  const refreshUser = async () => {
    const { data } = await refetch();
    if (data?.me) setUser(data.me);
    else {
      setUser(null);
      setIsAuthenticated(false);
    }
  };


  return (
    <AuthContext.Provider value={{ CID, isAuthenticated, user, loading, error, CLOUD_NAME, login, logout, refetch, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
