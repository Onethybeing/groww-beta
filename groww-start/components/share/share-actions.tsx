"use client";
import { useState } from "react";
import { Download, Share } from "lucide-react";

export function ShareActions({ imgUrl, text }: { imgUrl: string; text: string }) {
  const [status, setStatus] = useState<string | null>(null);
  const getFile = async () => {
    const blob = await (await fetch(imgUrl)).blob();
    return new File([blob], "groww-milestone.png", { type: "image/png" });
  };
  const download = async () => {
    const file = await getFile();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const share = async () => {
    try {
      const file = await getFile();
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], text });
      else {
        await download();
        setStatus("Sharing isn't supported here, so we downloaded the card instead.");
      }
    } catch {
      setStatus("Sharing was cancelled.");
    }
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2.5">
        <button type="button" onClick={share} className="flex h-[52px] items-center justify-center gap-2 rounded-[14px] bg-groww text-base font-bold text-white">
          <Share className="size-[18px]" aria-hidden />Share
        </button>
        <button type="button" onClick={download} className="flex h-[52px] items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-[#D5D8DE] bg-white text-base font-bold">
          <Download className="size-[18px]" aria-hidden />Download
        </button>
      </div>
      {status && <p role="status" className="text-center text-xs text-muted-ink">{status}</p>}
    </div>
  );
}
