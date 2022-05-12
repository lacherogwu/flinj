import AppError from './AppError.js';

/**
 *
 * @returns {function}
 */
export const notFoundErrorHandler = (req, res, next) => next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));

/**
 *
 * @callback ErrorHandlerCallback
 * @param {Error} err
 * @returns {new AppError}
 */

/**
 * @typedef {{ identifier: string, value: any, mode: ('EQ'|'IN'), handler: ErrorHandlerCallback }} ErrorHandlerObject
 */

/**
 *
 * @param {{ errorsList: ErrorHandlerObject[], debug: boolean }} options
 * @returns {function}
 */
export const globalErrorHandler = options => {
	// TODO: allow to manipulate response
	const { errorsList = [], debug = false } = options;

	const modes = {
		EQ: (a, b) => a === b,
		IN: (a, b) => a.includes(b),
	};

	const findError = err => errorsList.find(item => modes[item.mode || 'EQ'](err[item.identifier], item.value));

	const handler = (err, req, res, next) => {
		if (debug) console.log(err);

		const { isOperational, data } = err;
		let { message, statusCode = 500 } = err;

		if (!isOperational) {
			const errorObject = findError(err);
			if (!errorObject) {
				statusCode = 500;
				message = 'Something went wrong!';
				if (!debug) console.log(err);
			} else {
				const error = errorObject.handler(err);
				return handler(error, req, res, next);
			}
		}

		return res.status(statusCode).json({ success: false, message, data });
	};

	return handler;
};
