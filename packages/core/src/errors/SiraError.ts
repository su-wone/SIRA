export class SiraError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "SiraError";
    this.code = code;
  }
}
