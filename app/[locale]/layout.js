import "../globals.css";

export default function LocaleLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div style={{ padding: 30, fontFamily: "Arial" }}>
          <h1>Tijarah.pk</h1>
          {children}
        </div>
      </body>
    </html>
  );
}