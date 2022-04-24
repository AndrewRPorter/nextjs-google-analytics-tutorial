export const pageview = (url) => {
  console.log("pageview");
  if (window !== undefined) {
    window.gtag("config", process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS, {
      page_path: url,
    });
  }
};

export const event = ({ action, params }) => {
  console.log("event");
  if (window !== undefined) {
    window.gtag("event", action, params);
  }
};
