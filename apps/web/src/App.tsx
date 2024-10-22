import type { ImportRoutine, ServerError } from "prs-common";
import { TaskMode } from "@/types";
import * as React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import cn from "clsx";
import dayjs from "dayjs";
import { Plus, ArrowRight, ChevronLeft, ChevronRight, ArrowBigDownDash } from "lucide-react";
import { Task } from "@/components";
import { Button, Tabs, TabsList, TabsTrigger, useToast } from "@/components/ui";
import { CreateTaskDialog } from "@/components/dialog";
import { api, qc } from "@/lib/api";
import { sfx } from "@/lib/sfx";
import { usePRS, Countdown } from "@/components";

interface Props {}

const App: React.FC<Props> = () => {
  const { online, currentTaskIndex, revalidateContext } = usePRS();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams(location.search);
  const [taskMode, setTaskMode] = React.useState<TaskMode>(TaskMode.DEFAULT);
  const [createDialogOpen, setCreateDialogOpen] = React.useState<boolean>(false);

  const date = params.get("date");

  const { data: day, status } = useQuery(["currentDay", date], () => api.days.get(date as string));

  const importRoutine = useMutation<ImportRoutine["payload"], ServerError, string>({
    mutationFn: (id) => api.days.routine(id),
    onSuccess: () => {
      revalidateContext();
      qc.invalidateQueries(["currentDay", date]);
      toast({ title: "Routine imported" });
    },
    onError: () => {
      toast({ title: "Failed to import routine", variant: "destructive" });
    },
  });

  const closeCreateDialog = () => setCreateDialogOpen(false);

  const changeTaskMode = (mode: string) => {
    const currentMode = TaskMode[mode.toUpperCase() as keyof typeof TaskMode];
    if (currentMode === taskMode) return;
    setTaskMode(currentMode);
    sfx.click.play();
  };

  const changeQueryDate = (direction: "increment" | "decrement") => {
    const newDate = dayjs(date as string)
      .add(direction === "increment" ? 1 : -1, "day")
      .format("YYYY-MM-DD");
    params.set("date", newDate);
    navigate(`/?${params.toString()}`);
    sfx.click.play();
  };

  React.useEffect(() => {
    if (params.get("date") === null) {
      params.set("date", dayjs().format("YYYY-MM-DD"));
    }
    navigate(`/?${params.toString()}`);
  }, [navigate, params]);

  return (
    <>
      <div className="relative w-screen h-screen flex flex-col gap-2 p-20">
        <div className="relative flex flex-col">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">Physical Reward System</h1>
          <p className="leading-7 text-muted-foreground mt-4">
            Here's everything you gotta do to stay on track. You got this! 🚀
          </p>
        </div>

        <div className="relative flex flex-col gap-4 mt-2">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="icon" onClick={() => importRoutine.mutate(day!.id)}>
              <ArrowBigDownDash className="h-4 w-4" />
            </Button>

            <Tabs defaultValue="default" onValueChange={changeTaskMode} className="w-auto">
              <TabsList>
                <TabsTrigger value="default">Default</TabsTrigger>
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="delete">Delete</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => changeQueryDate("decrement")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className={cn({ "text-muted-foreground": dayjs(date).isSame(dayjs(), "day") }, "text-sm")}>
                {dayjs(date).format("ddd, MMM DD")}
              </span>
              <Button variant="outline" size="icon" onClick={() => changeQueryDate("increment")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {status === "success" ? (
            <>
              <div className="flex items-center gap-2">
                {day.tasks.map((task, i) => (
                  <span
                    key={i}
                    className={cn(
                      { "text-muted": task.complete, "text-muted-foreground": !task.complete },
                      "flex items-center gap-1 text-xs"
                    )}
                  >
                    {task.description} {day.tasks.length > i + 1 && <ArrowRight size={12} />}
                  </span>
                ))}
              </div>
              {!day.tasks.length && (
                <span className="text-xs text-muted-foreground">No tasks currently, create some!</span>
              )}
              <div className="grid grid-cols-3 gap-1">
                {day.tasks.map((task, i) => (
                  <Task key={i} {...task} mode={taskMode} selected={online && currentTaskIndex === i} />
                ))}
              </div>
            </>
          ) : (
            <span className={cn({ "text-red-500": status === "error" }, "text-xs text-muted-foreground")}>
              {status === "error" ? "Something went wrong" : "Loading tasks..."}
            </span>
          )}
        </div>
        <div className="absolute bottom-20 left-20 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className={cn({ "bg-green-500": online, "bg-red-500": !online }, "h-2 w-2 rounded-full")} />
            <p className="text-xs italic leading-7 text-muted-foreground">PRS system {online ? "online" : "offline"}</p>
          </div>
          {day?.stats ? (
            <div className="flex items-center gap-3">
              {/* this is kinda messy, should it be abstracted or just expanded? */}
              {[
                `⚡️ ${day.stats.streak}`,
                `🏆 ${day.stats.totalCompleted}`,
                `${day.stats.ratio.incline ? "📈" : "📉"} ${day.stats.ratio.value}`,
              ].map((value) => (
                <span key={value} className="text-xs leading-7 text-muted-foreground">
                  {value}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">...</span>
          )}
          <Countdown />
        </div>
      </div>
      <CreateTaskDialog open={createDialogOpen} close={closeCreateDialog} />
    </>
  );
};

export default App;
