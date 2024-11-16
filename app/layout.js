import './globals.css';

export const metadata = {
  title: 'ViewMarket - Crypto Prices',
  description: 'Check cryptocurrency predictions',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground min-h-screen">
        {children}
      </body>
    </html>
  )
}