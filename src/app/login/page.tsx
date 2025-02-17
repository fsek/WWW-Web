import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="max-w-md bg-neutral-50 p-4 rounded-lg shadow-xs border w-full">
				<LoginForm />
			</div>
		</div>
	);
}
