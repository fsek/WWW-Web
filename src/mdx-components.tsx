import type { MDXComponents } from 'mdx/types'
 
export function useMDXComponents(components: MDXComponents): MDXComponents {
  // We can override or extend the default MDX components here
  return {
    ...components,
  }
}