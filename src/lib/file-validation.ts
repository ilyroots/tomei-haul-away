export type FileValidationOptions = {
  maxSizeBytes: number;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
};

export type FileValidationError =
  "file-too-large" | "invalid-type" | "invalid-extension" | "empty-file";

export function validateFile(
  file: { name: string; type: string; size: number },
  options: FileValidationOptions
): FileValidationError | null {
  if (file.size === 0) {
    return "empty-file";
  }
  if (file.size > options.maxSizeBytes) {
    return "file-too-large";
  }
  if (options.allowedMimeTypes && options.allowedMimeTypes.length > 0) {
    if (!options.allowedMimeTypes.includes(file.type)) {
      return "invalid-type";
    }
  }
  if (options.allowedExtensions && options.allowedExtensions.length > 0) {
    const ext = file.name.toLowerCase().split(".").pop();
    if (!ext || !options.allowedExtensions.includes(ext)) {
      return "invalid-extension";
    }
  }
  return null;
}
