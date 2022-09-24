# Flinj

| :exclamation: This is an experimental project. You definitely shouldn't try and use it, yet. |
| -------------------------------------------------------------------------------------------- |

The fasest way to build REST API

![Flinching](https://media.giphy.com/media/TpXiNmXLdpOaEENYci/giphy.gif)

# API

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

export function GET(ctx) {
	const { firstName, lastName } = ctx.query;

	return { message: `Hello ${firstName} ${lastName}!` };
}

export async function POST(ctx) {
	const { email, password } = ctx.body;

	await db.createUser({ email, password });
}

export async function POST_login(ctx) {
	const { email, password } = ctx.body;

	const user = await login(email, password);
	ctx.setCookie('jwt', 'eyTOKEN', { httpOnly: true, secure: true, maxAge: 1000 * 60 * 60 * 24 * 3 });

	return user;
}

export async function DELETE_$id(ctx) {
	const { id } = ctx.params;

	await db.deleteUser(id);
}
```

```js
// /path/to/middlewares/auth.js

import { error } from 'flinj';

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
