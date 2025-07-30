"use client";

// TODO: When we get language to work properly in the future,
// (for example using cookies)
// we might want to switch these pages to be serverside
// for now it just works

// This also feels like a hacky way to do it, ideally there should be no need to
// use a page.tsx file, but rather just import the MDX files directly.
// This works only if a single file "page.mdx" is used, which breaks localization.

import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";

// Import images
import IMG_1 from "@/assets/landing/IMG_2785.jpg";
import IMG_2 from "@/assets/landing/IMG_0272.jpg";
import IMG_3 from "@/assets/landing/Mottagning-090.jpg";

// Import Carousel components
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselPrevious,
	CarouselNext,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";

const MDXPages: Record<string, React.ComponentType> = {
	sv: dynamic(() => import("./page.sv.mdx")),
	en: dynamic(() => import("./page.en.mdx")),
};

export default function AboutPage() {
	const { i18n } = useTranslation();
	const SelectedPage = MDXPages[i18n.language] ?? MDXPages.sv;

	const images = [
		{
			src: IMG_1,
			alt: "People dancing outside at a nollning event",
		},
		{
			src: IMG_2,
			alt: "People sitting and eating at tables",
		},
		{
			src: IMG_3,
			alt: "A group of people discussing and laughing together at a nollning event",
		},
	];

	return (
		<main className="p-4 md:p-8 min-h-screen">
			<div className="gap-8 items-stretch h-full ">
				<div className="relative w-full flex flex-col h-full mb-8 md:mb-0">
					<Carousel
						plugins={[
							Autoplay({
								delay: 7000,
							}),
						]}
						className="flex-grow"
					>
						<CarouselContent>
							{images.map((img) => (
								<CarouselItem key={img.src.src}>
									<div className="relative w-full h-64 md:h-96">
										<Image
											src={img.src}
											alt={img.alt}
											fill
											className="w-full h-full object-cover rounded-lg"
										/>
									</div>
								</CarouselItem>
							))}
						</CarouselContent>
						<CarouselPrevious className="top-[calc(100%+0.5rem)] left-0 translate-y-0 absolute" />
						<CarouselNext className="top-[calc(100%+0.5rem)] left-2 translate-x-full translate-y-0 absolute" />
					</Carousel>
				</div>
				<div className="w-full flex flex-col h-full">
					<SelectedPage />
				</div>
			</div>
		</main>
	);
}
