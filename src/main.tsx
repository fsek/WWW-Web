import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import ReactDOM from "react-dom/client";
import "./index.css";
import AdminPage from "./routes/admin/Admin";
import { AuthService, client } from "./api";
import { OpenAPI } from "./api/core/OpenAPI";

client.setConfig({baseUrl: "http://127.0.0.1:8000"})

const token = await AuthService.authJwtLogin({
	body: { username: "boss@fsektionen.se", password: "dabdab" },
});
OpenAPI.interceptors.request.use((request) => {
	(request.headers as Headers).set(
		"Authorization",
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		`${token.data!.token_type} ${token.data!.access_token}`,
	);
	return request;
});

const router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
	},
	{
		path: "/admin/*",
		element: <AdminPage />,
	},
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>,
);
