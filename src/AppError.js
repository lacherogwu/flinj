export default class AppError extends Error {
	/**
	 *
	 * @param {string} message - Error message
	 * @param {number} statusCode - HTTP status code
	 * @param {*} data - Additional data (optional)
	 */
	constructor(message, statusCode, data = undefined) {
		super(message);
		this.statusCode = statusCode;
		this.isOperational = true;
		this.data = data;

		Error.captureStackTrace(this, this.constructor);
	}
}
