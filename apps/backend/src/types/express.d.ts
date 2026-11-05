
export {};

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        role: "SUPER_ADMIN" | "SUB_ADMIN" | "EMPLOYEE";
      };
    }
  }
}
