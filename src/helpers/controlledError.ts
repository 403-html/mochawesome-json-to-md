export class ControlledError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ControlledError";
    this.stack = "";
  }
}
