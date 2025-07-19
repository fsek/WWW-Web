import type { MDXComponents } from 'mdx/types'
import Link from 'next/link'
import CustomTitle from '@/components/CustomTitle'
 
export function useMDXComponents(components: MDXComponents): MDXComponents {
  // We can override or extend the default MDX components here
  // if you include "prose dark:prose-invert" in your layouts className,
  // the default components will look nice
  return {
    ...components,
    a: ({ href, ...props }) => {
      // This makes internal links use Next.js's Link component
      // Check if it's an internal link
      if (href?.startsWith('/') || href?.startsWith('#')) {
        return <Link href={href} {...props} />
      }
      // External links
      return <a href={href} target="_blank" rel="noopener noreferrer" {...props} />
    },
    h1: (props) => <CustomTitle {...props} size={5} />,
    h2: (props) => <CustomTitle {...props} size={3} shortUnderline/>,
    h3: (props) => <CustomTitle {...props} size={2} noUnderline/>,
    h4: (props) => <CustomTitle {...props} size={1} noUnderline/>, // All my homies dislike h5 and h6
  }
}