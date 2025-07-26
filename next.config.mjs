import nextMdx from "@next/mdx";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeMathjaxChtml from "rehype-mathjax/chtml";

/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone",
	distDir: "./dist", // Changes the build output directory to `./dist/`.
	// Configure `pageExtensions` to include MDX files
	pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
};

const withMDX = nextMdx({
	extension: /\.(md|mdx)$/,
	options: {
		remarkPlugins: [remarkGfm, remarkMath],
		rehypePlugins: [
			[
				rehypeMathjaxChtml,
				{
					chtml: {
						// Font required, see https://www.npmjs.com/package/rehype-mathjax
						fontURL:
							"https://cdn.jsdelivr.net/npm/mathjax@3/es5/output/chtml/fonts/woff-v2",
						scale: 1.3,
					},
				},
			],
		],
	},
});
export default withMDX(nextConfig);
