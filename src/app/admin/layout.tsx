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
			<NavBar />
			<SidebarProvider>
				<AdminSidebar />
				<main>
					<SidebarTrigger />
					{children}
				</main>
			</SidebarProvider>
		</LoginWall>
	);
}
