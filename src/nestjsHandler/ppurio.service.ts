import { Injectable, Inject } from '@nestjs/common';
import {
  CancelReservationParams,
  Ppurio,
  SendMessageParams,
  SuccessCancelReservation,
  SuccessSendMessage,
} from '../index';

@Injectable()
export class PpurioService {
  private instance: Ppurio;

  constructor(@Inject('PPURIO_USER_ID') userId: string) {
    this.instance = new Ppurio(userId);
  }

  sendMessage(params: SendMessageParams): Promise<SuccessSendMessage> {
    return this.instance.sendMessage(params);
  }

  cancelReservation(
    params: CancelReservationParams,
  ): Promise<SuccessCancelReservation> {
    return this.instance.cancelReservation(params);
  }
}
