export const ALLOWED_CONTENT_TYPES = [
    // Images
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    // Video
    "video/mp4",
    "video/webm",
    // Misc
    "text/plain",
    "application/json",
    "application/zip",
  ] as const;

  export type AllowedContentType = (typeof ALLOWED_CONTENT_TYPES)[number];