import { useEffect } from "react";

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Component to inject JSON-LD structured data into the page head
 * @param data - JSON-LD object or array of objects
 */
export default function JsonLd({ data }: JsonLdProps) {
  useEffect(() => {
    // Remove any existing JSON-LD scripts with the same id
    const existingScript = document.getElementById("json-ld-script");
    if (existingScript) {
      existingScript.remove();
    }

    // Create new script element
    const script = document.createElement("script");
    script.id = "json-ld-script";
    script.type = "application/ld+json";
    script.text = JSON.stringify(data);
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      const scriptToRemove = document.getElementById("json-ld-script");
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [data]);

  return null;
}




