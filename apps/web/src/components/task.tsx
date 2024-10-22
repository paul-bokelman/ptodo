import * as React from "react";
import type { GetDay, ServerError, UpdateTask, DeleteTask } from "prs-common";
import cn from "clsx";
import { useMutation } from "react-query";
import { TaskMode } from "@/types";
import { UpdateTaskDialog } from "@/components/dialog";
import { useToast } from "@/components/ui";
import { Circle, CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { sfx } from "@/lib/sfx";
import { usePRS } from "@/components";

type Props = GetDay["payload"]["tasks"][number] & {
  selected?: boolean;
  mode: TaskMode;
};

export const Task: React.FC<Props> = ({ mode, selected, ...task }) => {
  const { toast } = useToast();
  const { revalidateContext } = usePRS();
  const [updateDialogOpen, setUpdateDialogOpen] = React.useState<boolean>(false);
  const [onHover, setOnHover] = React.useState<boolean>(false);

  const { id, description, complete } = task;

  const updateTask = useMutation<UpdateTask["payload"], ServerError, { id: string; data: UpdateTask["body"] }>({
    mutationFn: ({ id, data }) => api.tasks.update(id, data),
    onSuccess: () => {
      revalidateContext();
      sfx.complete().play();
    },
    onError: () => {
      toast({ title: "Failed to update task", variant: "destructive" });
    },
  });

  const deleteTask = useMutation<DeleteTask["payload"], ServerError, string>({
    mutationFn: (id) => api.tasks.delete(id),
    onSuccess: () => {
      revalidateContext();
      sfx.delete().play();
    },
    onError: () => {
      toast({ title: "Failed to delete task", variant: "destructive" });
    },
  });

  const closeUpdateDialog = () => setUpdateDialogOpen(false);
  const openUpdateDialog = () => setUpdateDialogOpen(true);

  const handleInteraction = () => {
    if (mode === TaskMode.DEFAULT) return updateTask.mutate({ id, data: { complete: !complete } });
    if (mode === TaskMode.EDIT) return openUpdateDialog();
    if (mode === TaskMode.DELETE) return deleteTask.mutate(id);
  };

  React.useEffect(() => {
    if (onHover) {
      sfx.select.play();
    }
  }, [onHover]);

  return (
    <>
      <div
        onMouseEnter={() => setOnHover(true)}
        onMouseLeave={() => setOnHover(false)}
        className={cn(
          { "bg-accent/50": selected },
          "flex flex-col cursor-pointer hover:bg-accent/50 px-4 py-2 rounded-lg group"
        )}
        onClick={handleInteraction}
      >
        <div className="grid grid-cols-2 items-center">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="scroll-m-20 text-lg tracking-tight">
                {description.includes(":") ? (
                  <>
                    <span className="rounded-sm font-normal text-muted-foreground">{description.split(":")[0]}</span>
                    <span className="font-semibold">{description.split(":")[1]}</span>
                  </>
                ) : (
                  <span className="font-semibold">{description}</span>
                )}
              </h3>
            </div>
            <p className="leading-7 text-muted-foreground text-xs">
              {new Date().toDateString()} •{" "}
              <span className={cn({ "text-green-500/80": complete, "text-orange-500/80": !complete })}>
                {complete ? "Complete" : "Incomplete"}
              </span>
            </p>
          </div>
          <div className="hidden group-hover:flex place-self-end self-center mr-6">
            {mode === TaskMode.DEFAULT &&
              (complete ? (
                <Circle className="text-orange-500/80" size={20} />
              ) : (
                <CheckCircle2 className="text-green-500/80" size={20} />
              ))}
            {mode === TaskMode.EDIT && <Pencil className="text-blue-500/80" size={20} />}
            {mode === TaskMode.DELETE && <Trash2 className="text-red-500/80" size={20} />}
          </div>
        </div>
      </div>
      <UpdateTaskDialog task={{ id, description }} open={updateDialogOpen} close={closeUpdateDialog} />
    </>
  );
};
