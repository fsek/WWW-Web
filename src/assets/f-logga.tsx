// FLogga.tsx
import Image from "next/image";
import fLoggaSrc from "@/assets/f-logga.svg";
import { cn } from "@/lib/utils"; // if you’re using a utility to combine class names

interface FLoggaProps {
	className?: string;
}

export default function FLogga({ className = "" }: FLoggaProps) {
	return (
		<div className={cn(className)}>
			<Image src={fLoggaSrc} alt="" width={100} height={100} />
		</div>
	);
}
