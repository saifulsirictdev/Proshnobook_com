// Harness-only browser routing; production Next routing is not replaced in the app.
export function useRouter() {
  return {
    push: (url: string) => {
      history.pushState({}, "", url);
      dispatchEvent(new Event("popstate"));
    },
  };
}
export function useSearchParams() {
  return new URLSearchParams(location.search);
}
