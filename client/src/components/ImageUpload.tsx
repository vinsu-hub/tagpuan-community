import { supabase } from "@/lib/supabase";
import { useRef, useState } from "react";

const BUCKET = "media";

type ImageUploadProps = {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
};

/** Uploads an image to the Supabase Storage `media` bucket and returns its public URL. */
export function ImageUpload({
  value,
  onChange,
  folder = "uploads",
  label = "Image",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setBusy(true);
    setError(null);
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-");
    const path = `${folder}/${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (uploadError) {
      setError(uploadError.message || "Upload failed.");
      setBusy(false);
      return;
    }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    onChange(data.publicUrl);
    setBusy(false);
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
