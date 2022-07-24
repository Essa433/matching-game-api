import { Type } from '@sinclair/typebox';
import { ObjectId } from 'bson';
import { FastifyInstance } from 'fastify';
import _ from 'lodash';
import { prismaClient } from '../prisma';

const MatchingGame = Type.Object({
	// game_id: Type.String(),
	created_at: Type.String(),
	name: Type.String(),
	attempts: Type.String(),
	Mistakes: Type.String(),
	complation_parcentage: Type.String(),
	total_time: Type.String(),

});

export default async function (server: FastifyInstance) {
	server.route({
		method: 'POST',
		url: '/games',
		schema: {
			summary: 'Upsert game',
			tags: ['Games'],
			body: MatchingGame,
		},
		handler: async (request, reply) => {
			const game = request.body as any;
			return await prismaClient.matchingGame.create({
				data: game,

			});
		},
	});


	// /// Delete one by id
	// server.route({
	// 	method: 'DELETE',
	// 	url: '/tasks/:task_id',
	// 	schema: {
	// 		summary: 'Deletes a task',
	// 		tags: ['Tasks'],
	// 		params: Type.Object({
	// 			task_id: Type.String(),
	// 		}),
	// 	},
	// 	handler: async (request, reply) => {
	// 		const { task_id } = request.params as any;
	// 		if (!ObjectId.isValid(task_id)) {
	// 			reply.badRequest('task_id should be an ObjectId!');
	// 			return;
	// 		}

	// 		return prismaClient.matchingGame.delete({
	// 			where: { task_id },
	// 		});
	// 	},
	// });

	/// Get all contacts or search by name
	server.route({
		method: 'GET',
		url: '/games',
		schema: {
			summary: 'Gets all Games',
			tags: ['Games'],

			response: {
				'2xx': Type.Array(MatchingGame),
			},
		},
		handler: async (request, reply) => {
			return await prismaClient.matchingGame.findMany();
		},
	});
}
