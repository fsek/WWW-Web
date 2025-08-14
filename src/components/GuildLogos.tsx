import Image, { type StaticImageData } from "next/image";

type Logo = {
	href: string;
	src: StaticImageData;
	alt: string;
};

export default function GuildLogos({ logos }: { logos: Logo[] }) {
	return (
		<div className="flex flex-wrap gap-2">
			{logos.map((logo) => (
				<a
					key={logo.href}
					href={logo.href}
					target="_blank"
					rel="noopener noreferrer"
					className="block"
				>
					<Image
						src={logo.src}
						alt={logo.alt}
						width={100}
						height={100}
						className="h-[100px] w-auto"
					/>
				</a>
			))}
		</div>
	);
}
