import {
    Outlet,
    createRoute,
    createRootRoute,
    createRouter,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import SummaryPage from "./pages/SummaryPage";
import { lazy, Suspense, useEffect } from "react";
import { initTheme } from "./utils/theme";
import UploadPage from "./pages/UploadPage";
import HomePage from "./pages/HomePage";

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

        return <HomePage />;
    },
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
    component: function Charts() {
        return (
            <Suspense
                fallback={
                    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-neutral-950">
                        <div className="text-xl font-semibold text-neutral-600 dark:text-neutral-400">
                            Loading Charts...
                        </div>
                    </div>
                }
            >
                <LazyChartsPage />
            </Suspense>
        );
    },
});

const routeTree = rootRoute.addChildren([
    indexRoute,
    summaryRoute,
    uploadRoute,
    chartsRoute,
]);

export const router = createRouter({ routeTree });
