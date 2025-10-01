import { useEffect, useRef, useState } from "react";

/**
 * Hook that detects when an element is in or near the viewport using IntersectionObserver
 * @param rootMargin - Margin around the viewport to trigger early loading (default: "200px" for preloading)
 * @returns [ref, isInView] - ref to attach to element and boolean indicating if element is in viewport
 */
export function useInViewport<T extends Element = HTMLDivElement>(
	rootMargin = "200px",
): [React.RefObject<T>, boolean] {
	const ref = useRef<T>(null);
	const [isInView, setIsInView] = useState(false);

	useEffect(() => {
		const element = ref.current;
		if (!element) return;

		// Create observer
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					// Once the element is in view, we keep it loaded
					if (entry.isIntersecting) {
						setIsInView(true);
					}
				}
			},
			{
				rootMargin, // Load images before they come into view
			},
		);

		observer.observe(element);

		return () => {
			observer.disconnect();
		};
	}, [rootMargin]);

	return [ref, isInView];
}
