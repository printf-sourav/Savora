import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { admin, isFirebaseConfigured } from "../config/firebase.js";
import { generateAccessAndRefreshTokens } from "./auth.controller.js"; // This isn't exported, wait, let's just create firebaseLogin inside auth.controller.js
