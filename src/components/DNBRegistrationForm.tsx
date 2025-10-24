import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, X, CheckCircle, Loader2, PartyPopper, Heart } from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useRegistration } from "../hooks/useRegistration";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

// Step-specific validation schemas
const step1Schema = z.object({
  fullName: z.string().min(2, { message: "Full name is required" }),
  email: z.string().email({ message: "Valid email address is required" }),
  phoneNumber: z.string().min(10, { message: "Phone number is required" }),
  age: z.string().min(1, { message: "Age is required" }),
});

const step2Schema = z.object({
  isGrmMember: z.boolean(),
  grmBranch: z.string().optional(),
  churchName: z.string().optional(),
}).refine((data) => {
  if (data.isGrmMember && (!data.grmBranch || data.grmBranch.trim().length < 1)) {
    return false;
  }
  if (!data.isGrmMember && (!data.churchName || data.churchName.trim().length < 1)) {
    return false;
  }
  return true;
}, {
  message: "Please provide your GRM branch or church name",
  path: ["grmBranch"],
});

const step3Schema = z.object({
  wantsToExhibit: z.boolean(),
  exhibitionDescription: z.string().optional(),
}).refine((data) => {
  if (data.wantsToExhibit && (!data.exhibitionDescription || data.exhibitionDescription.trim().length < 5)) {
    return false;
  }
  return true;
}, {
  message: "Please provide a description of what you'd like to showcase",
  path: ["exhibitionDescription"],
});

// Complete form schema for final validation
const conferenceRegistrationSchema = z.object({
  fullName: z.string().min(2, { message: "Full name is required" }),
  email: z.string().email({ message: "Valid email address is required" }),
  phoneNumber: z.string().min(8, { message: "Phone number is required" }),
  age: z.string().min(1, { message: "Age is required" }),
  grmBranch: z.string().optional(),
  churchName: z.string().optional(),
  isGrmMember: z.boolean(),
  wantsToExhibit: z.boolean(),
  exhibitionDescription: z.string().optional(),
});

interface ConferenceRegistrationFormProps {
  onClose: () => void;
}

const steps = [
  { id: 1, label: "Personal Information", completed: false, current: true },
  { id: 2, label: "Church Details", completed: false, current: false },
  { id: 3, label: "Exhibition Interest", completed: false, current: false },
  { id: 4, label: "Review & Submit", completed: false, current: false },
];

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};

const stepVariants: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.4,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    x: -50,
    transition: { duration: 0.3 }
  }
};

const sidebarItemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
      ease: "easeOut"
    }
  })
};

export const ConferenceRegistrationForm: React.FC<ConferenceRegistrationFormProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { submitRegistration, isLoading, error, clearError } = useRegistration();

  const form = useForm({
    resolver: zodResolver(conferenceRegistrationSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      age: "",
      grmBranch: "",
      churchName: "",
      isGrmMember: true,
      wantsToExhibit: false,
      exhibitionDescription: "",
    },
  });

  const validateCurrentStep = async () => {
    const values = form.getValues();
    
    try {
      switch (currentStep) {
        case 1:
          await step1Schema.parseAsync({
            fullName: values.fullName,
            email: values.email,
            phoneNumber: values.phoneNumber,
            age: values.age,
          });
          break;
        case 2:
          await step2Schema.parseAsync({
            isGrmMember: values.isGrmMember,
            grmBranch: values.grmBranch,
            churchName: values.churchName,
          });
          break;
        case 3:
          await step3Schema.parseAsync({
            wantsToExhibit: values.wantsToExhibit,
            exhibitionDescription: values.exhibitionDescription,
          });
          break;
        default:
          return true;
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Set form errors for the current step
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            form.setError(issue.path[0] as any, {
              type: "manual",
              message: issue.message,
            });
          }
        });
      }
      return false;
    }
  };

  const handleNext = async () => {
    console.log("Next button clicked, current step:", currentStep);
    
    // Clear any previous errors
    clearError();
    
    // Validate current step
    const isValid = await validateCurrentStep();
    if (!isValid) {
      console.log("Validation failed for step:", currentStep);
      return; // Stop if validation fails
    }

    console.log("Validation passed, moving to next step");
    if (currentStep < 4) {
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(currentStep + 1);
    } else {
      // Final submission to Supabase
      const formValues = form.getValues();
      
      const registrationData = {
        fullName: formValues.fullName,
        email: formValues.email,
        phoneNumber: formValues.phoneNumber,
        age: formValues.age,
        isGrmMember: formValues.isGrmMember,
        grmBranch: formValues.grmBranch,
        churchName: formValues.churchName,
        wantsToExhibit: formValues.wantsToExhibit,
        exhibitionDescription: formValues.exhibitionDescription,
      };

      const result = await submitRegistration(registrationData);
      
      if (result.success) {
        setShowSuccessModal(true);
      }
      // Error handling is done by the hook and displayed in the UI
    }
  };

  const onSubmit = async (values: any) => {
    console.log("Form submitted:", values);
    await handleNext();
  };

  const handleBack = (targetStep: number) => {
    console.log("Going back to step:", targetStep);
    // Remove steps after target step from completed steps
    setCompletedSteps(completedSteps.filter(step => step < targetStep));
    setCurrentStep(targetStep);
  };

  const getStepStatus = (stepId: number) => {
    if (completedSteps.includes(stepId)) return "completed";
    if (stepId === currentStep) return "current";
    return "pending";
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Left Sidebar */}
        <div className="w-80 bg-gray-50 p-8 flex flex-col">
          {/* Conference Logo */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-purple-600">GRM</h1>
            <p className="text-sm text-gray-600 mt-1">Women's Conference</p>
          </div>

          {/* Registration Title */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900">Event Registration</h2>
          </div>

          {/* Steps */}
          <div className="flex-1">
            {steps.map((step, index) => {
              const status = getStepStatus(step.id);
              return (
                <motion.div 
                  key={step.id} 
                  className="flex items-start mb-6"
                  variants={sidebarItemVariants}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                >
                  {/* Step Number/Icon */}
                  <div className="flex flex-col items-center mr-4">
                    <motion.div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        status === "completed"
                          ? "bg-purple-600 text-white"
                          : status === "current"
                          ? "bg-purple-600 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      {status === "completed" ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                        >
                          <Check className="w-4 h-4" />
                        </motion.div>
                      ) : (
                        step.id
                      )}
                    </motion.div>
                    {index < steps.length - 1 && (
                      <motion.div
                        className={`w-0.5 h-8 mt-2 ${
                          status === "completed" ? "bg-purple-600" : "bg-gray-300"
                        }`}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: index * 0.1 + 0.3, duration: 0.3 }}
                        style={{ originY: 0 }}
                      />
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="pt-1">
                    <span
                      className={`text-sm ${
                        status === "current"
                          ? "font-semibold text-gray-900"
                          : status === "completed"
                          ? "text-gray-700"
                          : "text-gray-500"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Visit Site Link */}
          <div className="mt-auto">
            <a
              href="#"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              Visit GRM
            </a>
          </div>
        </div>

        {/* Right Content Area */}
        <div className={`flex-1 p-8 overflow-y-auto flex flex-col ${currentStep <= 3 ? 'justify-center' : 'justify-start'}`}>
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-6 top-6 text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Form Content */}
          <div className="max-w-2xl mx-auto w-full">
            <AnimatePresence mode="wait">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      PERSONAL INFORMATION
                    </h3>
                    
                    {/* Full Name */}
                    <div className="mb-6">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-gray-600">
                              Full Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your full name"
                                className="mt-1"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Email and Phone */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-gray-600">
                              Email Address
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="your.email@example.com"
                                className="mt-1"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-gray-600">
                              Phone Number
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your phone number"
                                className="mt-1"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Age */}
                    <div className="mb-6">
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-gray-600">
                              Age
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter your age"
                                className="mt-1 max-w-32"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Next Button */}
                  <div className="flex justify-end pt-6">
                    <Button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2 rounded-md"
                    >
                      Next
                    </Button>
                  </div>
                </form>
              </Form>
                </motion.div>
              )}

              {/* Step 2: Church Details */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      CHURCH INFORMATION
                    </h3>
                    
                    {/* GRM Member Check */}
                    <div className="mb-6">
                      <FormField
                        control={form.control}
                        name="isGrmMember"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-gray-600">
                              Are you a GRM member?
                            </FormLabel>
                            <Select onValueChange={(value) => field.onChange(value === "true")} defaultValue={field.value ? "true" : "false"}>
                              <FormControl>
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="true">Yes, I'm a GRM member</SelectItem>
                                <SelectItem value="false">No, I'm not a GRM member</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* GRM Branch or Church Name */}
                    {form.watch("isGrmMember") ? (
                      <div className="mb-6">
                        <FormField
                          control={form.control}
                          name="grmBranch"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm text-gray-600">
                                GRM Branch
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter your GRM branch"
                                  className="mt-1"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ) : (
                      <div className="mb-6">
                        <FormField
                          control={form.control}
                          name="churchName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm text-gray-600">
                                Church Name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter your church name"
                                  className="mt-1"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleBack(1)}
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2 rounded-md"
                    >
                      Next
                    </Button>
                  </div>
                </form>
              </Form>
                </motion.div>
              )}

              {/* Step 3: Exhibition Interest */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      EXHIBITION OPPORTUNITY
                    </h3>
                    
                    {/* Exhibition Interest */}
                    <div className="mb-6">
                      <FormField
                        control={form.control}
                        name="wantsToExhibit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-gray-600">
                              Would you like to exhibit your products or services at the event?
                            </FormLabel>
                            <Select onValueChange={(value) => field.onChange(value === "true")} defaultValue={field.value ? "true" : "false"}>
                              <FormControl>
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="true">Yes, I would like to exhibit</SelectItem>
                                <SelectItem value="false">No, I'm just attending</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Exhibition Description */}
                    {form.watch("wantsToExhibit") && (
                      <div className="mb-6">
                        <FormField
                          control={form.control}
                          name="exhibitionDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm text-gray-600">
                                Please provide a brief description of what you would like to showcase
                              </FormLabel>
                              <FormControl>
                                <textarea
                                  className="w-full mt-1 p-3 border border-gray-300 rounded-md resize-none"
                                  rows={4}
                                  placeholder="e.g. Food, Make up & Accessories, Skin care Products, Books, Clothing etc."
                                  {...field}
                                />
                              </FormControl>
                              <p className="text-xs text-gray-500 mt-1">
                                Describe the products or services you'd like to showcase at the conference
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleBack(2)}
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2 rounded-md"
                    >
                      Next
                    </Button>
                  </div>
                </form>
              </Form>
                </motion.div>
              )}

              {/* Step 4: Review & Submit */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
              <div className="space-y-8">
                {/* Header with Success Icon */}
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div
                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 500 }}
                  >
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Almost Done!
                  </h3>
                  <p className="text-gray-600">
                    Please review your information before submitting your registration
                  </p>
                </motion.div>

                {/* Registration Cards */}
                <div className="grid gap-6">
                  {/* Personal Information Card */}
                  <motion.div 
                    className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center mb-4">
                      {/* <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <Users className="w-5 h-5 text-purple-600" />
                      </div> */}
                      <h4 className="text-lg font-semibold text-gray-900">Personal Information</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Full Name</p>
                        <p className="text-gray-900 font-medium">{form.getValues("fullName") || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Age</p>
                        <p className="text-gray-900 font-medium">{form.getValues("age") || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-gray-900 font-medium">{form.getValues("email") || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Phone</p>
                        <p className="text-gray-900 font-medium">{form.getValues("phoneNumber") || "Not provided"}</p>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Church Information Card */}
                  <motion.div 
                    className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex items-center mb-4">
                      {/* <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div> */}
                      <h4 className="text-lg font-semibold text-gray-900">Church Information</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Membership Status</p>
                        <p className="text-gray-900 font-medium">
                          {form.getValues("isGrmMember") ? "GRM Member" : "Non-GRM Member"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {form.getValues("isGrmMember") ? "GRM Branch" : "Church Name"}
                        </p>
                        <p className="text-gray-900 font-medium">
                          {form.getValues("isGrmMember") 
                            ? (form.getValues("grmBranch") || "Not provided")
                            : (form.getValues("churchName") || "Not provided")
                          }
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Exhibition Information Card */}
                  <motion.div 
                    className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="flex items-center mb-4">
                      {/* <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                        <Calendar className="w-5 h-5 text-orange-600" />
                      </div> */}
                      <h4 className="text-lg font-semibold text-gray-900">Exhibition Interest</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Exhibition Participation</p>
                        <p className="text-gray-900 font-medium">
                          {form.getValues("wantsToExhibit") ? "Yes, I want to exhibit" : "No, just attending"}
                        </p>
                      </div>
                      {form.getValues("wantsToExhibit") && form.getValues("exhibitionDescription") && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Exhibition Description</p>
                          <p className="text-gray-900 font-medium">{form.getValues("exhibitionDescription")}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>

                {/* Error Display */}
                {error && (
                  <motion.div 
                    className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center">
                      <X className="w-5 h-5 text-red-500 mr-2" />
                      <p className="text-red-700 font-medium">Registration Error</p>
                    </div>
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                  </motion.div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleBack(3)}
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={isLoading}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      "Complete Registration"
                    )}
                  </Button>
                </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

    {/* Success Modal */}
    {showSuccessModal && (
      <motion.div
        className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl"
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          {/* Success Animation */}
          <motion.div
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 400 }}
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>
          </motion.div>

          {/* Celebration Icons */}
          <div className="flex justify-center space-x-4 mb-6">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
            >
              <PartyPopper className="w-6 h-6 text-purple-500" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.7 }}
            >
              <Heart className="w-6 h-6 text-pink-500" />
            </motion.div>
            <motion.div
              animate={{ rotate: [0, -15, 15, 0] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.9 }}
            >
              <PartyPopper className="w-6 h-6 text-blue-500" />
            </motion.div>
          </div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              🎉 Registration Successful!
            </h2>
            <p className="text-gray-600 mb-2">
              Thank you for registering for the
            </p>
            <p className="text-lg font-semibold text-purple-600 mb-4">
              GRM Women's Conference 2K25
            </p>
            <p className="text-sm text-gray-500 mb-6">
              We're excited to see you there! You'll receive a confirmation email shortly.
            </p>
          </motion.div>

          {/* Close Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                onClose();
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Continue
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    )}
        </motion.div>

  );
};
