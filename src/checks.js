import chalk from 'chalk';

const warn = chalk.black.bgHex('#e5e510')(' WARN ');
const green = chalk.green;
const gray = chalk.gray;

const log = (currentItem, foundItem) => {
	console.log(warn, green(currentItem.method.toUpperCase()), currentItem.route, 'collided with', green(foundItem.method.toUpperCase()), foundItem.route, '\n', gray(`${currentItem.file} → ${foundItem.file}`));
};

/**
 *
 * @param {{ method: string, route: string }[]} controllers
 */
export const checkRouteCollision = controllers => {
	const newList = [];
	const routes = controllers.map(({ method, route, file }) => ({ method, route, file }));

	routes.forEach(item => {
		const { method, route, file } = item;

		let cleanRoute = route;

		const matches = route.match(/\/:[\w$]+/g);
		if (matches) {
			matches.forEach(match => {
				cleanRoute = cleanRoute.replace(match, '{param}');
			});
		}

		const foundItem = newList.find(item => item.cleanRoute === cleanRoute && item.method === method);
		if (foundItem) {
			log(item, foundItem);
		}

		newList.push({ method, route, cleanRoute, file });
	});
};
