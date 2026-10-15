import type { AllowedContentType } from "#src/types/allowed-content.type.js";
import { fault }                   from "#src/utils/response.util.js";
import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    CopyObjectCommand,
    DeleteObjectCommand,
  } from "@aws-sdk/client-s3";
  import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
  import { randomUUID }   from "crypto";

  const ACCOUNT_ID        = process.env.R2_ACCOUNT_ID!;
  const ACCESS_KEY_ID     = process.env.R2_ACCESS_KEY_ID!;
  const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
  const PUBLIC_BASE_URL   = process.env.R2_PUBLIC_URL;
  const PUBLIC_BUCKET     = process.env.R2_PUBLIC_BUCKET_NAME!;
  const PRIVATE_BUCKET    = process.env.R2_PRIVATE_BUCKET_NAME!;
  // const TEMP_BUCKET       = PRIVATE_BUCKET;
  const TEMP_BUCKET       = PUBLIC_BUCKET;
  export const TEMP_FOLDER = "temporary";

  const s3 = new S3Client({
    region     : "auto",
    endpoint   : `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId    : ACCESS_KEY_ID,
      secretAccessKey: SECRET_ACCESS_KEY,
    },
  });
  interface ErrorResult {
    success: false;
    message: string;
    reason : string;
  }

  interface PresignedUploadResult {
    success: true;
    url    : string;
    key    : string;
  }

  interface SaveFinalResult {
    success: true;
    key    : string;
    bucket : string;
    url    : string | null;
  }

  export async function saveFinalObject({
    targetFolder,
    isPublic,
    uploadedImageKey,
    filename,
  }: {
    targetFolder: string;
    isPublic    : boolean;
    uploadedImageKey   : string;
    filename?   : string;
  }): Promise<SaveFinalResult | ErrorResult> {

    if (!uploadedImageKey.startsWith(`${TEMP_FOLDER}/`)) {
      return {
        success: false,
        message: "INVALID_TEMP_KEY",
        reason : `Expected uploadedImageKey inside "${TEMP_FOLDER}/" folder, got "${uploadedImageKey}".`,
      };
    }
    const originalFilename = uploadedImageKey.split("/").pop()!;
    const finalFilename    = filename ?? originalFilename;
    const cleanFolder      = targetFolder.replace(/^\/+|\/+$/g, "");
    const finalKey         = `${cleanFolder}/${finalFilename}`;
    const targetBucket     = isPublic ? PUBLIC_BUCKET : PRIVATE_BUCKET;

    try {
      await s3.send(
        new CopyObjectCommand({
          Bucket    : targetBucket,
          CopySource: `${TEMP_BUCKET}/${uploadedImageKey}`,
          Key       : finalKey,
        })
      );
    } catch (err) {
      return {
        success: false,
        message: "COPY_FAILED",
        reason : `Failed to copy object from "${uploadedImageKey}" to "${finalKey}".`,
      };
    }

    try {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: TEMP_BUCKET,
          Key   : uploadedImageKey,
        })
      );
    } catch (err) {
      return {
        success: false,
        message: "DELETE_FAILED",
        reason : `Copied to "${finalKey}" successfully, but failed to delete temp file "${uploadedImageKey}".`,
      };
    }

    return {
      success: true,
      key    : finalKey,
      bucket : targetBucket,
      url    : isPublic ? `${PUBLIC_BASE_URL}/${finalKey}` : null,
    };
  }
  export async function deleteObject({ imageKey, isPublic = true }: { imageKey: string, isPublic?: boolean }): Promise<SaveFinalResult | ErrorResult> {

    const targetBucket = isPublic ? PUBLIC_BUCKET : PRIVATE_BUCKET;
    try {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: targetBucket,
          Key   : imageKey,
        })
      );
    } catch (err) {
      return {
        success: false,
        message: "DELETE_FAILED",
        reason : `failed to delete "${imageKey}".`,
      };
    }

    return {
      success: true,
      key    : imageKey,
      bucket : targetBucket,
      url    : null
    };
  }
  export async function getBufferObject({
    uploadedImageKey,
    bucket = TEMP_BUCKET,
  }: {
    uploadedImageKey    : string;
    bucket?: string;
  }): Promise<{ success: true; buffer: Buffer } | ErrorResult> {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key   : uploadedImageKey,
      });

      const response = await s3.send(command);

      if (!response.Body) {
        return {
          success: false,
          message: "EMPTY_BODY",
          reason : `Object "${uploadedImageKey}" in bucket "${bucket}" has no body.`,
        };
      }
      const chunks: Uint8Array[] = [];
      for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
        chunks.push(chunk);
      }

      return { success: true, buffer: Buffer.concat(chunks) };
    } catch (err) {
      return {
        success: false,
        message: "FETCH_FAILED",
        reason : `Failed to fetch object "${uploadedImageKey}" from bucket "${bucket}".`,
      };
    }
  }
  export async function generatePrivateURL({
    key,
    expiresIn = 3600,
  }: {
    key       : string;
    expiresIn?: number;
  }): Promise<{ success: true; url: string } | ErrorResult> {
    try {
      const command = new GetObjectCommand({
        Bucket: PRIVATE_BUCKET,
        Key   : key,
      });

      const url = await getSignedUrl(s3, command, { expiresIn });
      return { success: true, url };
    } catch (err) {
      return {
        success: false,
        message: "PRESIGN_FAILED",
        reason : `Failed to generate a presigned download URL for "${key}".`,
      };
    }
  }

  export function generatePublicURL({
    key,
  }: {
    key: string;
  }): { success: true; url: string } | ErrorResult {
    if (!PUBLIC_BASE_URL) {
      return {
        success: false,
        message: "PUBLIC_URL_NOT_CONFIGURED",
        reason : "R2_PUBLIC_URL is not set in the environment variables.",
      };
    }

    return { success: true, url: `${PUBLIC_BASE_URL}/${key}` };
  }

  export async function buildPresignedURL({
    filename,
    suffixTempKey,
    contentType,
    expiresIn = 300,
  }: {
    filename      : string;
    suffixTempKey?: string;
    contentType   : AllowedContentType;
    expiresIn?    : number;
  }): Promise<PresignedUploadResult | ErrorResult> {
    try {
      const tempKeyFolder = (!!suffixTempKey ? `${TEMP_FOLDER}/${suffixTempKey}` : TEMP_FOLDER).replace(/^\/+|\/+$/g, "");
      const ext = filename.includes(".") ? filename.split(".").pop() : "";
      const key = `${tempKeyFolder}/${randomUUID()}${ext ? `.${ext}` : ""}`;

      const safeExpiresIn = Math.min(Math.max(expiresIn, 1), 3600);

      const command = new PutObjectCommand({
        Bucket     : TEMP_BUCKET,
        Key        : key,
        ContentType: contentType,
      });

      const url = await getSignedUrl(s3, command, { expiresIn: safeExpiresIn });

      return { success: true, url, key };
    } catch (err) {
      return {
        success: false,
        message: "PRESIGN_FAILED",
        reason : "Failed to generate a presigned upload URL.",
      };
    }
  }
  /**
   * Ambil R2 object key dari URL publik (hasil generatePublicURL / saveFinalObject).
   * Return null kalau value-nya bukan URL yang berasal dari PUBLIC_BASE_URL kita
   * (misal URL eksternal yang ditempel manual admin) — supaya nggak salah hapus
   * objek yang bukan punya kita.
   */
  export function extractKeyFromPublicUrl(url: string): string | null {
    if (!PUBLIC_BASE_URL || !url.startsWith(`${PUBLIC_BASE_URL}/`)) return null;
    return url.slice(PUBLIC_BASE_URL.length + 1);
  }

  /**
   * Dipakai di service create/update tiap modul yang punya field upload
   * (logoUrl, image, avatarUrl, dst). Flow lengkapnya:
   *   client  -> minta presigned URL (/upload/create-url) -> PUT file ke R2
   *           -> create/update resource sambil kirim `key` sementara itu di field-nya.
   *   server  -> finalizeUploadField() cek field yang dikirim:
   *
   *   - field nggak dikirim (undefined)                  -> nggak diapa-apain (undefined balik lagi,
   *                                                          jangan di-set ke DB supaya value lama nggak ketiban).
   *   - field dikosongin (null / "")                      -> hapus file lama (kalau ada & punya kita), simpan null.
   *   - field diisi key temp ("temporary/...")            -> pindah dari temp ke targetFolder (copy+delete di R2),
   *                                                          lalu hapus file lama (kalau ada, beda, & punya kita).
   *   - field diisi value lain (URL final / nggak berubah) -> dibiarin apa adanya, nggak nyentuh R2 sama sekali.
   *
   * Lempar FaultError (400) kalau key-nya nggak valid/udah nggak ada di temp
   * (misal keburu ke-auto-delete lifecycle rule 2 jam).
   */
  export async function finalizeUploadField({
    newValue,
    oldValue,
    targetFolder,
    isPublic = true,
  }: {
    newValue?: string | null;
    oldValue?: string | null;
    targetFolder: string;
    isPublic?: boolean;
  }): Promise<string | null | undefined> {
    if (newValue === undefined) return undefined;

    if (!newValue) {
      if (oldValue) {
        const oldKey = extractKeyFromPublicUrl(oldValue);
        if (oldKey) await deleteObject({ imageKey: oldKey, isPublic });
      }
      return null;
    }

    if (!newValue.startsWith(`${TEMP_FOLDER}/`)) return newValue;

    const result = await saveFinalObject({ targetFolder, isPublic, uploadedImageKey: newValue });
    if (!result.success) {
      throw fault({ code: 400, message: result.message, cause: result.reason });
    }

    if (oldValue) {
      const oldKey = extractKeyFromPublicUrl(oldValue);
      if (oldKey && oldKey !== result.key) await deleteObject({ imageKey: oldKey, isPublic });
    }

    return result.url ?? result.key;
  }
