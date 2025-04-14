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
			<Image className="absolute inset-0 size-full z-0 object-cover" src={mh} alt="Matematikhuset, LTH" />
			<div className="relative max-w-md bg-neutral-50/75 backdrop-blur-md p-4 rounded-lg shadow-xs border w-full z-10 space-y-10 flex flex-col items-center" ref={ref}>
				<FLogga className="size-25" />
				<LoginForm />
			</div>
		</div>
	);
}
