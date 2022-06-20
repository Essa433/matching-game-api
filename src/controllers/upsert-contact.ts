export function upsertContactController(contacts: any[], newContact: any) {
	const contactIndex = contacts.findIndex((el) => el.id === newContact.id);
	if (contactIndex === -1) {
		contacts.push(newContact);
	} else {
		contacts[contactIndex] = {
			...contacts[contactIndex],
			...newContact,
		};
	}
	return contacts;
}
