import fastifyAutoload from '@fastify/autoload';
import fastifySwagger from '@fastify/swagger';
import fastify from 'fastify';
import { join } from 'path';

export const server = fastify({ logger: true });

server.register(fastifySwagger, {
	routePrefix: '/docs',
	exposeRoute: true,
	mode: 'dynamic',
	openapi: {
		info: {
			title: 'Red3lay API',
			version: '0.0.1',
		},
	},
});

server.register(fastifyAutoload, {
	dir: join(__dirname, 'routes'),
});
