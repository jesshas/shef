"use client";

import { useState } from "react";
import { Share2, Check, Link, X } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonProps {
  onGetToken: () => Promise<string>;
  label?: string;
  shareUrlPath: string; // e.g. "/share/grocery"
}

export function ShareButton({ onGetToken, label = "Share", shareUrlPath }: ShareButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (shareUrl) {
      copyToClipboard(shareUrl);
      return;
    }
    setIsLoading(true);
    try {
      const token = await onGetToken();
      const url = `${window.location.origin}${shareUrlPath}/${token}`;
      setShareUrl(url);
      copyToClipboard(url);
    } catch (err) {
      toast.error("Couldn't create share link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function copyToClipboard(url: string) {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleShare}
        disabled={isLoading}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans rounded-full border border-espresso/20 bg-linen text-espresso/70 hover:text-espresso hover:border-espresso/40 transition-colors disabled:opacity-50"
      >
        {isLoading ? (
          <span className="w-3 h-3 border border-espresso/40 border-t-transparent rounded-full animate-spin" />
        ) : copied ? (
          <Check size={11} className="text-sage" />
        ) : (
          <Share2 size={11} />
        )}
        {copied ? "Copied!" : label}
      </button>

      {shareUrl && (
        <button
          onClick={() => copyToClipboard(shareUrl)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-sans text-espresso/40 bg-linen border border-rose/20 rounded-full max-w-45 hover:text-espresso/70 hover:border-rose/40 transition-colors cursor-pointer"
          title="Click to copy"
        >
          <Link size={9} className="shrink-0" />
          <span className="truncate">{shareUrl.replace(/^https?:\/\//, "")}</span>
        </button>
      )}
    </div>
  );
}
