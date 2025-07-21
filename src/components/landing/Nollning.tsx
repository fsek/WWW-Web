import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";

import IMG_1 from "@/assets/landing/IMG_2785.jpg";
import IMG_2 from "@/assets/landing/IMG_0272.jpg";
import IMG_3 from "@/assets/landing/Mottagning-090.jpg";

export const Nollning = () => {
	const { t } = useTranslation("landingpage");

	const images = [
		{
			src: IMG_1.src,
			alt: "People dancing outside at a nollning event",
		},
		{
			src: IMG_2.src,
			alt: "People sitting and eating at tables",
		},
		{
			src: IMG_3.src,
			alt: "A group of people discussing and laughing together at a nollning event",
		},
	];

	return (
		<section className="container grid lg:grid-cols-2 place-items-center py-10 md:py-15 gap-10 px-10 md:px-0">
			{/* Image carousel on the left */}
			<div className="relative w-full">
				<Carousel
					plugins={[
						Autoplay({
							delay: 7000,
						}),
					]}
				>
					<CarouselContent>
						{images.map((img) => (
							<CarouselItem key={img.src}>
								<div className="relative w-full h-72 md:h-96">
									<Image
										src={img.src}
										alt={img.alt}
										height={400}
										width={600}
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

			<div className="text-center lg:text-start space-y-6 transform transition-all duration-700 md:hover:translate-y-[-10px]">
				<div className="text-5xl md:text-6xl font-bold flex flex-wrap items-start gap-2 flex-col justify-start pointer-events-none md:pointer-events-auto">
					<div className="inline to-primary-light from-primary bg-gradient-to-t text-transparent bg-clip-text transform transition-all duration-500 hover:scale-105 hover:rotate-1 cursor-default">
						{t("nollning.title")}
					</div>
				</div>

				<p className="text-xl text-muted-foreground md:w-10/12 mx-auto lg:mx-0 transform transition-all duration-500 hover:text-foreground">
					{t("nollning.description")}
				</p>

				<div className="space-y-4 md:space-y-0 md:space-x-4">
					<Button className="w-full md:w-auto transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 hover:rotate-1 active:scale-95 group relative overflow-hidden">
						<div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-light opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
						<Link
							href="/nollning"
							className="relative z-10 transition-colors duration-300 group-hover:text-white"
						>
							{t("nollning.button")}
						</Link>
					</Button>
				</div>
			</div>
		</section>
	);
};
