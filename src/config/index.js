import { exists } from '../utils/files.js';
import { join } from 'path';

const loadConfig = async () => {
	const root = process.cwd();
	const configFileName = 'flinj.config.js';
	const configFile = join(root, configFileName);

	if (!(await exists(configFile))) {
		throw new Error(`You need to create a ${configFileName} file. See https://flinj.dev/docs/configuration`);
	}

	const { default: config } = await import(`file://${configFile}`);
	return config;
};

export const config = await loadConfig();
