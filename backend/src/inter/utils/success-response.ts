export function successResponse(message: string, data?: any) {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}
