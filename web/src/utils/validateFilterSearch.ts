export function validateFilterSearch(search: Record<string, unknown>) {
    return {
        demo: (search.demo as boolean | undefined) ?? false,
        from: search.from as string | undefined,
        to: search.to as string | undefined,
        sortBy: search.sortBy as string | undefined,
        interval: search.interval as string | undefined,
        query: search.query as string | undefined,
    };
}
