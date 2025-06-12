import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

// Use environment variable for API URL
const apiUrl = import.meta.env.VITE_GRAPHQL_API || "http://localhost:4000/graphql";

const httpLink = createHttpLink({
  uri: apiUrl,
  credentials: "include", // Include cookies for authentication
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;
