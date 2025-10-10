import {
  Outlet,
  createRoute,
  createRootRoute,
  createRouter,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import SignInPage from "./pages/SignInPage";
import SummaryPage from "./pages/SummaryPage";
import { useEffect } from "react";
import { initTheme } from "./utils/theme";
import UploadPage from "./pages/UploadPage";

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

    return (
      <div className="p-2">
        <h3>Welcome Home!</h3>
      </div>
    );
  },
});

const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sign-in",
  component: SignInPage,
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
