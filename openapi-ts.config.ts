import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
	input: "openapi.cleaned.json",
	//input: "http://127.0.0.1:8000",
	//input: "http://localhost:8000/openapi.json",
	output: { path: "src/api", lint: "biome", format: "biome" },
	parser: {
		transforms: {
			enums: "root", // <- make enums reusable
		},
	},
	plugins: [
		"@hey-api/schemas",
		{
			dates: true,
			name: "@hey-api/transformers",
		},
		{
			asClass: true,
			name: "@hey-api/sdk",
			// Really jank unfortunately, there is no way to preprocess input,
			// so we have to find the index of '-' in the generated name and take the subslice from that index onwards
			// Now almost all routes have nice names (except auth, but it was extra jank to begin with)
			// methodNameBuilder: (operation) => {
			// 	//console.log(operation.id);
			// 	const str = operation.id.replace(/^[a-z]+/, "");
			// 	//console.log(str.substring(1));
			// 	return str[0].toLowerCase() + str.substring(1); // First letter shold be lowercase, but since we stripped the first word we do this manually
			// },
			transformer: true,
		},
		{
			name: "@hey-api/typescript",
			enums: "javascript",
		},
		{
			name: "@tanstack/react-query",
			exportFromIndex: true,
		},
		"zod",
		{ name: "@hey-api/client-fetch", exportFromIndex: true },
	],
});
