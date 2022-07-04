import { Static, Type } from '@sinclair/typebox';
import { FastifyInstance } from 'fastify';
import { prismaClient } from '../prisma';

const LoginBody = Type.Object({
	email: Type.String({ format: 'email' }),
	password: Type.String(),
});
type LoginBody = Static<typeof LoginBody>;

export default async function (server: FastifyInstance) {
	server.route({
		method: 'POST',
		url: '/login',
		schema: {
			summary: 'Login a user and returns a token',
			body: LoginBody,
		},
		handler: async (request, reply) => {
			const { email, password } = request.body as LoginBody;

			const user = await prismaClient.user.findFirst({
				where: {
					email: email,
				},
			});
			if (!user) {
				const result = await prismaClient.user.create({
					data: {
						email: email,
						password: password,
						name: '',
						phone: '',
					},
				});

				const token = server.jwt.sign({
					id: result.user_id,
					email: result.email,
					name: result.name,
					role: 'admin',
				});

				return {
					id: result.user_id,
					token,
					type: 'SignUp',
				};
			} else {
				if (user.password !== password) {
					reply.unauthorized();
					return;
				}

				const token = server.jwt.sign({
					id: user.user_id,
					email: user.email,
					name: user.name,
					role: 'admin',
				});

				return {
					id: user.user_id,
					token,
					type: 'SignIn',
				};
			}
		},
	});
}
