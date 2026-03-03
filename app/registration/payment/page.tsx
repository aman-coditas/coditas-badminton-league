"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import TeamRevealModal from "@/components/TeamRevealModal";
import { convertFileToBase64, registerIndividual, registerTeam } from "@/lib/api";
import { CheckCircle2, Loader2, X } from "lucide-react";
import CblDisclaimer from "@/components/CblDisclaimer";
import CblGuidelines from "@/components/CblGuidelines";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const phone_schema = z.string().regex(/^\d{10}$/, "Must be a 10-digit number");

const payment_schema = z.object({
  transactionId: z.string().min(5, "Transaction ID must be at least 5 characters"),
  emergencyContactName: z.string().min(2, "Emergency contact name is required"),
  emergencyContactNumber: phone_schema,
  refundUpiId: z.string().min(3, "Refund UPI ID is required"),
  paymentProof: z
    .any()
    .refine((file) => file?.[0], "Payment proof is required")
    .refine((file) => file?.[0]?.size <= MAX_FILE_SIZE, "Max file size is 5MB")
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file?.[0]?.type), "Only .jpg, .jpeg, .png formats are supported"),
});

type PaymentFormData = z.infer<typeof payment_schema>;

type RegistrationDraft =
  | { kind: "team"; details: Record<string, unknown>; createdAt: string }
  | { kind: "individual"; details: Record<string, unknown>; createdAt: string };

function build_team_payload(details: Record<string, unknown>, payment: PaymentFormData, paymentScreenshotBase64: string) {
  const d = details as Record<string, string>;
  return {
    "Male Player 1 Name": d.malePlayer1Name,
    "Male Player 1 Email": d.malePlayer1Email,
    "Male Player 1 DOB": d.malePlayer1Dob,
    "Male Player 1 Contact Number": d.malePlayer1ContactNumber,
    "Male Player 1 WhatsApp Number": d.malePlayer1WhatsAppNumber,
    "Male Player 1 Address": d.malePlayer1Address,
    "Male Player 1 Employee ID": d.malePlayer1EmployeeId,
    "Male Player 1 Jersey Number": d.malePlayer1JerseyNumber,
    "Male Player 1 Jersey Name": d.malePlayer1JerseyName,
    "Male Player 1 Jersey Size": d.malePlayer1JerseySize,

    "Male Player 2 Name": d.malePlayer2Name,
    "Male Player 2 Email": d.malePlayer2Email,
    "Male Player 2 DOB": d.malePlayer2Dob,
    "Male Player 2 Contact Number": d.malePlayer2ContactNumber,
    "Male Player 2 WhatsApp Number": d.malePlayer2WhatsAppNumber,
    "Male Player 2 Address": d.malePlayer2Address,
    "Male Player 2 Employee ID": d.malePlayer2EmployeeId,
    "Male Player 2 Jersey Number": d.malePlayer2JerseyNumber,
    "Male Player 2 Jersey Name": d.malePlayer2JerseyName,
    "Male Player 2 Jersey Size": d.malePlayer2JerseySize,

    "Female Player 1 Name": d.femalePlayer1Name,
    "Female Player 1 Email": d.femalePlayer1Email,
    "Female Player 1 DOB": d.femalePlayer1Dob,
    "Female Player 1 Contact Number": d.femalePlayer1ContactNumber,
    "Female Player 1 WhatsApp Number": d.femalePlayer1WhatsAppNumber,
    "Female Player 1 Address": d.femalePlayer1Address,
    "Female Player 1 Employee ID": d.femalePlayer1EmployeeId,
    "Female Player 1 Jersey Number": d.femalePlayer1JerseyNumber,
    "Female Player 1 Jersey Name": d.femalePlayer1JerseyName,
    "Female Player 1 Jersey Size": d.femalePlayer1JerseySize,

    "Female Player 2 Name": d.femalePlayer2Name,
    "Female Player 2 Email": d.femalePlayer2Email,
    "Female Player 2 DOB": d.femalePlayer2Dob,
    "Female Player 2 Contact Number": d.femalePlayer2ContactNumber,
    "Female Player 2 WhatsApp Number": d.femalePlayer2WhatsAppNumber,
    "Female Player 2 Address": d.femalePlayer2Address,
    "Female Player 2 Employee ID": d.femalePlayer2EmployeeId,
    "Female Player 2 Jersey Number": d.femalePlayer2JerseyNumber,
    "Female Player 2 Jersey Name": d.femalePlayer2JerseyName,
    "Female Player 2 Jersey Size": d.femalePlayer2JerseySize,

    "Transaction ID": payment.transactionId,
    "Emergency contact name": payment.emergencyContactName,
    "Emergency contact number": payment.emergencyContactNumber,
    "Refund UPI ID": payment.refundUpiId,
    paymentScreenshotBase64,
  } satisfies Record<string, string>;
}

function build_individual_payload(
  details: Record<string, unknown>,
  payment: PaymentFormData,
  paymentScreenshotBase64: string
) {
  const d = details as Record<string, string>;

  return {
    registrationType: "individual",
    "Player Name": d.playerName,
    "Player Email": d.playerEmail,
    "Player DOB": d.playerDob,
    "Player Contact Number": d.playerContactNumber,
    "Player WhatsApp Number": d.playerWhatsAppNumber,
    "Player Address": d.playerAddress,
    "Player Employee ID": d.playerEmployeeId,
    "Player Jersey Number": d.playerJerseyNumber,
    "Player Jersey Name": d.playerJerseyName,
    "Player Jersey Size": d.playerJerseySize,
    "Player Gender": d.gender,

    "Transaction ID": payment.transactionId,
    "Emergency contact name": payment.emergencyContactName,
    "Emergency contact number": payment.emergencyContactNumber,
    "Refund UPI ID": payment.refundUpiId,
    paymentScreenshotBase64,
  } satisfies Record<string, string>;
}

export default function RegistrationPaymentPage() {
  const { toast } = useToast();
  const [draft, setDraft] = useState<RegistrationDraft | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [fileName, setFileName] = useState("");
  const [qrSrc, setQrSrc] = useState<string>("/assets/qr-code.png");
  const [hasAccepted, setHasAccepted] = useState<boolean>(false);
  const paymentProofInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    resetField,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(payment_schema),
    mode: "onChange",
    reValidateMode: "onChange",
    shouldFocusError: false,
  });

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem("cbl:registration:draft");
      if (!raw) return;
      const parsed = JSON.parse(raw) as RegistrationDraft;
      if (parsed && (parsed.kind === "team" || parsed.kind === "individual")) setDraft(parsed);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!draft) return;
    setQrSrc(draft.kind === "individual" ? "/assets/Individual-500.JPG" : "/assets/Team-2000.JPG");
  }, [draft]);

  const header = useMemo(() => {
    if (!draft) return "Payment Details";
    return draft.kind === "team" ? "Team payment details" : "Individual payment details";
  }, [draft]);

  const payment_qr_alt = useMemo(() => {
    if (!draft) return "Payment QR Code";
    return draft.kind === "team" ? "Team payment QR Code" : "Individual payment QR Code";
  }, [draft]);

  const payment_caption = useMemo(() => {
    if (!draft) return "Scan to pay registration fee";
    return draft.kind === "team" ? "Scan to pay ₹2000" : "Scan to pay ₹500";
  }, [draft]);

  const onSubmit = async (data: PaymentFormData) => {
    if (!draft) {
      toast({
        title: "Missing details",
        description: "Please fill registration details first.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const file = data.paymentProof[0];
      const paymentScreenshotBase64 = await convertFileToBase64(file);

      const payload =
        draft.kind === "team"
          ? build_team_payload(draft.details, data, paymentScreenshotBase64)
          : build_individual_payload(draft.details, data, paymentScreenshotBase64);

      const response = await (draft.kind === "team" ? registerTeam(payload) : registerIndividual(payload));

      if (response.success) {
        const maybe_team_name = response?.data?.teamName;
        if (typeof maybe_team_name === "string" && maybe_team_name) {
          setTeamName(maybe_team_name);
          setModalOpen(true);
        }
        reset();
        setFileName("");
        toast({ title: "Success!", description: response.message });
        try {
          window.sessionStorage.removeItem("cbl:registration:draft");
        } catch {
          // ignore
        }
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
        <div className="mb-8">
          <Link href="/registration" className="text-neon-blue hover:underline text-sm">
            ← Back to details
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold neon-text mb-4">{header}</h1>
          <p className="text-gray-400">Complete payment details to finish registration.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-3">
            <CblGuidelines />
          </div>

          <div className="lg:col-span-6">
            {!draft ? (
              <div className="glass rounded-xl p-8 max-w-xl mx-auto text-center">
                <p className="text-slate-700">No registration details found.</p>
                <p className="text-slate-600 mt-2 text-sm">Please go back and fill the form first.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <motion.div
                  className="glass rounded-xl p-6 md:p-8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="text-2xl font-bold mb-6">Payment Details</h2>

                  <div className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="glass rounded-lg p-6 text-center">
                    <div className="w-48 h-48 bg-white rounded-lg border border-border mb-4 overflow-hidden relative mx-auto">
                      <Image
                        src={qrSrc}
                        alt={payment_qr_alt}
                        fill
                        sizes="192px"
                        className="object-contain p-2"
                        onError={(e) => {
                          if (qrSrc !== "/assets/qr-code.png") setQrSrc("/assets/qr-code.png");
                          else e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                    <p className="text-sm text-slate-600">{payment_caption}</p>
                    <p className="text-neon-blue font-mono mt-2">UPI: 9971461729@goaxb</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transactionId">Transaction ID *</Label>
                  <Input id="transactionId" {...register("transactionId")} className={errors.transactionId ? "border-red-500" : ""} />
                  {errors.transactionId ? <p className="text-red-500 text-sm">{errors.transactionId.message}</p> : null}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactName">Emergency contact name *</Label>
                    <Input
                      id="emergencyContactName"
                      {...register("emergencyContactName")}
                      className={errors.emergencyContactName ? "border-red-500" : ""}
                    />
                    {errors.emergencyContactName ? (
                      <p className="text-red-500 text-sm">{errors.emergencyContactName.message}</p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactNumber">Emergency contact number *</Label>
                    {(() => {
                      const emergency_register = register("emergencyContactNumber");
                      return (
                        <Input
                          id="emergencyContactNumber"
                          inputMode="numeric"
                          maxLength={10}
                          {...emergency_register}
                          onChange={(e) => {
                            const digits_only = e.target.value.replace(/\D/g, "");
                            e.target.value = digits_only.slice(0, 10);
                            emergency_register.onChange(e);
                          }}
                          className={errors.emergencyContactNumber ? "border-red-500" : ""}
                        />
                      );
                    })()}
                    {errors.emergencyContactNumber ? (
                      <p className="text-red-500 text-sm">{errors.emergencyContactNumber.message}</p>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="refundUpiId">Refund UPI ID *</Label>
                  <Input id="refundUpiId" {...register("refundUpiId")} className={errors.refundUpiId ? "border-red-500" : ""} />
                  {errors.refundUpiId ? <p className="text-red-500 text-sm">{errors.refundUpiId.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentProof">Payment Screenshot (PNG, JPG, JPEG) *</Label>
                  <div className="space-y-3">
                    {(() => {
                      const paymentProofRegister = register("paymentProof");

                      return (
                        <>
                          <Input
                            id="paymentProof"
                            type="file"
                            accept="image/png,image/jpeg,image/jpg"
                            className="sr-only"
                            {...paymentProofRegister}
                            ref={(el) => {
                              paymentProofRegister.ref(el);
                              paymentProofInputRef.current = el;
                            }}
                            onChange={(e) => {
                              paymentProofRegister.onChange(e);
                              const file = e.target.files?.[0];
                              setFileName(file ? file.name : "");
                            }}
                          />

                          <div className="flex">
                            <Button
                              type="button"
                              variant="outline"
                              className={errors.paymentProof ? "border-red-500" : ""}
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
                                  resetField("paymentProof");
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
                  {errors.paymentProof ? <p className="text-red-500 text-sm">{errors.paymentProof.message as string}</p> : null}
                </div>
              </div>
                </motion.div>

                <div className="flex flex-col items-center">
                  <Button
                    type="submit"
                    disabled={!isValid || isSubmitting || !hasAccepted}
                    variant="neon"
                    size="lg"
                    className="w-full md:w-auto min-w-[220px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit registration"
                    )}
                  </Button>
                  <p className="text-xs text-slate-500 mt-2">Please accept the T&amp;C before submitting</p>
                </div>
              </form>
            )}
          </div>

          <div className="lg:col-span-3">
            <CblDisclaimer accepted={hasAccepted} onAcceptedChange={setHasAccepted} />
          </div>
        </div>
      </motion.div>

      <TeamRevealModal isOpen={modalOpen} onClose={() => setModalOpen(false)} teamName={teamName} />
    </div>
  );
}

