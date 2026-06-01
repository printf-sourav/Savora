import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

// TASK 5: Middleware that reads express-validator results and throws on first error
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(422, errors.array()[0].msg);
  }
  next();
};
