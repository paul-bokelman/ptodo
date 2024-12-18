import type { GetDay } from "ptodo-common";
import * as React from "react";
import cn from "clsx";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Button } from "@/components/ui";
import { Loader } from "lucide-react";
import { useTask } from "@/components/context";

interface SelectTaskDialogProps {
  open: boolean;
  close: () => void;
  hour: number;
  tasks: GetDay["payload"]["tasks"];
}

export const SelectTaskDialog: React.FC<SelectTaskDialogProps> = ({ tasks, hour, open, close }) => {
  const { updateTask } = useTask();
  const [selectedTasks, setSelectedTasks] = React.useState<string[]>([]);

  const [isLoading, setLoading] = React.useState(false);
  const handleTaskSelection = (id: string) => {
    if (selectedTasks.includes(id)) {
      setSelectedTasks(selectedTasks.filter((currentId) => currentId != id));
    } else {
      setSelectedTasks((tasks) => [id, ...tasks]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    for (const id of selectedTasks) {
      const time = `${hour}:00-${hour + 1}:00`;
      await updateTask.mutateAsync({ id, data: { time } });
    }

    setLoading(false);
    close();
  };

  React.useEffect(() => {
    setSelectedTasks([]);
  }, [open]);

  return (
    <Dialog open={open} defaultOpen={false}>
      <DialogContent onEscapeKeyDown={close} onInteractOutside={close}>
        <DialogHeader>
          <DialogTitle>
            Select Tasks for {hour % 12 === 0 ? 12 : hour % 12} {hour >= 12 ? "PM" : "AM"}
          </DialogTitle>
          <DialogDescription>Select one or multiple tasks for this time segment</DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-2">
          {tasks.map(({ id, description }) => (
            <div
              key={id}
              className={cn("relative flex flex-col cursor-pointer px-4 py-2 rounded-lg group border-2 bg-accent/50", {
                "border-blue-500": selectedTasks.includes(id),
                "border-transparent": !selectedTasks.includes(id),
              })}
              onClick={() => handleTaskSelection(id)}
            >
              <h3 className="scroll-m-20 text-lg tracking-tight">
                {description.includes(":") ? (
                  <>
                    <span className="text-muted-foreground">{description.split(":")[0]} </span>
                    <span className="font-semibold">{description.split(":")[1]}</span>
                  </>
                ) : (
                  <span className="font-semibold">{description}</span>
                )}
              </h3>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 mt-2">
          <Button type="submit" onClick={handleSubmit} disabled={isLoading} className="w-fit">
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Updating
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
