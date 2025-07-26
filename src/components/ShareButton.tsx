import React, { useState } from 'react';
import { ShareIcon } from './icons/ShareIcon';
import { ClipboardCheckIcon } from './icons/ClipboardCheckIcon';

interface ShareButtonProps {
  textToShare: string;
  shareTitle: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ textToShare, shareTitle }) => {
  const [didCopy, setDidCopy] = useState(false);
  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  const handleAction = async () => {
    const shareData = {
      title: shareTitle,
      text: textToShare,
      url: window.location.href,
    };

    if (canShare) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as DOMException).name !== 'AbortError') {
          console.error('Share API failed, falling back to copy:', err);
          await copyToClipboard();
        }
      }
    } else {
      await copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    try {
        await navigator.clipboard.writeText(textToShare);
        setDidCopy(true);
        setTimeout(() => setDidCopy(false), 2500);
    } catch (err) {
        console.error('Failed to copy using clipboard API:', err);
        const textArea = document.createElement("textarea");
        textArea.value = textToShare;
        textArea.style.position = "absolute";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            setDidCopy(true);
            setTimeout(() => setDidCopy(false), 2500);
        } catch (copyErr) {
            console.error('Fallback copy failed:', copyErr);
            alert("Failed to copy results. Please copy the text manually.");
        }
        document.body.removeChild(textArea);
    }
  };

  const buttonText = didCopy ? 'Copied!' : 'Share';
  const ButtonIcon = didCopy ? ClipboardCheckIcon : ShareIcon;

  return (
    <button
      onClick={handleAction}
      className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
        didCopy ? 'bg-green-600' : 'bg-emerald-600 hover:bg-emerald-700'
      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200`}
      aria-live="polite"
      title={canShare ? 'Share analysis' : 'Copy analysis to clipboard'}
    >
      <ButtonIcon className="w-5 h-5 mr-2" />
      {buttonText}
    </button>
  );
};
