import './globals.css';

export const metadata = {
  title: 'Ocho al Morocho',
  description: 'Juego de mesa social para reuniones',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
