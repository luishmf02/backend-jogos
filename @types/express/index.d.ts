// @types/express/index.d.ts
import { Admin } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      admin?: Admin;
    }
  }
}
