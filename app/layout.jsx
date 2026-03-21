export const metadata = {
  title: "ClearClause",
  description: "ClearClause Legal Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}