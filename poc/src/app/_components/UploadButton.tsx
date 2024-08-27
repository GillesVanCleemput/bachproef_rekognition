"use client";

import { useCallback, useRef, useState } from "react";

import { api } from "~/trpc/react";

export function UploadButton() {
  const webcamRef = useRef<{ getScreenshot: () => string | null } | null>(null);
  const uploadRef = useRef<HTMLInputElement | null>(null);

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    const res = await fetch(imageSrc);
    const blob = await res.blob();
    const file = new File([blob], "selfie.jpeg", { type: "image/jpeg" });

    await uploadAndFindImage(file);
  }, [webcamRef, uploadAndFindImage]);

  return (
    <button
      onClick={() => capture()}
      className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
    >
      Upload
    </button>
  );
}
