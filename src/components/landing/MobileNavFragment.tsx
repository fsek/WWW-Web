"use client";

import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

const title = "WWW Web";

export const MobileNavFragment = () => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const { t } = useTranslation("landingpage");
	const navbarData = t("navbar.items", { returnObjects: true }) as Record<
		string,
		{ label: string; href: string }
	>;

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger className="px-2">
				<Menu
					className="flex md:hidden h-5 w-5"
					onClick={() => setIsOpen(true)}
				>
					{/* <span className="sr-only">Menu Icon</span> */}
				</Menu>
			</SheetTrigger>

			<SheetContent side={"right"}>
				<SheetHeader>
					<SheetTitle className="font-bold text-xl">{title}</SheetTitle>
				</SheetHeader>
				<nav className="flex flex-col justify-center items-center gap-2 mt-4">
					{Object.entries(navbarData).map(([key, item]) => (
						<Link
							key={key}
							href={item.href}
							onClick={() => setIsOpen(false)}
							className={buttonVariants({ variant: "ghost" })}
						>
							{item.label}
						</Link>
					))}
					<Link
						href="https://github.com/leoMirandaa/shadcn-landing-page.git"
						target="_blank"
						className={`w-[110px] border ${buttonVariants({
							variant: "secondary",
						})}`}
					>
						<GitHubLogoIcon className="mr-2 w-5 h-5" />
						Github
					</Link>
				</nav>
			</SheetContent>
		</Sheet>
	);
};
