import { fileTypeFromBuffer } from "file-type";
import sharp                  from "sharp";

const ALLOWED_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

const DEFAULT_SIZE_BYTES_IN_MB = 10;
const DEFAULT_MAX_DIMENSION_PX = 8000;
const DEFAULT_MIN_DIMENSION_PX = 1;

interface ValidationSuccess {
  valid          : true;
  mimeType       : string;
  width          : number;
  height         : number;
  sanitizedBuffer: Buffer;
}

interface ValidationFailure {
  valid  : false;
  message: string;
  reason : string;
}

export const validateAndSanitizeImage = async ({
  buffer,
  maxFileInMB = DEFAULT_SIZE_BYTES_IN_MB,
  maxFileDimension = DEFAULT_MAX_DIMENSION_PX,
  minFileDimension = DEFAULT_MIN_DIMENSION_PX,
}: {
  buffer          : Buffer;
  maxFileInMB?     : number;
  maxFileDimension?: number;
  minFileDimension?: number;
})               : Promise<ValidationSuccess | ValidationFailure> => {

  const MAX_FILE_SIZE_BYTES = maxFileInMB * 1024 * 1024;
  const MAX_DIMENSION_PX    = maxFileDimension;
  const MIN_DIMENSION_PX    = minFileDimension;

  if (buffer.length === 0) {
    return {
      valid  : false,
      message: "FILE_EMPTY",
      reason : "The provided file buffer is empty.",
    };
  }

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    return {
      valid  : false,
      message: "FILE_TOO_LARGE",
      reason : `File exceeds the maximum allowed size of ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB.`,
    };
  }

  const detected = await fileTypeFromBuffer(buffer);
  if (!detected) {
    return {
      valid  : false,
      message: "UNKNOWN_FILE_TYPE",
      reason : "Could not detect file type — the file may be corrupted or is not a valid image.",
    };
  }

  if (!ALLOWED_MIME_TYPES.has(detected.mime)) {
    return {
      valid  : false,
      message: "MIME_TYPE_NOT_ALLOWED",
      reason : `Format "${detected.mime}" is not allowed. Accepted formats: ${[...ALLOWED_MIME_TYPES].join(", ")}.`,
    };
  }

  try {
    const image = sharp(buffer, {
      limitInputPixels: MAX_DIMENSION_PX * MAX_DIMENSION_PX,
      failOn          : "error",
    });

    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      return {
        valid  : false,
        message: "DIMENSION_UNREADABLE",
        reason : "Could not read image dimensions.",
      };
    }

    if (metadata.width > MAX_DIMENSION_PX || metadata.height > MAX_DIMENSION_PX) {
      return {
        valid  : false,
        message: "DIMENSION_TOO_LARGE",
        reason : `Image dimensions exceed the maximum allowed size of ${MAX_DIMENSION_PX}x${MAX_DIMENSION_PX}px.`,
      };
    }

    if (metadata.width < MIN_DIMENSION_PX || metadata.height < MIN_DIMENSION_PX) {
      return {
        valid  : false,
        message: "DIMENSION_TOO_SMALL",
        reason : `Image dimensions are below the minimum allowed size of ${MIN_DIMENSION_PX}x${MIN_DIMENSION_PX}px.`,
      };
    }

    let sanitizedBuffer: Buffer;
    switch (detected.mime) {
      case "image/png":
        sanitizedBuffer = await image.png().toBuffer();
        break;
      case "image/jpeg":
        sanitizedBuffer = await image.jpeg({ quality: 90 }).toBuffer();
        break;
      case "image/webp":
        sanitizedBuffer = await image.webp({ quality: 90 }).toBuffer();
        break;
      default:
        return {
          valid  : false,
          message: "UNSUPPORTED_FORMAT",
          reason : `Format "${detected.mime}" passed the whitelist check but has no re-encode handler.`,
        };
    }

    return {
      valid   : true,
      mimeType: detected.mime,
      width   : metadata.width,
      height  : metadata.height,
      sanitizedBuffer,
    };
  } catch (err) {
    return {
      valid  : false,
      message: "PROCESSING_FAILED",
      reason : "Failed to process the image — the file may be corrupted or malformed.",
    };
  }
};