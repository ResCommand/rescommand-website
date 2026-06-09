"use client";

import { useState, useRef } from "react";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  importEndpoint: string;
  onImportComplete: (data: Record<string, unknown>) => void;
}

export default function ImportModal({
  isOpen,
  onClose,
  title,
  description,
  importEndpoint,
  onImportComplete,
}: ImportModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [useBetterModel, setUseBetterModel] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setError("");
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (ev) => setPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        // For non-image files (Excel, PDF, CSV), show filename
        setPreview(`file:${file.name}`);
      }
    }
  };

  const handleSubmit = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Please select a file");
      return;
    }

    // Client-side resize to reduce upload size (images only)
    let processedFile = file;
    if (file.type.startsWith("image/")) {
      processedFile = await resizeImage(file, 800);
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", processedFile);
      if (useBetterModel) formData.append("model", "z-ai/glm-4.6v");

      const res = await fetch(importEndpoint, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setError(result.error || "Failed to process image");
        return;
      }

      onImportComplete(result.data);
      onClose();
      setPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          maxWidth: 480,
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
        }}
      >
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #E5E7EB" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>📷 {title}</h2>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: 20,
                cursor: "pointer",
                color: "#6B7280",
                padding: 4,
              }}
            >
              ✕
            </button>
          </div>
          <p style={{ fontSize: 14, color: "#6B7280", margin: "8px 0 0" }}>{description}</p>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px" }}>
          {/* File picker */}
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: "2px dashed #D1D5DB",
              borderRadius: 8,
              padding: preview ? "12px" : "32px 16px",
              textAlign: "center",
              cursor: "pointer",
              background: "#F9FAFB",
              transition: "border-color 0.2s",
            }}
          >
            {preview ? (
              preview.startsWith("file:") ? (
                <div style={{ padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>📄</div>
                  <p style={{ fontSize: 14, color: "#374151", fontWeight: 500, margin: 0, wordBreak: "break-all" }}>
                    {preview.replace("file:", "")}
                  </p>
                </div>
              ) : (
                <img
                  src={preview}
                  alt="Preview"
                  style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 4, objectFit: "contain" }}
                />
              )
            ) : (
              <>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
                <p style={{ fontSize: 14, color: "#374151", fontWeight: 500, margin: 0 }}>
                  Tap to upload a photo or file
                </p>
                <p style={{ fontSize: 12, color: "#9CA3AF", margin: "4px 0 0" }}>
                  JPG, PNG, WebP, HEIC, PDF, Excel, CSV • Max 10MB
                </p>
              </>
            )}
<input
                ref={fileRef}
                type="file"
                accept="image/*,.pdf,.xlsx,.xls,.csv"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
          </div>

          {/* Model toggle */}
          <div
            style={{
              marginTop: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: "#6B7280",
            }}
          >
            <input
              type="checkbox"
              id="betterModel"
              checked={useBetterModel}
              onChange={(e) => setUseBetterModel(e.target.checked)}
              style={{ cursor: "pointer" }}
            />
            <label htmlFor="betterModel" style={{ cursor: "pointer" }}>
              Use better model (slower, better for handwriting)
            </label>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                marginTop: 12,
                padding: "10px 14px",
                background: "#FEF2F2",
                borderRadius: 6,
                color: "#DC2626",
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #E5E7EB",
            display: "flex",
            gap: 12,
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "1px solid #D1D5DB",
              background: "#fff",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !preview}
            style={{
              padding: "8px 20px",
              borderRadius: 6,
              border: "none",
              background: loading || !preview ? "#9CA3AF" : "#2563EB",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: loading || !preview ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Processing..." : "Extract Data"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Client-side image resize to keep uploads small
function resizeImage(file: File, maxSize: number): Promise<File> {
  return new Promise((resolve) => {
    const img = document.createElement("img");
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;

      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: "image/jpeg" }));
          } else {
            resolve(file);
          }
        },
        "image/jpeg",
        0.8
      );
    };
    img.src = URL.createObjectURL(file);
  });
}