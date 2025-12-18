import { useEffect, useRef } from 'react';

export const useSyncScroll = (refs: React.RefObject<HTMLElement>[]) => {
    const isScrolling = useRef<number | null>(null);

    useEffect(() => {
        const handlers = refs.map((ref, index) => {
            const element = ref.current;
            if (!element) return null;

            const handleScroll = () => {
                // Prevent recursive scrolling
                if (isScrolling.current !== null && isScrolling.current !== index) return;

                isScrolling.current = index;

                requestAnimationFrame(() => {
                    refs.forEach((otherRef, otherIndex) => {
                        if (index !== otherIndex && otherRef.current) {
                            otherRef.current.scrollTop = element.scrollTop;
                        }
                    });
                    // Reset after a short delay (debouncing roughly) or check scroll state?
                    // A simple timeout usually suffices for this "leader-follower" pattern
                    setTimeout(() => {
                        if (isScrolling.current === index) {
                            isScrolling.current = null;
                        }
                    }, 50);
                });
            };

            element.addEventListener('scroll', handleScroll, { passive: true });
            return () => element.removeEventListener('scroll', handleScroll);
        });

        return () => {
            handlers.forEach(cleanup => cleanup && cleanup());
        };
    }, [refs]);
};
