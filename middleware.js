@"
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'ar', 'ur', 'zh', 'tr', 'ms', 'id'],
  defaultLocale: 'en',
  localePrefix: 'always'
});

export const config = {
  matcher: ['/', '/(en|ar|ur|zh|tr|ms|id)/:path*', '/((?!api|_next|_vercel|.*\\\\..*).*)']
};
"@ | Out-File -FilePath middleware.js -Encoding utf8