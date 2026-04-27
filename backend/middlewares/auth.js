import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";

// Middleware to authenticate dashboard users
export const isAdminAuthenticated = catchAsyncErrors(
  async (req, res, next) => {
    const token = req.cookies.adminToken;
    if (!token) {
      return next(
        new ErrorHandler("Dashboard User is not authenticated!", 400)
      );
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decoded.id);
    if (req.user.role !== "Admin") {
      return next(
        new ErrorHandler(`${req.user.role} not authorized for this resource!`, 403)
      );
    }
    next();
  }
);

// Middleware to authenticate frontend users
export const isPatientAuthenticated = async (req, res, next) => {
  try {
    const token =
      req.cookies.patientToken ||
      req.headers.authorization?.split(" ")[1];

    console.log("TOKEN:", token);

    if (!token) {
      return next(new ErrorHandler("Patient not authenticated!", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    console.log("DECODED:", decoded);

    req.user = await User.findById(decoded.id);

    console.log("USER:", req.user);

    next();
  } catch (error) {
    return next(new ErrorHandler("Invalid token!", 401));
  }
};

export const isAuthorized = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `${req.user.role} not allowed to access this resource!`
        )
      );
    }
    next();
  };
};