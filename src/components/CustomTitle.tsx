"use client";

import { type FC, useEffect, useState, useRef } from "react";

interface CustomTitleProps {
	text?: string;
	className?: string;
	size?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
	children?: React.ReactNode;
	fullUnderline?: boolean;
	shortUnderline?: boolean; 
	noUnderline?: boolean;
}

const CustomTitle: FC<CustomTitleProps> = ({
	text,
	className,
	size = 3,
	children,
	fullUnderline,
	shortUnderline = false,
	noUnderline = false,
}) => {
	const [animationState, setAnimationState] = useState<
		"initial" | "text-width" | "full-width"
	>("initial");
	const textRef = useRef<HTMLDivElement>(null);
	const underlineRef = useRef<HTMLDivElement>(null);

	const getSizeClass = () => {
		const sizeMap = { // I don't know why this is needed, but text-5xl and up didn't work for me
			1: "text-xl",
			2: "text-2xl",
			3: "text-3xl",
			4: "text-4xl",
			5: "text-5xl",
			6: "text-6xl",
			7: "text-7xl",
			8: "text-8xl",
			9: "text-9xl"
		};
		return sizeMap[size] || "text-3xl";
	};

	useEffect(() => {
		if (fullUnderline || noUnderline) return;

		if (!textRef.current) return;

		// First set the underline to match text width without animation
		if (underlineRef.current && textRef.current) {
			const width = textRef.current.offsetWidth;
			underlineRef.current.style.width = `${width}px`;
			underlineRef.current.style.transition = "none";
		}

		if (shortUnderline) return;

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
	}, [fullUnderline, shortUnderline, noUnderline]);

	return (
		<div className="w-full py-5">
			<div
				ref={textRef}
				className={`inline-block font-bold text-left text-orange-500 ${getSizeClass()} ${className}`}
			>
				{text ?? children ?? "Default title"}
			</div>
			{!noUnderline && (
				<div
					ref={underlineRef}
					className="h-0.5 bg-orange-500 mt-1"
					style={{
						width: animationState === "full-width" ? "100%" : "auto",
					}}
				/>
			)}
		</div>
	);
};

export default CustomTitle;
