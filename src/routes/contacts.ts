import { FastifyInstance } from 'fastify';
import { upsertContactController } from '../controllers/upsert-contact';

export let contacts: any[] = [
	{ id: 1, name: 'Lamis', phone: '0511111111' },
	{ id: 2, name: 'Amani', phone: '0511111111' },
	{ id: 3, name: 'Azizah', phone: '0511111111' },
];

export default async function (server: FastifyInstance) {
	server.route({
		method: 'PUT',
		url: '/contacts/upsert',
		schema: {
			summary: 'Updates or insets a contact',
			tags: ['Contacts'],
			body: {},
		},
		handler: async (request, reply) => {
			const newContact: any = request.body;
			return upsertContactController(contacts, newContact);
		},
	});

	server.route({
		method: 'DELETE',
		url: '/contacts/:id',
		schema: {
			summary: 'Deletes a contact',
			tags: ['Contacts'],
		},
		handler: async (request, reply) => {
			const id = (request.params as any).id as string;

			contacts = contacts.filter((c) => c.id !== +id);

			return contacts;
		},
	});

	server.route({
		method: 'GET',
		url: '/contacts',
		schema: {
			summary: 'Gets all contacts',
			tags: ['Contacts'],
		},
		handler: async (request, reply) => {
			return contacts;
		},
	});
}
