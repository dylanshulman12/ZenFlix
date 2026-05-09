"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MyComponent() {
  const router = useRouter();

   useEffect(() => {
        async function fetchData() {

            const response = await fetch("http://localhost:8000/api/welcomeCheck")
            const data = await response.json();
            console.log(data)
            if (data === false) {
              console.log(data)
              router.push("/Welcome")
            } else {
              router.push("/Gallery")
              }

    }
      fetchData();
    }, []);

  return null; // nothing is shown because it redirects
}
