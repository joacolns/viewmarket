import './globals.css';

export const metadata = {
  title: 'ViewMarket',
  description: 'Check cryptocurrency predictions',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className="bg-background text-foreground min-h-screen"
        style={{
          backgroundColor: 'var(--background)', // Asegura que el fondo use la variable CSS
          color: 'var(--foreground)', // Asegura que el texto use la variable CSS
        }}
      >
        {children}
      </body>
    </html>
  );
}