import { supabase } from "@/lib/supabase";
import { trpc } from "@/lib/trpc";
import { useRef, useState } from "react";

const BUCKET = "media";
const ALLOWED = ["image/png", "image/jpeg", "image/webp"] as const;

type ImageUploadProps = {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
};

/**
 * Admin image upload. The browser no longer has write access to the `media`
 * bucket — it asks the server (admin-only) for a one-shot signed upload URL,
 * then PUTs the file straight to Storage with that token.
 */
export function ImageUpload({
  value,
  onChange,
  folder = "uploads",
  label = "Image",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createUploadUrl = trpc.admin.media.createUploadUrl.useMutation();

  const handleFile = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const contentType = ALLOWED.includes(file.type as (typeof ALLOWED)[number])
        ? (file.type as (typeof ALLOWED)[number])
        : null;
      if (!contentType) {
        setError("Use a PNG, JPEG, or WebP image.");
        return;
      }
      const { path, token, publicUrl } = await createUploadUrl.mutateAsync({
        folder,
        filename: file.name,
        contentType,
      });
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .uploadToSignedUrl(path, token, file, { contentType });
      if (uploadError) {
        setError(uploadError.message || "Upload failed.");
        return;
      }
      onChange(publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="image-upload">
      <span className="field-label">{label}</span>
      {value ? (
        <img
          src={value}
          alt=""
          style={{
            width: "100%",
            maxHeight: 180,
            objectFit: "cover",
            borderRadius: 8,
            marginBottom: 8,
          }}
        />
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        style={{ display: "none" }}
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          type="button"
          className="button outline small"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? "Uploading…" : value ? "Replace image" : "Upload image"}
        </button>
        {value ? (
          <button
            type="button"
            className="button outline small"
            onClick={() => onChange("")}
          >
            Remove
          </button>
        ) : null}
      </div>
      {error ? (
        <p style={{ color: "#a3412b", fontSize: "0.8rem", marginTop: 6 }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
