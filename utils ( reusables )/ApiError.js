// This class extends the Error class of the js to create Error standard
class ApiError extends Error {
  constructor(statusCode, message, type = 'GENERAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
  }
}

export default ApiError;
