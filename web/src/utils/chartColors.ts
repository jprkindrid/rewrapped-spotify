// These are to match the Tailwind palette
export const CHART_COLORS = {
    // Spotify brand color - matches --color-spotify-green in index.css
    spotifyGreen: "oklch(0.77 0.212 148.7)",

    text: {
        light: "oklch(0.205 0 0)", // neutral-900
        dark: "oklch(0.97 0 0)", // neutral-100
    },

    axis: {
        light: "oklch(0.556 0 0)", // neutral-500
        dark: "oklch(0.708 0 0)", // neutral-400
    },

    grid: {
        light: "oklch(0.922 0 0)", // neutral-200
        dark: "oklch(0.269 0 0)", // neutral-800
    },

    background: {
        light: "oklch(1 0 0)", // white
        dark: "oklch(0.205 0 0)", // neutral-900
    },
} as const;
