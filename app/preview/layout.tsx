export const metadata = {
  title: 'Device Preview',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
};

export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
