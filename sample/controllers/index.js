export const get = ctx => {};
export const get_something = ctx => {};
export const get_something1 = ctx => {};
export const get_something2 = ctx => {};
// export const get_something3 = ctx => {};
// export const get_something4 = ctx => {};
// export const get_something5 = ctx => {};
// export const get_something6 = ctx => {};
// export const get_something7 = ctx => {};
// export const get_something8 = ctx => {};
// export const get_something9 = ctx => {};
// export const get_something10 = ctx => {};

// export const put = ctx => {};
// export const put_something1 = ctx => {};
// export const put_something2 = ctx => {};
// export const put_something3 = ctx => {};
// export const put_something4 = ctx => {};

export const post = ctx => {};
export const post_something1 = ctx => {};
// export const post_something2 = ctx => {};
// export const post_something3 = ctx => {};
// export const post_something4 = ctx => {};

// export const del = ctx => {};
// export const del_something1 = ctx => {};
// export const del_something2 = ctx => {};
// export const del_something3 = ctx => {};
// export const del_something4 = ctx => {};

// export const middlewares = ['get:a,c,core'];
// prettier-ignore
export const middlewares = [
    'get*,post*:a',
    'get,post*:c',
    'get*,post*:core',
];
