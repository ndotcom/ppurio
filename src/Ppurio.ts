import axios from "axios";
import { errorMessages } from "./errorMessages";
import {
  CancelReservationParams,
  CancelReservationResponse,
  ResponseBase,
  SendMessageParams,
  SendMessageResponse,
  SuccessCancelReservation,
  SuccessSendMessage,
} from "./types";
import { CANCEL_MESSAGE_ENDPOINT, SEND_MESSAGE_ENDPOINT } from "./constants";
import * as FormData from "form-data";
import * as fs from "fs";
import { promisify } from "util";
import path from "path";
import { PpurioException } from "./PpurioException";

const stat = promisify(fs.stat);

export class Ppurio {
  userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  public async sendMessage(
    params: SendMessageParams
  ): Promise<SuccessSendMessage> {
    const apiUrl = SEND_MESSAGE_ENDPOINT;
    const formData = new FormData();

    formData.append("userid", this.userId);
    formData.append("callback", params.sender);
    formData.append("phone", this.arrStr(params.receiver));
    formData.append("msg", params.message);
    if (params.name) formData.append("names", this.arrStr(params.name));
    if (params.appointmentDate)
      formData.append("appdate", params.appointmentDate);

    if (params.subject) {
      if (Buffer.byteLength(params.subject, "utf8") > 30) {
        throw new Error("제목은 30 바이트 이하로 작성해야 합니다.");
      }
      formData.append("subject", params.subject);
    }

    if (params.file1) {
      const fileStream = fs.createReadStream(params.file1);
      const fileStats = await stat(params.file1);
      const fileSizeInBytes = fileStats.size;
      const fileSizeInKilobytes = fileSizeInBytes / 1024;

      if (fileSizeInKilobytes > 300) {
        throw new Error("파일은 300 Kbyte 이하이어야 합니다.");
      }

      const extension = path.extname(params.file1).toLowerCase();
      if (![".jpg", ".jpeg"].includes(extension)) {
        throw new Error("jpg 또는 jpeg 파일만 지원됩니다.");
      }

      formData.append("file1", fileStream);
    }

    const {
      type,
      msgid: messageId,
      ok_cnt: okCount,
    } = await this.sendRequest<SendMessageResponse>(apiUrl, formData);

    return { type, messageId, okCount };
  }

  public async cancelReservation(
    params: CancelReservationParams
  ): Promise<SuccessCancelReservation> {
    const apiUrl = CANCEL_MESSAGE_ENDPOINT;
    const formData = new FormData();

    formData.append("userid", this.userId);
    formData.append("msgid", params.messageId);

    const { ok_cnt: okCount } =
      await this.sendRequest<CancelReservationResponse>(apiUrl, formData);

    return { okCount };
  }

  private async sendRequest<TResponse extends ResponseBase>(
    endpoint: string,
    formData: FormData
  ): Promise<TResponse> {
    const response = await axios.post<TResponse>(endpoint, formData, {
      headers: formData.getHeaders(),
    });

    if (response.data.result !== "ok") {
      throw new PpurioException(
        this.getErrorMsg(response.data.result),
        response.data.result
      );
    }

    return response.data;
  }

  private getErrorMsg(result: keyof typeof errorMessages): string {
    return errorMessages[result] || "알 수 없는 오류 : " + result;
  }

  private arrStr(val: string | string[]) {
    return (Array.isArray(val) ? val : [val]).join("|");
  }
}
