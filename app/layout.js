import './globals.css';

export const metadata = {
  title: 'ViewMarket',
  description: 'Check market predictions',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className="bg-background text-foreground min-h-screen"
        style={{
          backgroundColor: 'var(--background)',
          color: 'var(--foreground)',
        }}
      >
        {children}
      </body>
    </html>
  );
}