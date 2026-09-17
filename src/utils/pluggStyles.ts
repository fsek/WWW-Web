// Shared class strings for the plugg pages

export const pluggDisplay =
	"font-extrabold [font-stretch:72%] tracking-[-0.01em]";

const highlighterStroke =
	"bg-[linear-gradient(rgb(var(--forange)/0.55),rgb(var(--forange)/0.55))] bg-no-repeat bg-[position:0_88%] box-decoration-clone";

export const pluggHighlight = `${highlighterStroke} bg-[length:100%_0.38em]`;

// Only visible while the tab is active, for use inside a Radix tab trigger
export const pluggHighlightActiveTab = `${highlighterStroke} bg-[length:0_0.38em] group-data-[state=active]:bg-[length:100%_0.38em]`;

// Swipes in on hover/focus of the nearest `group`
export const pluggHighlightHover = `${highlighterStroke} bg-[length:0%_0.4em] transition-[background-size] duration-[220ms] ease-[ease-out] group-hover:bg-[length:100%_0.4em] group-focus-visible:bg-[length:100%_0.4em] motion-reduce:transition-none`;

export const pluggGraphPaper =
	"bg-[linear-gradient(hsl(var(--border))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border))_1px,transparent_1px)] bg-[length:24px_24px] bg-[position:-1px_-1px] [mask-image:linear-gradient(to_bottom,black_20%,transparent_100%)]";
