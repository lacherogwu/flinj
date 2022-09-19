interface Options {
	controllersDir: string;
	middlewaresDir: string;
}

interface App {
	start(port: number): void;
	addMiddleware(...middlewares: function[]): this;
}

export function createApp(options: Options): Promise<App>;
import AppError from '../src/AppError';
export function error(status: number, body: string): AppError;

import { Routes } from './ROUTES';

type Route = keyof Routes;
export function useMiddleware(...routes: Route[]): string[];
