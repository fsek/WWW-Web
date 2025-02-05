import QueryClientProvider from "@/components/QueryClientProvider";
import "./globals.css";
import { AuthService, client } from "@/api";

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	client.setConfig({ baseUrl: "http://host.docker.internal:8000" });

	// FIXME: TEMPORARY
	const token = await AuthService.authJwtLogin({
		body: { username: "boss@fsektionen.se", password: "dabdab" },
	});

	const myHeaders = new Headers();

	myHeaders.append(
		"Authorization",
		`${token.data?.token_type} ${token.data?.access_token}`,
	);

	client.setConfig({ headers: myHeaders });

	return (
		<QueryClientProvider>
			<html lang="en">
				<head>
					<title>F-sektionen WWW-Web</title>
					<link rel="preconnect" href="https://fonts.googleapis.com" />
					<link rel="preconnect" href="https://fonts.gstatic.com" />
					<link
						href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
						rel="stylesheet"
					/>
				</head>
				<body>
					<div id="root">{children}</div>
				</body>
			</html>
		</QueryClientProvider>
	);
}
