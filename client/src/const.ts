// Send the browser to the sign-in page, preserving where the user was headed.
export const goToLogin = (redirectTo?: string) => {
  const target =
    redirectTo ?? window.location.pathname + window.location.search;
  window.location.assign(`/login?redirect=${encodeURIComponent(target)}`);
};
