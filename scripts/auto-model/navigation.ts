// Harness-only browser routing; production Next routing is not replaced in the app.
function navigate(url: string, replace = false) {
  if (replace) history.replaceState({}, "", url);
  else history.pushState({}, "", url);
  dispatchEvent(new Event("popstate"));
}
const router = {
  push: (url: string) => navigate(url),
  replace: (url: string) => navigate(url, true),
};
export function useRouter() {
  return router;
}
export function useSearchParams() {
  return new URLSearchParams(location.search);
}
