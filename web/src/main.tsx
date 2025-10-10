import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { rootRoute, indexRoute, signInRoute, summaryRoute } from "./routes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";

const routeTree = rootRoute.addChildren([
  indexRoute,
  signInRoute,
  summaryRoute,
]);

const router = createRouter({ routeTree });

// if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
//   document.documentElement.classList.add("dark");
// } else {
//   document.documentElement.classList.remove("dark");
// }

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient();

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>
  );
}
