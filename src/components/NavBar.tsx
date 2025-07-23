"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import FLogga from "@/assets/f-logga";
import Link from "next/link";
import { LogInIcon, ExternalLink, UserIcon, ShieldIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
	getMeOptions,
	authCookieLogoutMutation,
} from "@/api/@tanstack/react-query.gen";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

type NavItem = {
	self: string;
	desc: string;
	href?: string;
};

type NavSection = {
	self: string;
} & Record<string, NavItem>;

export function NavBar() {
	const { t } = useTranslation();
	const router = useRouter();
	const { data: user } = useQuery({
		...getMeOptions(),
		refetchOnWindowFocus: false,
	});
	const loginHandler = useLoginHandler();
	const logoutMutation = useMutation({
		...authCookieLogoutMutation({ credentials: "include" }),
		onSuccess: () => {
			router.push("/");
		},
		onError: (error) => {
			console.error("Logout failed:", error);
		},
	});

	const handleLogout = React.useCallback(() => {
		logoutMutation.mutate({});
	}, [logoutMutation]);

	const showAdmin =
		user?.is_member && Array.isArray(user.posts) && user.posts.length > 0;

	return (
		<header className="sticky top-0 z-50 w-full border-b border-border bg-white/50 dark:bg-background/40 dark:border-b-slate-700 backdrop-blur-md">
			<div className="container flex items-center justify-between h-20 px-4 mx-auto">
				<div className="flex items-center gap-4">
					<Link href="/home" className="flex items-center">
						<FLogga className="size-14 mr-3" />
					</Link>
					<div className="hidden md:flex">
						<NavBarMenu />
					</div>
				</div>
				<div className="flex items-center gap-2">
					<LanguageSwitcher />
					<ThemeToggle />
					{user ? (
						<>
							{showAdmin && (
								<Button
									variant="outline"
									className="ml-2 flex items-center gap-2"
									asChild
								>
									<Link href="/admin">
										<ShieldIcon className="w-5 h-5" />
										<span>{t("navbar.admin", "Admin")}</span>
									</Link>
								</Button>
							)}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="outline"
										className="ml-2 flex items-center gap-2"
									>
										<UserIcon className="w-5 h-5" />
										<span>
											{`${user.first_name} ${user.last_name}`.trim() ||
												user.email ||
												"User"}
										</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align="end"
									className="py-2 px-2 min-w-[180px]"
								>
									<DropdownMenuItem asChild>
										<Link href="/account-settings">
											{t("navbar.account-settings")}
										</Link>
									</DropdownMenuItem>
									{user.is_verified === false && (
										<DropdownMenuItem asChild>
											<Link href="/verify">{t("navbar.verify")}</Link>
										</DropdownMenuItem>
									)}
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={handleLogout}>
										{t("navbar.logout", "Logout")}
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</>
					) : (
						<Button className="ml-2" onClick={loginHandler}>
							<LogInIcon className="mr-1" />
							<span className="hidden sm:inline">{t("login.login")}</span>
						</Button>
					)}
				</div>
			</div>
			{/* Mobile menu below */}
			<div className="flex md:hidden px-4 pb-2">
				<NavBarMenu />
			</div>
		</header>
	);
}

// Helper hook for login button handler
function useLoginHandler() {
	const pathname = usePathname();
	const router = useRouter();
	return React.useCallback(() => {
		router.push(`/login?next=${pathname}`);
	}, [router, pathname]);
}

export function NavBarMenu() {
	const { t } = useTranslation();
	const navbarData = t("navbar", { returnObjects: true }) as Record<
		string,
		NavSection
	>;

	const sections = Object.entries(navbarData).filter(
		([, value]) =>
			typeof value === "object" && value !== null && !Array.isArray(value),
	);

	function onNavChange() {
		setTimeout(() => {
			const triggers = document.querySelectorAll(
				'[data-slot="navigation-menu-trigger"][data-state="open"]',
			);
			const dropdowns = document.querySelectorAll(
				'[data-slot="navigation-menu-viewport"][data-state="open"]',
			);

			if (!triggers.length || !dropdowns.length) return;

			const padding = 16;
			const { x, width } = (triggers[0] as HTMLElement).getBoundingClientRect();
			const dropdown = dropdowns[0] as HTMLElement;
			const menuWidth = dropdown.children[0].clientWidth;
			const parentLeft =
				dropdown.offsetParent?.getBoundingClientRect().left || 0;

			let viewportLeft = x + width / 2 - menuWidth / 2;
			if (viewportLeft < padding) {
				viewportLeft = padding;
			} else if (viewportLeft + menuWidth > window.innerWidth - padding) {
				viewportLeft = window.innerWidth - menuWidth - padding;
			}

			document.documentElement.style.setProperty(
				"--menu-left-position",
				`${viewportLeft - parentLeft}px`,
			);
		});
	}

	return (
		<div className="flex items-center bg-transparent rounded-md px-2 py-1">
			<NavigationMenu
				onValueChange={onNavChange}
				className="
                  w-full max-w-full flex items-center
                  custom-navmenu
                "
			>
				{sections.map(([sectionKey, section]) => {
					const items = Object.entries(section).filter(
						([key]) => key !== "self",
					) as [string, NavItem][];
					return (
						<NavigationMenuList
							key={sectionKey}
							className="flex items-center bg-transparent"
						>
							<NavigationMenuItem className="bg-transparent hover:bg-transparent">
								<NavigationMenuTrigger className="submenu-trigger !bg-transparent !hover:bg-transparent border-2 border-transparent hover:border-foreground/30">
									{section.self}
								</NavigationMenuTrigger>
								<NavigationMenuContent>
									<ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
										{items.map(([itemKey, item]) => (
											<ListItem
												key={itemKey}
												title={item.self}
												href={item.href || "#"}
												className="bg-transparent hover:bg-transparent border-2 border-transparent hover:border-foreground/30"
											>
												{item.desc}
											</ListItem>
										))}
									</ul>
								</NavigationMenuContent>
							</NavigationMenuItem>
						</NavigationMenuList>
					);
				})}
			</NavigationMenu>
		</div>
	);
}

const ListItem = React.forwardRef<
	React.ElementRef<"a">,
	React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
	const isDisabled = !props.href || props.href === "#";
	return (
		<li>
			<NavigationMenuLink asChild>
				<Link
					ref={ref}
					href={props.href ?? "#"}
					className={cn(
						"block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
						isDisabled && "opacity-50 cursor-not-allowed pointer-events-none",
						className,
					)}
					{...props}
				>
					<div className="text-sm font-medium leading-none flex items-center gap-1">
						{title}
						{!isDisabled &&
							typeof props.href === "string" &&
							props.href.startsWith("https://") && (
								<ExternalLink
									className="inline w-6 h-6"
									aria-label="External link"
								/>
							)}
					</div>
					<p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
						{children}
					</p>
				</Link>
			</NavigationMenuLink>
		</li>
	);
});
ListItem.displayName = "ListItem";
