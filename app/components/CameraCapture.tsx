"use client";

import { useEffect, useRef, useState } from "react";

export default function CameraCapture({ onCapture, disabled = false }: { onCapture: (file: File) => void; disabled?: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  useEffect(() => () => stopCamera(), []);

  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!open || !video || !stream) return;

    video.srcObject = stream;
    video.muted = true;
    void video.play().catch((error: unknown) => {
      console.warn("[camera] preview could not play", error);
      setMessage("The camera opened, but the preview could not start. Please try again or choose photos from your device.");
    });

    return () => {
      video.srcObject = null;
    };
  }, [open]);

  async function openCamera() {
    setMessage("");
    setReady(false);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("unsupported");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      streamRef.current = stream;
      setOpen(true);
    } catch (error) {
      console.warn("[camera] access failed", error);
      const name = error instanceof DOMException ? error.name : "";
      setMessage(name === "NotAllowedError" ? "Camera permission was blocked. Allow camera access in your browser settings, then try again." : "Camera access was not available. You can still choose photos from your device.");
    }
  }

  function closeCamera() {
    stopCamera();
    setReady(false);
    setOpen(false);
  }

  function takePhoto() {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setMessage("The camera preview is still loading. Please wait a moment and try again.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      onCapture(new File([blob], `pull-theory-card-${Date.now()}.jpg`, { type: "image/jpeg" }));
      closeCamera();
    }, "image/jpeg", 0.9);
  }

  return <>
    <button type="button" disabled={disabled} onClick={() => void openCamera()} className="rounded-xl border border-amber-300/35 bg-amber-300/[0.08] px-4 py-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/[0.15] disabled:opacity-50">Use camera</button>
    {message && <p className="mt-3 text-xs text-amber-200">{message}</p>}
    {open && <div className="fixed inset-0 z-[80] grid place-items-center bg-black/85 p-4 backdrop-blur-sm"><div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#15121b] p-5 text-white shadow-2xl"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Card camera</p><p className="mt-1 text-sm text-zinc-300">Center the card, then take the photo.</p></div><button type="button" onClick={closeCamera} className="rounded-xl border border-white/15 px-3 py-2 text-sm">Close</button></div><video ref={videoRef} autoPlay muted playsInline onLoadedMetadata={() => setReady(true)} className="mt-5 aspect-[3/4] w-full rounded-2xl bg-black object-cover" /><button type="button" disabled={!ready} onClick={takePhoto} className="mt-5 w-full rounded-2xl bg-violet-600 px-4 py-3 font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50">{ready ? "Take photo" : "Starting camera..."}</button></div></div>}
  </>;
}
