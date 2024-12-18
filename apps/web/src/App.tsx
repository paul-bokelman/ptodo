import { TaskMode } from "@/types";
import * as React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import cn from "clsx";
import dayjs from "dayjs";
import { Plus, ChevronLeft, ChevronRight, CalendarClock, ClipboardList } from "lucide-react";
import { Tasks, TimeBlock } from "@/components";
import { Button, Tabs, TabsList, TabsTrigger } from "@/components/ui";
import { CreateTaskDialog } from "@/components/dialog";
import { api, qc } from "@/lib/api";
import { sfx } from "@/lib/sfx";
import { useTask } from "@/components/context";

interface Props {}

const App: React.FC<Props> = () => {
  const navigate = useNavigate();
  const { mode, setMode } = useTask();
  const [params] = useSearchParams(location.search);
  const [createDialogOpen, setCreateDialogOpen] = React.useState<boolean>(false);
  const [viewMode, setViewMode] = React.useState<"list" | "time">("list");

  const date = params.get("date");

  const { data: day, status } = useQuery(["currentDay", date], () => api.days.get(date as string));

  const closeCreateDialog = () => setCreateDialogOpen(false);

  const changeTaskMode = (incomingMode: string) => {
    const currentMode = TaskMode[incomingMode.toUpperCase() as keyof typeof TaskMode];
    if (currentMode === mode) return;
    setMode(currentMode);
    sfx.click.play();
  };

  const changeQueryDate = (direction: "increment" | "decrement") => {
    const newDate = dayjs(date as string)
      .add(direction === "increment" ? 1 : -1, "day")
      .format("YYYY-MM-DD");
    params.set("date", newDate);
    navigate(`/?${params.toString()}`);
    sfx.click.play();
    qc.invalidateQueries(["currentDay", date]);
  };

  const cycleViewMode = () => {
    const views = ["list", "time"] as const;
    const currentIndex = views.indexOf(viewMode);
    const nextIndex = (currentIndex + 1) % views.length;
    setViewMode(views[nextIndex]);
    params.set("view", views[nextIndex]);
    navigate(`/?${params.toString()}`);
  };

  React.useEffect(() => {
    if (params.get("date") === null) {
      params.set("date", dayjs().format("YYYY-MM-DD"));
    }
    navigate(`/?${params.toString()}`);
  }, [navigate, params]);

  React.useEffect(() => {
    const persistedViewParam = params.get("view");
    if (!persistedViewParam || !["list", "time"].includes(persistedViewParam)) {
      params.set("view", "list");
    } else {
      setViewMode(persistedViewParam as "list" | "time");
    }
  }, [params]);

  return (
    <>
      <div className="relative w-screen flex flex-col gap-2 p-4">
        <div className="relative flex flex-row items-center gap-4">
          <h1 className="scroll-m-20 text-sm text-muted-foreground tracking-tight">PAB</h1>
          <span className="text-xs text-muted-foreground">—</span>
          {day?.stats ? (
            <div className="flex items-center gap-3">
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
            <span className="text-xs leading-7 text-muted-foreground">...</span>
          )}
        </div>

        <div className="relative flex flex-col gap-4 mt-2">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4" />
            </Button>

            <Tabs defaultValue="default" onValueChange={changeTaskMode} className="w-auto">
              <TabsList>
                <TabsTrigger value="default">Default</TabsTrigger>
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="delete">Delete</TabsTrigger>
              </TabsList>
            </Tabs>

            <Button variant="outline" size="icon" onClick={cycleViewMode}>
              {viewMode === "list" ? <ClipboardList className="h-4 w-4" /> : <CalendarClock className="h-4 w-4" />}
            </Button>

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
              {!day.tasks.length ? (
                <span className="text-xs text-muted-foreground">No tasks found, create some!</span>
              ) : viewMode === "time" ? (
                <TimeBlock tasks={day.tasks} />
              ) : (
                <Tasks tasks={day.tasks} />
              )}
            </>
          ) : (
            <span className={cn({ "text-red-500": status === "error" }, "mt-2 ml-2 text-xs text-muted-foreground")}>
              {status === "error" ? "Something went wrong" : "Loading tasks..."}
            </span>
          )}
        </div>
      </div>
      <CreateTaskDialog open={createDialogOpen} close={closeCreateDialog} />
    </>
  );
};

export default App;
