import { fileTypeFromBuffer } from "file-type";

const DEFAULT_SIZE_BYTES_IN_MB = 15;

interface ValidationSuccess {
  valid          : true;
  mimeType       : string;
  sanitizedBuffer: Buffer;
}

interface ValidationFailure {
  valid  : false;
  message: string;
  reason : string;
}

/**
 * Validasi file PDF (CV/resume). Beda dari validate-image.util.ts:
 * nggak bisa "re-encode" PDF pakai sharp, jadi sanitasinya cuma
 * memastikan magic bytes-nya beneran PDF (bukan sekadar ekstensi/mimetype
 * dari client, yang gampang dipalsuin) sebelum buffer-nya dipakai apa
 * adanya.
 */
export const validateAndSanitizePdf = async ({
  buffer,
  maxFileInMB = DEFAULT_SIZE_BYTES_IN_MB,
}: {
  buffer      : Buffer;
  maxFileInMB?: number;
}): Promise<ValidationSuccess | ValidationFailure> => {

  const MAX_FILE_SIZE_BYTES = maxFileInMB * 1024 * 1024;

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
  if (!detected || detected.mime !== "application/pdf") {
    return {
      valid  : false,
      message: "MIME_TYPE_NOT_ALLOWED",
      reason : `Format "${detected?.mime ?? "unknown"}" is not allowed. Only application/pdf is accepted.`,
    };
  }

  return {
    valid          : true,
    mimeType       : detected.mime,
    sanitizedBuffer: buffer,
  };
};
