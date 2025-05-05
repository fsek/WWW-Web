import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      {children}
      <Footer />
    </div>
  );
}
