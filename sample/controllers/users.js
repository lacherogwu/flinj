'use strict';

/** @type {import('../../src/index').Ctx} */
export function POST(ctx) {
	const { setCookie, setHeaders, url } = ctx;
	setCookie('a', 'b', {});

	setHeaders({
		item: 'asaf',
		some: 1,
		aaa: '',
		aa: {
			on: {
				asa: 1,
			},
		},
	});
}
export function PATCH_$id() {}
export function DELETE_me() {}
export function DELETE_$id() {}
