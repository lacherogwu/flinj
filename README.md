# Flinj

| :exclamation: This is an experimental project. You definitely shouldn't try and use it, yet. |
| -------------------------------------------------------------------------------------------- |

The fasest way to build REST API

![Flinching](https://media.giphy.com/media/TpXiNmXLdpOaEENYci/giphy.gif)

# API

```js
import { createApp } from 'flinj';

const app = await createApp({
	controllersDir: '/path/to/controllers',
	middlewaresDir: '/path/to/middlewares',
});

app.start(3000);
```

```js
// /path/to/controllers/auth.js

export function GET(ctx) {
	const { query } = ctx;
	const { firstName, lastName } = query;

	return { message: `Hello ${firstName} ${lastName}!` };
}

export async function POST(ctx) {
	const { body } = ctx;
	const { email, password } = body;

	await db.createUser({ email, password });
}

export function DELETE_$id(ctx){
  const { params} = ctx
  const { id } = params

  await db.deleteUser(id)
}
```

```js
// /path/to/middlewares/auth.js

import { useMiddleware, error } from 'flinj';

export default async ctx => {
	const { cookies } = ctx;

	const token = cookies?.jwt;

	try {
		const tokenResponse = await validateToken(token);
		ctx.stuff.auth = {
			userId: tokenResponse.userId,
		};
	} catch (err) {
		throw error(401, 'Unauthorized');
	}
};

export const use = useMiddleware('auth/*');
```
