class AppError extends Error {
  constructor(message, statusCode) {
    super(message); //inbuild object of parent class
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail ' : 'error';
    this.isOperational = true;
  }
}
module.exports = AppError;
