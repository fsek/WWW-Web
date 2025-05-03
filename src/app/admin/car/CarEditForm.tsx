import { useEffect } from "react";
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
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { AdminChooseDates } from "@/widgets/AdminChooseDates";
import {
  getAllBookingQueryKey,
  updateBookingMutation,
  removeBookingMutation,
} from "@/api/@tanstack/react-query.gen";
import type { CarRead, CarUpdate } from "../../../api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

interface CarEditFormProps {
  open: boolean;
  onClose: () => void;
  selectedBooking: CarRead;
}

export default function CarEditForm({
  open,
  onClose,
  selectedBooking,
}: CarEditFormProps) {
  const { t } = useTranslation();

  const carEditSchema = z.object({
    id: z.number().int(),
    description: z.string().min(1),
    start_time: z.string(),
    end_time: z.string(),
  }).refine(
    (data) => {
      // Check if start time equals end time
      if (new Date(data.start_time).getTime() === new Date(data.end_time).getTime()) {
        return false;
      }

      // Check if start time is after end time
      if (new Date(data.start_time).getTime() > new Date(data.end_time).getTime()) {
        return false;
      }

      return true;
    },
    {
      message: t("admin:car.error_start_end"),
      path: ["end_time"] // Shows the error on the end time field
    }
  );

  type CarEditFormType = z.infer<typeof carEditSchema>;

  const form = useForm<CarEditFormType>({
    resolver: zodResolver(carEditSchema),
    defaultValues: {
      id: 0,
      description: "",
      start_time: "",
      end_time: "",
    },
  });

  useEffect(() => {
    if (open && selectedBooking) {
      form.reset({
        ...selectedBooking,
        id: selectedBooking.id,
        start_time: new Date(selectedBooking.start_time).toISOString(),
        end_time: new Date(selectedBooking.end_time).toISOString(),
      });
    }
  }, [selectedBooking, form, open]);

  const queryClient = useQueryClient();

  const updateBooking = useMutation({
    ...updateBookingMutation(),
    throwOnError: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getAllBookingQueryKey() });
    },
    onError: () => {
      onClose();
    },
  });

  const removeBooking = useMutation({
    ...removeBookingMutation(),
    throwOnError: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getAllBookingQueryKey() });
    },
    onError: () => {
      onClose();
    },
  });

  function handleFormSubmit(values: CarEditFormType) {
    const updatedBooking: CarUpdate = {
      description: values.description,
      start_time: new Date(values.start_time),
      end_time: new Date(values.end_time),
    };

    updateBooking.mutate(
      {
        path: { booking_id: values.id },
        body: updatedBooking,
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  }

  function handleRemoveSubmit() {
    const bookingId = form.getValues("id");
    if (bookingId) {
      removeBooking.mutate(
        { path: { booking_id: bookingId } },
        {
          onSuccess: () => {
            onClose();
          },
        },
      );
    } else {
      console.error("Cannot remove booking: ID is missing.");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <DialogContent className="min-w-fit lg:max-w-7xl">
        <DialogHeader>
          <DialogTitle>{t("admin:car.edit_booking")}</DialogTitle>
        </DialogHeader>
        <hr />
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="grid gap-x-4 gap-y-3 lg:grid-cols-4"
          >
            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin:description")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("admin:description")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Start Time Field */}
            <FormField
              control={form.control}
              name="start_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin:car.start_time")}</FormLabel>
                  <AdminChooseDates
                    value={new Date(field.value)}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* End Time Field */}
            <FormField
              control={form.control}
              name="end_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin:car.end_time")}</FormLabel>
                  <AdminChooseDates
                    value={new Date(field.value)}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Button Section */}
            <div className="space-x-2 lg:col-span-2 lg:grid-cols-subgrid">
              <Button
                 type="button"
                 variant="outline"
                 className="w-32 min-w-fit"
                 onClick={() => console.log("Preview:", form.getValues())}
               >
                 {t("admin:preview")}
              </Button>

              <Button
                variant="destructive"
                type="button"
                className="w-32 min-w-fit"
                onClick={handleRemoveSubmit}
              >
                {t("admin:remove")}
              </Button>

              <Button type="submit" className="w-32 min-w-fit">
                {t("admin:save")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}