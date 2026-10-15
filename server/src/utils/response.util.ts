// shared/response.util.ts
import crypto from "crypto";
import { logger } from "#src/configs/pino.config.js";
// import env from "#src/configs/env.config.js";

// const ALGO = "aes-256-cbc";
// const SECRET_KEY = crypto.scryptSync(env.PAYLOAD_SECRET!, "salt", 32);

interface faultPayload {
    cause?: string | null;
    code    : number;
    data?   : any;
    message?: string | null;
  }
  export interface CustomError extends Error {
    code?: number;
    data?: any;
  }
// export function encryptPayload(payload: any): string {
//   const iv = crypto.randomBytes(16);
//   const cipher = crypto.createCipheriv(ALGO, SECRET_KEY, iv);
//   const json = JSON.stringify(payload);
//   const encrypted = Buffer.concat([cipher.update(json, "utf8"), cipher.final()]);
//   return Buffer.concat([iv, encrypted]).toString("base64");
// }

export interface FormatResponsePayload<T> {
    data: T;
    message?: string | null;
    cause?: string;
    success?: boolean;
  }

  export interface SuccessResponse<T> {
    success: true;
    data: T;
    message: string | null;
    timestamp: string;
  }

  export function response<T>({
    data,
    message = null,
    success = true,
    cause,
  }: FormatResponsePayload<T>): SuccessResponse<T> {
    return {
      success,
      data,
      message,
      ...(!!cause ? {cause} : {}),
      timestamp: new Date().toISOString(),
    } as SuccessResponse<T>;
  }

export class FaultError extends Error {
    code: number;
    data: any;

    constructor(message: string, code: number, data: any = null) {
      super(message);
      this.code = code;
      this.data = data;
    }
  }

  export const fault = ({
    code = 400,
    message = "UNKNOWN_ERROR",
    cause = null,
    data,
  }: faultPayload) => {
    logger.error({ code, message, cause, data });

    let errData: any = null;
    if (cause) errData = { cause, ...data };
    else if (data !== undefined) errData = Array.isArray(data) ? data : [data];

    return new FaultError(message ?? "UNKNOWN_ERROR", code, errData);
  };

export default response;
