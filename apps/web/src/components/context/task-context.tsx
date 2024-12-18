import type { ServerError, UpdateTask, DeleteTask, GetDay } from "ptodo-common";
import { TaskMode } from "@/types";
import * as React from "react";
import { type UseMutationResult, useMutation } from "react-query";
import { qc, api } from "@/lib/api";
import { sfx } from "@/lib/sfx";
import { useToast } from "@/components/ui";
import { UpdateTaskDialog } from "@/components/dialog";

type TaskProviderProps = {
  children: React.ReactNode;
};

type TaskProviderState = {
  mode: TaskMode;
  setMode: (mode: TaskMode) => void;
  openEditDialog: (task: GetDay["payload"]["tasks"][number]) => void;
  updateTask: UseMutationResult<UpdateTask["payload"], ServerError, { id: string; data: UpdateTask["body"] }>;
  deleteTask: UseMutationResult<DeleteTask["payload"], ServerError, string>;
  handleTaskInteraction: (task: GetDay["payload"]["tasks"][number]) => void;
};

const initialState: TaskProviderState = {
  mode: TaskMode.DEFAULT,
  setMode: () => {},
  openEditDialog: () => {},
  deleteTask: (() => {}) as never,
  updateTask: (() => {}) as never,
  handleTaskInteraction: () => {},
};

const TaskProviderContext = React.createContext<TaskProviderState>(initialState);

export function TaskProvider({ children }: TaskProviderProps) {
  const { toast } = useToast();
  const [mode, setMode] = React.useState<TaskMode>(TaskMode.DEFAULT);
  const [currentTask, setCurrentTask] = React.useState<GetDay["payload"]["tasks"][number] | null>(null);

  const [editDialogOpen, setEditDialogOpen] = React.useState<boolean>(false);

  const closeEditDialog = () => {
    setCurrentTask(null);
    setEditDialogOpen(false);
  };

  const openEditDialog: TaskProviderState["openEditDialog"] = (task) => {
    setCurrentTask(task);
    setEditDialogOpen(true);
  };

  const updateTask = useMutation<UpdateTask["payload"], ServerError, { id: string; data: UpdateTask["body"] }>({
    mutationFn: ({ id, data }) => api.tasks.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries("currentDay");
      sfx.complete().play();
    },
    onError: () => {
      toast({ title: "Failed to update task", variant: "destructive" });
    },
  });

  const deleteTask = useMutation<DeleteTask["payload"], ServerError, string>({
    mutationFn: (id) => api.tasks.delete(id),
    onSuccess: () => {
      qc.invalidateQueries("currentDay");
      sfx.delete().play();
    },
    onError: () => {
      toast({ title: "Failed to delete task", variant: "destructive" });
    },
  });

  const handleTaskInteraction: TaskProviderState["handleTaskInteraction"] = (task) => {
    if (mode === TaskMode.DEFAULT) return updateTask.mutate({ id: task.id, data: { complete: !task.complete } });
    if (mode === TaskMode.EDIT) return openEditDialog(task);
    if (mode === TaskMode.DELETE) return deleteTask.mutate(task.id);
  };

  const value: TaskProviderState = {
    mode,
    setMode,
    openEditDialog,
    handleTaskInteraction,
    updateTask,
    deleteTask,
  };

  return (
    <TaskProviderContext.Provider value={value}>
      {children}
      {currentTask != null && <UpdateTaskDialog task={currentTask} open={editDialogOpen} close={closeEditDialog} />}
    </TaskProviderContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTask = () => {
  const context = React.useContext(TaskProviderContext);
  if (context === undefined) throw new Error("usePRS must be used within a TaskProvider");
  return context;
};
