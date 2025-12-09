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
	type LucideProps,
	Users,
	UserPen,
	List,
	Apple,
	Award,
	House,
	Mail,
	ChefHat,
	ListMusic,
	Music3,
	Images,
	Gavel,
	Vote,
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
import { ActionEnum, TargetEnum } from "@/api";

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
				permissions: [[ActionEnum.MANAGE, TargetEnum.NEWS]],
				icon: Newspaper,
			},
			{
				title: "admin:events.self",
				url: "/admin/events",
				permissions: [[ActionEnum.MANAGE, TargetEnum.EVENT]],
				icon: Calendar,
			},
			{
				title: "admin:documents.self",
				url: "/admin/documents",
				permissions: [[ActionEnum.MANAGE, TargetEnum.DOCUMENT]],
				icon: FileText,
			},
			{
				title: "admin:albums.self",
				url: "/admin/albums",
				permissions: [[ActionEnum.MANAGE, TargetEnum.GALLERY]],
				icon: Images,
			},
			{
				title: "admin:member.self",
				url: "/admin/members",
				permissions: [[ActionEnum.VIEW, TargetEnum.USER]],
				icon: User,
			},
			{
				title: "admin:door_access.self",
				url: "/admin/user-door-access",
				permissions: [[ActionEnum.MANAGE, TargetEnum.USER_DOOR_ACCESS]],
				icon: Users,
			},
			{
				title: "admin:cafe_shifts.self",
				url: "/admin/cafe-shifts",
				permissions: [[ActionEnum.MANAGE, TargetEnum.CAFE]],
				icon: ChefHat,
			},
		],
	},
	{
		title: "admin:categories.bookings",
		entries: [
			{
				title: "admin:car.self",
				url: "/admin/car",
				permissions: [[ActionEnum.MANAGE, TargetEnum.CAR]],
				icon: Car,
			},
			{
				title: "admin:room_bookings.self",
				url: "/admin/room-bookings",
				permissions: [[ActionEnum.MANAGE, TargetEnum.ROOM_BOOKINGS]],
				icon: House,
			},
		],
	},
	{
		title: "admin:categories.councils",
		entries: [
			{
				title: "admin:councils.self",
				url: "/admin/councils",
				permissions: [[ActionEnum.MANAGE, TargetEnum.COUNCIL]],
				icon: Users,
			},
			{
				title: "admin:user-posts.self",
				url: "/admin/user-posts",
				permissions: [[ActionEnum.MANAGE, TargetEnum.POST]],
				icon: UserPen,
			},
			{
				title: "admin:posts.self",
				url: "/admin/posts",
				permissions: [[ActionEnum.MANAGE, TargetEnum.POST]],
				icon: Briefcase,
			},
		],
	},
	{
		title: "admin:categories.songs",
		entries: [
			{
				title: "admin:song_categories.self",
				url: "/admin/song-categories",
				permissions: [[ActionEnum.MANAGE, TargetEnum.SONG]],
				icon: ListMusic,
			},
			{
				title: "admin:songs.self",
				url: "/admin/songs",
				permissions: [[ActionEnum.MANAGE, TargetEnum.SONG]],
				icon: Music3,
			},
		],
	},
	{
		title: "admin:categories.nollning",
		entries: [
			{
				title: "admin:nollning.self_all",
				url: "/admin/nollning",
				permissions: [[ActionEnum.MANAGE, TargetEnum.NOLLNING]],
				icon: List,
			},
			{
				title: "admin:nollning.self_current",
				url: "/admin/nollning/admin-nollning?id=current",
				permissions: [[ActionEnum.MANAGE, TargetEnum.NOLLNING]],
				icon: Apple,
			},
			{
				title: "admin:nollning.self_mission",
				url: "/admin/nollning/admin-nollning/adventure-missions?id=current",
				permissions: [[ActionEnum.MANAGE, TargetEnum.ADVENTURE_MISSIONS]],
				icon: Award,
			},
		],
	},
	{
		title: "admin:categories.elections",
		entries: [
			{
				title: "admin:visible_election.self",
				url: "/admin/elections/visible",
				permissions: [[ActionEnum.MANAGE, TargetEnum.ELECTION]],
				icon: Vote,
			},
			{
				title: "admin:elections.self",
				url: "/admin/elections",
				permissions: [[ActionEnum.MANAGE, TargetEnum.ELECTION]],
				icon: Gavel,
			},
			{
				title: "admin:guild_meeting.self",
				url: "/admin/guild-meeting",
				permissions: [[ActionEnum.MANAGE, TargetEnum.GUILD_MEETING]],
				icon: Users,
			},
		],
	},
	{
		title: "admin:categories.spider",
		entries: [
			{
				title: "admin:permissions.self",
				url: "/admin/permissions",
				permissions: [[ActionEnum.MANAGE, TargetEnum.PERMISSION]],
				icon: FolderLock,
			},
			{
				title: "admin:mail_aliases.self",
				url: "/admin/mail-aliases",
				permissions: [[ActionEnum.MANAGE, TargetEnum.MAIL_ALIAS]],
				icon: Mail,
			},
		],
	},
];

export function AdminSidebar() {
	const { t } = useTranslation();
	const permissions = useAuthState().getPermissions();

	// Filter out groups and entries the user doesn't have permission to see
	const visibleGroups = groups
		.map((group) => {
			return {
				...group,
				// Also filter out entries
				entries: group.entries.filter((item) =>
					permissions.hasRequiredPermissions(item.permissions ?? []),
				),
			};
		})
		.filter((group) => group.entries.length > 0);

	return (
		<Sidebar className="text-foreground ">
			<SidebarHeader className="px-6 py-4 decoration-3 items-center bg-[#fa7909]">
				<h2 className="text-2xl mt-2 transition-colors">{t("admin:title")}</h2>
			</SidebarHeader>
			<SidebarContent className="px-2 gap-2 bg-[#fa7909]">
				{visibleGroups.map(({ title, entries }, groupIndex) => (
					<Collapsible defaultOpen className="group/collapsible" key={title}>
						<SidebarGroup className="mb-0 p-0">
							<SidebarGroupLabel
								asChild
								className="text-base text-foreground py-1 "
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
												return (
													<SidebarMenuItem key={item.title}>
														<SidebarMenuButton
															asChild
															className="h-9 px-3 rounded-md bg-transparent hover:bg-accent/15 hover:text-background hover:bg-gradient-to-r hover:to-[#f9203d] hover:from-[#fa7909] hover:bg-[length:100%] hover:bg-no-repeat hover:bg-bottom"
														>
															<Link
																href={item.url}
																className="flex items-center gap-3"
															>
																<item.icon className="h-4 w-4 shrink-0 transition-colors" />
																<span className="text-sm transition-colors">
																	{t(item.title)}
																</span>
															</Link>
														</SidebarMenuButton>
													</SidebarMenuItem>
												);
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
