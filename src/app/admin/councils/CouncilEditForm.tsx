import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  deleteCouncilMutation,
  getAllCouncilsQueryKey,
  updateCouncilMutation,
} from "@/api/@tanstack/react-query.gen";
import type { CouncilRead, CouncilUpdate } from "@/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { Save } from "lucide-react";

const councilEditSchema = z.object({
  id: z.number(),
  name_sv: z.string().min(2),
  name_en: z.string().min(2),
  description_sv: z.string().nullable().optional(),
  description_en: z.string().nullable().optional(),
});

type CouncilEditFormType = z.infer<typeof councilEditSchema>;

interface CouncilEditFormProps {
  item: CouncilRead | null;
  onClose: () => void;
}

export default function CouncilEditForm({
  item,
  onClose,
}: CouncilEditFormProps) {
  const { t } = useTranslation("admin");
  const form = useForm<CouncilEditFormType>({
    resolver: zodResolver(councilEditSchema),
    defaultValues: {
      name_sv: "",
      name_en: "",
      description_sv: "",
      description_en: "",
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        ...item,
      });
    }
  }, [item, form]);

  const queryClient = useQueryClient();

  const updateCouncil = useMutation({
    ...updateCouncilMutation(),
    throwOnError: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getAllCouncilsQueryKey() });
      toast.success(t("councils.edit_success", "Utskottet har uppdaterats"));
    },
    onError: (error) => {
      toast.error(
        typeof error?.detail === "string"
          ? error.detail
          : t("councils.edit_error", "Kunde inte uppdatera utskott"),
      );
      onClose();
    },
  });

  const removeCouncil = useMutation({
    ...deleteCouncilMutation(),
    throwOnError: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getAllCouncilsQueryKey() });
      toast.success(t("councils.remove_success", "Utskottet har tagits bort"));
    },
    onError: (error) => {
      toast.error(
        typeof error?.detail === "string"
          ? error.detail
          : t("councils.remove_error", "Kunde inte ta bort utskott"),
      );
      onClose();
    },
  });

  function handleFormSubmit(values: CouncilEditFormType) {
    const updatedCouncil: CouncilUpdate = {
      name_sv: values.name_sv,
      name_en: values.name_en,
      description_sv: values.description_sv,
      description_en: values.description_en,
    };

    updateCouncil.mutate(
      {
        path: { council_id: values.id },
        body: updatedCouncil,
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  }

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  function handleRemoveSubmit() {
    removeCouncil.mutate(
      { path: { council_id: form.getValues("id") } },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  }

  return (
    <Dialog
      open={!!item}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <DialogContent className="min-w-fit lg:max-w-7xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t("councils.edit_council", "Redigera utskott")}
          </DialogTitle>
        </DialogHeader>
        <hr />
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="grid gap-x-4 gap-y-3 lg:grid-cols-4"
          >
            <FormField
              control={form.control}
              name="name_sv"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("councils.name_sv", "Namn (svenska)")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        "councils.name_placeholder",
                        "Utskottets namn",
                      )}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("councils.name_en", "Name (English)")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        "councils.name_placeholder",
                        "Council Name",
                      )}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description_sv"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("councils.description_sv", "Beskrivning (svenska)")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        "councils.description_sv",
                        "Beskrivning (svenska)",
                      )}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("councils.description_en", "Description (English)")}
                  </FormLabel>
                  <Textarea
                    placeholder={t(
                      "councils.description_en",
                      "Description (English)",
                    )}
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormItem>
              )}
            />
            <div className="space-x-2 lg:col-span-4 lg:grid-cols-subgrid">
              <ConfirmDeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleRemoveSubmit}
                triggerText={t("councils.remove_council")}
                title={t("councils.confirm_remove")}
                description={t("councils.confirm_remove_text")}
                confirmText={t("councils.remove_council")}
                cancelText={t("admin:cancel")}
              />
              <Button type="submit" className="w-32 min-w-fit">
                <Save />
                {t("save", "Spara")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
