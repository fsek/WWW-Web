export default function MdxLayout({ children }: { children: React.ReactNode }) {
  // This is a good place to change default prose styles
  return (
    <div className="prose dark:prose-invert max-w-none">
      {children}
    </div>
  )
}