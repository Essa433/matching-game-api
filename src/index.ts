import { server } from './server';

server
	.listen({
		port: 3002,
		host: '0.0.0.0',
	})
	.catch((err) => {
		server.log.error(err);
		process.exit(1);
	});
