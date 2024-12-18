import type { GetDay } from "ptodo-common";
import { TaskMode } from "@/types";
import React from "react";
import cn from "clsx";
import { FoldVertical, Plus, UnfoldVertical } from "lucide-react";
import { useTask } from "@/components/context";
import { SelectTaskDialog } from "@/components/dialog";

type TimeCellTaskProps = GetDay["payload"]["tasks"][number];

export const TimeCellTask: React.FC<TimeCellTaskProps> = (task) => {
  const { mode, handleTaskInteraction } = useTask();
  const { id, description, complete } = task;

  return (
    <div
      className={cn("relative flex flex-col cursor-pointer px-4 py-2 rounded-lg group", {
        "bg-accent/10": complete,
        "bg-accent/50": !complete,
      })}
      onClick={() => handleTaskInteraction(task)}
    >
      <h3
        className={cn("scroll-m-20 text-lg tracking-tight", {
          "opacity-10": complete,
        })}
      >
        {description.includes(":") ? (
          <>
            <span className="text-muted-foreground">{description.split(":")[0]} </span>
            <span className="font-semibold">{description.split(":")[1]}</span>
          </>
        ) : (
          <span className="font-semibold">{description}</span>
        )}
      </h3>

      <div
        className={cn("group-hover:flex hidden absolute -right-0.5 -top-0.5 bg-accent h-2 w-2 z-10 rounded-full", {
          "bg-green-500/80": mode === TaskMode.DEFAULT && !complete,
          "bg-orange-500/80": mode === TaskMode.DEFAULT && complete,
          "bg-blue-500/80": mode === TaskMode.EDIT,
          "bg-red-500/80": mode === TaskMode.DELETE,
        })}
      />
    </div>
  );
};

interface TimeCellProps {
  hour: number;
  tasks: Omit<TimeCellTaskProps, "mode">[];
  openSelectTaskDialog: () => void;
}

export const TimeCell: React.FC<TimeCellProps> = ({ hour, tasks, openSelectTaskDialog }) => {
  const [minutesLeft, setMinutesLeft] = React.useState(getMinutesLeftInHour());

  const active = new Date().getHours() === hour;
  const complete = tasks.every((t) => t.complete);

  function getMinutesLeftInHour() {
    const now = new Date();
    const currentMinutes = now.getMinutes();
    const minutesLeft = 60 - currentMinutes;

    return minutesLeft;
  }

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMinutesLeft(getMinutesLeftInHour());
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div
        className={cn("my-4 px-4 flex gap-2 group", {
          "flex-col items-start gap-4": active,
          "items-center": !active,
        })}
      >
        <div className="flex items-center gap-1">
          <h3
            className={cn("w-20", {
              "text-accent": !active && hour <= new Date().getHours(),
              "text-muted-foreground": hour > new Date().getHours(),
              "text-foreground font-bold text-xl leading-none w-fit": active,
            })}
          >
            {hour % 12 === 0 ? 12 : hour % 12} {hour >= 12 ? "PM" : "AM"}
          </h3>
          {active && (
            <p className="ml-2 text-muted-foreground text-xs">
              <span className={cn({ "text-green-500/80": complete, "text-orange-500/80": !complete })}>
                {complete ? "Complete" : "Incomplete"}
              </span>{" "}
              • {tasks.filter((t) => t.complete).length}/{tasks.length} • {minutesLeft}m left
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {tasks.length > 0 ? (
            tasks.map((task) => <TimeCellTask {...task} />)
          ) : (
            <div className="group-hover:hidden h-10" />
          )}
          <div
            className="group-hover:flex hidden items-center justify-center gap-2 px-2 w-10 h-10 rounded-md border border-dashed text-accent hover:border-muted-foreground hover:text-muted-foreground cursor-pointer"
            onClick={openSelectTaskDialog}
          >
            <Plus className="w-4 h-4" />
          </div>
        </div>
      </div>

      <div className="h-0.5 bg-accent/30 w-full" />
    </>
  );
};

interface TimeBlock {
  tasks: GetDay["payload"]["tasks"];
}

export const TimeBlock: React.FC<TimeBlock> = ({ tasks }) => {
  const [showPastHours, setShowPastHours] = React.useState(false);
  const [selectTaskDialogOpen, setSelectTaskDialogOpen] = React.useState(false);
  const [selectedHour, setSelectedHour] = React.useState<number | null>();

  const openSelectTaskDialog = (hour: number) => {
    setSelectTaskDialogOpen(true);
    setSelectedHour(hour);
  };

  const closeSelectTaskDialog = () => {
    setSelectTaskDialogOpen(false);
    setSelectedHour(null);
  };

  const range = [9, 17]; // define 24 hour time range (9am - 5pm = 9 - 17)
  const currentHour = new Date().getHours();

  const displayedHours =
    !showPastHours && currentHour >= range[0] && currentHour <= range[1] ? [currentHour, range[1]] : range;
  console.log(displayedHours);

  const toggleShowPastHours = () => setShowPastHours((prev) => !prev);

  return (
    <>
      <div className="flex flex-col gap-2">
        {currentHour != range[0] && (
          <div className="h-4 cursor-pointer flex items-center group" onClick={toggleShowPastHours}>
            <div className="border-accent/30 group-hover:border-accent/80 w-full cursor-pointer rounded-md border border-dashed" />
            <div className="absolute left-[calc((100%-32px)/2)] flex">
              {showPastHours ? (
                <FoldVertical className="bg-background text-accent/80 group-hover:text-white" />
              ) : (
                <UnfoldVertical className="bg-background text-accent/80 group-hover:text-white" />
              )}
            </div>
          </div>
        )}
        {[...Array(displayedHours[1] - displayedHours[0] + 1).keys()]
          .map((hour) => hour + displayedHours[0])
          .map((hour) => (
            <TimeCell
              key={hour}
              hour={hour}
              tasks={tasks.filter(
                (t) =>
                  t.timeStart &&
                  t.timeEnd &&
                  parseInt(t.timeStart.split(":")[0]) <= hour &&
                  parseInt(t.timeEnd.split(":")[0]) > hour
              )}
              openSelectTaskDialog={() => openSelectTaskDialog(hour)}
            />
          ))}
      </div>

      {selectedHour != null && (
        <SelectTaskDialog hour={selectedHour} tasks={tasks} open={selectTaskDialogOpen} close={closeSelectTaskDialog} />
      )}
    </>
  );
};
