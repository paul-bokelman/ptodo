import axios from "axios";
import { ControllerConfig, GetDay, DeleteTask, UpdateTask, CreateTask, ImportRoutine } from "prs-common";
import { QueryClient } from "react-query";

export const qc = new QueryClient();

export const client = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  withCredentials: true,
});

const get = <C extends ControllerConfig>(url: string) => client.get<C["payload"]>(url).then((r) => r.data);
const post = <C extends ControllerConfig>(url: string, data?: C["body"]) =>
  client.post<C["payload"]>(url, data).then((r) => r.data);

/* ---------------------------------- DAYS ---------------------------------- */
const getDay = (date: string) => get<GetDay>(`/days?date=${date}`);
const importRoutine = (id: string) => post<ImportRoutine>(`/days/${id}/routine`);

/* ---------------------------------- TASKS --------------------------------- */
const updateTask = (id: string, data: UpdateTask["body"]) => post<UpdateTask>(`/tasks/${id}/update`, data);
const deleteTask = (id: string) => post<DeleteTask>(`/tasks/${id}/delete`);
const createTask = (data: CreateTask["body"]) => post<CreateTask>(`/tasks/create`, data);

export const api = {
  days: { get: getDay, routine: importRoutine },
  tasks: { update: updateTask, delete: deleteTask, create: createTask },
};
