"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldErrors, type UseFormRegister, type UseFormSetValue } from "react-hook-form";
import { cn } from "@/lib/utils";
import * as z from "zod";
import { CheckCircle2, Loader2, X } from "lucide-react";

import TeamRevealModal from "@/components/TeamRevealModal";
import CblDisclaimer from "@/components/CblDisclaimer";
import CblGuidelines from "@/components/CblGuidelines";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { convertFileToBase64, registerIndividual, registerTeam } from "@/lib/api";

const jersey_size_options = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"] as const;

const phone_schema = z.string().regex(/^\d{10}$/, "Must be a 10-digit number");
const dob_schema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter DOB");
const jersey_size_schema = z.enum(jersey_size_options, { message: "Select a valid jersey size" });
const coditas_email_schema = z
  .string()
  .email("Invalid email address")
  .refine((value) => value.trim().toLowerCase().endsWith("@coditas.com"), "Please use coditas email");

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const payment_schema = z.object({
  transactionId: z.string().min(5, "Transaction ID must be at least 5 characters"),
  refundUpiId: z.string().min(3, "Refund UPI ID is required"),
  paymentProof: z
    .any()
    .refine((file) => file?.[0], "Payment proof is required")
    .refine((file) => file?.[0]?.size <= MAX_FILE_SIZE, "Max file size is 5MB")
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file?.[0]?.type), "Only .jpg, .jpeg, .png formats are supported"),
});

const team_details_schema = z
  .object({
    malePlayer1EmployeeId: z.string().min(2, "Employee ID is required"),
    malePlayer1Name: z.string().min(2, "Name must be at least 2 characters"),
    malePlayer1Email: coditas_email_schema,
    malePlayer1ContactNumber: phone_schema,
    malePlayer1Dob: dob_schema,
    malePlayer1Address: z.string().min(2, "Address is required"),
    malePlayer1JerseyName: z.string().min(1, "Name on jersey is required"),
    malePlayer1JerseySize: jersey_size_schema,
    malePlayer1EmergencyContactNumber: phone_schema,

    malePlayer2EmployeeId: z.string().min(2, "Employee ID is required"),
    malePlayer2Name: z.string().min(2, "Name must be at least 2 characters"),
    malePlayer2Email: coditas_email_schema,
    malePlayer2ContactNumber: phone_schema,
    malePlayer2Dob: dob_schema,
    malePlayer2Address: z.string().min(2, "Address is required"),
    malePlayer2JerseyName: z.string().min(1, "Name on jersey is required"),
    malePlayer2JerseySize: jersey_size_schema,
    malePlayer2EmergencyContactNumber: phone_schema,

    femalePlayer1EmployeeId: z.string().min(2, "Employee ID is required"),
    femalePlayer1Name: z.string().min(2, "Name must be at least 2 characters"),
    femalePlayer1Email: coditas_email_schema,
    femalePlayer1ContactNumber: phone_schema,
    femalePlayer1Dob: dob_schema,
    femalePlayer1Address: z.string().min(2, "Address is required"),
    femalePlayer1JerseyName: z.string().min(1, "Name on jersey is required"),
    femalePlayer1JerseySize: jersey_size_schema,
    femalePlayer1EmergencyContactNumber: phone_schema,

    femalePlayer2EmployeeId: z.string().min(2, "Employee ID is required"),
    femalePlayer2Name: z.string().min(2, "Name must be at least 2 characters"),
    femalePlayer2Email: coditas_email_schema,
    femalePlayer2ContactNumber: phone_schema,
    femalePlayer2Dob: dob_schema,
    femalePlayer2Address: z.string().min(2, "Address is required"),
    femalePlayer2JerseyName: z.string().min(1, "Name on jersey is required"),
    femalePlayer2JerseySize: jersey_size_schema,
    femalePlayer2EmergencyContactNumber: phone_schema,
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
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [row.key], message: "Email must be unique within the team" });
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [prev], message: "Email must be unique within the team" });
    }
  });

const individual_details_schema = z.object({
  playerEmployeeId: z.string().min(2, "Employee ID is required"),
  playerName: z.string().min(2, "Name must be at least 2 characters"),
  playerEmail: coditas_email_schema,
  playerContactNumber: phone_schema,
  playerDob: dob_schema,
  playerAddress: z.string().min(2, "Address is required"),
  playerJerseyName: z.string().min(1, "Name on jersey is required"),
  playerJerseySize: jersey_size_schema,
  playerEmergencyContactNumber: phone_schema,
  gender: z.enum(["Male", "Female", "Other"], { message: "Select gender" }),
});

type TeamDetailsFormData = z.infer<typeof team_details_schema>;
type IndividualDetailsFormData = z.infer<typeof individual_details_schema>;
type PaymentFormData = z.infer<typeof payment_schema>;

type PlayerPrefix = "malePlayer1" | "malePlayer2" | "femalePlayer1" | "femalePlayer2";

function PlayerFields({
  prefix,
  labelPrefix,
  register,
  errors,
  setValue,
}: {
  prefix: PlayerPrefix;
  labelPrefix: string;
  register: UseFormRegister<TeamDetailsFormData>;
  errors: FieldErrors<TeamDetailsFormData>;
  setValue: UseFormSetValue<TeamDetailsFormData>;
}) {
  type FieldName = keyof TeamDetailsFormData & string;

  const [lookupStatus, setLookupStatus] = useState<"idle" | "loading" | "found">("idle");
  const [autoFilledKeys, setAutoFilledKeys] = useState(new Set<string>());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEmployeeIdChange = (value: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const trimmed = value.trim();

    // Immediately clear any previously auto-filled values
    if (autoFilledKeys.size > 0) {
      for (const key of autoFilledKeys) {
        setValue(key as keyof TeamDetailsFormData, "" as never, { shouldValidate: false });
      }
      setAutoFilledKeys(new Set());
    }

    if (trimmed.length < 3) {
      setLookupStatus("idle");
      return;
    }

    // Show loading immediately so "Fetching..." placeholders appear right away
    setLookupStatus("loading");

    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/employee-lookup?employeeId=${encodeURIComponent(trimmed)}`);
        if (!res.ok) { setLookupStatus("idle"); return; }
        const { employee } = await res.json();
        if (!employee) { setLookupStatus("idle"); return; }

        const filled = new Set<string>();
        const toFill = [
          { suffix: "Name",          value: employee.name  },
          { suffix: "Email",         value: employee.email },
          { suffix: "ContactNumber", value: employee.phone },
          { suffix: "Dob",           value: employee.dob   },
        ];
        for (const f of toFill) {
          if (f.value) {
            setValue(`${prefix}${f.suffix}` as keyof TeamDetailsFormData, f.value, {
              shouldValidate: true,
              shouldDirty: true,
            });
            filled.add(`${prefix}${f.suffix}`);
          }
        }
        setAutoFilledKeys(filled);
        setLookupStatus("found");
      } catch {
        setLookupStatus("idle");
      }
    }, 600);
  };

  const field_error = (field: FieldName): string | undefined => {
    const message = (errors as Record<string, { message?: unknown }>)[field]?.message;
    return typeof message === "string" ? message : undefined;
  };

  const field_id = (suffix: string) => `${prefix}${suffix}`;

  const AUTO_FILL_SUFFIXES = new Set(["Name", "Email", "ContactNumber", "Dob"]);

  const render_text_field = ({
    suffix,
    label,
    type = "text",
    inputMode,
    maxLength,
    sanitizeDigitsMax,
  }: {
    suffix: string;
    label: string;
    type?: string;
    inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
    maxLength?: number;
    sanitizeDigitsMax?: number;
  }) => {
    const name = field_id(suffix) as FieldName;
    const message = field_error(name);
    const isAutoFilled = autoFilledKeys.has(name);
    const field = register(name as keyof TeamDetailsFormData);

    return (
      <div className="space-y-2">
        <Label htmlFor={name}>{label}</Label>
        <Input
          id={name}
          type={type}
          inputMode={inputMode}
          maxLength={maxLength}
          placeholder={AUTO_FILL_SUFFIXES.has(suffix) && lookupStatus === "loading" ? "Fetching..." : undefined}
          {...field}
          onChange={(e) => {
            if (sanitizeDigitsMax) {
              const digits_only = e.target.value.replace(/\D/g, "");
              e.target.value = digits_only.slice(0, sanitizeDigitsMax);
            }
            field.onChange(e);
          }}
          className={cn(
            message ? "border-red-500" : isAutoFilled ? "border-emerald-300 bg-emerald-50/40" : "",
          )}
        />
        {message ? <p className="text-red-500 text-sm">{message}</p> : null}
      </div>
    );
  };

  // Employee ID field — rendered separately to attach the lookup behaviour
  const empIdName = field_id("EmployeeId") as FieldName;
  const empIdError = field_error(empIdName);
  const empIdField = register(empIdName as keyof TeamDetailsFormData);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Employee ID with directory auto-lookup */}
        <div className="space-y-2">
          <Label htmlFor={empIdName}>{`${labelPrefix} Employee ID *`}</Label>
          <div className="relative">
            <Input
              id={empIdName}
              {...empIdField}
              onChange={(e) => {
                empIdField.onChange(e);
                handleEmployeeIdChange(e.target.value);
              }}
              className={cn(
                empIdError ? "border-red-500" : lookupStatus === "found" ? "border-emerald-300" : "",
                "pr-8",
              )}
            />
            {lookupStatus === "loading" && (
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 animate-spin text-brand-violet" />
              </div>
            )}
            {lookupStatus === "found" && (
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
            )}
          </div>
          {empIdError && <p className="text-red-500 text-sm">{empIdError}</p>}
        </div>

        {render_text_field({ suffix: "Name", label: `${labelPrefix} Name *` })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {render_text_field({ suffix: "Email", label: `${labelPrefix} Email *`, type: "email" })}
        {render_text_field({
          suffix: "ContactNumber",
          label: `${labelPrefix} Phone Number *`,
          inputMode: "numeric",
          maxLength: 10,
          sanitizeDigitsMax: 10,
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {render_text_field({ suffix: "Dob", label: `${labelPrefix} Date of Birth *`, type: "date" })}
        {render_text_field({ suffix: "Address", label: `${labelPrefix} Address *` })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {render_text_field({ suffix: "JerseyName", label: `${labelPrefix} Name on Jersey *` })}
        <div className="space-y-2">
          <Label htmlFor={`${prefix}JerseySize`}>{`${labelPrefix} Jersey Size *`}</Label>
          <select
            id={`${prefix}JerseySize`}
            {...register(`${prefix}JerseySize` as keyof TeamDetailsFormData)}
            className={[
              "flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              field_error(`${prefix}JerseySize` as FieldName) ? "border-red-500" : "",
            ].join(" ")}
          >
            <option value="">Select</option>
            {jersey_size_options.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          {field_error(`${prefix}JerseySize` as FieldName) ? (
            <p className="text-red-500 text-sm">{field_error(`${prefix}JerseySize` as FieldName)}</p>
          ) : null}
        </div>
      </div>

      {render_text_field({
        suffix: "EmergencyContactNumber",
        label: `${labelPrefix} Emergency Contact Number *`,
        inputMode: "numeric",
        maxLength: 10,
        sanitizeDigitsMax: 10,
      })}
    </div>
  );
}

const draft_storage_key_v2 = "cbl:registration:draft:v2";

export default function RegistrationPage() {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"team" | "individual">("team");
  const [hasAccepted, setHasAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [teamName, setTeamName] = useState("");

  const [fileName, setFileName] = useState("");
  const paymentProofInputRef = useRef<HTMLInputElement | null>(null);

  const [qrSrc, setQrSrc] = useState<string>("/assets/Team-2000.JPG");

  const [individualLookupStatus, setIndividualLookupStatus] = useState<"idle" | "loading" | "found">("idle");
  const [individualAutoFilled, setIndividualAutoFilled] = useState(new Set<string>());
  const individualLookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const teamForm = useForm<TeamDetailsFormData>({
    resolver: zodResolver(team_details_schema),
    mode: "onChange",
    reValidateMode: "onChange",
    shouldFocusError: false,
    defaultValues: {
      malePlayer1JerseySize: "" as (typeof jersey_size_options)[number],
      malePlayer2JerseySize: "" as (typeof jersey_size_options)[number],
      femalePlayer1JerseySize: "" as (typeof jersey_size_options)[number],
      femalePlayer2JerseySize: "" as (typeof jersey_size_options)[number],
    },
  });

  const individualForm = useForm<IndividualDetailsFormData>({
    resolver: zodResolver(individual_details_schema),
    mode: "onChange",
    reValidateMode: "onChange",
    shouldFocusError: false,
    defaultValues: {
      gender: "" as "Male" | "Female" | "Other",
      playerJerseySize: "" as (typeof jersey_size_options)[number],
    },
  });

  const paymentForm = useForm<PaymentFormData>({
    resolver: zodResolver(payment_schema),
    mode: "onChange",
    reValidateMode: "onChange",
    shouldFocusError: false,
  });

  useEffect(() => {
    setQrSrc(activeTab === "team" ? "/assets/Team-2000.JPG" : "/assets/Individual-500.JPG");
  }, [activeTab]);

  // Clear any leftover draft from previous sessions on mount.
  useEffect(() => {
    try { window.sessionStorage.removeItem(draft_storage_key_v2); } catch { /* ignore */ }
  }, []);

  const canProceed = useMemo(() => {
    return activeTab === "team" ? teamForm.formState.isValid : individualForm.formState.isValid;
  }, [activeTab, individualForm.formState.isValid, teamForm.formState.isValid]);

  const canSubmit = useMemo(() => {
    return canProceed && paymentForm.formState.isValid && hasAccepted && !isSubmitting;
  }, [canProceed, hasAccepted, isSubmitting, paymentForm.formState.isValid]);

  const handleIndividualEmployeeIdChange = (value: string) => {
    if (individualLookupTimer.current) clearTimeout(individualLookupTimer.current);
    const trimmed = value.trim();

    // Immediately clear any previously auto-filled values
    if (individualAutoFilled.size > 0) {
      if (individualAutoFilled.has("playerName"))          individualForm.setValue("playerName",          "", { shouldValidate: false });
      if (individualAutoFilled.has("playerEmail"))         individualForm.setValue("playerEmail",         "", { shouldValidate: false });
      if (individualAutoFilled.has("playerContactNumber")) individualForm.setValue("playerContactNumber", "", { shouldValidate: false });
      if (individualAutoFilled.has("playerDob"))           individualForm.setValue("playerDob",           "", { shouldValidate: false });
      setIndividualAutoFilled(new Set());
    }

    if (trimmed.length < 3) {
      setIndividualLookupStatus("idle");
      return;
    }

    // Show loading immediately so "Fetching..." placeholders appear right away
    setIndividualLookupStatus("loading");

    individualLookupTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/employee-lookup?employeeId=${encodeURIComponent(trimmed)}`);
        if (!res.ok) { setIndividualLookupStatus("idle"); return; }
        const { employee } = await res.json();
        if (!employee) { setIndividualLookupStatus("idle"); return; }

        const filled = new Set<string>();
        if (employee.name)  { individualForm.setValue("playerName",          employee.name,  { shouldValidate: true }); filled.add("playerName"); }
        if (employee.email) { individualForm.setValue("playerEmail",         employee.email, { shouldValidate: true }); filled.add("playerEmail"); }
        if (employee.phone) { individualForm.setValue("playerContactNumber", employee.phone, { shouldValidate: true }); filled.add("playerContactNumber"); }
        if (employee.dob)   { individualForm.setValue("playerDob",           employee.dob,   { shouldValidate: true }); filled.add("playerDob"); }

        setIndividualAutoFilled(filled);
        setIndividualLookupStatus("found");
      } catch {
        setIndividualLookupStatus("idle");
      }
    }, 600);
  };

  const build_team_payload = ({
    details,
    payment,
    paymentScreenshotBase64,
  }: {
    details: TeamDetailsFormData;
    payment: PaymentFormData;
    paymentScreenshotBase64: string;
  }) => {
    return {
      registrationType: "team",

      "Male Player 1 Employee ID": details.malePlayer1EmployeeId,
      "Male Player 1 Name": details.malePlayer1Name,
      "Male Player 1 Email": details.malePlayer1Email,
      "Male Player 1 DOB": details.malePlayer1Dob,
      "Male Player 1 Contact Number": details.malePlayer1ContactNumber,
      "Male Player 1 Address": details.malePlayer1Address,
      "Male Player 1 Jersey Name": details.malePlayer1JerseyName,
      "Male Player 1 Jersey Size": details.malePlayer1JerseySize,
      "Male Player 1 Emergency Contact Number": details.malePlayer1EmergencyContactNumber,

      "Male Player 2 Employee ID": details.malePlayer2EmployeeId,
      "Male Player 2 Name": details.malePlayer2Name,
      "Male Player 2 Email": details.malePlayer2Email,
      "Male Player 2 DOB": details.malePlayer2Dob,
      "Male Player 2 Contact Number": details.malePlayer2ContactNumber,
      "Male Player 2 Address": details.malePlayer2Address,
      "Male Player 2 Jersey Name": details.malePlayer2JerseyName,
      "Male Player 2 Jersey Size": details.malePlayer2JerseySize,
      "Male Player 2 Emergency Contact Number": details.malePlayer2EmergencyContactNumber,

      "Female Player 1 Employee ID": details.femalePlayer1EmployeeId,
      "Female Player 1 Name": details.femalePlayer1Name,
      "Female Player 1 Email": details.femalePlayer1Email,
      "Female Player 1 DOB": details.femalePlayer1Dob,
      "Female Player 1 Contact Number": details.femalePlayer1ContactNumber,
      "Female Player 1 Address": details.femalePlayer1Address,
      "Female Player 1 Jersey Name": details.femalePlayer1JerseyName,
      "Female Player 1 Jersey Size": details.femalePlayer1JerseySize,
      "Female Player 1 Emergency Contact Number": details.femalePlayer1EmergencyContactNumber,

      "Female Player 2 Employee ID": details.femalePlayer2EmployeeId,
      "Female Player 2 Name": details.femalePlayer2Name,
      "Female Player 2 Email": details.femalePlayer2Email,
      "Female Player 2 DOB": details.femalePlayer2Dob,
      "Female Player 2 Contact Number": details.femalePlayer2ContactNumber,
      "Female Player 2 Address": details.femalePlayer2Address,
      "Female Player 2 Jersey Name": details.femalePlayer2JerseyName,
      "Female Player 2 Jersey Size": details.femalePlayer2JerseySize,
      "Female Player 2 Emergency Contact Number": details.femalePlayer2EmergencyContactNumber,

      "Transaction ID": payment.transactionId,
      "Refund UPI ID": payment.refundUpiId,
      paymentScreenshotBase64,
    } satisfies Record<string, string>;
  };

  const build_individual_payload = ({
    details,
    payment,
    paymentScreenshotBase64,
  }: {
    details: IndividualDetailsFormData;
    payment: PaymentFormData;
    paymentScreenshotBase64: string;
  }) => {
    return {
      registrationType: "individual",
      "Player Employee ID": details.playerEmployeeId,
      "Player Name": details.playerName,
      "Player Email": details.playerEmail,
      "Player DOB": details.playerDob,
      "Player Contact Number": details.playerContactNumber,
      "Player Address": details.playerAddress,
      "Player Jersey Name": details.playerJerseyName,
      "Player Jersey Size": details.playerJerseySize,
      "Player Gender": details.gender,
      "Transaction ID": payment.transactionId,
      "Emergency contact number": details.playerEmergencyContactNumber,
      "Refund UPI ID": payment.refundUpiId,
      paymentScreenshotBase64,
    } satisfies Record<string, string>;
  };

  const onSubmit = async () => {
    const details_valid = activeTab === "team" ? await teamForm.trigger() : await individualForm.trigger();
    const payment_valid = await paymentForm.trigger();
    if (!details_valid || !payment_valid) {
      toast({
        title: "Please fix form errors",
        description: "Complete all required fields to submit registration.",
        variant: "destructive",
      });
      return;
    }

    if (!hasAccepted) {
      toast({
        title: "Please accept the disclaimer",
        description: "You must accept the T&C to submit registration.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payment = paymentForm.getValues();
      const file = payment.paymentProof?.[0];
      const paymentScreenshotBase64 = await convertFileToBase64(file);

      const response =
        activeTab === "team"
          ? await registerTeam(build_team_payload({ details: teamForm.getValues(), payment, paymentScreenshotBase64 }))
          : await registerIndividual(build_individual_payload({ details: individualForm.getValues(), payment, paymentScreenshotBase64 }));

      if (response.success) {
        const maybe_team_name = response?.data?.teamName;
        if (typeof maybe_team_name === "string" && maybe_team_name) {
          setTeamName(maybe_team_name);
          setModalOpen(true);
        }

        teamForm.reset();
        individualForm.reset();
        paymentForm.reset();
        setHasAccepted(false);
        setFileName("");
        if (paymentProofInputRef.current) paymentProofInputRef.current.value = "";
        setFormKey((k) => k + 1);

        toast({ title: "Success!", description: response.message });
      } else {
        toast({
          title: "Registration Failed",
          description: response.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to register. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
          <h1 className="text-4xl md:text-5xl pb-2 font-bold neon-text mb-4">Registration</h1>
          <p className="text-gray-400">Fill player and payment details to complete registration.</p>
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

        <div key={formKey} className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-[70%]">
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
                      setValue={teamForm.setValue}
                    />
                    <div className="h-px bg-border/60" />
                    <PlayerFields
                      prefix="malePlayer2"
                      labelPrefix="Male Player 2"
                      register={teamForm.register}
                      errors={teamForm.formState.errors}
                      setValue={teamForm.setValue}
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
                      setValue={teamForm.setValue}
                    />
                    <div className="h-px bg-border/60" />
                    <PlayerFields
                      prefix="femalePlayer2"
                      labelPrefix="Female Player 2"
                      register={teamForm.register}
                      errors={teamForm.formState.errors}
                      setValue={teamForm.setValue}
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
                <h2 className="text-2xl font-bold mb-6 text-neon-blue">Individual Player Details</h2>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Employee ID with directory auto-lookup */}
                    <div className="space-y-2">
                      <Label htmlFor="playerEmployeeId">Employee ID *</Label>
                      <div className="relative">
                        {(() => {
                          const field = individualForm.register("playerEmployeeId");
                          return (
                            <Input
                              id="playerEmployeeId"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleIndividualEmployeeIdChange(e.target.value);
                              }}
                              className={cn(
                                individualForm.formState.errors.playerEmployeeId ? "border-red-500" : individualLookupStatus === "found" ? "border-emerald-300" : "",
                                "pr-8",
                              )}
                            />
                          );
                        })()}
                        {individualLookupStatus === "loading" && (
                          <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                            <Loader2 className="w-4 h-4 animate-spin text-brand-violet" />
                          </div>
                        )}
                        {individualLookupStatus === "found" && (
                          <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          </div>
                        )}
                      </div>
                      {individualForm.formState.errors.playerEmployeeId ? (
                        <p className="text-red-500 text-sm">
                          {individualForm.formState.errors.playerEmployeeId.message}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="playerName">Name *</Label>
                      <Input
                        id="playerName"
                        placeholder={individualLookupStatus === "loading" ? "Fetching..." : undefined}
                        {...individualForm.register("playerName")}
                        className={cn(
                          individualForm.formState.errors.playerName ? "border-red-500" : "",
                          individualAutoFilled.has("playerName") ? "border-emerald-300 bg-emerald-50/40" : "",
                        )}
                      />
                      {individualForm.formState.errors.playerName ? (
                        <p className="text-red-500 text-sm">{individualForm.formState.errors.playerName.message}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="playerEmail">Email *</Label>
                      <Input
                        id="playerEmail"
                        type="email"
                        placeholder={individualLookupStatus === "loading" ? "Fetching..." : undefined}
                        {...individualForm.register("playerEmail")}
                        className={cn(
                          individualForm.formState.errors.playerEmail ? "border-red-500" : "",
                          individualAutoFilled.has("playerEmail") ? "border-emerald-300 bg-emerald-50/40" : "",
                        )}
                      />
                      {individualForm.formState.errors.playerEmail ? (
                        <p className="text-red-500 text-sm">{individualForm.formState.errors.playerEmail.message}</p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="playerContactNumber">Phone Number *</Label>
                      {(() => {
                        const field = individualForm.register("playerContactNumber");
                        return (
                          <Input
                            id="playerContactNumber"
                            inputMode="numeric"
                            maxLength={10}
                            placeholder={individualLookupStatus === "loading" ? "Fetching..." : undefined}
                            {...field}
                            onChange={(e) => {
                              const digits_only = e.target.value.replace(/\D/g, "");
                              e.target.value = digits_only.slice(0, 10);
                              field.onChange(e);
                            }}
                            className={cn(
                              individualForm.formState.errors.playerContactNumber ? "border-red-500" : "",
                              individualAutoFilled.has("playerContactNumber") ? "border-emerald-300 bg-emerald-50/40" : "",
                            )}
                          />
                        );
                      })()}
                      {individualForm.formState.errors.playerContactNumber ? (
                        <p className="text-red-500 text-sm">
                          {individualForm.formState.errors.playerContactNumber.message}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="playerDob">Date of Birth *</Label>
                      <Input
                        id="playerDob"
                        type="date"
                        placeholder={individualLookupStatus === "loading" ? "Fetching..." : undefined}
                        {...individualForm.register("playerDob")}
                        className={cn(
                          individualForm.formState.errors.playerDob ? "border-red-500" : "",
                          individualAutoFilled.has("playerDob") ? "border-emerald-300 bg-emerald-50/40" : "",
                        )}
                      />
                      {individualForm.formState.errors.playerDob ? (
                        <p className="text-red-500 text-sm">{individualForm.formState.errors.playerDob.message}</p>
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
                      <Label htmlFor="playerJerseyName">Name on Jersey *</Label>
                      <Input
                        id="playerJerseyName"
                        {...individualForm.register("playerJerseyName")}
                        className={individualForm.formState.errors.playerJerseyName ? "border-red-500" : ""}
                      />
                      {individualForm.formState.errors.playerJerseyName ? (
                        <p className="text-red-500 text-sm">{individualForm.formState.errors.playerJerseyName.message}</p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="playerJerseySize">Jersey Size *</Label>
                      <select
                        id="playerJerseySize"
                        {...individualForm.register("playerJerseySize")}
                        className={[
                          "flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                          individualForm.formState.errors.playerJerseySize ? "border-red-500" : "",
                        ].join(" ")}
                      >
                        <option value="">Select</option>
                        {jersey_size_options.map((size) => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                      {individualForm.formState.errors.playerJerseySize ? (
                        <p className="text-red-500 text-sm">{individualForm.formState.errors.playerJerseySize.message}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="playerEmergencyContactNumber">Emergency Contact Number *</Label>
                      {(() => {
                        const field = individualForm.register("playerEmergencyContactNumber");
                        return (
                          <Input
                            id="playerEmergencyContactNumber"
                            inputMode="numeric"
                            maxLength={10}
                            {...field}
                            onChange={(e) => {
                              const digits_only = e.target.value.replace(/\D/g, "");
                              e.target.value = digits_only.slice(0, 10);
                              field.onChange(e);
                            }}
                            className={
                              individualForm.formState.errors.playerEmergencyContactNumber ? "border-red-500" : ""
                            }
                          />
                        );
                      })()}
                      {individualForm.formState.errors.playerEmergencyContactNumber ? (
                        <p className="text-red-500 text-sm">
                          {individualForm.formState.errors.playerEmergencyContactNumber.message}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender *</Label>
                      <select
                        id="gender"
                        {...individualForm.register("gender")}
                        className={[
                          "flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                          individualForm.formState.errors.gender ? "border-red-500" : "",
                        ].join(" ")}
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      {individualForm.formState.errors.gender ? (
                        <p className="text-red-500 text-sm">{individualForm.formState.errors.gender.message}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div
              className="glass rounded-xl p-6 md:p-8 mt-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold mb-6 text-neon-blue">Payment Details</h2>

              <div className="flex flex-col items-center space-y-4 mb-6">
                <div className="glass rounded-lg p-6 text-center w-full">
                  <div className="w-48 h-48 bg-white rounded-lg border border-border mb-4 overflow-hidden relative mx-auto">
                    <Image
                      src={qrSrc}
                      alt="Payment QR Code"
                      fill
                      sizes="192px"
                      className="object-contain p-2"
                      onError={(e) => {
                        if (qrSrc !== "/assets/qr-code.png") setQrSrc("/assets/qr-code.png");
                        else e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                  <p className="text-sm text-slate-600">
                    {activeTab === "team"
                      ? "Scan to pay ₹2000"
                      : "Scan to pay ₹500"}
                  </p>
                  <p className="text-neon-blue font-mono mt-2">UPI: 9971461729@goaxb</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="transactionId">Transaction ID *</Label>
                  <Input
                    id="transactionId"
                    {...paymentForm.register("transactionId")}
                    className={paymentForm.formState.errors.transactionId ? "border-red-500" : ""}
                  />
                  {paymentForm.formState.errors.transactionId ? (
                    <p className="text-red-500 text-sm">{paymentForm.formState.errors.transactionId.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="refundUpiId">Refund UPI ID *</Label>
                  <Input
                    id="refundUpiId"
                    {...paymentForm.register("refundUpiId")}
                    className={paymentForm.formState.errors.refundUpiId ? "border-red-500" : ""}
                  />
                  {paymentForm.formState.errors.refundUpiId ? (
                    <p className="text-red-500 text-sm">{paymentForm.formState.errors.refundUpiId.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentProof">Payment Screenshot (PNG, JPG, JPEG) *</Label>
                  <div className="space-y-3">
                    {(() => {
                      const reg = paymentForm.register("paymentProof");
                      return (
                        <>
                          <Input
                            id="paymentProof"
                            type="file"
                            accept="image/png,image/jpeg,image/jpg"
                            className="sr-only"
                            {...reg}
                            ref={(el) => {
                              reg.ref(el);
                              paymentProofInputRef.current = el;
                            }}
                            onChange={(e) => {
                              reg.onChange(e);
                              const file = e.target.files?.[0];
                              setFileName(file ? file.name : "");
                            }}
                          />

                          <div className="flex">
                            <Button
                              type="button"
                              variant="outline"
                              className={paymentForm.formState.errors.paymentProof ? "border-red-500" : ""}
                              onClick={() => paymentProofInputRef.current?.click()}
                            >
                              Choose file
                            </Button>
                          </div>

                          {fileName ? (
                            <div className="flex items-center gap-3">
                              <div className="inline-flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 max-w-full">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                <span className="truncate max-w-[240px]">{fileName}</span>
                              </div>

                              <button
                                type="button"
                                className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
                                onClick={() => {
                                  setFileName("");
                                  paymentForm.resetField("paymentProof");
                                  if (paymentProofInputRef.current) paymentProofInputRef.current.value = "";
                                }}
                              >
                                <X className="w-4 h-4" />
                                Remove
                              </button>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500">No file selected</p>
                          )}
                        </>
                      );
                    })()}
                  </div>
                  {paymentForm.formState.errors.paymentProof ? (
                    <p className="text-red-500 text-sm">{paymentForm.formState.errors.paymentProof.message as string}</p>
                  ) : null}
                </div>
              </div>
            </motion.div>

            <div className="mt-8">
              <CblDisclaimer accepted={hasAccepted} onAcceptedChange={setHasAccepted} />
            </div>

            <div className="flex flex-col items-center mt-8">
              <Button
                type="button"
                onClick={onSubmit}
                disabled={!canSubmit}
                variant="neon"
                size="lg"
                className="w-full md:w-auto min-w-[220px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submit registration
                  </>
                ) : (
                  "Submit registration"
                )}
              </Button>
              <p className="text-xs text-slate-500 mt-2">Please accept the T&amp;C before submitting</p>
            </div>
          </div>

          <div className="w-full lg:w-[30%] lg:sticky lg:top-24">
            <CblGuidelines />
          </div>
        </div>
      </motion.div>

      <TeamRevealModal isOpen={modalOpen} onClose={() => setModalOpen(false)} teamName={teamName} />
    </div>
  );
}
