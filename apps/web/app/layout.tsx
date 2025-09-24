export const metadata = {
  title: "Thermomix Recipe Genius",
  description: "Generate recipes and save to Cookidoo"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}