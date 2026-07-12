import ImageDisplay from "@/components/ImageDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

type InfoThumbnailCardProps = {
	title: string;
	description: string | null;
	imageId: number | null;
	emptyDescriptionText: string;
	href: string;
	descriptionMaxChars?: number;
};

function truncateDescription(text: string, maxChars: number) {
	const normalizedText = text.replace(/\s+/g, " ").trim();
	if (normalizedText.length <= maxChars) {
		return normalizedText;
	}

	return `${normalizedText.slice(0, maxChars).trimEnd()}...`;
}

export default function InfoThumbnailCard({
	title,
	description,
	imageId,
	emptyDescriptionText,
	href,
	descriptionMaxChars = 90,
}: InfoThumbnailCardProps) {
	const truncatedDescription = description
		? truncateDescription(description, descriptionMaxChars)
		: null;

	return (
		<Card className="h-full gap-1 overflow-hidden py-0 transition-shadow hover:shadow-md">
			{imageId ? (
				<div className="relative h-36 w-full bg-muted">
					<ImageDisplay
						type="associated_img"
						imageId={imageId}
						alt={`Associated image for ${title}`}
						className="object-cover"
						size="medium"
						fill
					/>
				</div>
			) : null}
			<CardHeader className="min-w-0 pt-4 pb-1">
				<CardTitle className="min-w-0 text-lg leading-tight">
					<Link
						href={href}
						className="block w-full truncate hover:underline"
						title={title}
					>
						{title}
					</Link>
				</CardTitle>
			</CardHeader>
			<CardContent className="pb-5">
				{truncatedDescription ? (
					<p
						className="text-sm leading-relaxed"
						title={description ?? undefined}
					>
						{truncatedDescription}
					</p>
				) : (
					<p className="text-sm text-muted-foreground italic">
						{emptyDescriptionText}
					</p>
				)}
			</CardContent>
		</Card>
	);
}
