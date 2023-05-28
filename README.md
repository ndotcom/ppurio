# ppurio

![npm](https://img.shields.io/npm/v/ppurio)
![npm](https://img.shields.io/npm/dt/ppurio)
![npm](https://img.shields.io/npm/l/ppurio)

뿌리오의 메세지 전송 연동을 위한 비공식 라이브러리입니다.

이 라이브러리는 Express와 같은 환경에서 직접 호출해서 사용할 수 있는 클래스 및 NestJS 모듈을 제공하며, 뿌리오 서비스로 메시지를 보내거나 예약한 메시지를 취소하는 기능을 제공합니다.

도움이 되셨다면 별 좀...(굽신굽신)


## 설치 방법

```
npm install ppurio
```

또는

```
yarn add ppurio
```

## 사용 방법

### 직접 호출하기

```typescript
import { Ppurio } from 'ppurio';

const ppurio = new Ppurio('yourUserId');
const params = {
  sender: '01012345678',
  receiver: '01087654321', // 복수 전송시 ['01012341234', '01022223333'] 과 같은 배열
  message: '테스트 메시지입니다.',
};

ppurio.sendMessage(params).then(console.log);
```

### NestJS 모듈로 사용하기

#### 모듈 Import

```typescript
import { PpurioModule } from 'ppurio';
```

#### 모듈 등록

app.module.ts에서 PpurioModule을 import하고, forRoot() 메서드에 사용자 ID를 전달하여 모듈을 등록합니다.

```typescript
@Module({
  imports: [PpurioModule.forRoot({ userId: 'yourUserId' })],
})
export class AppModule {}
```

forRootAsync()를 사용하여 비동기 방식으로 설정을 로드할 수도 있습니다.

```typescript
@Module({
  imports: [
    PpurioModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        userId: configService.get('PPURIO_USER_ID'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

#### 서비스 사용

PpurioService를 주입하여 뿌리오 서비스의 기능을 사용할 수 있습니다.

```typescript
import { PpurioService } from 'ppurio';

@Injectable()
export class YourService {
  constructor(private readonly ppurioService: PpurioService) {}

  async someMethod() {
    const params = {
      sender: '01012345678',
      receiver: ['01087654321'],
      message: '테스트 메시지입니다.',
    };
    const result = await this.ppurioService.sendMessage(params);
    console.log(result);
  }
}
```
## 매서드

### sendMessage(params: `SendMessageParams`) : `SuccessSendMessage`
```typescript
const sendMessageParams = {
    sender: 'SENDER_PHONE_NUMBER',
    receiver: 'RECEIVER_PHONE_NUMBER',
    message: 'Your message goes here',
    // Optional parameters
    name: 'Name goes here',
    appointmentDate: '20190502093000',
    subject: 'Subject goes here',
    file1: '/path/to/your/file.jpg',
};

try {
    const result = await ppurio.sendMessage(sendMessageParams);
    console.log(result);
} catch (error) {
    console.error(error);
}

```

### cancelReservation(params: `CancelReservationParams`) : `SuccessCancelReservation`
```typescript
const cancelReservationParams = {
    messageId: 'YOUR_MESSAGE_ID',
};

try {
    const result = await ppurio.cancelReservation(cancelReservationParams);
    console.log(result);
} catch (error) {
    console.error(error);
}

```


## 오류 처리
Ppurio는 PpurioException을 던져서 API 호출에서 발생하는 오류를 처리합니다. 이 예외는 오류 메시지와 오류 코드를 포함합니다.
```typescript
try {
  // Ppurio API call
} catch (error) {
  if (error instanceof PpurioException) {
    console.error(`An error occurred: ${error.message}, code: ${error.code}`);
  }
}
```


## 타입 및 에러 메시지

### 발송메세지 파라미터 (`SendMessageParams`)

| 속성명 | 타입 | 설명                                              |
| --- | --- |-------------------------------------------------|
| sender | string | 발신 번호 - 숫자만                                     |
| receiver | string \| string[] | 수신 번호 - 여러명일 경우 배열로 입력                          |
| message | string | 문자 내용 - 이름(name)값이 있다면 [*이름*]가 치환되서 발송됨         |
| name | string \| string[] (Optional) | 이름 - 여러명일 경우 배열로 입력                             |
| appointmentDate | string (Optional) | 예약 발송 (현재시간 기준 10분이후 예약가능) 작성 예: 20190502093000 |
| subject | string (Optional) | 제목 (최대 30byte)                                  |
| file1 | string (Optional) | 이미지파일 경로 (jpg, jpeg만 지원 300 K 이하)               |

### 메세지 발송취소시 파라미터 (`CancelReservationParams`)

| 속성명 | 타입 | 설명 |
| --- | --- | --- |
| messageId | string | 취소할 예약한 메세지ID |

### 전송성공 리턴값 (`SuccessSendMessage`)

| 속성명 | 타입 | 설명 |
| --- | --- | --- |
| type | "sms" \| "lms" \| "mms" | 전송된 메세지 형식 |
| messageId | string | 메세지 ID |
| okCount | number | 성공한 횟수 |

### 예약취소 성공 리턴값 (`SuccessCancelReservation`)

| 속성명 | 타입 | 설명 |
| --- | --- | --- |
| okCount | number | 성공한 횟수 |

### 에러 메시지 (`errorMessages`)

각 종류의 에러 메시지와 그에 대한 설명은 다음과 같습니다.

| 에러 메시지 | 설명 |
| --- | --- |
| invalid_member | 연동 서비스 신청이 안 됐거나 없는 아이디입니다. |
| under_maintenance | 요청 시간에 서버 점검 중입니다. |
| allow_https_only | HTTP 요청입니다. |
| invalid_ip | 등록된 접속 가능 IP가 아닙니다. |
| invalid_msg | 문자 내용에 오류가 있습니다. |
| invalid_names | 이름에 오류가 있습니다. |
| invalid_subject | 제목에 오류가 있습니다. |
| invalid_sendtime | 예약 발송 시간에 오류가 있습니다. |
| invalid_sendtime_maintenance | 예약 발송 시간에 서버 점검 예정입니다. |
| invalid_phone | 수신 번호에 오류가 있습니다. |
| invalid_msg_over_max | 문자 내용이 너무 긴 경우입니다. |
| invalid_callback | 발신 번호에 오류가 있습니다. |
| once_limit_over | 1회 최대 발송 건수를 초과한 경우입니다. |
| daily_limit_over | 1일 최대 발송 건수를 초과한 경우입니다. |
| not_enough_point | 잔액이 부족한 경우입니다. |
| over_use_limit | 한달 사용 금액을 초과한 경우입니다. |
| server_error | 기타 서버 오류입니다. |
| invalid_msgid | 발송 msgid에 오류가 있는 경우입니다. |
| master_not_exist | 취소할 발송 요청이 없는 경우입니다. |
| not_update_time | 예약 시간이 1분 이내여서 취소가 불가능한 경우입니다. |
| ing_master | 이미 전송 중인 경우입니다. |


## 참고

이 모듈은 뿌리오의 공식 라이브러리가 아닙니다. 이 모듈을 사용함으로써 발생하는 모든 문제에 대해서 뿌리오는 책임지지 않습니다.


## 문제 보고

이 라이브러리에 대한 버그 리포트나 기능 요청은 [이슈 트래커](https://github.com/ndotcom/ppurio/issues)를 이용해주세요.

## 라이센스

이 라이브러리는 [MIT 라이센스](LICENSE) 하에 배포됩니다. 