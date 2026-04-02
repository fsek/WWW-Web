import nextMdx from "@next/mdx";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone",
	// Configure `pageExtensions` to include MDX files
	pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
};

const withMDX = nextMdx({
	extension: /\.(md|mdx)$/,
	options: {
		remarkPlugins: [remarkGfm, remarkMath],
		rehypePlugins: [[rehypeKatex, { strict: true, throwOnError: true }]],
	},
});
export default withMDX(nextConfig);
