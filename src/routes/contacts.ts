import { Meal, Menu } from '@prisma/client';
import { Static, Type } from '@sinclair/typebox';
import { FastifyInstance } from 'fastify';
import { upsertContactController } from '../controllers/upsert-contact';
import { prismaClient } from '../prisma';

const Contact = Type.Object({
	id: Type.String({ format: 'uuid' }),
	name: Type.String(),
	phone: Type.String(),
});
type Contact = Static<typeof Contact>;

const GetContactsQuery = Type.Object({
	name: Type.Optional(Type.String()),
});
type GetContactsQuery = Static<typeof GetContactsQuery>;

export let contacts: Contact[] = [
	{ id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'Lamis', phone: '0511111111' },
	{ id: '3fa85f64-5717-4562-b3fc-2c963f66afa5', name: 'Lamis', phone: '0511111111' },
	{ id: '3fa85f64-5717-4562-b3fc-2c963f66afa2', name: 'Amani', phone: '0511111111' },
	{ id: '3fa85f64-5717-4562-b3fc-2c963f66afa1', name: 'Amani', phone: '0511111111' },
	{ id: '3fa85f64-5717-4562-b3fc-2c963f66afa3', name: 'Amal', phone: '0511111111' },
	{ id: '3', name: 'Azizah', phone: '123123123' },
];

const Meal = Type.Object({
	meal_id: Type.String(),
	title: Type.String(),
	description: Type.String(),
	type: Type.String(),
	price: Type.Number(),
	calories: Type.Number(),
	image_url: Type.String(),
	size: Type.String(),
});

const Menu = Type.Object({
	menu_id: Type.String(),
	title: Type.String(),
	restaurant_name: Type.String(),
	meals: Type.Array(Meal),
});

export default async function (server: FastifyInstance) {
	server.route({
		method: 'PUT',
		url: '/contacts',
		schema: {
			summary: 'Creates new contact + all properties are required',
			tags: ['Contacts'],
			body: Contact,
		},
		handler: async (request, reply) => {
			const newContact: any = request.body;
			return upsertContactController(contacts, newContact);
		},
	});

	server.route({
		method: 'PATCH',
		url: '/contacts/:id',
		schema: {
			summary: 'Update a contact by id + you dont need to pass all properties',
			tags: ['Contacts'],
			body: Type.Partial(Contact),
			params: Type.Object({
				id: Type.String({ format: 'uuid' }),
			}),
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
			params: Type.Object({
				id: Type.String({ format: 'uuid' }),
			}),
		},
		handler: async (request, reply) => {
			const id = (request.params as any).id as string;

			contacts = contacts.filter((c) => c.id !== id);

			return contacts;
		},
	});

	server.route({
		method: 'GET',
		url: '/contacts/:id',
		schema: {
			summary: 'Returns one contact or null',
			tags: ['Contacts'],
			params: Type.Object({
				id: Type.String({ format: 'uuid' }),
			}),
			response: {
				'2xx': Type.Union([Contact, Type.Null()]),
			},
		},
		handler: async (request, reply) => {
			const id = (request.params as any).id as string;

			return contacts.find((c) => c.id === id) ?? null;
		},
	});

	server.route({
		method: 'GET',
		url: '/contacts',
		schema: {
			summary: 'Gets all contacts',
			tags: ['Contacts'],
			querystring: GetContactsQuery,
			response: {
				'2xx': Type.Array(Contact),
			},
		},
		handler: async (request, reply) => {
			const query = request.query as GetContactsQuery;

			if (query.name) {
				return contacts.filter((c) => c.name.includes(query.name ?? ''));
			} else {
				return contacts;
			}
		},
	});

	server.route({
		method: 'PUT',
		url: '/menus',
		schema: {
			summary: 'Creates new menu',
			tags: ['Menu'],
			body: Menu,
		},
		handler: async (request, reply) => {
			const menu = request.body as Menu;
			await prismaClient.menu.create({
				data: menu,
			});

			return prismaClient.menu.findMany();
		},
	});
}
