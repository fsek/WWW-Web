import { getMeEventSignupOptions, getMeEventSignupQueryKey, updateEventSignupRouteMutation, eventSignupRouteMutation, eventSignoffRouteMutation, getMeOptions } from "@/api/@tanstack/react-query.gen"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { LoadingErrorCard } from "@/components/LoadingErrorCard"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { SelectFromOptions } from "@/widgets/SelectFromOptions"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { UserCheck, UserX, Edit, Save, X, LogOut, FilePenLine } from "lucide-react"
import type { EventRead, EventSignupRead, EventSignupUpdate } from "@/api/types.gen"

const signupSchema = z.object({
  priority: z.string().optional(),
  group_name: z.string().optional(),
  drinkPackage: z.enum(["None", "AlcoholFree", "Alcohol"]),
});

interface SignupCardProps {
  event: EventRead;
  availablePriorities: string[];
}

export default function SignupCard({ event, availablePriorities }: SignupCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: signupData, isLoading, isError, error } = useQuery({
    ...getMeEventSignupOptions({ path: { event_id: event.id } }),
    retry: 0,
    refetchOnWindowFocus: false
  });

  const { data: meData, isLoading: isMeLoading, isError: isMeError } = useQuery({
    ...getMeOptions(),
    refetchOnWindowFocus: false,
  });

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      priority: signupData?.priority || "",
      group_name: signupData?.group_name || "",
      drinkPackage: signupData?.drinkPackage || "None",
    },
  });

  // Reset form when signupData changes (including when it's cleared)
  useEffect(() => {
    if (signupData) {
      form.reset({
        priority: signupData.priority || "",
        group_name: signupData.group_name || "",
        drinkPackage: signupData.drinkPackage || "None",
      });
    } else {
      form.reset({
        priority: "",
        group_name: "",
        drinkPackage: "None",
      });
    }
  }, [signupData, form]);

  const createSignupMutation = useMutation({
    ...eventSignupRouteMutation(),
    onSuccess: () => {
      toast.success(t("event.signup.success_create"));
      queryClient.invalidateQueries({ queryKey: getMeEventSignupQueryKey({ path: { event_id: event.id } }) });
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(t("event.signup.error_create", { error: error?.detail || "Unknown error" }));
    },
  });

  const updateSignupMutation = useMutation({
    ...updateEventSignupRouteMutation(),
    onSuccess: () => {
      toast.success(t("event.signup.success_update"));
      queryClient.invalidateQueries({ queryKey: getMeEventSignupQueryKey({ path: { event_id: event.id } }) });
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(t("event.signup.error_update", { error: error?.detail || "Unknown error" }));
    },
  });

  const signoffMutation = useMutation({
    ...eventSignoffRouteMutation(),
    onSuccess: () => {
      toast.success(t("event.signup.success_signoff"));
      // Remove old signup so buttons disappear
      queryClient.removeQueries({
        queryKey: getMeEventSignupQueryKey({ path: { event_id: event.id } }),
        exact: true,
      });
      // Switch into "add new signup" mode
      setIsEditing(false);
      form.reset({
        priority: "",
        group_name: "",
        drinkPackage: "None",
      });
    },
    onError: (error) => {
      toast.error(t("event.signup.error_signoff", { error: error?.detail || "Unknown error" }));
    },
  });

  if (isMeLoading) {
    return <LoadingErrorCard />
  }

  const onSubmit = (values: z.infer<typeof signupSchema>) => {
    const submitData: EventSignupUpdate = {
      priority: values.priority,
      group_name: values.group_name || null,
      drinkPackage: values.drinkPackage,
    };

    if (signupData) {
      // Update existing signup
      updateSignupMutation.mutate({
        path: { event_id: event.id },
        body: submitData,
      });
    } else {
      // Create new signup
      createSignupMutation.mutate({
        path: { event_id: event.id },
        body: submitData,
      });
    }
  };

  function handleSignoff() {
    if (!event.id || !signupData) {
      return () => { };
    }

    return () => {
      signoffMutation.mutate({
        path: { event_id: event.id },
        query: { user_id: signupData.user.id },
      });
    };
  }

  // Not a great way but works for now
  const showSignupForm =
    isError && typeof error === "object" && "detail" in error && (error as any).detail.includes("Signup not found");

  const drinkPackageOptions = [
    { value: "None", label: t("event.signup.drink_package.none") },
    { value: "AlcoholFree", label: t("event.signup.drink_package.alcohol_free") },
    { value: "Alcohol", label: t("event.signup.drink_package.alcohol") },
  ];

  const priorityOptions =
    (availablePriorities.map((p) => ({
      value: p,
      label: p.charAt(0).toUpperCase() + p.slice(1),
    }))) || [];

  if (isLoading) {
    return <LoadingErrorCard />
  }

  return (
    <Card className="w-full hover:shadow-md transition-shadow duration-200 scroll-mt-40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FilePenLine className="w-5 h-5" />
          <span>{t("event.signup.title")}</span>
          {signupData && !isEditing && (
            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleSignoff()}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                {t("event.signup.signoff_button")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                {t("event.signup.edit_button")}
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showSignupForm || isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Only show priority select if availablePriorities is provided and non-empty, or if event priorities exist */}
              {(availablePriorities?.length || event.priorities?.length) ? (
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold mb-2 text-med">{t("event.signup.priority")}</FormLabel>
                      <FormControl>
                        <SelectFromOptions
                          options={priorityOptions}
                          placeholder={t("event.signup.select_priority")}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}

              <FormField
                control={form.control}
                name="group_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold mb-2 text-med">{t("event.signup.group_name")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("event.signup.group_name_placeholder")}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="drinkPackage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold mb-2 text-med">{t("event.signup.drink_package.title")}</FormLabel>
                    <FormControl>
                      <SelectFromOptions
                        options={drinkPackageOptions}
                        placeholder={t("event.signup.select_drink_package")}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  disabled={createSignupMutation.isPending || updateSignupMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {signupData ? t("event.signup.update_button") : t("event.signup.button")}
                </Button>
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      form.reset();
                    }}
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    {t("common.cancel")}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        ) : signupData ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold mb-2 text-med text-muted-foreground">{t("event.signup.user")}</p>
                <p className="font-medium">{`${signupData.user.first_name} ${signupData.user.last_name}`}</p>
              </div>

              <div>
                <p className="font-semibold mb-2 text-med text-muted-foreground">{t("event.signup.priority")}</p>
                <Badge variant="secondary">
                  {signupData.priority.charAt(0).toUpperCase() + signupData.priority.slice(1)}
                </Badge>
              </div>

              {signupData.group_name && (
                <div>
                  <p className="font-semibold mb-2 text-med text-muted-foreground">{t("event.signup.group_name")}</p>
                  <p className="font-medium">{signupData.group_name}</p>
                </div>
              )}

              <div>
                <p className="font-semibold mb-2 text-med text-muted-foreground">{t("event.signup.drink_package.title")}</p>
                <Badge variant="outline">
                  {drinkPackageOptions.find(opt => opt.value === signupData.drinkPackage)?.label || signupData.drinkPackage}
                </Badge>
              </div>

              <div className="md:col-span-2">
                <p className="font-semibold mb-2 text-med text-muted-foreground">{t("event.signup.status")}</p>
                <div className="flex items-center gap-2">
                  {signupData.confirmed_status ? (
                    <>
                      <UserCheck className="w-4 h-4 text-green-600" />
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        {t("event.signup.confirmed")}
                      </Badge>
                    </>
                  ) : (
                    <>
                      <UserX className="w-4 h-4 text-yellow-600" />
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        {t("event.signup.pending")}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">{t("event.signup.not_found")}</p>
            <Button onClick={() => setIsEditing(true)}>
              {t("event.signup.button")}
            </Button>
          </div>
        )}
        <hr className="my-4" />
        <div>
          <p className="font-semibold mb-1">{t("event.signup.food_preferences_title")}</p>
          <p className="text-sm text-muted-foreground mb-2">
            {t("event.signup.food_preferences_explainer")}
          </p>
          <div className="flex flex-col gap-1">
            <div>
              <span className="font-medium">{t("event.signup.standard_food_preferences")}</span>{" "}
              {meData?.standard_food_preferences && meData.standard_food_preferences.length > 0
                ? meData.standard_food_preferences.join(", ")
                : t("event.signup.none")}
            </div>
            <div>
              <span className="font-medium">{t("event.signup.other_food_preferences")}</span>{" "}
              {meData?.other_food_preferences
                ? meData.other_food_preferences
                : t("event.signup.none")}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}