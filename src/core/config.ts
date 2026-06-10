export const forumUiConfig = {
  // Developer-only theme entrypoint: update this value to change the forum primary color.
  themeColor: "#2764ff",
};

export const apiClientConfig = {
  baseURL: import.meta.env.DEV ? "/api" : import.meta.env.VITE_API_URL,
};
