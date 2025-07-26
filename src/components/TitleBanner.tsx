import Image from "next/image";

interface TitleBannerProps {
	title: string;
	imageUrl: string;
	className?: string;
}

/**
 * A reusable title component with a blurred background image and centered text.
 * @param title - The text for the title.
 * @param imageUrl - The URL for the background image.
 * @param className - Optional additional Tailwind classes.
 */
const TitleBanner: React.FC<TitleBannerProps> = ({
	title,
	imageUrl,
	className = "", // Default to an empty string if no extra classes are provided
}) => {
	return (
		// Root container: relative positioning context, full width, flex centering, overflow hidden
		<div
			className={`
        relative w-full min-h-[45vh] md:min-h-[35vh]
        flex justify-center items-center
        overflow-hidden
        ${className} // Merge additional classes
      `}
		>
			<Image
				src={imageUrl}
				fill
				objectFit="cover"
				loading="lazy"
				aria-hidden="true"
				alt=""
				className="absolute inset-0 bg-cover bg-center blur-md -z-10 scale-[1.1]"
			/>
			{/* Background Image Layer */}
			<div
				aria-hidden="true" // Hide decorative background from screen readers
			/>

			{/* Title Text */}
			<div className="relative text-5xl lg:text-6xl font-bold text-center px-5 inline-block text-orange-500 underline">
				{title}
			</div>
		</div>
	);
};

export default TitleBanner;
