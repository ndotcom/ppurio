import {
  Ppurio,
  SendMessageParams,
  CancelReservationParams,
  PpurioException,
} from "../src";
import axios from "axios";
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Ppurio", () => {
  const userId = "testId";
  const sender = "01012345678";
  const receiver = "01098765432";

  const ppurio = new Ppurio(userId);
  const sendMessageParams: SendMessageParams = {
    sender,
    receiver,
    message: "Test message",
  };

  describe("sendMessage", () => {
    it("should send a message successfully", async () => {
      const mockedResponse = {
        data: {
          result: "ok",
          type: "sms",
          msgid: "mockMessageId",
          ok_cnt: 1,
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockedResponse);

      const response = await ppurio.sendMessage(sendMessageParams);

      expect(response).toEqual({
        type: "sms",
        messageId: "mockMessageId",
        okCount: 1,
      });
    });
  });

  describe("cancelReservation", () => {
    it("should reserve and cancel a message successfully", async () => {
      const reservationParams = {
        ...sendMessageParams,
        appointmentDate: "20230528120000", // 예약발송 설정
      };

      const mockedReservationResponse = {
        data: {
          result: "ok",
          type: "sms",
          msgid: "mockReservationId",
          ok_cnt: 1,
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockedReservationResponse);

      const reservationResponse = await ppurio.sendMessage(reservationParams);
      expect(reservationResponse).toEqual({
        type: "sms",
        messageId: "mockReservationId",
        okCount: 1,
      });

      const cancelReservationParams: CancelReservationParams = {
        messageId: reservationResponse.messageId,
      };

      const mockedCancelReservationResponse = {
        data: {
          result: "ok",
          ok_cnt: 1,
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockedCancelReservationResponse);

      const cancelResponse = await ppurio.cancelReservation(
        cancelReservationParams
      );

      expect(cancelResponse).toEqual({
        okCount: 1,
      });
    });
  });
});

describe("PpurioException", () => {
  it("should throw PpurioException with invalid userId", async () => {
    const invalidUserId = "invalidUserId";
    const ppurioWithInvalidUserId = new Ppurio(invalidUserId);
    const sendMessageParams = {
      sender: "1234567890",
      receiver: "0987654321",
      message: "Hello, World!",
    };

    const mockedResponse = {
      data: {
        result: "invalid_member",
      },
    };

    mockedAxios.post.mockResolvedValueOnce(mockedResponse);

    await expect(
      ppurioWithInvalidUserId.sendMessage(sendMessageParams)
    ).rejects.toThrowError(PpurioException);
  });
});
