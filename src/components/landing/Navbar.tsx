import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuList,
} from "@/components/ui/navigation-menu";

import { buttonVariants } from "@/components/ui/button";
import DarkModeToggle from "@/components/ThemeToggle";
import { UserIcon } from "lucide-react";
import { MobileNavFragment } from "@/components/landing/MobileNavFragment";
import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import FLogga from "@/assets/f-logga";

type NavItem = {
	label: string;
	href: string;
	className?: string;
};

export const Navbar = () => {
	const { t } = useTranslation("landingpage");

	const navbarData = t("navbar.items", { returnObjects: true }) as Record<
		string,
		NavItem
	>;

	return (
		<header className="sticky border-b-[1px] top-0 z-40 w-full bg-white/50 dark:border-b-slate-700 dark:bg-background/40 backdrop-blur-md">
			<NavigationMenu className="mx-auto">
				<NavigationMenuList className="container h-20 px-4 w-screen flex justify-between ">
					<NavigationMenuItem className="font-bold flex">
						<Link
							href="/"
							className="ml-2 font-bold text-3xl flex flex-row items-center"
						>
							<FLogga className="size-14 mr-5" />
						</Link>
					</NavigationMenuItem>

					{/* desktop */}
					<nav className="hidden md:flex gap-2">
						{Object.entries(navbarData).map(([itemKey, item]) => (
							<Link
								href={item.href}
								key={itemKey}
								className={`text-lg lg:text-xl ${buttonVariants({
									variant: "ghost",
								})}`}
							>
								<span className={`${item.className || ""}`}>{item.label}</span>
							</Link>
						))}
					</nav>

					<div className="flex gap-0 md:gap-2">
						<LanguageSwitcher />
						<DarkModeToggle />
						{/* Desktop */}
						<div className="hidden md:flex">
							<Link
								href="/login?next=/home"
								className={`border ${buttonVariants({ variant: "default" })}`}
							>
								<UserIcon className="w-5 h-5" />
								{t("navbar.login")}
							</Link>
						</div>
						{/* Mobile */}
						<div className="md:hidden flex">
							<MobileNavFragment />
						</div>
					</div>
				</NavigationMenuList>
			</NavigationMenu>
		</header>
	);
};
