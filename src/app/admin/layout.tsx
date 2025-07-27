import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import LoginWall from "@/components/LoginWall";
import { NavBar } from "@/components/NavBar";

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<LoginWall>
			<div className="flex w-full h-full">
				<SidebarProvider>
					<AdminSidebar />
					<div className="flex flex-col flex-1 h-full">
						<NavBar />
						<main className="flex-1 flex flex-col w-full h-full">
							<SidebarTrigger />
							{children}
						</main>
					</div>
				</SidebarProvider>
			</div>
		</LoginWall>
	);
}
