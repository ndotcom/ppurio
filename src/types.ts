import { errorMessages } from "./errorMessages";

/**
 * 발송메세지 파라미터
 */
export interface SendMessageParams {
  // 발신 번호 - 숫자만
  sender: string;
  // 수신 번호 - 여러명일 경우 배열로 입력
  receiver: string | string[];
  // 문자 내용 - 이름(names)값이 있다면 [*이름*]가 치환되서 발송됨
  message: string;
  // 이름 - 여러명일 경우 배열로 입력
  name?: string | string[];
  // 예약 발송 (현재시간 기준 10분이후 예약가능) 작성 예: 20190502093000
  appointmentDate?: string;
  // 제목 (30byte)
  subject?: string;
  // 포토 발송 (jpg, jpeg만 지원 300 K 이하)
  file1?: string;
}

/**
 * 메세지 발송취소시 파라미터
 */
export interface CancelReservationParams {
  // 취소할 예약한 메세지ID
  messageId: string;
}

export interface ResponseBase {
  result: "ok" | keyof typeof errorMessages;
}

// 전송요청 서버 응답값
export interface SendMessageResponse extends ResponseBase {
  // 전송된 메세지 형식
  type: "sms" | "lms" | "mms";

  // 메세지 ID
  msgid: string;

  // 성공한 횟수
  ok_cnt: number;
}

// 예약전송 실패 서버 응답값
export interface CancelReservationResponse extends ResponseBase {
  // 성공한 횟수
  ok_cnt: number;
}

// 전송성공 리턴값
export interface SuccessSendMessage {
  // 전송된 메세지 형식
  type: "sms" | "lms" | "mms";
  // 메세지 ID
  messageId: string;
  // 성공한 횟수
  okCount: number;
}

// 예약취소 성공 리턴값
export interface SuccessCancelReservation {
  // 성공한 횟수
  okCount: number;
}
