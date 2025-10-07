"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import type {
  FieldPath,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";

export interface ImageUploadFieldProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
  accept?: string; // e.g. "image/jpeg,image/png"
  maxSizeMB?: number; // default 1MB
  className?: string;
}

export function ImageUploadField<TFieldValues extends FieldValues>(props: ImageUploadFieldProps<TFieldValues>) {
  const {
    form,
    name,
    label = "Upload Image",
    description = "Max size: 1 MB (JPG, JPEG, PNG).",
    accept = "image/jpeg,image/jpg,image/png",
    maxSizeMB = 1,
    className,
  } = props;

  const [imgFile, setImgFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (imgFile) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(imgFile);
    } else {
      setPreviewUrl(null);
    }
  }, [imgFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (!selectedFile) return;

    const maxSizeInBytes = maxSizeMB * 1024 * 1024;
    if (selectedFile.size > maxSizeInBytes) {
      toast.error(`Image size exceeds ${maxSizeMB}MB`);
      setImgFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setImgFile(selectedFile);
    // Inform RHF about the new file value
    form.setValue(name, selectedFile as any, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const handleRemoveFile = () => {
    setImgFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    // Clear RHF value
    form.setValue(name, undefined as any, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={() => (
        <FormItem className={cn("w-full", className)}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div
              className={cn(
                "mt-2 rounded-md border p-4",
                imgFile ? "border-secondary" : "border-dashed border-secondary",
                "flex items-center justify-center w-full"
              )}
            >
              {!imgFile ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Upload className="h-5 w-5" aria-hidden="true" />
                  <div className="flex items-center gap-1">
                    <label className="cursor-pointer font-medium text-blue-600 hover:underline">
                      <span>Choose file</span>
                      <Input
                        type="file"
                        accept={accept}
                        className="sr-only"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                      />
                    </label>
                    <span>to upload</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 w-full">
                  <div className="h-12 w-12 overflow-hidden rounded-md bg-muted flex items-center justify-center">
                    {previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewUrl} alt="preview" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{imgFile.name}</p>
                    <p className="text-xs text-muted-foreground">{(imgFile.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="shrink-0"
                    aria-label="Remove"
                    onClick={handleRemoveFile}
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              )}
            </div>
          </FormControl>
          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default ImageUploadField;
