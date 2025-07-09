import nextMdx from "@next/mdx";
import remarkGfm from "remark-gfm";

/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "export", // Outputs a Single-Page Application (SPA).
	distDir: "./dist", // Changes the build output directory to `./dist/`.
	images: {
		unoptimized: true, // Next.js image optimization is unsupported when static export is enabled.
	},
	// Configure `pageExtensions` to include MDX files
	pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
};

const withMDX = nextMdx({
	extension: /\.(md|mdx)$/,
	options: {
		remarkPlugins: [remarkGfm],
	},
});
export default withMDX(nextConfig);
