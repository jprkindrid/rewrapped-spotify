import {
  Outlet,
  createRoute,
  createRootRoute,
  createRouter,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import SummaryPage from "./pages/SummaryPage";
import { useEffect } from "react";
import { initTheme } from "./utils/theme";
import UploadPage from "./pages/UploadPage";
import HomePage from "./pages/HomePage";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: function Index() {
    useEffect(() => {
      initTheme();
    }, []);

    return <HomePage />;
  },
});

const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/home",
  component: HomePage,
});

const summaryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/summary",
  component: SummaryPage,
});

const uploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/upload",
  component: UploadPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  signInRoute,
  summaryRoute,
  uploadRoute,
]);

export const router = createRouter({ routeTree });
