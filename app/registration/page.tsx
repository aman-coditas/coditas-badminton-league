"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useForm, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import CblDisclaimer from "@/components/CblDisclaimer";
import CblGuidelines from "@/components/CblGuidelines";
import { validateEmailsBeforePayment } from "@/lib/api";

const jersey_size_options = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"] as const;

const phone_schema = z.string().regex(/^\d{10}$/, "Must be a 10-digit number");
const dob_schema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter DOB");
const jersey_number_schema = z.string().regex(/^\d{1,3}$/, "Jersey number must be numeric");
const jersey_size_schema = z.enum(jersey_size_options, { message: "Select a valid jersey size" });
const coditas_email_schema = z
  .string()
  .email("Invalid email address")
  .refine((value) => value.trim().toLowerCase().endsWith("@coditas.com"), "Please use coditas email");

const team_details_schema = z
  .object({
  malePlayer1Name: z.string().min(2, "Name must be at least 2 characters"),
  malePlayer1Email: coditas_email_schema,
  malePlayer1Dob: dob_schema,
  malePlayer1ContactNumber: phone_schema,
  malePlayer1WhatsAppNumber: phone_schema,
  malePlayer1Address: z.string().min(2, "Address is required"),
  malePlayer1EmployeeId: z.string().min(2, "Employee ID is required"),
  malePlayer1JerseyNumber: jersey_number_schema,
  malePlayer1JerseyName: z.string().min(1, "Jersey name is required"),
  malePlayer1JerseySize: jersey_size_schema,

  malePlayer2Name: z.string().min(2, "Name must be at least 2 characters"),
  malePlayer2Email: coditas_email_schema,
  malePlayer2Dob: dob_schema,
  malePlayer2ContactNumber: phone_schema,
  malePlayer2WhatsAppNumber: phone_schema,
  malePlayer2Address: z.string().min(2, "Address is required"),
  malePlayer2EmployeeId: z.string().min(2, "Employee ID is required"),
  malePlayer2JerseyNumber: jersey_number_schema,
  malePlayer2JerseyName: z.string().min(1, "Jersey name is required"),
  malePlayer2JerseySize: jersey_size_schema,

  femalePlayer1Name: z.string().min(2, "Name must be at least 2 characters"),
  femalePlayer1Email: coditas_email_schema,
  femalePlayer1Dob: dob_schema,
  femalePlayer1ContactNumber: phone_schema,
  femalePlayer1WhatsAppNumber: phone_schema,
  femalePlayer1Address: z.string().min(2, "Address is required"),
  femalePlayer1EmployeeId: z.string().min(2, "Employee ID is required"),
  femalePlayer1JerseyNumber: jersey_number_schema,
  femalePlayer1JerseyName: z.string().min(1, "Jersey name is required"),
  femalePlayer1JerseySize: jersey_size_schema,

  femalePlayer2Name: z.string().min(2, "Name must be at least 2 characters"),
  femalePlayer2Email: coditas_email_schema,
  femalePlayer2Dob: dob_schema,
  femalePlayer2ContactNumber: phone_schema,
  femalePlayer2WhatsAppNumber: phone_schema,
  femalePlayer2Address: z.string().min(2, "Address is required"),
  femalePlayer2EmployeeId: z.string().min(2, "Employee ID is required"),
  femalePlayer2JerseyNumber: jersey_number_schema,
  femalePlayer2JerseyName: z.string().min(1, "Jersey name is required"),
  femalePlayer2JerseySize: jersey_size_schema,
})
  .superRefine((data, ctx) => {
    const fields = ["malePlayer1Email", "malePlayer2Email", "femalePlayer1Email", "femalePlayer2Email"] as const;
    const normalized = fields.map((key) => ({ key, value: (data[key] ?? "").trim().toLowerCase() }));
    const seen = new Map<string, (typeof fields)[number]>();

    for (const row of normalized) {
      if (!row.value) continue;
      const prev = seen.get(row.value);
      if (!prev) {
        seen.set(row.value, row.key);
        continue;
      }

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [row.key],
        message: "Email must be unique within the team",
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [prev],
        message: "Email must be unique within the team",
      });
    }
  });

const individual_details_schema = z.object({
  playerName: z.string().min(2, "Name must be at least 2 characters"),
  playerEmail: coditas_email_schema,
  playerDob: dob_schema,
  playerContactNumber: phone_schema,
  playerWhatsAppNumber: phone_schema,
  playerAddress: z.string().min(2, "Address is required"),
  playerEmployeeId: z.string().min(2, "Employee ID is required"),
  playerJerseyNumber: jersey_number_schema,
  playerJerseyName: z.string().min(1, "Jersey name is required"),
  playerJerseySize: jersey_size_schema,
  gender: z.enum(["Male", "Female", "Other"], { message: "Select gender" }),
});

type TeamDetailsFormData = z.infer<typeof team_details_schema>;
type IndividualDetailsFormData = z.infer<typeof individual_details_schema>;

type PlayerPrefix = "malePlayer1" | "malePlayer2" | "femalePlayer1" | "femalePlayer2";

function PlayerFields({
  prefix,
  labelPrefix,
  register,
  errors,
}: {
  prefix: PlayerPrefix;
  labelPrefix: string;
  register: UseFormRegister<TeamDetailsFormData>;
  errors: FieldErrors<TeamDetailsFormData>;
}) {
  type FieldName = keyof TeamDetailsFormData & string;

  const field_error = (field: FieldName): string | undefined => {
    const message = (errors as Record<string, { message?: unknown }>)[field]?.message;
    return typeof message === "string" ? message : undefined;
  };

  const field_id = (suffix: string) => `${prefix}${suffix}`;

  const render_text_field = ({
    suffix,
    label,
    type = "text",
    inputMode,
    maxLength,
    sanitizeDigitsMax,
    list,
  }: {
    suffix: string;
    label: string;
    type?: string;
    inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
    maxLength?: number;
    sanitizeDigitsMax?: number;
    list?: string;
  }) => {
    const name = field_id(suffix) as FieldName;
    const message = field_error(name);
    const field = register(name as keyof TeamDetailsFormData);

    return (
      <div className="space-y-2">
        <Label htmlFor={name}>{label}</Label>
        <Input
          id={name}
          type={type}
          inputMode={inputMode}
          maxLength={maxLength}
          list={list}
          {...field}
          onChange={(e) => {
            if (sanitizeDigitsMax) {
              const digits_only = e.target.value.replace(/\D/g, "");
              e.target.value = digits_only.slice(0, sanitizeDigitsMax);
            }
            field.onChange(e);
          }}
          className={message ? "border-red-500" : ""}
        />
        {message ? <p className="text-red-500 text-sm">{message}</p> : null}
      </div>
    );
  };

  const jersey_size_list_id = `${prefix}-jersey-size`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {render_text_field({ suffix: "Name", label: `${labelPrefix} Name *` })}
        {render_text_field({ suffix: "Email", label: `${labelPrefix} Email *`, type: "email" })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {render_text_field({ suffix: "Dob", label: `${labelPrefix} DOB *`, type: "date" })}
        {render_text_field({
          suffix: "ContactNumber",
          label: `${labelPrefix} Contact Number *`,
          inputMode: "numeric",
          maxLength: 10,
          sanitizeDigitsMax: 10,
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {render_text_field({
          suffix: "WhatsAppNumber",
          label: `${labelPrefix} WhatsApp Number *`,
          inputMode: "numeric",
          maxLength: 10,
          sanitizeDigitsMax: 10,
        })}
        {render_text_field({ suffix: "EmployeeId", label: `${labelPrefix} Employee ID *` })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {render_text_field({ suffix: "Address", label: `${labelPrefix} Address *` })}
        {render_text_field({ suffix: "JerseyNumber", label: `${labelPrefix} Jersey Number *`, inputMode: "numeric" })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {render_text_field({ suffix: "JerseyName", label: `${labelPrefix} Jersey Name *` })}
        <div className="space-y-2">
          <Label htmlFor={`${prefix}JerseySize`}>{`${labelPrefix} Jersey Size *`}</Label>
          <Input
            id={`${prefix}JerseySize`}
            list={jersey_size_list_id}
            {...register(`${prefix}JerseySize` as keyof TeamDetailsFormData)}
            className={field_error(`${prefix}JerseySize` as FieldName) ? "border-red-500" : ""}
          />
          <datalist id={jersey_size_list_id}>
            {jersey_size_options.map((size) => (
              <option key={size} value={size} />
            ))}
          </datalist>
          {field_error(`${prefix}JerseySize` as FieldName) ? (
            <p className="text-red-500 text-sm">{field_error(`${prefix}JerseySize` as FieldName)}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function RegistrationPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"team" | "individual">("team");
  const [hasAccepted, setHasAccepted] = useState<boolean>(false);
  const [isCheckingEmails, setIsCheckingEmails] = useState(false);

  const teamForm = useForm<TeamDetailsFormData>({
    resolver: zodResolver(team_details_schema),
    mode: "onChange",
    reValidateMode: "onChange",
    shouldFocusError: false,
  });

  const individualForm = useForm<IndividualDetailsFormData>({
    resolver: zodResolver(individual_details_schema),
    mode: "onChange",
    reValidateMode: "onChange",
    shouldFocusError: false,
  });

  const reset_team_details = teamForm.reset;
  const reset_individual_details = individualForm.reset;

  const canProceed = useMemo(() => {
    return activeTab === "team" ? teamForm.formState.isValid : individualForm.formState.isValid;
  }, [activeTab, individualForm.formState.isValid, teamForm.formState.isValid]);

  // Restore details when coming back from payment page.
  // We keep the stored draft until final submission succeeds on payment page.
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem("cbl:registration:draft");
      if (!raw) return;
      const parsed = JSON.parse(raw) as { kind?: unknown; details?: unknown } | null;
      if (!parsed || typeof parsed !== "object") return;

      if (parsed.kind === "team" && parsed.details && typeof parsed.details === "object") {
        setActiveTab("team");
        reset_team_details(parsed.details as TeamDetailsFormData);
        return;
      }

      if (parsed.kind === "individual" && parsed.details && typeof parsed.details === "object") {
        setActiveTab("individual");
        reset_individual_details(parsed.details as IndividualDetailsFormData);
      }
    } catch {
      // ignore
    }
  }, [reset_individual_details, reset_team_details]);

  const onNext = async () => {
    const isValid = activeTab === "team" ? await teamForm.trigger() : await individualForm.trigger();
    if (!isValid) {
      toast({
        title: "Please fill all required fields",
        description: "Complete the form to continue to payment.",
        variant: "destructive",
      });
      return;
    }

    const emails_to_check =
      activeTab === "team"
        ? [
            teamForm.getValues("malePlayer1Email"),
            teamForm.getValues("malePlayer2Email"),
            teamForm.getValues("femalePlayer1Email"),
            teamForm.getValues("femalePlayer2Email"),
          ]
        : [individualForm.getValues("playerEmail")];

    setIsCheckingEmails(true);
    try {
      const { conflicts } = await validateEmailsBeforePayment({ emails: emails_to_check });
      const conflict_set = new Set((conflicts ?? []).map((e) => e.trim().toLowerCase()).filter(Boolean));

      if (conflict_set.size > 0) {
        if (activeTab === "team") {
          (["malePlayer1Email", "malePlayer2Email", "femalePlayer1Email", "femalePlayer2Email"] as const).forEach((field) => {
            const value = (teamForm.getValues(field) ?? "").trim().toLowerCase();
            if (!value) return;
            if (!conflict_set.has(value)) return;
            teamForm.setError(field, { type: "validate", message: "Email already registered" });
          });
        } else {
          const value = (individualForm.getValues("playerEmail") ?? "").trim().toLowerCase();
          if (value && conflict_set.has(value)) individualForm.setError("playerEmail", { type: "validate", message: "Email already registered" });
        }

        toast({
          title: "Email already registered",
          description: "Please use a different email to continue.",
          variant: "destructive",
        });
        return;
      }
    } catch (err) {
      toast({
        title: "Validation failed",
        description: err instanceof Error ? err.message : "Failed to validate emails. Please try again.",
        variant: "destructive",
      });
      return;
    } finally {
      setIsCheckingEmails(false);
    }

    const draft =
      activeTab === "team"
        ? { kind: "team" as const, details: teamForm.getValues(), createdAt: new Date().toISOString() }
        : { kind: "individual" as const, details: individualForm.getValues(), createdAt: new Date().toISOString() };

    try {
      window.sessionStorage.setItem("cbl:registration:draft", JSON.stringify(draft));
    } catch {
      // ignore storage errors
    }

    router.push("/registration/payment");
  };

  return (
    <div className="mx-auto w-full max-w-full md:max-w-[calc(100vw-4rem)] px-4 md:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold neon-text mb-4">Registration</h1>
          <p className="text-gray-400">Fill player details first, then proceed to payment.</p>
        </div>

        <div className="mb-8 overflow-x-auto">
          <div className="flex justify-center min-w-full">
            <div className="inline-flex gap-2 rounded-2xl border border-border bg-white/70 p-2 backdrop-blur-md w-fit">
            <button
              type="button"
              onClick={() => setActiveTab("team")}
              className={[
                "px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-colors",
                activeTab === "team"
                  ? "bg-neon-blue text-white"
                  : "text-slate-700 hover:bg-slate-900/5 hover:text-slate-900",
              ].join(" ")}
            >
              Team registration
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("individual")}
              className={[
                "px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-colors",
                activeTab === "individual"
                  ? "bg-neon-blue text-white"
                  : "text-slate-700 hover:bg-slate-900/5 hover:text-slate-900",
              ].join(" ")}
            >
              Individual registration
            </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-3">
            <CblGuidelines />
          </div>

          <div className="lg:col-span-6">
            {activeTab === "team" ? (
              <div className="space-y-8">
                <motion.div
                  className="glass rounded-xl p-6 md:p-8"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="text-2xl font-bold mb-6 text-neon-blue">Male Players</h2>
                  <div className="space-y-6">
                    <PlayerFields
                      prefix="malePlayer1"
                      labelPrefix="Male Player 1"
                      register={teamForm.register}
                      errors={teamForm.formState.errors}
                    />
                    <div className="h-px bg-border/60" />
                    <PlayerFields
                      prefix="malePlayer2"
                      labelPrefix="Male Player 2"
                      register={teamForm.register}
                      errors={teamForm.formState.errors}
                    />
                  </div>
                </motion.div>

                <motion.div
                  className="glass rounded-xl p-6 md:p-8"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <h2 className="text-2xl font-bold mb-6 text-neon-blue">Female Players</h2>
                  <div className="space-y-6">
                    <PlayerFields
                      prefix="femalePlayer1"
                      labelPrefix="Female Player 1"
                      register={teamForm.register}
                      errors={teamForm.formState.errors}
                    />
                    <div className="h-px bg-border/60" />
                    <PlayerFields
                      prefix="femalePlayer2"
                      labelPrefix="Female Player 2"
                      register={teamForm.register}
                      errors={teamForm.formState.errors}
                    />
                  </div>
                </motion.div>
              </div>
            ) : (
              <motion.div
                className="glass rounded-xl p-6 md:p-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-2xl font-bold mb-6 text-neon-blue">Player Details</h2>

                <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="playerName">Name *</Label>
                  <Input
                    id="playerName"
                    {...individualForm.register("playerName")}
                    className={individualForm.formState.errors.playerName ? "border-red-500" : ""}
                  />
                  {individualForm.formState.errors.playerName ? (
                    <p className="text-red-500 text-sm">{individualForm.formState.errors.playerName.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="playerEmail">Email *</Label>
                  <Input
                    id="playerEmail"
                    type="email"
                    {...individualForm.register("playerEmail")}
                    className={individualForm.formState.errors.playerEmail ? "border-red-500" : ""}
                  />
                  {individualForm.formState.errors.playerEmail ? (
                    <p className="text-red-500 text-sm">{individualForm.formState.errors.playerEmail.message}</p>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="playerDob">DOB *</Label>
                  <Input
                    id="playerDob"
                    type="date"
                    {...individualForm.register("playerDob")}
                    className={individualForm.formState.errors.playerDob ? "border-red-500" : ""}
                  />
                  {individualForm.formState.errors.playerDob ? (
                    <p className="text-red-500 text-sm">{individualForm.formState.errors.playerDob.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Input
                    id="gender"
                    list="gender-options"
                    {...individualForm.register("gender")}
                    className={individualForm.formState.errors.gender ? "border-red-500" : ""}
                  />
                  <datalist id="gender-options">
                    <option value="Male" />
                    <option value="Female" />
                    <option value="Other" />
                  </datalist>
                  {individualForm.formState.errors.gender ? (
                    <p className="text-red-500 text-sm">{individualForm.formState.errors.gender.message}</p>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(() => {
                  const field = individualForm.register("playerContactNumber");
                  return (
                    <div className="space-y-2">
                      <Label htmlFor="playerContactNumber">Contact Number *</Label>
                      <Input
                        id="playerContactNumber"
                        inputMode="numeric"
                        maxLength={10}
                        {...field}
                        onChange={(e) => {
                          const digits_only = e.target.value.replace(/\\D/g, "");
                          e.target.value = digits_only.slice(0, 10);
                          field.onChange(e);
                        }}
                        className={individualForm.formState.errors.playerContactNumber ? "border-red-500" : ""}
                      />
                      {individualForm.formState.errors.playerContactNumber ? (
                        <p className="text-red-500 text-sm">
                          {individualForm.formState.errors.playerContactNumber.message}
                        </p>
                      ) : null}
                    </div>
                  );
                })()}

                {(() => {
                  const field = individualForm.register("playerWhatsAppNumber");
                  return (
                    <div className="space-y-2">
                      <Label htmlFor="playerWhatsAppNumber">WhatsApp Number *</Label>
                      <Input
                        id="playerWhatsAppNumber"
                        inputMode="numeric"
                        maxLength={10}
                        {...field}
                        onChange={(e) => {
                          const digits_only = e.target.value.replace(/\\D/g, "");
                          e.target.value = digits_only.slice(0, 10);
                          field.onChange(e);
                        }}
                        className={individualForm.formState.errors.playerWhatsAppNumber ? "border-red-500" : ""}
                      />
                      {individualForm.formState.errors.playerWhatsAppNumber ? (
                        <p className="text-red-500 text-sm">
                          {individualForm.formState.errors.playerWhatsAppNumber.message}
                        </p>
                      ) : null}
                    </div>
                  );
                })()}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="playerEmployeeId">Employee ID *</Label>
                  <Input
                    id="playerEmployeeId"
                    {...individualForm.register("playerEmployeeId")}
                    className={individualForm.formState.errors.playerEmployeeId ? "border-red-500" : ""}
                  />
                  {individualForm.formState.errors.playerEmployeeId ? (
                    <p className="text-red-500 text-sm">
                      {individualForm.formState.errors.playerEmployeeId.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="playerAddress">Address *</Label>
                  <Input
                    id="playerAddress"
                    {...individualForm.register("playerAddress")}
                    className={individualForm.formState.errors.playerAddress ? "border-red-500" : ""}
                  />
                  {individualForm.formState.errors.playerAddress ? (
                    <p className="text-red-500 text-sm">{individualForm.formState.errors.playerAddress.message}</p>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="playerJerseyNumber">Jersey Number *</Label>
                  <Input
                    id="playerJerseyNumber"
                    inputMode="numeric"
                    {...individualForm.register("playerJerseyNumber")}
                    className={individualForm.formState.errors.playerJerseyNumber ? "border-red-500" : ""}
                  />
                  {individualForm.formState.errors.playerJerseyNumber ? (
                    <p className="text-red-500 text-sm">
                      {individualForm.formState.errors.playerJerseyNumber.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="playerJerseyName">Jersey Name *</Label>
                  <Input
                    id="playerJerseyName"
                    {...individualForm.register("playerJerseyName")}
                    className={individualForm.formState.errors.playerJerseyName ? "border-red-500" : ""}
                  />
                  {individualForm.formState.errors.playerJerseyName ? (
                    <p className="text-red-500 text-sm">{individualForm.formState.errors.playerJerseyName.message}</p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="playerJerseySize">Jersey Size *</Label>
                <Input
                  id="playerJerseySize"
                  list="individual-jersey-sizes"
                  {...individualForm.register("playerJerseySize")}
                  className={individualForm.formState.errors.playerJerseySize ? "border-red-500" : ""}
                />
                <datalist id="individual-jersey-sizes">
                  {jersey_size_options.map((size) => (
                    <option key={size} value={size} />
                  ))}
                </datalist>
                {individualForm.formState.errors.playerJerseySize ? (
                  <p className="text-red-500 text-sm">{individualForm.formState.errors.playerJerseySize.message}</p>
                ) : null}
              </div>
            </div>
              </motion.div>
            )}

            <div className="flex flex-col items-center mt-10">
              <Button
                type="button"
                onClick={onNext}
                disabled={!canProceed || isCheckingEmails}
                variant="neon"
                size="lg"
                className="w-full md:w-auto min-w-[200px]"
              >
                {isCheckingEmails ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Next
                  </>
                ) : (
                  "Next"
                )}
              </Button>
            </div>
          </div>

          <div className="lg:col-span-3">
            <CblDisclaimer accepted={hasAccepted} onAcceptedChange={setHasAccepted} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
