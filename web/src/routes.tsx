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
import ChartsPage from "./pages/ChartsPage";

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

const uploadRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/upload",
    component: UploadPage,
});

const summaryRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/summary",
    validateSearch: (search: Record<string, unknown>) => ({
        demo: (search.demo as boolean | undefined) ?? false,
    }),
    component: SummaryPage,
});

const chartsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/charts",
    validateSearch: (search: Record<string, unknown>) => ({
        demo: (search.demo as boolean | undefined) ?? false,
    }),
    component: ChartsPage,
});

const routeTree = rootRoute.addChildren([
    indexRoute,
    signInRoute,
    summaryRoute,
    uploadRoute,
    chartsRoute,
]);

export const router = createRouter({ routeTree });
