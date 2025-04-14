
interface TwoColumnLayoutProps {
  /** Content for the wider (2/3) left column */
  leftColumnContent: React.ReactNode;
  /** Content for the narrower (1/3) right column */
  rightColumnContent: React.ReactNode;
  /** Optional additional CSS classes for the container */
  className?: string;
  /** Optional gap class (e.g., 'gap-4', 'gap-8') */
  gap?: string;
}

/**
 * A responsive two-column layout component using Tailwind CSS.
 * Splits content into a 2/3 width left column and a 1/3 width right column on medium screens and up.
 * Stacks columns vertically on smaller screens.
 */
const TwoColumnLayout: React.FC<TwoColumnLayoutProps> = ({
  leftColumnContent,
  rightColumnContent,
  className = 'gap-12',
}) => {
  return (
    <div className={`flex flex-col md:flex-row ${className}`}>

      <div className="w-full md:w-2/3">
        {leftColumnContent}
      </div>

      <div className="w-full md:w-1/3">
        {rightColumnContent}
      </div>

    </div>
  );
};

export default TwoColumnLayout;