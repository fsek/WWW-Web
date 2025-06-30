"use client";

import { type FC, useEffect, useState, useRef } from "react";

interface CustomTitleProps {
	text?: string;
	className?: string;
	size?: 1 | 2 | 3 | 4 | 5 | 6;
	children?: React.ReactNode;
	fullUnderline?: boolean;
}

const CustomTitle: FC<CustomTitleProps> = ({
	text,
	className,
	size = 3,
	children,
	fullUnderline,
}) => {
	const [animationState, setAnimationState] = useState<
		"initial" | "text-width" | "full-width"
	>("initial");
	const textRef = useRef<HTMLDivElement>(null);
	const underlineRef = useRef<HTMLDivElement>(null);

	const getSizeClass = () => {
		return size === 1 ? "text-xl" : `text-${size}xl`;
	};

	useEffect(() => {
		if (fullUnderline) return;

		if (!textRef.current) return;

		// First set the underline to match text width without animation
		if (underlineRef.current && textRef.current) {
			const width = textRef.current.offsetWidth;
			underlineRef.current.style.width = `${width}px`;
			underlineRef.current.style.transition = "none";
		}

		// Small delay to ensure the text width is applied before animation
		requestAnimationFrame(() => {
			setAnimationState("text-width");
		});

		// Then enable the transition and animate to full width
		const timeoutId = setTimeout(() => {
			if (underlineRef.current) {
				underlineRef.current.style.transition = "width 700ms ease-in-out";
				setAnimationState("full-width");
			}
		}, 1000);

		return () => {
			clearTimeout(timeoutId);
		};
	}, [fullUnderline]);

	return (
		<div className="w-full">
			<div
				ref={textRef}
				className={`inline-block font-bold text-left text-orange-500 ${getSizeClass()} ${className}`}
			>
				{text ?? children ?? "Default title"}
			</div>
			<div
				ref={underlineRef}
				className="h-0.5 bg-orange-500 mt-1"
				style={{
					width: animationState === "full-width" ? "100%" : "auto",
				}}
			/>
		</div>
	);
};

export default CustomTitle;
