import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, X, CheckCircle, Loader2, PartyPopper, Heart, Download, Wifi, WifiOff } from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useOfflineRegistration } from "../hooks/useOfflineRegistration";
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


export const ConferenceRegistrationForm: React.FC<ConferenceRegistrationFormProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<any>(null);
  const { submitRegistration, exportRegistrations, getStats, isLoading, error, isOnline, clearError } = useOfflineRegistration();

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
        setRegistrationResult(result);
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
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 md:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div 
        className="bg-white rounded-xl md:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-6xl h-[95vh] md:h-[90vh] flex flex-col overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Top Horizontal Stepper */}
        <div className="bg-gray-50 p-4 md:p-6 border-b border-gray-200">
          {/* Conference Logo & Title */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg md:text-xl font-bold text-purple-600">GRM Women's Conference</h1>
              <div className="flex items-center gap-2">
                <p className="text-xs md:text-sm text-gray-600">Event Registration</p>
                {/* Connection Status */}
                <div className="flex items-center gap-1">
                  {isOnline ? (
                    <Wifi className="w-3 h-3 text-green-500" />
                  ) : (
                    <WifiOff className="w-3 h-3 text-orange-500" />
                  )}
                  <span className="text-xs text-gray-500">
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Export Button */}
              {getStats().canExport && (
                <button
                  onClick={() => {
                    const result = exportRegistrations();
                    if (result.success) {
                      alert(result.message);
                    }
                  }}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                  title="Export registrations to Excel"
                >
                  <Download className="w-3 h-3" />
                  <span className="hidden md:inline">Export ({getStats().totalRegistrations})</span>
                </button>
              )}
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 z-10"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
          </div>

          {/* Horizontal Steps */}
          <div className="flex items-center justify-center md:justify-between">
            {steps.map((step, index) => {
              const status = getStepStatus(step.id);
              return (
                <div key={step.id} className="flex items-center">
                  {/* Step Circle */}
                  <motion.div 
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      status === 'completed' 
                        ? 'bg-purple-600 border-purple-600' 
                        : status === 'current'
                        ? 'bg-purple-100 border-purple-600'
                        : 'bg-gray-100 border-gray-300'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {status === 'completed' ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Check className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </motion.div>
                    ) : (
                      <span className={`text-xs md:text-sm font-semibold ${
                        status === 'current' ? 'text-purple-600' : 'text-gray-500'
                      }`}>
                        {step.id}
                      </span>
                    )}
                  </motion.div>
                  
                  {/* Step Label - Hidden on Mobile */}
                  <div className="ml-2 md:ml-3 flex-1 hidden md:block">
                    <h3 className={`text-sm font-medium transition-colors duration-300 ${
                      status === 'current' ? 'text-purple-600' : 
                      status === 'completed' ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </h3>
                  </div>
                  
                  {/* Connecting Line */}
                  {index < steps.length - 1 && (
                    <motion.div 
                      className="h-0.5 bg-gray-200 w-8 md:w-16 lg:w-24 mx-2 md:mx-4"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: completedSteps.includes(step.id) ? 1 : 0.3 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className={`flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto flex flex-col ${currentStep <= 3 ? 'justify-center' : 'justify-start'}`}>
          {/* Form Content */}
          <div className="max-w-full md:max-w-2xl mx-auto w-full">
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
          className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 max-w-sm md:max-w-md w-full mx-4 text-center shadow-2xl"
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          {/* Success Animation */}
          <motion.div
            className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 400 }}
            >
              <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-green-600" />
            </motion.div>
          </motion.div>

          {/* Celebration Icons */}
          <div className="flex justify-center space-x-3 md:space-x-4 mb-4 md:mb-6">
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
            
            {/* Status Message */}
            {registrationResult && (
              <div className={`p-3 rounded-lg mb-4 ${
                registrationResult.isOffline 
                  ? 'bg-orange-50 border border-orange-200' 
                  : 'bg-green-50 border border-green-200'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  {registrationResult.isOffline ? (
                    <WifiOff className="w-4 h-4 text-orange-600" />
                  ) : (
                    <Wifi className="w-4 h-4 text-green-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    registrationResult.isOffline ? 'text-orange-700' : 'text-green-700'
                  }`}>
                    {registrationResult.isOffline ? 'Saved Offline' : 'Saved Online'}
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  {registrationResult.message}
                </p>
              </div>
            )}
            
            <p className="text-sm text-gray-500 mb-6">
              {registrationResult?.isOffline 
                ? 'Your registration is saved locally. Data will sync when online.' 
                : 'We\'re excited to see you there! You\'ll receive a confirmation email shortly.'
              }
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
