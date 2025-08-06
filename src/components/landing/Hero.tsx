import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import TypewriterClient from "typewriter-effect";
import bannerImg from "@/assets/landing/banner.jpg";
import Image from "next/image";

import { useState, useEffect } from "react";

export const Hero = () => {
	const { t, i18n } = useTranslation("landingpage");
	const [reset, setReset] = useState(false);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		// This effect will run whenever the language changes
		setReset(true);
		const timer = setTimeout(() => {
			setReset(false);
		}, 10); // Small delay to ensure the component resets

		return () => clearTimeout(timer);
	}, [i18n.language]);

	return (
		<section className="relative items-center place-items-center py-20 md:py-60 md:h-screen gap-10 w-full flex flex-col">
			{/* Fullwidth background image (Is LCP) */}
			<Image
				src={bannerImg}
				alt="Banner image"
				fill
				loading="eager"
				priority={true}
				fetchPriority="high"
				className="absolute inset-0 w-full h-full object-cover z-0"
			/>
			{/* Dark overlay for text legibility */}
			<div
				className="absolute inset-0 w-full h-full z-10 pointer-events-none"
				style={{
					background:
						"linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.5) 100%)",
				}}
			/>

			<div className="container relative z-20 text-start space-y-6 px-10 md:px-0">
				<div className="backdrop-blur-xs bg-white/10 border border-white/20 rounded-2xl p-8 md:p-12 shadow-xl space-y-8 w-full lg:w-6/10">
					<div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold flex flex-wrap items-start gap-2 flex-col justify-start">
						<div className="inline text-primary">
							{t("hero.title_static")}
							{}
						</div>
						<div className="text-primary gap-3 justify-start whitespace-nowrap flex flex-row">
							{t("hero.title_dynamic_start")}
							{}
							{!reset && (
								<TypewriterClient
									options={{
										loop: true,
										delay: 75,
										wrapperClassName:
											"inline text-primary justify-start whitespace-nowrap",
										cursorClassName: "text-white animate-blink",
										cursor: "|",
									}}
									onInit={(typewriter) => {
										typewriter
											.typeString(t("hero.title_dynamic_1"))
											.pauseFor(2500)
											.deleteAll()
											.typeString(
												`<span style='color: #bebebe;'>${t("hero.title_dynamic_2")}</span>`,
											)
											.pauseFor(2500)
											.deleteAll()
											.typeString(
												`<span style='color: #4e9d2d;'>${t("hero.title_dynamic_3")}</span>`,
											)
											.pauseFor(2500)
											.deleteAll()
											.start();
									}}
								/>
							)}
						</div>
					</div>

					<p className="md:text-xl text-white md:w-10/12 mx-auto lg:mx-0">
						{t("hero.description")}
					</p>

					<div className="space-y-4 md:space-y-0 md:space-x-4 pt-4">
						<Button className="w-full md:w-auto">
							<Link href="/nollning">{t("hero.new-student")}</Link>
						</Button>
						<Button className="w-full md:w-auto">
							<Link href="/foretag">{t("hero.companies")}</Link>
						</Button>
						<Button variant="outline" className="w-full md:w-auto">
							<Link href="/home">{t("hero.login")}</Link>
						</Button>
					</div>
				</div>
			</div>
			{/* Scroll down arrow effect */}
			<div className="absolute bottom-30 left-1/2 -translate-x-1/2 z-30 hidden md:flex md:flex-col items-center">
				<span className="text-white text-3xl animate-bounce">&#8595;</span>
				<span className="sr-only">{t("hero.scroll-down")}</span>
			</div>
		</section>
	);
};
