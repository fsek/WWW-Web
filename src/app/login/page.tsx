"use client";

import LoginForm from "@/components/LoginForm";
import mh from "@/assets/mh.jpg";
import Image from "next/image";
import FLogga from "@/assets/f-logga";
import { useRef } from "react";

export default function LoginPage() {
	const ref = useRef<HTMLDivElement>(null);

	return (
		<div className="relative min-h-screen w-full flex p-4 sm:p-8 items-center justify-center">
			<Image
				className="absolute inset-0 size-full z-0 object-cover"
				src={mh}
				alt="Matematikhuset, LTH"
			/>
			{/* Dark overlay for dark mode */}
			<div className="pointer-events-none absolute inset-0 z-0 dark:bg-black/60" />
			<div
				className="relative max-w-md bg-neutral-50/75 dark:bg-neutral-800/75 backdrop-blur-md p-4 rounded-lg shadow-xs border w-full z-10 space-y-10 flex flex-col items-center"
				ref={ref}
			>
				<FLogga className="size-25" />
				<LoginForm />
			</div>
		</div>
	);
}
