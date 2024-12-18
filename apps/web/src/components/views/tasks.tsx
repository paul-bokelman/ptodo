import * as React from "react";
import type { GetDay } from "ptodo-common";
import cn from "clsx";
import { TaskMode } from "@/types";
import { Circle, CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { sfx } from "@/lib/sfx";

import { useTask } from "@/components/context";

type TaskProps = GetDay["payload"]["tasks"][number];

export const Task: React.FC<TaskProps> = (task) => {
  const { mode, handleTaskInteraction } = useTask();

  const { id, description, complete, timeStart, timeEnd } = task;

  const [onHover, setOnHover] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (onHover) {
      sfx.select.play();
    }
  }, [onHover]);

  return (
    <div
      onMouseEnter={() => setOnHover(true)}
      onMouseLeave={() => setOnHover(false)}
      className="flex flex-col cursor-pointer hover:bg-accent/50 px-4 py-2 rounded-lg group"
      onClick={() => handleTaskInteraction(task)}
    >
      <div className="grid grid-cols-2 items-center">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="scroll-m-20 text-lg tracking-tight">
              {description.includes(":") ? (
                <>
                  <span className="text-muted-foreground">{description.split(":")[0]}</span>
                  <span className="font-semibold">{description.split(":")[1]}</span>
                </>
              ) : (
                <span className="font-semibold">{description}</span>
              )}
            </h3>
          </div>
          <p className="leading-7 text-muted-foreground text-xs">
            {timeStart && timeEnd ? `${timeStart}-${timeEnd}` : "Timeless"} •{" "}
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
  );
};

interface TasksProps {
  tasks: GetDay["payload"]["tasks"];
}

export const Tasks: React.FC<TasksProps> = ({ tasks }) => {
  return (
    <div className="grid md:grid-cols-3 gap-1">
      {tasks.map((task, i) => (
        <Task key={i} {...task} />
      ))}
    </div>
  );
};
