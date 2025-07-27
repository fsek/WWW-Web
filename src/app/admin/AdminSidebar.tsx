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
	Users,
	UserPen,
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
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import { useAuthState, type RequiredPermission } from "@/lib/auth";
import { action, target } from "@/api";

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
				permissions: [[action.MANAGE, target.NEWS]],
				icon: Newspaper,
			},
			{
				title: "admin:events.self",
				url: "/admin/events",
				permissions: [[action.MANAGE, target.EVENT]],
				icon: Calendar,
			},
			{
				title: "admin:documents.self",
				url: "/admin/documents",
				permissions: [[action.MANAGE, target.DOCUMENT]],
				icon: FileText,
			},
			{
				title: "admin:car.self",
				url: "/admin/car",
				permissions: [[action.MANAGE, target.CAR]],
				icon: Car,
			},
			{
				title: "admin:permissions.self",
				url: "/admin/permissions",
				permissions: [[action.MANAGE, target.PERMISSION]],
				icon: FolderLock,
			},
			{
				title: "admin:member.self",
				url: "/admin/members",
				permissions: [[action.VIEW, target.USER]],
				icon: User,
			},
			// {
			// 	title: "admin:nollning.self",
			// 	url: "/admin/nollning",
			// 	permissions: [[action.MANAGE, target.NOLLNING]],
			// 	icon: Gauge,
			// },
		],
	},
	{
		title: "admin:categories.councils",
		entries: [
			{
				title: "admin:councils.self",
				url: "/admin/councils",
				permissions: [[action.MANAGE, target.COUNCIL]],
				icon: Users,
			},
			{
				title: "admin:user-posts.self",
				url: "/admin/user-posts",
				permissions: [[action.MANAGE, target.POST]],
				icon: UserPen,
			},
			{
				title: "admin:posts.self",
				url: "/admin/posts",
				permissions: [[action.MANAGE, target.POST]],
				icon: Briefcase,
			},
		],
	},
];

export function AdminSidebar() {
	const { t } = useTranslation();
	const permissions = useAuthState().getPermissions();

	return (
		<Sidebar className="text-foreground">
			<SidebarHeader className="px-6 py-4 mb-5 underline decoration-3 items-center">
				<h2 className="text-2xl font-bold">{t("admin:title")}</h2>
			</SidebarHeader>
			<SidebarContent className="px-2 gap-2">
				{groups.map(({ title, entries }, groupIndex) => (
					<Collapsible defaultOpen className="group/collapsible" key={title}>
						<SidebarGroup className="mb-0 p-0">
							<SidebarGroupLabel
								asChild
								className="text-base font-bold text-foreground py-1"
							>
								<CollapsibleTrigger className="w-full px-3 transition-colors rounded-md hover:bg-accent">
									{t(title)}
									<ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
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
															<SidebarMenuButton
																asChild
																className="h-9 px-3 rounded-md bg-transparent hover:bg-accent/15 hover:text-background"
															>
																<Link
																	href={item.url}
																	className="flex items-center gap-3"
																>
																	<item.icon className="h-4 w-4 shrink-0" />
																	<span className="text-sm">
																		{t(item.title)}
																	</span>
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
		</Sidebar>
	);
}
