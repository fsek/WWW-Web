"use client";

import Typewriter from "typewriter-effect";
import CustomTitle from "./CustomTitle";

interface TypewriterClientProps {
	strings: string[];
	className?: string;
}

export function TypewriterClient({
	strings,
	className = "",
}: TypewriterClientProps) {
	return (
		<span className={className}>
			<Typewriter
				options={{
					strings,
					autoStart: true,
					loop: true,
				}}
			/>
		</span>
	);
}

interface TitleWithTypewriterProps {
	staticText: string;
	strings: string[];
	className?: string;
}

export function TitleWithTypewriter({
	staticText,
	strings,
	className = "",
}: TitleWithTypewriterProps) {
	return (
		<CustomTitle
			className={`inline-flex items-center ${className}`}
			size={3}
			fullUnderline
		>
			<span>{staticText}</span>
			<span className="ml-2">
				<TypewriterClient strings={strings} />
			</span>
		</CustomTitle>
	);
}
