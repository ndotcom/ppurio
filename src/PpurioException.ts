export class PpurioException extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    Object.setPrototypeOf(this, PpurioException.prototype);

    this.name = "PpurioException";
    this.code = code;
  }
}
