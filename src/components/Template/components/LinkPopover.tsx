import { useState, useEffect, useRef } from "react";
import { Link as LinkIcon, Copy } from "lucide-react";

function LinkPopover({ publishedSnippet, publishedURL }: { publishedSnippet?: string; publishedURL?: string }) {
  const [showLinks, setShowLinks] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const copyToClipboard = async (text: string) => {
    try {
      // Modern clipboard API
      await navigator.clipboard.writeText(text);
      setCopiedText(text); // Show copied notification

      // Hide notification after 2 seconds
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
      alert("Copy failed. Please copy manually.");
    }
  };

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowLinks(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popoverRef]);

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setShowLinks((prev) => !prev)}
        className="p-2 border rounded hover:bg-gray-100"
      >
        <LinkIcon className="h-4 w-4" />
      </button>

      {showLinks && (
        <div className="absolute right-0 mt-2 w-96 bg-white shadow-lg rounded-lg border border-gray-200 p-4 z-50">
          {publishedSnippet && (
            <div className="flex items-center justify-between mb-2">
              <code className="text-xs break-all">{publishedSnippet}</code>
              <button 
                type="button"
                aria-label="Copy to clipboard" 
                onClick={() => copyToClipboard(publishedSnippet)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Copy className="h-4 w-4 text-gray-600 hover:text-black" />
              </button>
            </div>
          )}
          {publishedURL && (
            <div className="flex items-center justify-between">
              <code className="text-xs break-all">{publishedURL}</code>
              <button 
                type="button"
                aria-label="Copy to clipboard" 
                onClick={() => copyToClipboard(publishedURL)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Copy className="h-4 w-4 text-gray-600 hover:text-black" />
              </button>
            </div>
          )}
          {copiedText && (
            <div className="mt-2 text-green-600 text-sm">Copied!</div>
          )}
        </div>
      )}
    </div>
  );
}

export default LinkPopover;
