// FLogga.tsx
import Image from "next/image";
import fLoggaSrc from "@/assets/f-logga.svg";
import { cn } from "@/lib/utils"; // if you’re using a utility to combine class names

interface FLoggaProps {
	className?: string;
}

export default function FLogga({ className }: FLoggaProps) {
	return (
		<Image
			src={fLoggaSrc}
			className={cn("size-25", className)}
			alt="F-sektionen logo"
		/>
	);
}
