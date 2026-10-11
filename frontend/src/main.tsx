import React from "react";
import ReactDOM from "react-dom/client";
import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiError } from "./api/client";
import { App } from "./App";
import { AuthProvider } from "./auth/AuthContext";
import { FeedbackProvider } from "./components/ui/Feedback";
import "./styles.css";

const queryClient: QueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Reintentar solo fallos de red o del servidor; un 4xx no va a cambiar por reintentar.
      retry: (failureCount, error) =>
        failureCount < 2 && !(error instanceof ApiError && error.status < 500),
    },
  },
  // Cualquier operación guardada puede cambiar los totales: los reportes se recargan.
  mutationCache: new MutationCache({
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reports"] }),
  }),
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <FeedbackProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </FeedbackProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
