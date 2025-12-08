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
import {
	LogInIcon,
	ExternalLink,
	UserIcon,
	ShieldIcon,
	Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { usePathname, useRouter } from "next/navigation";
import {
	type DefaultError,
	useMutation,
	useQuery,
} from "@tanstack/react-query";
import {
	getMeOptions,
	authCookieLogoutMutation,
	getGuildMeetingOptions,
} from "@/api/@tanstack/react-query.gen";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
	Sheet,
	SheetContent,
	SheetTrigger,
	SheetClose,
	SheetTitle,
} from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import VerificationReminder from "./VerificationReminder";
import MemberBanner from "./MemberBanner";

type NavItem = {
	self: string;
	desc: string;
	href?: string;
};

type NavSection = {
	self: string | NavItem;
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
			// Set a cookie to indicate the user is not authenticated, just for the middleware to check if it should redirect
			// obviously this is not secure enough for real authentication
			document.cookie =
				"auth_status=unauthenticated; path=/; SameSite=Strict; expires=Thu, 01 Jan 1970 00:00:00 GMT";
			router.push("/");
		},
		onError: (error: DefaultError) => {
			toast.error(error.message || t("navbar.logoutError", "Logout failed"));
		},
	});

	const handleLogout = React.useCallback(() => {
		logoutMutation.mutate({});
	}, [logoutMutation]);

	const showAdmin =
		user?.is_member && Array.isArray(user.posts) && user.posts.length > 0;

	return (
		<header className="sticky top-0 z-50 w-full border-transparent  bg-white/50 dark:bg-background/40  backdrop-blur-md">
			<div className="flex flex-col">
				<div className="xl:container flex items-center justify-between h-20 px-4 mx-auto">
					<div className="flex items-center gap-4">
						<Link href="/home" className="flex items-center">
							<FLogga className="size-14 mr-3" />
						</Link>
						<div className="hidden lg:flex">
							<NavBarMenu />
						</div>
					</div>
					<div className="flex items-center gap-2">
						<LanguageSwitcher />
						<ThemeToggle />

						{/* Desktop user menu */}
						<div className="hidden lg:flex">
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
									<span>{t("login.login")}</span>
								</Button>
							)}
						</div>

						{/* Mobile hamburger menu */}
						<div className="lg:hidden">
							<Sheet>
								<SheetTrigger asChild>
									<Button variant="ghost" size="icon">
										<Menu className="h-5 w-5" />
										<span className="sr-only">Toggle menu</span>
									</Button>
								</SheetTrigger>
								<SheetContent
									side="right"
									className="w-[300px] sm:w-[400px] overflow-auto"
								>
									<VisuallyHidden>
										<SheetTitle className="text-xl font-semibold mx-auto mt-3">
											Mobile Navigation
										</SheetTitle>
									</VisuallyHidden>
									<div
										className="flex flex-col gap-6 py-4"
										aria-labelledby="mobile-nav-title"
									>
										<div className="px-2">
											<NavBarMenu isMobile />
										</div>

										<div className="px-2 pt-4 border-t">
											{user ? (
												<div className="space-y-4">
													<div className="flex items-center gap-2">
														<UserIcon className="w-5 h-5" />
														<span className="font-medium">
															{`${user.first_name} ${user.last_name}`.trim() ||
																user.email ||
																"User"}
														</span>
													</div>
													<div className="space-y-2">
														<SheetClose asChild>
															<Link
																href="/account-settings"
																className="block w-full"
															>
																<Button
																	variant="outline"
																	className="w-full justify-start"
																>
																	{t("navbar.account-settings")}
																</Button>
															</Link>
														</SheetClose>
														{user.is_verified === false && (
															<SheetClose asChild>
																<Link href="/verify" className="block w-full">
																	<Button
																		variant="outline"
																		className="w-full justify-start"
																	>
																		{t("navbar.verify")}
																	</Button>
																</Link>
															</SheetClose>
														)}
														{showAdmin && (
															<SheetClose asChild>
																<Link href="/admin" className="block w-full">
																	<Button
																		variant="outline"
																		className="w-full justify-start flex items-center gap-2"
																	>
																		<ShieldIcon className="w-4 h-4" />
																		<span>{t("navbar.admin", "Admin")}</span>
																	</Button>
																</Link>
															</SheetClose>
														)}
														<Button
															onClick={() => {
																handleLogout();
																// Find and click the SheetClose trigger to close the sheet
																const closeButton = document.querySelector(
																	"[data-radix-collection-item]",
																);
																if (closeButton instanceof HTMLElement)
																	closeButton.click();
															}}
															variant="outline"
															className="w-full justify-start"
														>
															{t("navbar.logout", "Logout")}
														</Button>
													</div>
												</div>
											) : (
												<SheetClose asChild>
													<Button className="w-full" onClick={loginHandler}>
														<LogInIcon className="mr-2" />
														{t("login.login")}
													</Button>
												</SheetClose>
											)}
										</div>
									</div>
								</SheetContent>
							</Sheet>
						</div>
					</div>
				</div>
				<VerificationReminder showBanner={user?.is_verified === false} />
				<MemberBanner showBanner={user?.is_member === false} />
			</div>
			<Toaster position="top-center" richColors />
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

export function NavBarMenu({ isMobile = false }: { isMobile?: boolean }) {
	const { t } = useTranslation();
	const navbarData = t("navbar", { returnObjects: true }) as Record<
		string,
		NavSection
	>;

	const sections = Object.entries(navbarData).filter(
		([, value]) =>
			typeof value === "object" && value !== null && !Array.isArray(value),
	);

	const { data: guildMeetingData } = useQuery({
		...getGuildMeetingOptions(),
		refetchOnWindowFocus: false,
	});

	if (guildMeetingData?.is_active) {
		sections.push([
			"guildMeeting",
			{
				self: {
					self: t("navbar.guild-meeting"),
					desc: "",
					href: "/guild-meeting",
				},
			},
		]);
	}

	const isStandaloneItem = (
		section: NavSection,
	): section is { self: NavItem } => {
		return typeof section.self !== "string";
	};

	if (isMobile) {
		// Mobile vertical layout
		return (
			<div className="space-y-4">
				{sections.map(([sectionKey, section]) => {
					// Standalone item
					if (isStandaloneItem(section)) {
						const item = section.self;
						return (
							<div key={sectionKey} className="space-y-2">
								<SheetClose asChild>
									<Link
										href={item.href || "#"}
										className={cn(
											"flex items-center gap-2 px-2 py-2 text-sm rounded-md transition-colors hover:bg-accent font-medium",
											(!item.href || item.href === "#") &&
												"opacity-50 cursor-not-allowed pointer-events-none",
										)}
									>
										<span>{item.self}</span>
										{item.href?.startsWith("https://") && (
											<ExternalLink className="w-4 h-4" />
										)}
									</Link>
								</SheetClose>
							</div>
						);
					}

					// Dropdown menu items
					const items = Object.entries(section).filter(
						([key]) => key !== "self",
					) as [string, NavItem][];

					return (
						<div key={sectionKey} className="space-y-2">
							<div>
								<h3 className="font-medium text-sm text-muted-foreground px-2">
									{typeof section.self === "string" ? section.self : ""}
								</h3>
								<div className="border-b border-border my-2" />
							</div>
							<div className="space-y-1">
								{items.map(([itemKey, item]) => (
									<SheetClose key={itemKey} asChild>
										<Link
											href={item.href || "#"}
											className={cn(
												"flex items-center gap-2 px-2 py-2 text-sm rounded-md transition-colors hover:bg-accent",
												(!item.href || item.href === "#") &&
													"opacity-50 cursor-not-allowed pointer-events-none",
											)}
										>
											<span>{item.self}</span>
											{item.href?.startsWith("https://") && (
												<ExternalLink className="w-4 h-4" />
											)}
										</Link>
									</SheetClose>
								))}
							</div>
						</div>
					);
				})}
			</div>
		);
	}

	// Desktop horizontal layout with dropdowns or standalone
	return (
		<div className="flex items-center bg-transparent rounded-md px-2 py-1">
			<NavigationMenu
				className="
                  w-full max-w-full flex items-center
                  custom-navmenu
                "
			>
				{sections.map(([sectionKey, section]) => {
					// Standalone item support for desktop
					if (isStandaloneItem(section)) {
						const item = section.self;
						return (
							<NavigationMenuList
								key={sectionKey}
								className="flex items-center bg-transparent"
							>
								<NavigationMenuItem className="bg-transparent hover:bg-transparent">
									<NavigationMenuLink asChild>
										<Link
											href={item.href || "#"}
											className={cn(
												"submenu-trigger !bg-transparent !hover:bg-transparent border-2 border-transparent hover:border-foreground/30 font-medium px-4 py-2",
												(!item.href || item.href === "#") &&
													"opacity-50 cursor-not-allowed pointer-events-none",
											)}
										>
											{item.self}
											{item.href?.startsWith("https://") && (
												<ExternalLink
													className="inline w-6 h-6 ml-1"
													aria-label="External link"
												/>
											)}
										</Link>
									</NavigationMenuLink>
								</NavigationMenuItem>
							</NavigationMenuList>
						);
					}

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
									{typeof section.self === "string" ? section.self : ""}
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
