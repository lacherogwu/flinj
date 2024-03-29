# Flinj

| :construction: This project is still in development. You should use it with caution. |
| ------------------------------------------------------------------------------------ |

The fasest way to build REST API

![Flinching](https://media.giphy.com/media/TpXiNmXLdpOaEENYci/giphy.gif)

## Installation

```bash
npm i flinj
```

## Usage

```js
import { createApp } from 'flinj';
// import morgan from 'morgan';

const app = await createApp({
	controllersDir: '/path/to/controllers',
	middlewaresDir: '/path/to/middlewares',
	debug: true, // to see which routes was registered
});

// app.addMiddleware(morgan('tiny'));

app.start(3000);
```

```js
// /path/to/controllers/auth.js

/** @type {import('flinj').Controller} */
export function GET(ctx) {
	const { firstName, lastName } = ctx.query;

	return { message: `Hello ${firstName} ${lastName}!` };
}

/** @type {import('flinj').Controller} */
export async function POST(ctx) {
	const { email, password } = ctx.body;

	await db.createUser({ email, password });
}

/** @type {import('flinj').Controller} */
export async function POST_login(ctx) {
	const { email, password } = ctx.body;

	const user = await login(email, password);
	ctx.setCookie('jwt', 'eyTOKEN', { httpOnly: true, secure: true, maxAge: 1000 * 60 * 60 * 24 * 3 });

	return user;
}

/** @type {import('flinj').Controller} */
export async function DELETE_$id(ctx) {
	const { id } = ctx.params;

	await db.deleteUser(id);
}
```

```js
// /path/to/middlewares/auth.js

import { error } from 'flinj';

/** @type {import('flinj').Controller} */
export default async ctx => {
	const { cookies } = ctx;

	const token = cookies?.jwt;
	ctx.setHeaders({
		'x-custom-header': 'x-custom',
	});

	try {
		const tokenResponse = await validateToken(token);
		ctx.stuff.auth = {
			userId: tokenResponse.userId,
		};
	} catch (err) {
		throw error(401, 'Unauthorized');
	}
};

/** @type {import('flinj').Routes} */
export const use = ['auth/*'];
```

## TOOD:

- [ ] add tests
