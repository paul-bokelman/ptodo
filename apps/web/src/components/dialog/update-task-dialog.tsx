import type { UpdateTask, ServerError } from "prs-common";
import * as React from "react";
import { useMutation } from "react-query";
import { type SubmitHandler, type SubmitErrorHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { schemas } from "prs-common";
import { usePRS } from "@/components/prs-provider";
import { api } from "@/lib/api";
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
import { Loader } from "lucide-react";

interface Props {
  task: { id: string; description: string };
  open: boolean;
  close: () => void;
}

type FormValues = z.infer<typeof schema>;

const schema = schemas.task.update.shape.body;

export const UpdateTaskDialog: React.FC<Props> = ({ task, open, close }) => {
  const { revalidateContext } = usePRS();
  const { toast } = useToast();

  const updateTask = useMutation<UpdateTask["payload"], ServerError, { id: string; data: UpdateTask["body"] }>({
    mutationFn: ({ id, data }) => api.tasks.update(id, data),
    onSuccess: () => revalidateContext(),
    onError: () => {
      toast({ title: "Failed to update task", variant: "destructive" });
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { description: task.description, complete: false, dayId: undefined },
  });

  const validSubmission: SubmitHandler<FormValues> = async (data) => {
    await updateTask.mutateAsync({ id: task.id, data });
    close();
  };

  const invalidSubmission: SubmitErrorHandler<FormValues> = (errors) => {
    console.log(errors);
  };

  // hate this block...
  React.useEffect(() => {
    form.setValue("description", task.description);
  }, [form, task]);

  return (
    <Dialog open={open} defaultOpen={false}>
      <DialogContent onEscapeKeyDown={close} onInteractOutside={close}>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>Edit the description and date of this task.</DialogDescription>
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
                      <Input placeholder={task.description} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={updateTask.isLoading}>
                {updateTask.isLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Updating
                  </>
                ) : (
                  "Update"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
