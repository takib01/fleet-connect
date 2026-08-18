import { ImagePlus, Trash2, UploadCloud } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

export function ImageUpload({
  file,
  existingUrl,
  onChange,
  error,
}: {
  file: File | null;
  existingUrl?: string | null;
  onChange: (file: File | null, error?: string) => void;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const accept = (selected: File | undefined) => {
    if (!selected) return;
    if (!ACCEPTED.includes(selected.type)) {
      onChange(null, "Upload a JPG, PNG or WEBP image.");
      return;
    }
    if (selected.size > MAX_BYTES) {
      onChange(null, "Image must be 5 MB or smaller.");
      return;
    }
    onChange(selected);
  };

  const shown = preview ?? existingUrl ?? null;

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          accept(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-input bg-muted/40 px-6 py-8 text-center transition-colors hover:border-primary/50 hover:bg-accent/40",
          dragging && "border-primary bg-accent/60",
          error && "border-destructive/60",
        )}
      >
        {shown ? (
          <img
            src={shown}
            alt="Selected vehicle preview"
            className="h-40 w-full max-w-sm rounded-lg object-cover"
          />
        ) : (
          <div className="flex size-11 items-center justify-center rounded-full bg-background text-muted-foreground">
            <UploadCloud className="size-5" />
          </div>
        )}
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-foreground">
            {shown ? "Replace vehicle photo" : "Drag & drop a vehicle photo"}
          </p>
          <p className="text-xs text-muted-foreground">JPG, PNG or WEBP · max 5 MB</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          className="hidden"
          onChange={(event) => accept(event.target.files?.[0])}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          <ImagePlus className="size-4" /> Choose file
        </Button>
        {file ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
          >
            <Trash2 className="size-4" /> Remove selection
          </Button>
        ) : null}
        {file ? <span className="truncate text-xs text-muted-foreground">{file.name}</span> : null}
      </div>

      {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
    </div>
  );
}
