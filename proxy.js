import createMiddleware from "next-intl/middleware";

const intlMiddleware = createMiddleware({
  locales: ["en", "ar", "ur", "zh", "tr", "ms", "id"],
  defaultLocale: "en",
  localePrefix: "always"
});

export function proxy(request) {
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"]
};