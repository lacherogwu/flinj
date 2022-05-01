export const get_$projectId_workspace_$workspaceId = ctx => {
	throw new Error('balagan');
	return { cool: true, ctx };
};

export const get_$id = ctx => {
	return {
		// status: 303,
		// headers: {
		// 	location: '/projects/124/workspace/123',
		// },
		body: 'cool',
	};
};

export const middlewares = ['core', 'auth'];
