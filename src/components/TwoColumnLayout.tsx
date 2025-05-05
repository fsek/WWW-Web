// interface TwoColumnLayoutProps {
// 	/** Content for the wider (2/3) left column */
// 	leftColumnContent: React.ReactNode;
// 	/** Content for the narrower (1/3) right column */
// 	rightColumnContent: React.ReactNode;
// 	/** Optional additional CSS classes for the container */
// 	className?: string;
// 	/** Optional gap class (e.g., 'gap-4', 'gap-8') */
// 	gap?: string;
// }

// /**
//  * A responsive two-column layout component using Tailwind CSS.
//  * Splits content into a 2/3 width left column and a 1/3 width right column on medium screens and up.
//  * Stacks columns vertically on smaller screens.
//  */
// const TwoColumnLayout: React.FC<TwoColumnLayoutProps> = ({
// 	leftColumnContent,
// 	rightColumnContent,
// 	className = "gap-12",
// }) => {
// 	return (
// 		<div className={`flex flex-col md:flex-row ${className}`}>
// 			<div className="w-full md:w-2/3">{leftColumnContent}</div>

// 			<div className="w-full md:w-1/3">{rightColumnContent}</div>
// 		</div>
// 	);
// };

// export default TwoColumnLayout;

import type React from "react";

interface TwoColumnLayoutProps {
	/** Content for the wider left column */
	leftColumnContent: React.ReactNode;
	/** Content for the narrower right column */
	rightColumnContent: React.ReactNode;
	/** Flex-grow ratio for the left side (e.g. 2 for twice as big as right=1) */
	leftFlex?: number;
	/** Flex-grow ratio for the right side */
	rightFlex?: number;
	/** Optional additional CSS classes for the container */
	className?: string;
	/** Optional gap class (e.g. 'gap-4', 'gap-8') */
	gap?: string;
}

/**
 * A responsive two-column layout:
 * - flex-col on small screens (children get w-full)
 * - flex-row on md+ with inline flex-grow to control proportions
 */
const TwoColumnLayout: React.FC<TwoColumnLayoutProps> = ({
	leftColumnContent,
	rightColumnContent,
	leftFlex = 2,
	rightFlex = 1,
	className = "",
	gap = "gap-12",
}) => {
	return (
		<div className={`flex flex-col md:flex-row ${gap} ${className}`}>
			<div
				className="w-full"
				style={{ flexGrow: leftFlex, flexBasis: 0, flexShrink: 1 }}
			>
				{leftColumnContent}
			</div>
			<div
				className="w-full"
				style={{ flexGrow: rightFlex, flexBasis: 0, flexShrink: 1 }}
			>
				{rightColumnContent}
			</div>
		</div>
	);
};

export default TwoColumnLayout;
