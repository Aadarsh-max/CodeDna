import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

export const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  let message = err.message;

  if (err.name === "CastError") {
    statusCode = 404;
    message = "Resource not found";
  }

  if (err.code === 11000) {
    statusCode = 400;
    message = "Duplicate field value entered";
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(", ");
  }

  logger.error(`${req.method} ${req.originalUrl} - ${statusCode} - ${err.stack}`);

  res.status(statusCode).json({
    success: false,
    message,
    stack: env.nodeEnv === "production" ? null : err.stack,
  });
};