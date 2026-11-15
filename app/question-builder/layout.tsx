/** Public landing page; each private builder subtree has its own authenticated layout. */
export default function QuestionBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
