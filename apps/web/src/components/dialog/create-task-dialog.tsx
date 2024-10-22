import type { ServerError, CreateTask } from "prs-common";
import * as React from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation } from "react-query";
import { type SubmitHandler, type SubmitErrorHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { schemas } from "prs-common";
import {
  useToast,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Button,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui";
import { api } from "@/lib/api";
import { sfx } from "@/lib/sfx";
import dayjs from "dayjs";
import { usePRS } from "..";
import { Loader } from "lucide-react";

interface Props {
  open: boolean;
  close: () => void;
}

type FormValues = Omit<z.infer<typeof schema>, "day">;

const schema = schemas.task.create.shape.body;

export const CreateTaskDialog: React.FC<Props> = ({ open, close }) => {
  const { toast } = useToast();
  const { revalidateContext } = usePRS();
  const [params] = useSearchParams(location.search);

  const createTask = useMutation<CreateTask["payload"], ServerError, { data: CreateTask["body"] }>({
    mutationFn: ({ data }) => api.tasks.create(data),
    onSuccess: () => {
      revalidateContext();
      sfx.success.play();
    },
    onError: () => {
      toast({ title: "Failed to create task", variant: "destructive" });
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema.omit({ day: true })),
    defaultValues: { description: "", complete: false },
  });

  const validSubmission: SubmitHandler<FormValues> = async (data) => {
    await createTask.mutateAsync({ data: { day: dayjs(params.get("date")).format("YYYY-MM-DD"), ...data } });
    close();
  };

  const invalidSubmission: SubmitErrorHandler<FormValues> = (errors) => {
    console.log(errors);
  };

  React.useEffect(() => {
    if (open) {
      form.reset();
      sfx.click.play();
    }
  }, [open, form]);

  return (
    <Dialog open={open} defaultOpen={false}>
      <DialogContent onEscapeKeyDown={close} onInteractOutside={close}>
        <DialogHeader>
          <DialogTitle>New Task</DialogTitle>
          <DialogDescription>Create a new task with a description</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 mt-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(validSubmission, invalidSubmission)} className="space-y-8">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="math hw" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={createTask.isLoading}>
                {createTask.isLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Creating
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
