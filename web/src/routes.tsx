import {
    Outlet,
    createRoute,
    createRootRoute,
    createRouter,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { lazy, Suspense, useEffect } from "react";
import { initTheme } from "./utils/theme";
import RouteFallback from "@/components/RouteFallback";
import { validateFilterSearch } from "./utils/validateFilterSearch";
const LazyHomePage = lazy(() => import("./pages/HomePage"));
const LazySummaryPage = lazy(() => import("./pages/SummaryPage"));
const LazyUploadPage = lazy(() => import("./pages/UploadPage"));
const LazyVerifyPage = lazy(() => import("./pages/VerifyPage"));
const LazyChartsPage = lazy(() => import("./pages/ChartsPage"));

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
            <Suspense fallback={<RouteFallback message="Loading Home..." />}>
                <LazyHomePage />
            </Suspense>
        );
    },
});

const uploadRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/upload",
    component: function Upload() {
        return (
            <Suspense fallback={<RouteFallback message="Loading Upload..." />}>
                <LazyUploadPage />
            </Suspense>
        );
    },
});

const summaryRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/summary",
    validateSearch: validateFilterSearch,
    component: function Summary() {
        return (
            <Suspense fallback={<RouteFallback message="Loading Summary..." />}>
                <LazySummaryPage />
            </Suspense>
        );
    },
});

const chartsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/charts",
    validateSearch: validateFilterSearch,
    component: function Charts() {
        return (
            <Suspense fallback={<RouteFallback message="Loading Charts..." />}>
                <LazyChartsPage />
            </Suspense>
        );
    },
});

const verifyRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/auth/verify",
    validateSearch: (search: Record<string, unknown>) => ({
        token: typeof search.token === "string" ? search.token : undefined,
    }),
    component: function Verify() {
        return (
            <Suspense
                fallback={<RouteFallback message="Checking your link..." />}
            >
                <LazyVerifyPage />
            </Suspense>
        );
    },
});

const routeTree = rootRoute.addChildren([
    indexRoute,
    summaryRoute,
    uploadRoute,
    chartsRoute,
    verifyRoute,
]);

export const router = createRouter({ routeTree });
