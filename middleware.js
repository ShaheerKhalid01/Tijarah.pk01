@"
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'ur', 'zh', 'id', 'tr', 'ms'],
  
  // Used when no locale matches
  defaultLocale: 'en',
  
  // Always show locale prefix in URL
  localePrefix: 'always'
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(en|ur|zh|id|tr|ms)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
"@ | Out-File -FilePath middleware.js -Encoding utf8