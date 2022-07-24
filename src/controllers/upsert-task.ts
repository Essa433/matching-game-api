export function upsertTaskController(tasks: any[], newTask: any) {
	const taskIndex = tasks.findIndex((el) => el.id === newTask.id);
	if (taskIndex === -1) {
		tasks.push(newTask);
	} else {
		tasks[taskIndex] = {
			...tasks[taskIndex],
			...newTask,
		};
	}
	return tasks;
}
