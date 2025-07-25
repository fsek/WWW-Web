"use client";

import {
	Calendar,
	ChevronDown,
	Newspaper,
	FileText,
	Car,
	Briefcase,
	FolderLock,
	User,
	Gauge,
	type LucideProps,
} from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import { useAuthState, type RequiredPermission } from "@/lib/auth";

type AdminSidebarEntry = {
	title: string;
	url: string;
	permissions?: RequiredPermission[];
	icon: ForwardRefExoticComponent<
		Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
	>;
};
type AdminGroup = { title: string; entries: AdminSidebarEntry[] };

const groups: AdminGroup[] = [
	{
		title: "admin:categories.general",
		entries: [
			{
				title: "admin:news.self",
				url: "/admin/news",
				permissions: [["manage", "News"]],
				icon: Newspaper,
			},
			{
				title: "admin:events.self",
				url: "/admin/events",
				permissions: [["manage", "Event"]],
				icon: Calendar,
			},
			{
				title: "admin:documents.self",
				url: "/admin/documents",
				permissions: [["manage", "Document"]],
				icon: FileText,
			},
			{
				title: "admin:car.self",
				url: "/admin/car",
				permissions: [["manage", "Car"]],
				icon: Car,
			},
			{
				title: "admin:permissions.self",
				url: "/admin/permissions",
				permissions: [["manage", "Permission"]],
				icon: FolderLock,
			},
			{
				title: "admin:member.self",
				url: "/admin/members",
				permissions: [["view", "User"]],
				icon: User,
			},
			{
				title: "admin:nollning.self",
				url: "/admin/nollning",
				permissions: [["manage", "Nollning"]],
				icon: Gauge,
			},
		],
	},
	{
		title: "admin:categories.councils",
		entries: [
			{
				title: "admin:councils.self",
				url: "/admin/councils",
				permissions: [["manage", "Council"]],
				icon: Briefcase,
			},
			{
				title: "admin:user-posts.self",
				url: "/admin/user-posts",
				permissions: [["manage", "Post"]],
				icon: Briefcase,
			},
			{
				title: "admin:posts.self",
				url: "/admin/posts",
				permissions: [["manage", "Post"]],
				icon: Briefcase,
			},
		],
	},
];

export function AdminSidebar() {
	const { t } = useTranslation();
	const permissions = useAuthState().getPermissions();

	return (
		<Sidebar>
			<SidebarHeader>{t("admin:title")}</SidebarHeader>
			<SidebarContent>
				{groups.map(({ title, entries }) => (
					<Collapsible defaultOpen className="group/collapsible" key={title}>
						<SidebarGroup>
							<SidebarGroupLabel asChild>
								<CollapsibleTrigger>
									{t(title)}
									<ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
								</CollapsibleTrigger>
							</SidebarGroupLabel>
							<CollapsibleContent>
								<SidebarGroup>
									<SidebarGroupContent>
										<SidebarMenu>
											{entries.map((item) => {
												if (
													permissions.hasRequiredPermissions(
														item.permissions ?? [],
													)
												) {
													return (
														<SidebarMenuItem key={item.title}>
															<SidebarMenuButton asChild>
																<Link href={item.url}>
																	{<item.icon />}
																	<span>{t(item.title)}</span>
																</Link>
															</SidebarMenuButton>
														</SidebarMenuItem>
													);
												}
											})}
										</SidebarMenu>
									</SidebarGroupContent>
								</SidebarGroup>
							</CollapsibleContent>
						</SidebarGroup>
					</Collapsible>
				))}
			</SidebarContent>
			<div className="absolute bottom-0 left-0 w-full flex flex-row items-center justify-end gap-2 px-4 py-3 border-t border-sidebar-border bg-sidebar z-10">
				<LanguageSwitcher />
				<ThemeToggle />
			</div>
		</Sidebar>
	);
}
