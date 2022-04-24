# Next.js Google Analytics Setup

Basic tutorial showing you how to utilize Google Analytics in Next.js.

## Steps

### 1. Create a Google Analytics account and setup a datastream

Go to https://analytics.google.com/analytics/web and create an account/property for your application.

After your account is created, should have a web property and a web steam created with a measurement ID. This measurement ID should be of the form: `G-XXXXXXXXX`. We will want to add this to a `.env` file. Create a new `.env.local` file at the base of your project and add the following value: `NEXT_PUBLIC_GOOGLE_ANALYTICS=G-XXXXXXXXX`. `XXXXXXXXX` should be the copied value from Google Analytics.

### 2. Add gtag.js to our site

This is the google tagging framework that allows us to send event data to Google Analytics. [This guide](https://developers.google.com/analytics/devguides/collection/gtagjs) by google shows us how to install the gtag on our site. We will have to do things a little different to support this on Next.js.

If you don't already have a `_document.js` file created in your Next.js project, create one in `pages`. This allows us to set custom `<head>` elements, which is where our gtag script will live.

An example `_document.js` looks like this. Notice the scripts inside the Head tag. This is what initializes google analytics in our application.

```js
import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}', {
        page_path: window.location.pathname,
    });
    `,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
```

### 3. Setup a helper package to communicate with gtag

Create a new folder called `lib`. Within `lib`, create a new file called `ga.js`. This fill will help us communicate with the gtag in the window.

`ga.js` will have to functions, one to track page views and one to track events.

```js
export const pageview = (url) => {
  if (window !== undefined) {
    window.gtag("config", process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS, {
      page_path: url,
    });
  }
};

export const event = ({ action, params }) => {
  if (window !== undefined) {
    window.gtag("event", action, params);
  }
};
```

### 4. Add pageview tracking

Within our `_app.js` file, we are going to use the Next.js router to listen for event changes. If the event `routeChangeComplete` is triggered, we will send a pageview event. Read more about the custom App component in Next.js [here](https://nextjs.org/docs/advanced-features/custom-app).

We want to create a use effect hook in our app component that looks like:

```js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { pageview } from "../lib/ga";

...

const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url) => {
      pageview(url);
    };

    //When the component is mounted, subscribe to router changes
    //and log those page views
    router.events.on("routeChangeComplete", handleRouteChange);

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);
```

_Note that this function will only work with Next.js `<Link>` component links. Regular `<a>` tags will not be execute the custom script we created. Instead, the gtag will be loaded into the head and a request will be sent off for a new page load._

### 5. Event tracking

Say for example you wanted to track a button click that submited a search field. You can use the `event` method we created in `lib/ga.js`.

After importing the `event` function we can trigger an event on a button like so:

```js
<button
  onClick={() =>
    event({
      action: "search",
      params: {
        search_term: "test",
      },
    })
  }
>
  Click me
</button>
```

### 6. (Optional) Ignoring in automated test suites

If you use automated testing frameworks like Cypress to test your applications, you will probably also want to ignore sending google analytics metrics for these tests.

In Cypress, you can do this by adding `"*.google-analytics.com` to `blockHosts`.

```
"blockHosts": "*.google-analytics.com"
```

Read more about `blockHosts` in Cypress [here](https://docs.cypress.io/guides/references/configuration#Browser).
