import { useState, useEffect } from "react";

const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536,
} as const; // Tailwind definitions

type Breakpoint = keyof typeof breakpoints;

const useBreakpoint = (breakpoint: Breakpoint) => {
    const [isBelow, setIsBelow] = useState(false);

    useEffect(() => {
        const check = () =>
            setIsBelow(window.innerWidth < breakpoints[breakpoint]);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, [breakpoint]);

    return isBelow;
};

export default useBreakpoint;
