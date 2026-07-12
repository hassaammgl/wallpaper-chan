export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

export function handleApiError(error) {
  console.error("API Error:", error);
  const statusCode = error.statusCode || 500;
  const message = error.isOperational
    ? error.message
    : "Internal server error";
  return Response.json({ success: false, message }, { status: statusCode });
}
