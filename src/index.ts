import { EmployeeRole, OrderPayment } from '@prisma/client';
import { connectDb, prismaClient } from './prisma';
import { listen } from './server';

async function start() {
	await connectDb();
	listen();
	test();
}
start();

async function test() {
	await prismaClient.order.create({
		data: {
			meals: [],
			togo: true,
			date: new Date(),
			rating: -1,
			payment: OrderPayment.card,
			employee: {
				create: {
					name: 'Ahlam',
					role: EmployeeRole.chief,
				},
			},
		},
	});
}
