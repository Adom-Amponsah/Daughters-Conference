import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "./ui/carousel"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "./ui/form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email" }),
});

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  code: z.string().min(4, { message: "Enter your code" }),
});

export type StepperMode = "register" | "login";

interface RegistrationStepperProps {
  mode: StepperMode;
  onClose: () => void;
}

export const RegistrationStepper: React.FC<RegistrationStepperProps> = ({ mode, onClose }) => {
  const [step, setStep] = useState(0);
  const formSchema = mode === "register" ? registerSchema : loginSchema;
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: mode === "register"
      ? { name: "", email: "" }
      : { email: "", code: "" },
  });

  function onSubmit(values: any) {
    if (step === steps.length - 1) {
      // Final submit
      alert(JSON.stringify(values, null, 2));
      onClose();
    } else {
      setStep((s) => s + 1);
    }
  }

  const steps =
    mode === "register"
      ? [
          {
            label: "Your Details",
            content: (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ),
          },
          {
            label: "Confirm",
            content: (
              <div className="text-center">
                <p className="mb-4">Review your details and confirm registration.</p>
                <pre className="bg-muted p-2 rounded text-left text-xs">
                  {JSON.stringify(form.getValues(), null, 2)}
                </pre>
              </div>
            ),
          },
        ]
      : [
          {
            label: "Login",
            content: (
              <>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Access Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ),
          },
          {
            label: "Confirm",
            content: (
              <div className="text-center">
                <p className="mb-4">Check your login details and confirm.</p>
                <pre className="bg-muted p-2 rounded text-left text-xs">
                  {JSON.stringify(form.getValues(), null, 2)}
                </pre>
              </div>
            ),
          },
        ];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-xl min-w-[340px] max-w-sm w-full relative">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-700 dark:hover:text-white"
        >
          &times;
        </button>
        <Carousel className="w-full">
          <CarouselContent>
            {steps.map((stepObj, idx) => (
              <CarouselItem key={idx} className={idx === step ? "block" : "hidden"}>
                <div className="py-2">
                  <h3 className="font-semibold mb-2 text-lg text-center">{stepObj.label}</h3>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      {stepObj.content}
                      <div className="flex gap-2 justify-between mt-4">
                        {step > 0 && (
                          <Button type="button" variant="secondary" onClick={() => setStep((s) => s - 1)}>
                            Back
                          </Button>
                        )}
                        <Button type="submit">
                          {step === steps.length - 1 ? "Finish" : "Next"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious onClick={() => setStep((s) => Math.max(0, s - 1))} />
          <CarouselNext onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))} />
        </Carousel>
      </div>
    </div>
  );
};
