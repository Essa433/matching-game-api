import { Contact, Meal, Menu } from '@prisma/client';
import { Static, Type } from '@sinclair/typebox';
import { ObjectId } from 'bson';
import { FastifyInstance } from 'fastify';
import Fuse from 'fuse.js';
import _ from 'lodash';
import { addAuthorization } from '../hooks/auth';
import { prismaClient } from '../prisma';

const Contact = Type.Object({
	contact_id: Type.String(),
	name: Type.String(),
	phone: Type.String(),
});

const ContactWithoutId = Type.Object({
	name: Type.String(),
	phone: Type.String(),
});
type ContactWithoutId = Static<typeof ContactWithoutId>;

const PartialContactWithoutId = Type.Partial(ContactWithoutId);
type PartialContactWithoutId = Static<typeof PartialContactWithoutId>;

const GetContactsQuery = Type.Object({
	text: Type.Optional(Type.String()),
});
type GetContactsQuery = Static<typeof GetContactsQuery>;

const ContactParams = Type.Object({
	contact_id: Type.String(),
});
type ContactParams = Static<typeof ContactParams>;

export let contacts: Contact[] = [
	{ contact_id: new ObjectId().toHexString(), name: 'Lamis', phone: '0511111111' },
	{ contact_id: new ObjectId().toHexString(), name: 'Lamis', phone: '0511111111' },
	{ contact_id: new ObjectId().toHexString(), name: 'Amani', phone: '0511111111' },
	{ contact_id: new ObjectId().toHexString(), name: 'Amani', phone: '0511111111' },
	{ contact_id: new ObjectId().toHexString(), name: 'Saleh', phone: '0511111111' },
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
	addAuthorization(server);

	/// Create contact without the need for contact_id
	server.route({
		method: 'POST',
		url: '/contacts',
		schema: {
			summary: 'Creates new contact',
			tags: ['Contacts'],
			body: ContactWithoutId,
		},
		handler: async (request, reply) => {
			const contact = request.body as ContactWithoutId;
			return await prismaClient.contact.create({
				data: contact,
			});
		},
	});

	/// Upsert one but all fields are required
	server.route({
		method: 'PUT',
		url: '/contacts',
		schema: {
			summary: 'Creates new contact + all properties are required',
			tags: ['Contacts'],
			body: Contact,
		},
		handler: async (request, reply) => {
			const contact = request.body as Contact;
			if (!ObjectId.isValid(contact.contact_id)) {
				reply.badRequest('contact_id should be an ObjectId!');
			} else {
				return await prismaClient.contact.upsert({
					where: { contact_id: contact.contact_id },
					create: contact,
					update: _.omit(contact, ['contact_id']),
				});
			}
		},
	});

	/// Update one by id
	server.route({
		method: 'PATCH',
		url: '/contacts/:contact_id',
		schema: {
			summary: 'Update a contact by id + you dont need to pass all properties',
			tags: ['Contacts'],
			body: PartialContactWithoutId,
			params: ContactParams,
		},
		handler: async (request, reply) => {
			const { contact_id } = request.params as ContactParams;
			if (!ObjectId.isValid(contact_id)) {
				reply.badRequest('contact_id should be an ObjectId!');
				return;
			}

			const contact = request.body as PartialContactWithoutId;

			return prismaClient.contact.update({
				where: { contact_id },
				data: contact,
			});
		},
	});

	/// Delete one by id
	server.route({
		method: 'DELETE',
		url: '/contacts/:contact_id',
		schema: {
			summary: 'Deletes a contact',
			tags: ['Contacts'],
			params: ContactParams,
		},
		handler: async (request, reply) => {
			const { contact_id } = request.params as ContactParams;
			if (!ObjectId.isValid(contact_id)) {
				reply.badRequest('contact_id should be an ObjectId!');
				return;
			}

			return prismaClient.contact.delete({
				where: { contact_id },
			});
		},
	});

	/// Get one by id
	server.route({
		method: 'GET',
		url: '/contacts/:contact_id',
		schema: {
			summary: 'Returns one contact or null',
			tags: ['Contacts'],
			params: ContactParams,
			response: {
				'2xx': Type.Union([Contact, Type.Null()]),
			},
		},
		handler: async (request, reply) => {
			const { contact_id } = request.params as ContactParams;
			if (!ObjectId.isValid(contact_id)) {
				reply.badRequest('contact_id should be an ObjectId!');
				return;
			}

			return prismaClient.contact.findFirst({
				where: { contact_id },
			});
		},
	});

	/// Get all contacts or search by name
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

			const contacts = await prismaClient.contact.findMany();
			if (!query.text) return contacts;

			const fuse = new Fuse(contacts, {
				includeScore: true,
				isCaseSensitive: false,
				includeMatches: true,
				findAllMatches: true,
				threshold: 1,
				keys: ['name', 'phone'],
			});

			console.log(JSON.stringify(fuse.search(query.text)));

			const result: Contact[] = fuse.search(query.text).map((r) => r.item);
			return result;
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
