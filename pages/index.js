import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { event } from "../lib/ga";

export default function Home() {
  return (
    <>
      <Link href="/page2">Go to page 2</Link>
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
    </>
  );
}
