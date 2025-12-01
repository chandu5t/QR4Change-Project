import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { FaSpinner } from "react-icons/fa";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileText, Camera, Upload, CheckCircle2, QrCode } from "lucide-react";
import LocationCard from "@/components/LocationCard";

const ReportIssue = () => {
  const navigate = useNavigate();
  const { city, district, state } = useParams(); // Extract parameters from URL
  const modalRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressStep, setProgressStep] = useState(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [complaintId, setComplaintId] = useState(null);
  const [urgency, setUrgency] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    image: null,
  });
  const [detectedLocation, setDetectedLocation] = useState("");
  const [detectedTimestamp, setDetectedTimestamp] = useState("");

  const complaintCategories = [
    { value: "Garbage", label: "Garbage Collection", dept: "Sanitation Department" },
    { value: "Water Leakage", label: "Water Leakage", dept: "Water Department" },
    { value: "Street Light", label: "Street Light", dept: "Electricity Department" },
    { value: "Road Damage", label: "Road Damage", dept: "Road Department" },
    { value: "Other", label: "Other", dept: "General Admin" },
  ];

  const progressSteps = [
    { key: "uploading", label: "Uploading Image", loading: isSubmitting },
    { key: "verifying", label: "Verifying Image with AI", loading: isSubmitting },
    { key: "calculating", label: "Calculating Urgency Score", loading: isSubmitting },
    { key: "submitting", label: "Submitting Complaint", loading: isSubmitting },
  ];

  // Close modals on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowProgressModal(false);
        setShowSuccessModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close modals on Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowProgressModal(false);
        setShowSuccessModal(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB", {
          position: "top-right",
          autoClose: 3000,
          toastId: "image-size-error",
        });
        return;
      }
      setFormData((prev) => ({ ...prev, image: file }));
      toast.info(`Selected image: ${file.name}`, {
        position: "top-right",
        autoClose: 3000,
        toastId: "image-selected",
      });
    }
  };

  const validateImage = async (category, image) => {
    if (category !== "Garbage" && category !== "Road Damage") {
      return true;
    }

    const endpoint = category === "Garbage" ? "http://127.0.0.1:8000/api/garbage/" : "http://127.0.0.1:8000/api/pothole/";
    const imageFormData = new FormData();
    imageFormData.append("image", image);

    try {
      setProgressStep("verifying");
      toast.info(`Verifying ${category} image with AI...`, {
        position: "top-right",
        autoClose: 2000,
        toastId: "image-verifying",
      });

      const response = await fetch(endpoint, {
        method: "POST",
        body: imageFormData,
      });

      if (!response.ok) {
        throw new Error(`Image validation failed for ${category}`);
      }

      const result = await response.json();
      if (result.prediction.toLowerCase() === "yes") {
        toast.success(`Image verified as ${category} with confidence ${result.confidence}`, {
          position: "top-right",
          autoClose: 2000,
          toastId: "image-verified",
        });
        return true;
      } else {
        toast.error(`Image does not match ${category} issue`, {
          position: "top-right",
          autoClose: 3000,
          toastId: "image-verification-failed",
        });
        return false;
      }
    } catch (error) {
      toast.error(error.message || "Failed to validate image", {
        position: "top-right",
        autoClose: 3000,
        toastId: "image-error",
      });
      return false;
    }
  };

  const predictUrgency = async (description) => {
    try {
      setProgressStep("calculating");
      toast.info("Calculating urgency score...", {
        position: "top-right",
        autoClose: 2000,
        toastId: "urgency-calculating",
      });

      const response = await fetch("http://127.0.0.1:8000/api/urgency/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: description }),
      });

      if (!response.ok) {
        throw new Error("Failed to predict urgency");
      }

      const result = await response.json();
      const urgencyValue = result.urgency === "High" ? "High" : "Low";
      toast.success(`Urgency classified: ${urgencyValue}`, {
        position: "top-right",
        autoClose: 2000,
        toastId: "urgency-classified",
      });
      return urgencyValue;
    } catch (error) {
      toast.error(error.message || "Failed to predict urgency. Defaulting to Low.", {
        position: "top-right",
        autoClose: 3000,
        toastId: "urgency-error",
      });
      return "Low";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.title ||
      !formData.category ||
      !formData.description ||
      !formData.image ||
      !detectedLocation ||
      !city ||
      !district ||
      !state
    ) {
      toast.error("Please fill in all required fields, including an image and location, and ensure city, district, and state are provided in the URL.", {
        position: "top-right",
        autoClose: 3000,
        toastId: "form-error",
      });
      return;
    }

    setIsSubmitting(true);
    setShowProgressModal(true);
    setProgressStep("uploading");
    toast.info("Uploading image...", {
      position: "top-right",
      autoClose: 2000,
      toastId: "image-uploading",
    });

    // Step 1: Validate image
    const isImageValid = await validateImage(formData.category, formData.image);
    if (!isImageValid) {
      setIsSubmitting(false);
      setShowProgressModal(false);
      return;
    }

    // Step 2: Predict urgency
    const urgencyValue = await predictUrgency(formData.description);
    setUrgency(urgencyValue);

    // Step 3: Submit complaint
    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("district", district);
    formDataToSend.append("city", city);
    formDataToSend.append("state", state);
    formDataToSend.append("location", detectedLocation);
    formDataToSend.append("urgency", urgencyValue);
    formDataToSend.append("image", formData.image);

    try {
      setProgressStep("submitting");
      toast.info("Submitting complaint...", {
        position: "top-right",
        autoClose: 2000,
        toastId: "complaint-submitting",
      });

      const response = await fetch("http://localhost:5000/api/complaint/register", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("Failed to submit complaint");
      }

      const { complaint } = await response.json();
      setComplaintId(complaint.id);
      setIsSubmitting(false);
      setShowProgressModal(false);
      setShowSuccessModal(true);
      toast.success("Complaint registered successfully!", {
        position: "top-right",
        autoClose: 3000,
        toastId: "complaint-success",
      });
    } catch (error) {
      setIsSubmitting(false);
      setShowProgressModal(false);
      toast.error(error.message || "Failed to submit complaint", {
        position: "top-right",
        autoClose: 3000,
        toastId: "complaint-error",
      });
    }
  };

  const handleTrackComplaint = () => {
    setShowSuccessModal(false);
    navigate(`/confirmation/${complaintId}`, { state: { complaintData: { id: complaintId, ...formData, urgency, location: detectedLocation, timestamp: detectedTimestamp, city, district, state } } });
  };

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-6 md:py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="text-sm"
      />

      <div className="container mx-auto px-4 max-w-2xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-primary/10">
              <QrCode className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">QR-Triggered Reporting</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Auto-captured location and timestamp • AI-powered verification
            </p>
          </div>

          {/* Location Detection */}
          <LocationCard
            onLocationChange={(loc, ts) => {
              setDetectedLocation(loc);
              if (ts) setDetectedTimestamp(ts);
            }}
          />

          {/* Report Form */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <FileText className="h-5 w-5" />
                <span>Issue Details</span>
              </CardTitle>
              <CardDescription className="text-sm">
                AI will auto-classify and route to the appropriate department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-4"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                encType="multipart/form-data"
              >
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Issue Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="Title of Complaint"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    className="h-10"
                    required
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">
                    Issue Category *
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select issue category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Garbage">🗑️ Garbage Collection</SelectItem>
                      <SelectItem value="Water Leakage">💧 Water Leakage</SelectItem>
                      <SelectItem value="Street Light">💡 Street Light</SelectItem>
                      <SelectItem value="Road Damage">🛣️ Road Damage</SelectItem>
                      <SelectItem value="Other">📋 Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.category && (
                    <p className="text-xs text-muted-foreground">
                      → {complaintCategories.find((t) => t.value === formData.category)?.dept || "General Admin"}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the issue in detail..."
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="resize-none"
                    required
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Photo Evidence *</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                    <div className="space-y-2">
                      <Camera className="h-6 w-6 mx-auto text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {formData.image ? formData.image.name : "Tap to capture or upload photo"}
                        </p>
                        <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                      </div>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageUpload}
                        className="hidden"
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById("image")?.click()}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        {formData.image ? "Change Photo" : "Take Photo"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-primary to-gov-blue-light"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Submit Report
                      </>
                    )}
                  </Button>
                </div>
              </motion.form>
            </CardContent>
          </Card>

          {/* AI Processing Notice */}
          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20">
                  <CheckCircle2 className="h-4 w-4 text-accent-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">AI-Powered Department Assignment</p>
                  <p className="text-xs text-muted-foreground">
                    Your complaint will be automatically analyzed, validated, and assigned to the appropriate department based on the category, image, and urgency.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Progress Modal */}
      <AnimatePresence>
        {showProgressModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-labelledby="progress-modal-title"
          >
            <motion.div
              ref={modalRef}
              className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md border border-muted-foreground/20"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
            >
              <h2 id="progress-modal-title" className="text-xl font-semibold text-primary mb-4">
                Processing Complaint
              </h2>
              <div className="space-y-4">
                {progressSteps.map((step) => (
                  <div key={step.key} className="flex items-center gap-3">
                    {progressStep === step.key && step.loading ? (
                      <FaSpinner className="animate-spin text-primary" size={20} />
                    ) : progressStep && progressSteps.findIndex((s) => s.key === progressStep) > progressSteps.findIndex((s) => s.key === step.key) ? (
                      <CheckCircleIcon className="text-green-600 w-6 h-6" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/50"></div>
                    )}
                    <span className={`text-sm ${progressStep === step.key ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-labelledby="success-modal-title"
          >
            <motion.div
              ref={modalRef}
              className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md border border-muted-foreground/20"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="flex justify-center mb-4">
                <CheckCircleIcon className="text-green-600 w-12 h-12" />
              </div>
              <h2 id="success-modal-title" className="text-xl font-semibold text-primary text-center mb-4">
                Complaint Registered!
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Your complaint has been successfully submitted.
              </p>
              <div className="space-y-3 text-left">
                <h3 className="text-lg font-semibold text-primary">Complaint Details</h3>
                <p className="text-sm">
                  <b className="text-primary">Complaint ID:</b> <span className="text-muted-foreground">{complaintId}</span>
                </p>
                <p className="text-sm">
                  <b className="text-primary">Title:</b> <span className="text-muted-foreground">{formData.title}</span>
                </p>
                <p className="text-sm">
                  <b className="text-primary">Category:</b> <span className="text-muted-foreground">{formData.category}</span>
                </p>
                <p className="text-sm">
                  <b className="text-primary">Location:</b> <span className="text-muted-foreground">{detectedLocation}</span>
                </p>
                <p className="text-sm">
                  <b className="text-primary">Description:</b> <span className="text-muted-foreground">{formData.description}</span>
                </p>
                <p className="text-sm">
                  <b className="text-primary">Urgency:</b> <span className="text-muted-foreground">{urgency || "N/A"}</span>
                </p>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  onClick={handleTrackComplaint}
                  className="bg-gradient-to-r from-primary to-gov-blue-light"
                >
                  Track Complaint
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ReportIssue;
// import React, { useState, useRef, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { AnimatePresence, motion } from "framer-motion";
// import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
// import { FaSpinner } from "react-icons/fa";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Button } from "@/components/ui/button";
// import { FileText, Camera, Upload, CheckCircle2, QrCode } from "lucide-react";
// import LocationCard from "@/components/LocationCard";

// const ReportIssue = () => {
//   const navigate = useNavigate();
//   const modalRef = useRef(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [progressStep, setProgressStep] = useState<string | null>(null);
//   const [showProgressModal, setShowProgressModal] = useState(false);
//   const [showSuccessModal, setShowSuccessModal] = useState(false);
//   const [complaintId, setComplaintId] = useState<string | null>(null);
//   const [urgency, setUrgency] = useState<string | null>(null);
//   const [formData, setFormData] = useState({
//     title: "",
//     category: "",
//     description: "",
//     district: "",
//     city: "",
//     state: "",
//     image: null as File | null,
//   });
//   const [detectedLocation, setDetectedLocation] = useState("");
//   const [detectedTimestamp, setDetectedTimestamp] = useState("");

//   const complaintCategories = [
//     { value: "Garbage", label: "Garbage Collection", dept: "Sanitation Department" },
//     { value: "Water Leakage", label: "Water Leakage", dept: "Water Department" },
//     { value: "Street Light", label: "Street Light", dept: "Electricity Department" },
//     { value: "Road Damage", label: "Road Damage", dept: "Road Department" },
//     { value: "Other", label: "Other", dept: "General Admin" },
//   ];

//   const progressSteps = [
//     { key: "uploading", label: "Uploading Image", loading: isSubmitting },
//     { key: "verifying", label: "Verifying Image with AI", loading: isSubmitting },
//     { key: "calculating", label: "Calculating Urgency Score", loading: isSubmitting },
//     { key: "submitting", label: "Submitting Complaint", loading: isSubmitting },
//   ];

//   // Close modals on outside click
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
//         setShowProgressModal(false);
//         setShowSuccessModal(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // Close modals on Escape key
//   useEffect(() => {
//     const handleEscape = (event: KeyboardEvent) => {
//       if (event.key === "Escape") {
//         setShowProgressModal(false);
//         setShowSuccessModal(false);
//       }
//     };
//     document.addEventListener("keydown", handleEscape);
//     return () => document.removeEventListener("keydown", handleEscape);
//   }, []);

//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       if (file.size > 5 * 1024 * 1024) {
//         toast.error("Image size must be less than 5MB", {
//           position: "top-right",
//           autoClose: 3000,
//           toastId: "image-size-error",
//         });
//         return;
//       }
//       setFormData((prev) => ({ ...prev, image: file }));
//       toast.info(`Selected image: ${file.name}`, {
//         position: "top-right",
//         autoClose: 3000,
//         toastId: "image-selected",
//       });
//     }
//   };

//   const validateImage = async (category: string, image: File): Promise<boolean> => {
//     if (category !== "Garbage" && category !== "Road Damage") {
//       return true;
//     }

//     const endpoint = category === "Garbage" ? "http://127.0.0.1:7000/api/garbage/" : "http://127.0.0.1:7000/api/pothole/";
//     const imageFormData = new FormData();
//     imageFormData.append("image", image);

//     try {
//       setProgressStep("verifying");
//       toast.info(`Verifying ${category} image with AI...`, {
//         position: "top-right",
//         autoClose: 2000,
//         toastId: "image-verifying",
//       });

//       const response = await fetch(endpoint, {
//         method: "POST",
//         body: imageFormData,
//       });

//       if (!response.ok) {
//         throw new Error(`Image validation failed for ${category}`);
//       }

//       const result = await response.json();
//       if (result.prediction.toLowerCase() === "yes") {
//         toast.success(`Image verified as ${category} with confidence ${result.confidence}`, {
//           position: "top-right",
//           autoClose: 2000,
//           toastId: "image-verified",
//         });
//         return true;
//       } else {
//         toast.error(`Image does not match ${category} issue`, {
//           position: "top-right",
//           autoClose: 3000,
//           toastId: "image-verification-failed",
//         });
//         return false;
//       }
//     } catch (error) {
//       toast.error(error.message || "Failed to validate image", {
//         position: "top-right",
//         autoClose: 3000,
//         toastId: "image-error",
//       });
//       return false;
//     }
//   };

//   const predictUrgency = async (description: string): Promise<string> => {
//     try {
//       setProgressStep("calculating");
//       toast.info("Calculating urgency score...", {
//         position: "top-right",
//         autoClose: 2000,
//         toastId: "urgency-calculating",
//       });

//       const response = await fetch("http://127.0.0.1:7000/api/urgency/", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ text: description }),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to predict urgency");
//       }

//       const result = await response.json();
//       const urgencyValue = result.urgency === "High" ? "High" : "Low";
//       toast.success(`Urgency classified: ${urgencyValue}`, {
//         position: "top-right",
//         autoClose: 2000,
//         toastId: "urgency-classified",
//       });
//       return urgencyValue;
//     } catch (error) {
//       toast.error(error.message || "Failed to predict urgency. Defaulting to Low.", {
//         position: "top-right",
//         autoClose: 3000,
//         toastId: "urgency-error",
//       });
//       return "Low";
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (
//       !formData.title ||
//       !formData.category ||
//       !formData.description ||
//       !formData.district ||
//       !formData.city ||
//       !formData.state ||
//       !formData.image ||
//       !detectedLocation
//     ) {
//       toast.error("Please fill in all required fields, including an image and location.", {
//         position: "top-right",
//         autoClose: 3000,
//         toastId: "form-error",
//       });
//       return;
//     }

//     setIsSubmitting(true);
//     setShowProgressModal(true);
//     setProgressStep("uploading");
//     toast.info("Uploading image...", {
//       position: "top-right",
//       autoClose: 2000,
//       toastId: "image-uploading",
//     });

//     // Step 1: Validate image
//     const isImageValid = await validateImage(formData.category, formData.image);
//     if (!isImageValid) {
//       setIsSubmitting(false);
//       setShowProgressModal(false);
//       return;
//     }

//     // Step 2: Predict urgency
//     const urgencyValue = await predictUrgency(formData.description);
//     setUrgency(urgencyValue);

//     // Step 3: Submit complaint
//     const formDataToSend = new FormData();
//     formDataToSend.append("title", formData.title);
//     formDataToSend.append("category", formData.category);
//     formDataToSend.append("description", formData.description);
//     formDataToSend.append("district", formData.district);
//     formDataToSend.append("city", formData.city);
//     formDataToSend.append("state", formData.state);
//     formDataToSend.append("location", detectedLocation);
//     formDataToSend.append("urgency", urgencyValue);
//     formDataToSend.append("image", formData.image);

//     try {
//       setProgressStep("submitting");
//       toast.info("Submitting complaint...", {
//         position: "top-right",
//         autoClose: 2000,
//         toastId: "complaint-submitting",
//       });

//       const response = await fetch("http://localhost:5000/api/complaint/register", {
//         method: "POST",
//         body: formDataToSend,
//       });

//       if (!response.ok) {
//         throw new Error("Failed to submit complaint");
//       }

//       const { complaint } = await response.json();
//       setComplaintId(complaint.id);
//       setIsSubmitting(false);
//       setShowProgressModal(false);
//       setShowSuccessModal(true);
//       toast.success("Complaint registered successfully!", {
//         position: "top-right",
//         autoClose: 3000,
//         toastId: "complaint-success",
//       });
//     } catch (error) {
//       setIsSubmitting(false);
//       setShowProgressModal(false);
//       toast.error(error.message || "Failed to submit complaint", {
//         position: "top-right",
//         autoClose: 3000,
//         toastId: "complaint-error",
//       });
//     }
//   };

//   const handleTrackComplaint = () => {
//     setShowSuccessModal(false);
//     navigate(`/confirmation/${complaintId}`, { state: { complaintData: { id: complaintId, ...formData, urgency, location: detectedLocation, timestamp: detectedTimestamp } } });
//   };

//   // Animation variants
//   const formVariants = {
//     hidden: { opacity: 0, y: 50 },
//     visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
//   };

//   const modalVariants = {
//     hidden: { opacity: 0, scale: 0.8 },
//     visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
//   };

//   return (
//     <motion.div
//       className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-6 md:py-8"
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       transition={{ duration: 0.8 }}
//     >
//       <ToastContainer
//         position="top-right"
//         autoClose={3000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         theme="light"
//         className="text-sm"
//       />

//       <div className="container mx-auto px-4 max-w-2xl">
//         <div className="space-y-6">
//           {/* Header */}
//           <div className="text-center space-y-3">
//             <div className="mx-auto flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-primary/10">
//               <QrCode className="h-5 w-5 md:h-6 md:w-6 text-primary" />
//             </div>
//             <h1 className="text-2xl md:text-3xl font-bold">QR-Triggered Reporting</h1>
//             <p className="text-sm md:text-base text-muted-foreground">
//               Auto-captured location and timestamp • AI-powered classification
//             </p>
//           </div>

//           {/* Location Detection */}
//           <LocationCard
//             onLocationChange={(loc, ts) => {
//               setDetectedLocation(loc);
//               if (ts) setDetectedTimestamp(ts);
//             }}
//           />

//           {/* Report Form */}
//           <Card>
//             <CardHeader className="pb-4">
//               <CardTitle className="flex items-center space-x-2 text-lg">
//                 <FileText className="h-5 w-5" />
//                 <span>Issue Details</span>
//               </CardTitle>
//               <CardDescription className="text-sm">
//                 AI will auto-classify and route to the appropriate department
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <motion.form
//                 onSubmit={handleSubmit}
//                 className="space-y-4"
//                 variants={formVariants}
//                 initial="hidden"
//                 animate="visible"
//                 encType="multipart/form-data"
//               >
//                 {/* Title */}
//                 <div className="space-y-2">
//                   <Label htmlFor="title" className="text-sm font-medium">
//                     Issue Title *
//                   </Label>
//                   <Input
//                     id="title"
//                     placeholder="Brief description of the issue"
//                     value={formData.title}
//                     onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
//                     className="h-10"
//                     required
//                   />
//                 </div>

//                 {/* Category */}
//                 <div className="space-y-2">
//                   <Label htmlFor="category" className="text-sm font-medium">
//                     Issue Category *
//                   </Label>
//                   <Select
//                     value={formData.category}
//                     onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
//                   >
//                     <SelectTrigger className="h-10">
//                       <SelectValue placeholder="Select issue category" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="Garbage">🗑️ Garbage Collection</SelectItem>
//                       <SelectItem value="Water Leakage">💧 Water Leakage</SelectItem>
//                       <SelectItem value="Street Light">💡 Street Light</SelectItem>
//                       <SelectItem value="Road Damage">🛣️ Road Damage</SelectItem>
//                       <SelectItem value="Other">📋 Other</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   {formData.category && (
//                     <p className="text-xs text-muted-foreground">
//                       → {complaintCategories.find((t) => t.value === formData.category)?.dept || "General Admin"}
//                     </p>
//                   )}
//                 </div>

//                 {/* Description */}
//                 <div className="space-y-2">
//                   <Label htmlFor="description" className="text-sm font-medium">
//                     Description *
//                   </Label>
//                   <Textarea
//                     id="description"
//                     placeholder="Describe the issue in detail..."
//                     value={formData.description}
//                     onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
//                     rows={3}
//                     className="resize-none"
//                     required
//                   />
//                 </div>

//                 {/* Location Details */}
//                 <div className="space-y-2">
//                   <Label htmlFor="district" className="text-sm font-medium">
//                     District *
//                   </Label>
//                   <Input
//                     id="district"
//                     placeholder="Enter district"
//                     value={formData.district}
//                     onChange={(e) => setFormData((prev) => ({ ...prev, district: e.target.value }))}
//                     className="h-10"
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="city" className="text-sm font-medium">
//                     City *
//                   </Label>
//                   <Input
//                     id="city"
//                     placeholder="Enter city"
//                     value={formData.city}
//                     onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
//                     className="h-10"
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="state" className="text-sm font-medium">
//                     State *
//                   </Label>
//                   <Input
//                     id="state"
//                     placeholder="Enter state"
//                     value={formData.state}
//                     onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
//                     className="h-10"
//                     required
//                   />
//                 </div>

//                 {/* Image Upload */}
//                 <div className="space-y-2">
//                   <Label className="text-sm font-medium">Photo Evidence *</Label>
//                   <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
//                     <div className="space-y-2">
//                       <Camera className="h-6 w-6 mx-auto text-muted-foreground" />
//                       <div className="space-y-1">
//                         <p className="text-sm font-medium">
//                           {formData.image ? formData.image.name : "Tap to capture or upload photo"}
//                         </p>
//                         <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
//                       </div>
//                       <Input
//                         id="image"
//                         type="file"
//                         accept="image/*"
//                         capture="environment"
//                         onChange={handleImageUpload}
//                         className="hidden"
//                         required
//                       />
//                       <Button
//                         type="button"
//                         variant="outline"
//                         size="sm"
//                         onClick={() => document.getElementById("image")?.click()}
//                       >
//                         <Camera className="h-4 w-4 mr-2" />
//                         {formData.image ? "Change Photo" : "Take Photo"}
//                       </Button>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Submit Button */}
//                 <div className="pt-2">
//                   <Button
//                     type="submit"
//                     className="w-full h-11 bg-gradient-to-r from-primary to-gov-blue-light"
//                     disabled={isSubmitting}
//                   >
//                     {isSubmitting ? (
//                       <>
//                         <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
//                         Processing...
//                       </>
//                     ) : (
//                       <>
//                         <Upload className="h-4 w-4 mr-2" />
//                         Submit Report
//                       </>
//                     )}
//                   </Button>
//                 </div>
//               </motion.form>
//             </CardContent>
//           </Card>

//           {/* AI Processing Notice */}
//           <Card className="bg-accent/5 border-accent/20">
//             <CardContent className="p-4">
//               <div className="flex items-center space-x-3">
//                 <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20">
//                   <CheckCircle2 className="h-4 w-4 text-accent-foreground" />
//                 </div>
//                 <div className="space-y-1">
//                   <p className="text-sm font-medium">AI-Powered Department Assignment</p>
//                   <p className="text-xs text-muted-foreground">
//                     Your complaint will be automatically analyzed, validated, and assigned to the appropriate department based on the category, image, and urgency.
//                   </p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       {/* Progress Modal */}
//       <AnimatePresence>
//         {showProgressModal && (
//           <motion.div
//             className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.3 }}
//             role="dialog"
//             aria-labelledby="progress-modal-title"
//           >
//             <motion.div
//               ref={modalRef}
//               className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md border border-muted-foreground/20"
//               variants={modalVariants}
//               initial="hidden"
//               animate="visible"
//             >
//               <h2 id="progress-modal-title" className="text-xl font-semibold text-primary mb-4">
//                 Processing Complaint
//               </h2>
//               <div className="space-y-4">
//                 {progressSteps.map((step) => (
//                   <div key={step.key} className="flex items-center gap-3">
//                     {progressStep === step.key && step.loading ? (
//                       <FaSpinner className="animate-spin text-primary" size={20} />
//                     ) : progressStep && progressSteps.findIndex((s) => s.key === progressStep) > progressSteps.findIndex((s) => s.key === step.key) ? (
//                       <CheckCircleIcon className="text-green-600 w-6 h-6" />
//                     ) : (
//                       <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/50"></div>
//                     )}
//                     <span className={`text-sm ${progressStep === step.key ? "text-primary font-semibold" : "text-muted-foreground"}`}>
//                       {step.label}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Success Modal */}
//       <AnimatePresence>
//         {showSuccessModal && (
//           <motion.div
//             className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.3 }}
//             role="dialog"
//             aria-labelledby="success-modal-title"
//           >
//             <motion.div
//               ref={modalRef}
//               className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md border border-muted-foreground/20"
//               variants={modalVariants}
//               initial="hidden"
//               animate="visible"
//             >
//               <div className="flex justify-center mb-4">
//                 <CheckCircleIcon className="text-green-600 w-12 h-12" />
//               </div>
//               <h2 id="success-modal-title" className="text-xl font-semibold text-primary text-center mb-4">
//                 Complaint Registered!
//               </h2>
//               <p className="text-sm text-muted-foreground text-center mb-6">
//                 Your complaint has been successfully submitted.
//               </p>
//               <div className="space-y-3 text-left">
//                 <h3 className="text-lg font-semibold text-primary">Complaint Details</h3>
//                 <p className="text-sm">
//                   <b className="text-primary">Complaint ID:</b> <span className="text-muted-foreground">{complaintId}</span>
//                 </p>
//                 <p className="text-sm">
//                   <b className="text-primary">Title:</b> <span className="text-muted-foreground">{formData.title}</span>
//                 </p>
//                 <p className="text-sm">
//                   <b className="text-primary">Category:</b> <span className="text-muted-foreground">{formData.category}</span>
//                 </p>
//                 <p className="text-sm">
//                   <b className="text-primary">Location:</b> <span className="text-muted-foreground">{detectedLocation}</span>
//                 </p>
//                 <p className="text-sm">
//                   <b className="text-primary">Description:</b> <span className="text-muted-foreground">{formData.description}</span>
//                 </p>
//                 <p className="text-sm">
//                   <b className="text-primary">Urgency:</b> <span className="text-muted-foreground">{urgency || "N/A"}</span>
//                 </p>
//               </div>
//               <div className="flex justify-end gap-3 mt-6">
//                 <Button
//                   onClick={handleTrackComplaint}
//                   className="bg-gradient-to-r from-primary to-gov-blue-light"
//                 >
//                   Track Complaint
//                 </Button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </motion.div>
//   );
// };

// export default ReportIssue;

// import React, { useState, useRef, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { AnimatePresence, motion } from "framer-motion";
// import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
// import { FaSpinner } from "react-icons/fa";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Button } from "@/components/ui/button";
// import { MapPin } from "lucide-react";

// const ReportIssue = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const modalRef = useRef(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [progressStep, setProgressStep] = useState<string | null>(null);
//   const [showProgressModal, setShowProgressModal] = useState(false);
//   const [showSuccessModal, setShowSuccessModal] = useState(false);
//   const [complaintId, setComplaintId] = useState<string | null>(null);
//   const [urgency, setUrgency] = useState<string | null>(null);
//   const [formData, setFormData] = useState({
//     title: "",
//     category: "",
//     description: "",
//     district: "",
//     city: "",
//     state: "",
//     image: null as File | null,
//   });
//   const [detectedLocation, setDetectedLocation] = useState("");

//   const complaintCategories = [
//     { value: "Garbage", label: "Garbage Collection", dept: "Sanitation Department" },
//     { value: "Water Leakage", label: "Water Leakage", dept: "Water Department" },
//     { value: "Street Light", label: "Street Light", dept: "Electricity Department" },
//     { value: "Road Damage", label: "Road Damage", dept: "Road Department" },
//     { value: "Other", label: "Other", dept: "General Admin" },
//   ];

//   const progressSteps = [
//     { key: "uploading", label: "Uploading Image", loading: isSubmitting },
//     { key: "verifying", label: "Verifying Image with AI", loading: isSubmitting },
//     { key: "calculating", label: "Calculating Urgency Score", loading: isSubmitting },
//     { key: "submitting", label: "Submitting Complaint", loading: isSubmitting },
//   ];

//   // Geolocation logic
//   useEffect(() => {
//     const updateLocationFromCoords = async (latitude: number, longitude: number) => {
//       try {
//         const response = await fetch(
//           `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
//           { headers: { Accept: "application/json" } }
//         );
//         if (!response.ok) throw new Error("Reverse geocoding failed");
//         const data = await response.json();
//         const displayName: string | undefined = data?.display_name;
//         setDetectedLocation(displayName || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
//       } catch (_err) {
//         setDetectedLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
//         toast.error("Unable to fetch detailed location. Using coordinates.", {
//           position: "top-right",
//           autoClose: 3000,
//           toastId: "geolocation-error",
//         });
//       }
//     };

//     const requestGeolocation = () => {
//       if (!("geolocation" in navigator)) {
//         setDetectedLocation("Geolocation not supported by this browser");
//         toast.error("Geolocation not supported by this browser.", {
//           position: "top-right",
//           autoClose: 3000,
//           toastId: "geolocation-unsupported",
//         });
//         return;
//       }

//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const { latitude, longitude } = position.coords;
//           updateLocationFromCoords(latitude, longitude);
//         },
//         (error) => {
//           let errorMessage = "Unable to fetch location.";
//           switch (error.code) {
//             case error.PERMISSION_DENIED:
//               errorMessage = "Location permission denied. Please allow access.";
//               break;
//             case error.POSITION_UNAVAILABLE:
//               errorMessage = "Location unavailable. Try again.";
//               break;
//             case error.TIMEOUT:
//               errorMessage = "Location request timed out. Try again.";
//               break;
//           }
//           setDetectedLocation(errorMessage);
//           toast.error(errorMessage, {
//             position: "top-right",
//             autoClose: 3000,
//             toastId: "geolocation-error",
//           });
//         },
//         { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
//       );
//     };

//     const params = new URLSearchParams(location.search);
//     const loc = params.get("location");
//     const district = params.get("district");
//     const city = params.get("city");
//     const state = params.get("state");

//     if (loc) {
//       setDetectedLocation(loc);
//     } else {
//       requestGeolocation();
//     }
//     if (district) setFormData((prev) => ({ ...prev, district }));
//     if (city) setFormData((prev) => ({ ...prev, city }));
//     if (state) setFormData((prev) => ({ ...prev, state }));
//   }, [location]);

//   // Close modals on outside click
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
//         setShowProgressModal(false);
//         setShowSuccessModal(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // Close modals on Escape key
//   useEffect(() => {
//     const handleEscape = (event: KeyboardEvent) => {
//       if (event.key === "Escape") {
//         setShowProgressModal(false);
//         setShowSuccessModal(false);
//       }
//     };
//     document.addEventListener("keydown", handleEscape);
//     return () => document.removeEventListener("keydown", handleEscape);
//   }, []);

//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       if (file.size > 5 * 1024 * 1024) {
//         toast.error("Image size must be less than 5MB", {
//           position: "top-right",
//           autoClose: 3000,
//           toastId: "image-size-error",
//         });
//         return;
//       }
//       setFormData((prev) => ({ ...prev, image: file }));
//       toast.info(`Selected image: ${file.name}`, {
//         position: "top-right",
//         autoClose: 3000,
//         toastId: "image-selected",
//       });
//     }
//   };

//   const validateImage = async (category: string, image: File): Promise<boolean> => {
//     if (category !== "Garbage" && category !== "Road Damage") {
//       return true;
//     }

//     const endpoint = category === "Garbage" ? "http://127.0.0.1:7000/api/garbage/" : "http://127.0.0.1:7000/api/pothole/";
//     const imageFormData = new FormData();
//     imageFormData.append("image", image);

//     try {
//       setProgressStep("verifying");
//       toast.info(`Verifying ${category} image with AI...`, {
//         position: "top-right",
//         autoClose: 2000,
//         toastId: "image-verifying",
//       });

//       const response = await fetch(endpoint, {
//         method: "POST",
//         body: imageFormData,
//       });

//       if (!response.ok) {
//         throw new Error(`Image validation failed for ${category}`);
//       }

//       const result = await response.json();
//       if (result.prediction.toLowerCase() === "yes") {
//         toast.success(`Image verified as ${category} with confidence ${result.confidence}`, {
//           position: "top-right",
//           autoClose: 2000,
//           toastId: "image-verified",
//         });
//         return true;
//       } else {
//         toast.error(`Image does not match ${category} issue`, {
//           position: "top-right",
//           autoClose: 3000,
//           toastId: "image-verification-failed",
//         });
//         return false;
//       }
//     } catch (error) {
//       toast.error(error.message || "Failed to validate image", {
//         position: "top-right",
//         autoClose: 3000,
//         toastId: "image-error",
//       });
//       return false;
//     }
//   };

//   const predictUrgency = async (description: string): Promise<string> => {
//     try {
//       setProgressStep("calculating");
//       toast.info("Calculating urgency score...", {
//         position: "top-right",
//         autoClose: 2000,
//         toastId: "urgency-calculating",
//       });

//       const response = await fetch("http://127.0.0.1:7000/api/urgency/", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ text: description }),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to predict urgency");
//       }

//       const result = await response.json();
//       const urgencyValue = result.urgency === "High" ? "High" : "Low";
//       toast.success(`Urgency classified: ${urgencyValue}`, {
//         position: "top-right",
//         autoClose: 2000,
//         toastId: "urgency-classified",
//       });
//       return urgencyValue;
//     } catch (error) {
//       toast.error(error.message || "Failed to predict urgency. Defaulting to Low.", {
//         position: "top-right",
//         autoClose: 3000,
//         toastId: "urgency-error",
//       });
//       return "Low";
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (
//       !formData.title ||
//       !formData.category ||
//       !formData.description ||
//       !formData.district ||
//       !formData.city ||
//       !formData.state ||
//       !formData.image ||
//       !detectedLocation
//     ) {
//       toast.error("Please fill in all required fields, including an image and location.", {
//         position: "top-right",
//         autoClose: 3000,
//         toastId: "form-error",
//       });
//       return;
//     }

//     setIsSubmitting(true);
//     setShowProgressModal(true);
//     setProgressStep("uploading");
//     toast.info("Uploading image...", {
//       position: "top-right",
//       autoClose: 2000,
//       toastId: "image-uploading",
//     });

//     // Step 1: Validate image
//     const isImageValid = await validateImage(formData.category, formData.image);
//     if (!isImageValid) {
//       setIsSubmitting(false);
//       setShowProgressModal(false);
//       return;
//     }

//     // Step 2: Predict urgency
//     const urgencyValue = await predictUrgency(formData.description);
//     setUrgency(urgencyValue);

//     // Step 3: Submit complaint
//     const formDataToSend = new FormData();
//     formDataToSend.append("title", formData.title);
//     formDataToSend.append("category", formData.category);
//     formDataToSend.append("description", formData.description);
//     formDataToSend.append("district", formData.district);
//     formDataToSend.append("city", formData.city);
//     formDataToSend.append("state", formData.state);
//     formDataToSend.append("location", detectedLocation);
//     formDataToSend.append("urgency", urgencyValue);
//     formDataToSend.append("image", formData.image);

//     try {
//       setProgressStep("submitting");
//       toast.info("Submitting complaint...", {
//         position: "top-right",
//         autoClose: 2000,
//         toastId: "complaint-submitting",
//       });

//       const response = await fetch("http://localhost:5000/api/complaint/register", {
//         method: "POST",
//         body: formDataToSend,
//       });

//       if (!response.ok) {
//         throw new Error("Failed to submit complaint");
//       }

//       const { complaint } = await response.json();
//       setComplaintId(complaint.id);
//       setIsSubmitting(false);
//       setShowProgressModal(false);
//       setShowSuccessModal(true);
//       toast.success("Complaint registered successfully!", {
//         position: "top-right",
//         autoClose: 3000,
//         toastId: "complaint-success",
//       });
//     } catch (error) {
//       setIsSubmitting(false);
//       setShowProgressModal(false);
//       toast.error(error.message || "Failed to submit complaint", {
//         position: "top-right",
//         autoClose: 3000,
//         toastId: "complaint-error",
//       });
//     }
//   };

//   const handleTrackComplaint = () => {
//     setShowSuccessModal(false);
//     navigate(`/confirmation/${complaintId}`, { state: { complaintData: { id: complaintId, ...formData, urgency, location: detectedLocation } } });
//   };

//   // Animation variants
//   const formVariants = {
//     hidden: { opacity: 0, y: 50 },
//     visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
//   };

//   const modalVariants = {
//     hidden: { opacity: 0, scale: 0.8 },
//     visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
//   };

//   return (
//     <motion.div
//       className="min-h-screen bg-gradient-to-br from-teal-100 to-green-100 flex items-center justify-center p-6 relative"
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       transition={{ duration: 0.8 }}
//     >
//       {/* Toast Container */}
//       <ToastContainer
//         position="top-right"
//         autoClose={3000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         theme="light"
//         className="text-sm"
//       />

//       {/* Background Pattern */}
//       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/city.png')] opacity-10 z-0"></div>

//       {/* Complaint Form */}
//       <motion.form
//         onSubmit={handleSubmit}
//         className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg z-10"
//         variants={formVariants}
//         initial="hidden"
//         animate="visible"
//         encType="multipart/form-data"
//       >
//         <motion.h2
//           className="text-2xl font-semibold text-teal-600 mb-6"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.2 }}
//         >
//           File a Complaint
//         </motion.h2>

//         {/* Detected Location */}
//         <div className="mb-5">
//           <Label htmlFor="detectedLocation" className="block text-sm font-medium text-gray-700 mb-2">
//             Detected Location *
//           </Label>
//           <div className="flex items-center space-x-2">
//             <MapPin className="h-5 w-5 text-gray-600" />
//             <Input
//               id="detectedLocation"
//               value={detectedLocation}
//               readOnly
//               placeholder="Fetching location..."
//               className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
//             />
//           </div>
//           {detectedLocation.includes("permission denied") && (
//             <p className="text-xs text-red-600 mt-1">
//               Please enable location permissions in your browser settings and refresh.
//             </p>
//           )}
//         </div>

//         {/* Title */}
//         <div className="mb-5">
//           <Label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
//             Complaint Title *
//           </Label>
//           <motion.input
//             id="title"
//             value={formData.title}
//             onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
//             required
//             placeholder="e.g. Garbage on Road"
//             className="w-full p-3 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
//             whileFocus={{ scale: 1.02 }}
//           />
//         </div>

//         {/* Category */}
//         <div className="mb-5">
//           <Label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
//             Complaint Type *
//           </Label>
//           <motion.div whileFocus={{ scale: 1.02 }}>
//             <Select
//               value={formData.category}
//               onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
//             >
//               <SelectTrigger className="w-full p-3 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
//                 <SelectValue placeholder="Select issue category" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="Garbage">🗑️ Garbage Collection</SelectItem>
//                 <SelectItem value="Water Leakage">💧 Water Leakage</SelectItem>
//                 <SelectItem value="Street Light">💡 Street Light</SelectItem>
//                 <SelectItem value="Road Damage">🛣️ Road Damage</SelectItem>
//                 <SelectItem value="Other">📋 Other</SelectItem>
//               </SelectContent>
//             </Select>
//           </motion.div>
//           {formData.category && (
//             <p className="text-xs text-gray-600 mt-1">
//               → {complaintCategories.find((t) => t.value === formData.category)?.dept || "General Admin"}
//             </p>
//           )}
//         </div>

//         {/* Description */}
//         <div className="mb-5">
//           <Label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
//             Description *
//           </Label>
//           <motion.textarea
//             id="description"
//             value={formData.description}
//             onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
//             rows={4}
//             required
//             placeholder="Write details about the complaint..."
//             className="w-full p-3 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
//             whileFocus={{ scale: 1.02 }}
//           />
//         </div>

//         {/* Location Details */}
//         <div className="flex gap-4 mb-5">
//           <div className="flex-1">
//             <Label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">
//               District *
//             </Label>
//             <motion.input
//               id="district"
//               value={formData.district}
//               onChange={(e) => setFormData((prev) => ({ ...prev, district: e.target.value }))}
//               required
//               placeholder="Enter district"
//               className="w-full p-3 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
//               whileFocus={{ scale: 1.02 }}
//             />
//           </div>
//           <div className="flex-1">
//             <Label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
//               City *
//             </Label>
//             <motion.input
//               id="city"
//               value={formData.city}
//               onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
//               required
//               placeholder="Enter city"
//               className="w-full p-3 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
//               whileFocus={{ scale: 1.02 }}
//             />
//           </div>
//         </div>
//         <div className="mb-5">
//           <Label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
//             State *
//           </Label>
//           <motion.input
//             id="state"
//             value={formData.state}
//             onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
//             required
//             placeholder="Enter state"
//             className="w-full p-3 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
//             whileFocus={{ scale: 1.02 }}
//           />
//         </div>

//         {/* Image Upload */}
//         <div className="mb-5">
//           <Label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
//             Upload Image *
//           </Label>
//           <motion.input
//             id="image"
//             type="file"
//             accept="image/*"
//             onChange={handleImageUpload}
//             required
//             className="w-full p-3 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
//             whileFocus={{ scale: 1.02 }}
//           />
//           {formData.image && (
//             <p className="text-sm text-gray-600 mt-2">Selected: {formData.image.name}</p>
//           )}
//         </div>

//         {/* Submit Button */}
//         <motion.button
//           type="submit"
//           className="w-full py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           disabled={isSubmitting}
//         >
//           {isSubmitting ? (
//             <>
//               <FaSpinner className="animate-spin inline-block mr-2" />
//               Processing...
//             </>
//           ) : (
//             "Submit Complaint"
//           )}
//         </motion.button>
//       </motion.form>

//       {/* Progress Modal */}
//       <AnimatePresence>
//         {showProgressModal && (
//           <motion.div
//             className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.3 }}
//             role="dialog"
//             aria-labelledby="progress-modal-title"
//           >
//             <motion.div
//               ref={modalRef}
//               className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md border border-teal-200"
//               variants={modalVariants}
//               initial="hidden"
//               animate="visible"
//             >
//               <h2 id="progress-modal-title" className="text-xl font-semibold text-teal-600 mb-4">
//                 Processing Complaint
//               </h2>
//               <div className="space-y-4">
//                 {progressSteps.map((step) => (
//                   <div key={step.key} className="flex items-center gap-3">
//                     {progressStep === step.key && step.loading ? (
//                       <FaSpinner className="animate-spin text-teal-600" size={20} />
//                     ) : progressStep && progressSteps.findIndex((s) => s.key === progressStep) > progressSteps.findIndex((s) => s.key === step.key) ? (
//                       <CheckCircleIcon className="text-green-600 w-6 h-6" />
//                     ) : (
//                       <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
//                     )}
//                     <span className={`text-sm ${progressStep === step.key ? "text-teal-600 font-semibold" : "text-gray-600"}`}>
//                       {step.label}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Success Modal */}
//       <AnimatePresence>
//         {showSuccessModal && (
//           <motion.div
//             className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.3 }}
//             role="dialog"
//             aria-labelledby="success-modal-title"
//           >
//             <motion.div
//               ref={modalRef}
//               className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md border border-teal-200"
//               variants={modalVariants}
//               initial="hidden"
//               animate="visible"
//             >
//               <div className="flex justify-center mb-4">
//                 <CheckCircleIcon className="text-green-600 w-12 h-12" />
//               </div>
//               <h2 id="success-modal-title" className="text-xl font-semibold text-teal-600 text-center mb-4">
//                 Complaint Registered!
//               </h2>
//               <p className="text-sm text-gray-600 text-center mb-6">
//                 Your complaint has been successfully submitted.
//               </p>
//               <div className="space-y-3 text-left">
//                 <h3 className="text-lg font-semibold text-teal-600">Complaint Details</h3>
//                 <p className="text-sm">
//                   <b className="text-teal-600">Complaint ID:</b> <span className="text-gray-700">{complaintId}</span>
//                 </p>
//                 <p className="text-sm">
//                   <b className="text-teal-600">Title:</b> <span className="text-gray-700">{formData.title}</span>
//                 </p>
//                 <p className="text-sm">
//                   <b className="text-teal-600">Category:</b> <span className="text-gray-700">{formData.category}</span>
//                 </p>
//                 <p className="text-sm">
//                   <b className="text-teal-600">Location:</b> <span className="text-gray-700">{detectedLocation}</span>
//                 </p>
//                 <p className="text-sm">
//                   <b className="text-teal-600">Description:</b> <span className="text-gray-700">{formData.description}</span>
//                 </p>
//                 <p className="text-sm">
//                   <b className="text-teal-600">Urgency:</b> <span className="text-gray-700">{urgency || "N/A"}</span>
//                 </p>
//               </div>
//               <div className="flex justify-end gap-3 mt-6">
//                 <motion.button
//                   onClick={handleTrackComplaint}
//                   className="py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-md"
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                 >
//                   Track Complaint
//                 </motion.button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </motion.div>
//   );
// };

// export default ReportIssue;


// // // // import { useState, useEffect } from "react";
// // // // import { useNavigate, useLocation } from "react-router-dom";
// // // // import { Button } from "@/components/ui/button";
// // // // import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// // // // import { Input } from "@/components/ui/input";
// // // // import { Label } from "@/components/ui/label";
// // // // import { Textarea } from "@/components/ui/textarea";
// // // // import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// // // // import { useToast } from "@/hooks/use-toast";
// // // // import { Upload, FileText, Camera, CheckCircle2, QrCode } from "lucide-react";

// // // // const ReportIssue = () => {
// // // //   const navigate = useNavigate();
// // // //   const { toast } = useToast();
// // // //   const location = useLocation();
// // // //   const [isSubmitting, setIsSubmitting] = useState(false);
// // // //   const [formData, setFormData] = useState({
// // // //     title: "",
// // // //     category: "", // Changed from 'type' to 'category' to match backend
// // // //     description: "",
// // // //     district: "",
// // // //     city: "",
// // // //     state: "",
// // // //     image: null,
// // // //     urgency: "", // Added urgency field
// // // //     // voiceNote: null, // Commented out as backend doesn't support it
// // // //   });
// // // //   const [detectedLocation, setDetectedLocation] = useState("");
// // // //   const [detectedTimestamp, setDetectedTimestamp] = useState("");

// // // //   const complaintCategories = [
// // // //     { value: "Garbage", label: "Garbage Collection", dept: "Sanitation Department" },
// // // //     { value: "Water Leakage", label: "Water Leakage", dept: "Water Department" }, // Match backend enum
// // // //     { value: "Street Light", label: "Street Light", dept: "Electricity Department" }, // Match backend enum
// // // //     { value: "Road Damage", label: "Road Damage", dept: "Road Department" }, // Match backend enum
// // // //     { value: "Other", label: "Other", dept: "General Admin" },
// // // //   ];

// // // //   // Extract location info from URL parameters
// // // //   useEffect(() => {
// // // //     const params = new URLSearchParams(location.search);
// // // //     const loc = params.get("location");
// // // //     const district = params.get("district");
// // // //     const city = params.get("city");
// // // //     const state = params.get("state");
// // // //     const ts = params.get("timestamp");

// // // //     if (loc) setDetectedLocation(loc);
// // // //     if (ts) setDetectedTimestamp(ts);
// // // //     if (district) setFormData((prev) => ({ ...prev, district }));
// // // //     if (city) setFormData((prev) => ({ ...prev, city }));
// // // //     if (state) setFormData((prev) => ({ ...prev, state }));
// // // //   }, [location]);

// // // //   const handleSubmit = async (e) => {
// // // //     e.preventDefault();
// // // //     if (
// // // //       !formData.title ||
// // // //       !formData.category ||
// // // //       !formData.description ||
// // // //       !formData.district ||
// // // //       !formData.city ||
// // // //       !formData.state ||
// // // //       !formData.image ||
// // // //       !formData.urgency
// // // //     ) {
// // // //       toast({
// // // //         title: "Missing Information",
// // // //         description: "Please fill in all required fields, including an image and urgency.",
// // // //         variant: "destructive",
// // // //       });
// // // //       return;
// // // //     }

// // // //     setIsSubmitting(true);

// // // //     const formDataToSend = new FormData();
// // // //     formDataToSend.append("title", formData.title);
// // // //     formDataToSend.append("category", formData.category); // Changed to 'category'
// // // //     formDataToSend.append("description", formData.description);
// // // //     formDataToSend.append("district", formData.district);
// // // //     formDataToSend.append("city", formData.city);
// // // //     formDataToSend.append("state", formData.state);
// // // //     formDataToSend.append("location", detectedLocation || "Location unavailable");
// // // //     formDataToSend.append("urgency", formData.urgency); // Added urgency
// // // //     formDataToSend.append("image", formData.image);
// // // //     // if (formData.voiceNote) formDataToSend.append("voiceNote", formData.voiceNote); // Commented out

// // // //     try {
// // // //       const response = await fetch("http://localhost:5000/api/complaint/register", {
// // // //         method: "POST",
// // // //         body: formDataToSend,
// // // //       });

// // // //       if (!response.ok) {
// // // //         throw new Error("Failed to submit complaint");
// // // //       }

// // // //       const { complaint } = await response.json(); // Adjusted to match backend response
// // // //       setIsSubmitting(false);

// // // //       toast({
// // // //         title: "Complaint Submitted Successfully!",
// // // //         description: `Your complaint ID is ${complaint.id}`,
// // // //       });

// // // //       navigate(`/confirmation/${complaint.id}`, { state: { complaintData: complaint } }); // Adjusted to use complaint.id
// // // //     } catch (error) {
// // // //       setIsSubmitting(false);
// // // //       toast({
// // // //         title: "Submission Failed",
// // // //         description: "An error occurred while submitting your complaint.",
// // // //         variant: "destructive",
// // // //       });
// // // //     }
// // // //   };

// // // //   const handleImageUpload = (e) => {
// // // //     const file = e.target.files?.[0];
// // // //     if (file) {
// // // //       setFormData((prev) => ({ ...prev, image: file }));
// // // //     }
// // // //   };

// // // //   // const handleVoiceNote = (blob) => {
// // // //   //   setFormData((prev) => ({ ...prev, voiceNote: blob }));
// // // //   // }; // Commented out as backend doesn't support it

// // // //   return (
// // // //     <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-6 md:py-8">
// // // //       <div className="container mx-auto px-4 max-w-2xl">
// // // //         <div className="space-y-6">
// // // //           {/* Header */}
// // // //           <div className="text-center space-y-3">
// // // //             <div className="mx-auto flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-primary/10">
// // // //               <QrCode className="h-5 w-5 md:h-6 md:w-6 text-primary" />
// // // //             </div>
// // // //             <h1 className="text-2xl md:text-3xl font-bold">QR-Triggered Reporting</h1>
// // // //             <p className="text-sm md:text-base text-muted-foreground">
// // // //               Auto-captured location and timestamp • AI-powered classification
// // // //             </p>
// // // //           </div>

// // // //           {/* Report Form */}
// // // //           <Card>
// // // //             <CardHeader className="pb-4">
// // // //               <CardTitle className="flex items-center space-x-2 text-lg">
// // // //                 <FileText className="h-5 w-5" />
// // // //                 <span>Issue Details</span>
// // // //               </CardTitle>
// // // //               <CardDescription className="text-sm">
// // // //                 AI will auto-classify and route to the appropriate department
// // // //               </CardDescription>
// // // //             </CardHeader>
// // // //             <CardContent>
// // // //               <form onSubmit={handleSubmit} className="space-y-4">
// // // //                 {/* Title */}
// // // //                 <div className="space-y-2">
// // // //                   <Label htmlFor="title" className="text-sm font-medium">
// // // //                     Issue Title *
// // // //                   </Label>
// // // //                   <Input
// // // //                     id="title"
// // // //                     placeholder="Brief description of the issue"
// // // //                     value={formData.title}
// // // //                     onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
// // // //                     className="h-10"
// // // //                     required
// // // //                   />
// // // //                 </div>

// // // //                 {/* Category */}
// // // //                 <div className="space-y-2">
// // // //                   <Label htmlFor="category" className="text-sm font-medium">
// // // //                     Issue Category *
// // // //                   </Label>
// // // //                   <Select
// // // //                     value={formData.category}
// // // //                     onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
// // // //                   >
// // // //                     <SelectTrigger className="h-10">
// // // //                       <SelectValue placeholder="AI will auto-classify from image" />
// // // //                     </SelectTrigger>
// // // //                     <SelectContent>
// // // //                       <SelectItem value="Garbage">🗑️ Garbage Collection</SelectItem>
// // // //                       <SelectItem value="Water Leakage">💧 Water Leakage</SelectItem>
// // // //                       <SelectItem value="Street Light">💡 Street Light</SelectItem>
// // // //                       <SelectItem value="Road Damage">🛣️ Road Damage</SelectItem>
// // // //                       <SelectItem value="Other">📋 Other</SelectItem>
// // // //                     </SelectContent>
// // // //                   </Select>
// // // //                   {formData.category && (
// // // //                     <p className="text-xs text-muted-foreground">
// // // //                       →{" "}
// // // //                       {complaintCategories.find((t) => t.value === formData.category)?.dept ||
// // // //                         "General Admin"}
// // // //                     </p>
// // // //                   )}
// // // //                 </div>

// // // //                 {/* Description */}
// // // //                 <div className="space-y-2">
// // // //                   <Label htmlFor="description" className="text-sm font-medium">
// // // //                     Description *
// // // //                   </Label>
// // // //                   <Textarea
// // // //                     id="description"
// // // //                     placeholder="Describe the issue in detail..."
// // // //                     value={formData.description}
// // // //                     onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
// // // //                     rows={3}
// // // //                     className="resize-none"
// // // //                     required
// // // //                   />
// // // //                 </div>

// // // //                 {/* Location Details */}
// // // //                 <div className="space-y-2">
// // // //                   <Label htmlFor="district" className="text-sm font-medium">
// // // //                     District *
// // // //                   </Label>
// // // //                   <Input
// // // //                     id="district"
// // // //                     placeholder="Enter district"
// // // //                     value={formData.district}
// // // //                     onChange={(e) => setFormData((prev) => ({ ...prev, district: e.target.value }))}
// // // //                     className="h-10"
// // // //                     required
// // // //                   />
// // // //                 </div>
// // // //                 <div className="space-y-2">
// // // //                   <Label htmlFor="city" className="text-sm font-medium">
// // // //                     City *
// // // //                   </Label>
// // // //                   <Input
// // // //                     id="city"
// // // //                     placeholder="Enter city"
// // // //                     value={formData.city}
// // // //                     onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
// // // //                     className="h-10"
// // // //                     required
// // // //                   />
// // // //                 </div>
// // // //                 <div className="space-y-2">
// // // //                   <Label htmlFor="state" className="text-sm font-medium">
// // // //                     State *
// // // //                   </Label>
// // // //                   <Input
// // // //                     id="state"
// // // //                     placeholder="Enter state"
// // // //                     value={formData.state}
// // // //                     onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
// // // //                     className="h-10"
// // // //                     required
// // // //                   />
// // // //                 </div>

// // // //                 {/* Urgency */}
// // // //                 <div className="space-y-2">
// // // //                   <Label htmlFor="urgency" className="text-sm font-medium">
// // // //                     Urgency *
// // // //                   </Label>
// // // //                   <Select
// // // //                     value={formData.urgency}
// // // //                     onValueChange={(value) => setFormData((prev) => ({ ...prev, urgency: value }))}
// // // //                   >
// // // //                     <SelectTrigger className="h-10">
// // // //                       <SelectValue placeholder="Select urgency level" />
// // // //                     </SelectTrigger>
// // // //                     <SelectContent>
// // // //                       <SelectItem value="High">High</SelectItem>
// // // //                       <SelectItem value="Low">Low</SelectItem>
// // // //                     </SelectContent>
// // // //                   </Select>
// // // //                 </div>

// // // //                 {/* Image Upload */}
// // // //                 <div className="space-y-2">
// // // //                   <Label className="text-sm font-medium">Photo Evidence *</Label>
// // // //                   <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
// // // //                     <div className="space-y-2">
// // // //                       <Camera className="h-6 w-6 mx-auto text-muted-foreground" />
// // // //                       <div className="space-y-1">
// // // //                         <p className="text-sm font-medium">
// // // //                           {formData.image ? formData.image.name : "Tap to capture or upload photo"}
// // // //                         </p>
// // // //                         <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
// // // //                       </div>
// // // //                       <Input
// // // //                         id="image"
// // // //                         type="file"
// // // //                         accept="image/*"
// // // //                         capture="environment"
// // // //                         onChange={handleImageUpload}
// // // //                         className="hidden"
// // // //                         required
// // // //                       />
// // // //                       <Button
// // // //                         type="button"
// // // //                         variant="outline"
// // // //                         size="sm"
// // // //                         onClick={() => document.getElementById("image")?.click()}
// // // //                       >
// // // //                         <Camera className="h-4 w-4 mr-2" />
// // // //                         {formData.image ? "Change Photo" : "Take Photo"}
// // // //                       </Button>
// // // //                     </div>
// // // //                   </div>
// // // //                 </div>

// // // //                 {/* Submit Button */}
// // // //                 <div className="pt-2">
// // // //                   <Button
// // // //                     type="submit"
// // // //                     className="w-full h-11 bg-gradient-to-r from-primary to-gov-blue-light"
// // // //                     disabled={isSubmitting}
// // // //                   >
// // // //                     {isSubmitting ? (
// // // //                       <>
// // // //                         <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
// // // //                         Processing...
// // // //                       </>
// // // //                     ) : (
// // // //                       <>
// // // //                         <Upload className="h-4 w-4 mr-2" />
// // // //                         Submit Report
// // // //                       </>
// // // //                     )}
// // // //                   </Button>
// // // //                 </div>
// // // //               </form>
// // // //             </CardContent>
// // // //           </Card>

// // // //           {/* AI Processing Notice */}
// // // //           <Card className="bg-accent/5 border-accent/20">
// // // //             <CardContent className="p-4">
// // // //               <div className="flex items-center space-x-3">
// // // //                 <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20">
// // // //                   <CheckCircle2 className="h-4 w-4 text-accent-foreground" />
// // // //                 </div>
// // // //                 <div className="space-y-1">
// // // //                   <p className="text-sm font-medium">AI-Powered Department Assignment</p>
// // // //                   <p className="text-xs text-muted-foreground">
// // // //                     Your complaint will be automatically analyzed and assigned to the most appropriate department based on the category and uploaded image.
// // // //                   </p>
// // // //                 </div>
// // // //               </div>
// // // //             </CardContent>
// // // //           </Card>
// // // //         </div>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // };

// // // // export default ReportIssue;

// // // import { useState, useEffect } from "react";
// // // import { useNavigate, useLocation } from "react-router-dom";
// // // import { Button } from "@/components/ui/button";
// // // import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// // // import { Input } from "@/components/ui/input";
// // // import { Label } from "@/components/ui/label";
// // // import { Textarea } from "@/components/ui/textarea";
// // // import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// // // import { useToast } from "@/hooks/use-toast";
// // // import { Upload, FileText, Camera, CheckCircle2, QrCode, MapPin } from "lucide-react";

// // // const ReportIssue = () => {
// // //   const navigate = useNavigate();
// // //   const { toast } = useToast();
// // //   const location = useLocation();
// // //   const [isSubmitting, setIsSubmitting] = useState(false);
// // //   const [formData, setFormData] = useState({
// // //     title: "",
// // //     category: "",
// // //     description: "",
// // //     district: "",
// // //     city: "",
// // //     state: "",
// // //     image: null,
// // //     urgency: "",
// // //   });
// // //   const [detectedLocation, setDetectedLocation] = useState("");
// // //   const [detectedTimestamp, setDetectedTimestamp] = useState("");

// // //   const complaintCategories = [
// // //     { value: "Garbage", label: "Garbage Collection", dept: "Sanitation Department" },
// // //     { value: "Water Leakage", label: "Water Leakage", dept: "Water Department" },
// // //     { value: "Street Light", label: "Street Light", dept: "Electricity Department" },
// // //     { value: "Road Damage", label: "Road Damage", dept: "Road Department" },
// // //     { value: "Other", label: "Other", dept: "General Admin" },
// // //   ];

// // //   // Geolocation and timestamp logic
// // //   useEffect(() => {
// // //     setDetectedTimestamp(new Date().toLocaleString());

// // //     const updateLocationFromCoords = async (latitude: number, longitude: number) => {
// // //       try {
// // //         const response = await fetch(
// // //           `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
// // //           {
// // //             headers: {
// // //               "Accept": "application/json",
// // //             },
// // //           }
// // //         );
// // //         if (!response.ok) {
// // //           throw new Error("Reverse geocoding failed");
// // //         }
// // //         const data = await response.json();
// // //         const displayName: string | undefined = data?.display_name;
// // //         if (displayName && displayName.length > 0) {
// // //           setDetectedLocation(displayName);
// // //         } else {
// // //           setDetectedLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
// // //         }
// // //       } catch (_err) {
// // //         setDetectedLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
// // //         toast({
// // //           title: "Geolocation Warning",
// // //           description: "Unable to fetch detailed location. Using coordinates instead.",
// // //           variant: "destructive",
// // //         });
// // //       }
// // //     };

// // //     const requestGeolocation = () => {
// // //       if (!("geolocation" in navigator)) {
// // //         setDetectedLocation("Geolocation not supported by this browser");
// // //         toast({
// // //           title: "Geolocation Error",
// // //           description: "Geolocation is not supported by this browser.",
// // //           variant: "destructive",
// // //         });
// // //         return;
// // //       }

// // //       navigator.geolocation.getCurrentPosition(
// // //         (position) => {
// // //           const { latitude, longitude } = position.coords;
// // //           updateLocationFromCoords(latitude, longitude);
// // //         },
// // //         (error) => {
// // //           let errorMessage = "Unable to fetch location.";
// // //           switch (error.code) {
// // //             case error.PERMISSION_DENIED:
// // //               errorMessage = "Location permission denied. Please allow access.";
// // //               break;
// // //             case error.POSITION_UNAVAILABLE:
// // //               errorMessage = "Location unavailable. Try again.";
// // //               break;
// // //             case error.TIMEOUT:
// // //               errorMessage = "Location request timed out. Try again.";
// // //               break;
// // //           }
// // //           setDetectedLocation(errorMessage);
// // //           toast({
// // //             title: "Geolocation Error",
// // //             description: errorMessage,
// // //             variant: "destructive",
// // //           });
// // //         },
// // //         {
// // //           enableHighAccuracy: true,
// // //           timeout: 10000,
// // //           maximumAge: 60000,
// // //         }
// // //       );
// // //     };

// // //     // Check for URL parameters first (e.g., from QR code)
// // //     const params = new URLSearchParams(location.search);
// // //     const loc = params.get("location");
// // //     const district = params.get("district");
// // //     const city = params.get("city");
// // //     const state = params.get("state");
// // //     const ts = params.get("timestamp");

// // //     if (loc) {
// // //       setDetectedLocation(loc);
// // //     } else {
// // //       requestGeolocation(); // Only request geolocation if no URL location is provided
// // //     }
// // //     if (ts) setDetectedTimestamp(ts);
// // //     if (district) setFormData((prev) => ({ ...prev, district }));
// // //     if (city) setFormData((prev) => ({ ...prev, city }));
// // //     if (state) setFormData((prev) => ({ ...prev, state }));
// // //   }, [location, toast]);

// // //   const handleSubmit = async (e) => {
// // //     e.preventDefault();
// // //     if (
// // //       !formData.title ||
// // //       !formData.category ||
// // //       !formData.description ||
// // //       !formData.district ||
// // //       !formData.city ||
// // //       !formData.state ||
// // //       !formData.image ||
// // //       !formData.urgency ||
// // //       !detectedLocation
// // //     ) {
// // //       toast({
// // //         title: "Missing Information",
// // //         description: "Please fill in all required fields, including an image, urgency, and location.",
// // //         variant: "destructive",
// // //       });
// // //       return;
// // //     }

// // //     setIsSubmitting(true);

// // //     const formDataToSend = new FormData();
// // //     formDataToSend.append("title", formData.title);
// // //     formDataToSend.append("category", formData.category);
// // //     formDataToSend.append("description", formData.description);
// // //     formDataToSend.append("district", formData.district);
// // //     formDataToSend.append("city", formData.city);
// // //     formDataToSend.append("state", formData.state);
// // //     formDataToSend.append("location", detectedLocation);
// // //     formDataToSend.append("urgency", formData.urgency);
// // //     formDataToSend.append("image", formData.image);

// // //     try {
// // //       const response = await fetch("http://localhost:5000/api/complaint/register", {
// // //         method: "POST",
// // //         body: formDataToSend,
// // //       });

// // //       if (!response.ok) {
// // //         throw new Error("Failed to submit complaint");
// // //       }

// // //       const { complaint } = await response.json();
// // //       setIsSubmitting(false);

// // //       toast({
// // //         title: "Complaint Submitted Successfully!",
// // //         description: `Your complaint ID is ${complaint.id}`,
// // //       });

// // //       navigate(`/confirmation/${complaint.id}`, { state: { complaintData: complaint } });
// // //     } catch (error) {
// // //       setIsSubmitting(false);
// // //       toast({
// // //         title: "Submission Failed",
// // //         description: "An error occurred while submitting your complaint.",
// // //         variant: "destructive",
// // //       });
// // //     }
// // //   };

// // //   const handleImageUpload = (e) => {
// // //     const file = e.target.files?.[0];
// // //     if (file) {
// // //       setFormData((prev) => ({ ...prev, image: file }));
// // //     }
// // //   };

// // //   return (
// // //     <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-6 md:py-8">
// // //       <div className="container mx-auto px-4 max-w-2xl">
// // //         <div className="space-y-6">
// // //           {/* Header */}
// // //           <div className="text-center space-y-3">
// // //             <div className="mx-auto flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-primary/10">
// // //               <QrCode className="h-5 w-5 md:h-6 md:w-6 text-primary" />
// // //             </div>
// // //             <h1 className="text-2xl md:text-3xl font-bold">QR-Triggered Reporting</h1>
// // //             <p className="text-sm md:text-base text-muted-foreground">
// // //               Auto-captured location and timestamp • AI-powered classification
// // //             </p>
// // //           </div>

// // //           {/* Report Form */}
// // //           <Card>
// // //             <CardHeader className="pb-4">
// // //               <CardTitle className="flex items-center space-x-2 text-lg">
// // //                 <FileText className="h-5 w-5" />
// // //                 <span>Issue Details</span>
// // //               </CardTitle>
// // //               <CardDescription className="text-sm">
// // //                 AI will auto-classify and route to the appropriate department
// // //               </CardDescription>
// // //             </CardHeader>
// // //             <CardContent>
// // //               <form onSubmit={handleSubmit} className="space-y-4">
// // //                 {/* Detected Location */}
// // //                 <div className="space-y-2">
// // //                   <Label htmlFor="detectedLocation" className="text-sm font-medium">
// // //                     Detected Location *
// // //                   </Label>
// // //                   <div className="flex items-center space-x-2">
// // //                     <MapPin className="h-5 w-5 text-muted-foreground" />
// // //                     <Input
// // //                       id="detectedLocation"
// // //                       value={detectedLocation}
// // //                       readOnly
// // //                       placeholder="Fetching location..."
// // //                       className="h-10 bg-muted/50"
// // //                     />
// // //                   </div>
// // //                   {detectedLocation.includes("permission denied") && (
// // //                     <p className="text-xs text-destructive">
// // //                       Please enable location permissions in your browser settings and refresh.
// // //                     </p>
// // //                   )}
// // //                 </div>

// // //                 {/* Title */}
// // //                 <div className="space-y-2">
// // //                   <Label htmlFor="title" className="text-sm font-medium">
// // //                     Issue Title *
// // //                   </Label>
// // //                   <Input
// // //                     id="title"
// // //                     placeholder="Brief description of the issue"
// // //                     value={formData.title}
// // //                     onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
// // //                     className="h-10"
// // //                     required
// // //                   />
// // //                 </div>

// // //                 {/* Category */}
// // //                 <div className="space-y-2">
// // //                   <Label htmlFor="category" className="text-sm font-medium">
// // //                     Issue Category *
// // //                   </Label>
// // //                   <Select
// // //                     value={formData.category}
// // //                     onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
// // //                   >
// // //                     <SelectTrigger className="h-10">
// // //                       <SelectValue placeholder="AI will auto-classify from image" />
// // //                     </SelectTrigger>
// // //                     <SelectContent>
// // //                       <SelectItem value="Garbage">🗑️ Garbage Collection</SelectItem>
// // //                       <SelectItem value="Water Leakage">💧 Water Leakage</SelectItem>
// // //                       <SelectItem value="Street Light">💡 Street Light</SelectItem>
// // //                       <SelectItem value="Road Damage">🛣️ Road Damage</SelectItem>
// // //                       <SelectItem value="Other">📋 Other</SelectItem>
// // //                     </SelectContent>
// // //                   </Select>
// // //                   {formData.category && (
// // //                     <p className="text-xs text-muted-foreground">
// // //                       →{" "}
// // //                       {complaintCategories.find((t) => t.value === formData.category)?.dept ||
// // //                         "General Admin"}
// // //                     </p>
// // //                   )}
// // //                 </div>

// // //                 {/* Description */}
// // //                 <div className="space-y-2">
// // //                   <Label htmlFor="description" className="text-sm font-medium">
// // //                     Description *
// // //                   </Label>
// // //                   <Textarea
// // //                     id="description"
// // //                     placeholder="Describe the issue in detail..."
// // //                     value={formData.description}
// // //                     onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
// // //                     rows={3}
// // //                     className="resize-none"
// // //                     required
// // //                   />
// // //                 </div>

// // //                 {/* Location Details */}
// // //                 <div className="space-y-2">
// // //                   <Label htmlFor="district" className="text-sm font-medium">
// // //                     District *
// // //                   </Label>
// // //                   <Input
// // //                     id="district"
// // //                     placeholder="Enter district"
// // //                     value={formData.district}
// // //                     onChange={(e) => setFormData((prev) => ({ ...prev, district: e.target.value }))}
// // //                     className="h-10"
// // //                     required
// // //                   />
// // //                 </div>
// // //                 <div className="space-y-2">
// // //                   <Label htmlFor="city" className="text-sm font-medium">
// // //                     City *
// // //                   </Label>
// // //                   <Input
// // //                     id="city"
// // //                     placeholder="Enter city"
// // //                     value={formData.city}
// // //                     onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
// // //                     className="h-10"
// // //                     required
// // //                   />
// // //                 </div>
// // //                 <div className="space-y-2">
// // //                   <Label htmlFor="state" className="text-sm font-medium">
// // //                     State *
// // //                   </Label>
// // //                   <Input
// // //                     id="state"
// // //                     placeholder="Enter state"
// // //                     value={formData.state}
// // //                     onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
// // //                     className="h-10"
// // //                     required
// // //                   />
// // //                 </div>

// // //                 {/* Urgency */}
// // //                 <div className="space-y-2">
// // //                   <Label htmlFor="urgency" className="text-sm font-medium">
// // //                     Urgency *
// // //                   </Label>
// // //                   <Select
// // //                     value={formData.urgency}
// // //                     onValueChange={(value) => setFormData((prev) => ({ ...prev, urgency: value }))}
// // //                   >
// // //                     <SelectTrigger className="h-10">
// // //                       <SelectValue placeholder="Select urgency level" />
// // //                     </SelectTrigger>
// // //                     <SelectContent>
// // //                       <SelectItem value="High">High</SelectItem>
// // //                       <SelectItem value="Low">Low</SelectItem>
// // //                     </SelectContent>
// // //                   </Select>
// // //                 </div>

// // //                 {/* Image Upload */}
// // //                 <div className="space-y-2">
// // //                   <Label className="text-sm font-medium">Photo Evidence *</Label>
// // //                   <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
// // //                     <div className="space-y-2">
// // //                       <Camera className="h-6 w-6 mx-auto text-muted-foreground" />
// // //                       <div className="space-y-1">
// // //                         <p className="text-sm font-medium">
// // //                           {formData.image ? formData.image.name : "Tap to capture or upload photo"}
// // //                         </p>
// // //                         <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
// // //                       </div>
// // //                       <Input
// // //                         id="image"
// // //                         type="file"
// // //                         accept="image/*"
// // //                         capture="environment"
// // //                         onChange={handleImageUpload}
// // //                         className="hidden"
// // //                         required
// // //                       />
// // //                       <Button
// // //                         type="button"
// // //                         variant="outline"
// // //                         size="sm"
// // //                         onClick={() => document.getElementById("image")?.click()}
// // //                       >
// // //                         <Camera className="h-4 w-4 mr-2" />
// // //                         {formData.image ? "Change Photo" : "Take Photo"}
// // //                       </Button>
// // //                     </div>
// // //                   </div>
// // //                 </div>

// // //                 {/* Submit Button */}
// // //                 <div className="pt-2">
// // //                   <Button
// // //                     type="submit"
// // //                     className="w-full h-11 bg-gradient-to-r from-primary to-gov-blue-light"
// // //                     disabled={isSubmitting}
// // //                   >
// // //                     {isSubmitting ? (
// // //                       <>
// // //                         <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
// // //                         Processing...
// // //                       </>
// // //                     ) : (
// // //                       <>
// // //                         <Upload className="h-4 w-4 mr-2" />
// // //                         Submit Report
// // //                       </>
// // //                     )}
// // //                   </Button>
// // //                 </div>
// // //               </form>
// // //             </CardContent>
// // //           </Card>

// // //           {/* AI Processing Notice */}
// // //           <Card className="bg-accent/5 border-accent/20">
// // //             <CardContent className="p-4">
// // //               <div className="flex items-center space-x-3">
// // //                 <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20">
// // //                   <CheckCircle2 className="h-4 w-4 text-accent-foreground" />
// // //                 </div>
// // //                 <div className="space-y-1">
// // //                   <p className="text-sm font-medium">AI-Powered Department Assignment</p>
// // //                   <p className="text-xs text-muted-foreground">
// // //                     Your complaint will be automatically analyzed and assigned to the most appropriate department based on the category and uploaded image.
// // //                   </p>
// // //                 </div>
// // //               </div>
// // //             </CardContent>
// // //           </Card>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default ReportIssue;

// // import { useState, useEffect } from "react";
// // import { useNavigate, useLocation } from "react-router-dom";
// // import { Button } from "@/components/ui/button";
// // import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";
// // import { Textarea } from "@/components/ui/textarea";
// // import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// // import { useToast } from "@/hooks/use-toast";
// // import { Upload, FileText, Camera, CheckCircle2, QrCode, MapPin } from "lucide-react";

// // const ReportIssue = () => {
// //   const navigate = useNavigate();
// //   const { toast } = useToast();
// //   const location = useLocation();
// //   const [isSubmitting, setIsSubmitting] = useState(false);
// //   const [submissionStatus, setSubmissionStatus] = useState<
// //     "idle" | "validating-image" | "predicting-urgency" | "submitting" | "success" | "error"
// //   >("idle");
// //   const [formData, setFormData] = useState({
// //     title: "",
// //     category: "",
// //     description: "",
// //     district: "",
// //     city: "",
// //     state: "",
// //     image: null as File | null,
// //   });
// //   const [detectedLocation, setDetectedLocation] = useState("");
// //   const [detectedTimestamp, setDetectedTimestamp] = useState("");

// //   const complaintCategories = [
// //     { value: "Garbage", label: "Garbage Collection", dept: "Sanitation Department" },
// //     { value: "Water Leakage", label: "Water Leakage", dept: "Water Department" },
// //     { value: "Street Light", label: "Street Light", dept: "Electricity Department" },
// //     { value: "Road Damage", label: "Road Damage", dept: "Road Department" },
// //     { value: "Other", label: "Other", dept: "General Admin" },
// //   ];

// //   // Geolocation and timestamp logic
// //   useEffect(() => {
// //     setDetectedTimestamp(new Date().toLocaleString());

// //     const updateLocationFromCoords = async (latitude: number, longitude: number) => {
// //       try {
// //         const response = await fetch(
// //           `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
// //           {
// //             headers: {
// //               Accept: "application/json",
// //             },
// //           }
// //         );
// //         if (!response.ok) {
// //           throw new Error("Reverse geocoding failed");
// //         }
// //         const data = await response.json();
// //         const displayName: string | undefined = data?.display_name;
// //         if (displayName && displayName.length > 0) {
// //           setDetectedLocation(displayName);
// //         } else {
// //           setDetectedLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
// //         }
// //       } catch (_err) {
// //         setDetectedLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
// //         toast({
// //           title: "Geolocation Warning",
// //           description: "Unable to fetch detailed location. Using coordinates instead.",
// //           variant: "destructive",
// //         });
// //       }
// //     };

// //     const requestGeolocation = () => {
// //       if (!("geolocation" in navigator)) {
// //         setDetectedLocation("Geolocation not supported by this browser");
// //         toast({
// //           title: "Geolocation Error",
// //           description: "Geolocation is not supported by this browser.",
// //           variant: "destructive",
// //         });
// //         return;
// //       }

// //       navigator.geolocation.getCurrentPosition(
// //         (position) => {
// //           const { latitude, longitude } = position.coords;
// //           updateLocationFromCoords(latitude, longitude);
// //         },
// //         (error) => {
// //           let errorMessage = "Unable to fetch location.";
// //           switch (error.code) {
// //             case error.PERMISSION_DENIED:
// //               errorMessage = "Location permission denied. Please allow access.";
// //               break;
// //             case error.POSITION_UNAVAILABLE:
// //               errorMessage = "Location unavailable. Try again.";
// //               break;
// //             case error.TIMEOUT:
// //               errorMessage = "Location request timed out. Try again.";
// //               break;
// //           }
// //           setDetectedLocation(errorMessage);
// //           toast({
// //             title: "Geolocation Error",
// //             description: errorMessage,
// //             variant: "destructive",
// //           });
// //         },
// //         {
// //           enableHighAccuracy: true,
// //           timeout: 10000,
// //           maximumAge: 60000,
// //         }
// //       );
// //     };

// //     // Check for URL parameters first (e.g., from QR code)
// //     const params = new URLSearchParams(location.search);
// //     const loc = params.get("location");
// //     const district = params.get("district");
// //     const city = params.get("city");
// //     const state = params.get("state");
// //     const ts = params.get("timestamp");

// //     if (loc) {
// //       setDetectedLocation(loc);
// //     } else {
// //       requestGeolocation();
// //     }
// //     if (ts) setDetectedTimestamp(ts);
// //     if (district) setFormData((prev) => ({ ...prev, district }));
// //     if (city) setFormData((prev) => ({ ...prev, city }));
// //     if (state) setFormData((prev) => ({ ...prev, state }));
// //   }, [location, toast]);

// //   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     const file = e.target.files?.[0];
// //     if (file) {
// //       setFormData((prev) => ({ ...prev, image: file }));
// //     }
// //   };

// //   const validateImage = async (category: string, image: File): Promise<boolean> => {
// //     if (category !== "Garbage" && category !== "Road Damage") {
// //       return true; // No validation needed for other categories
// //     }

// //     const endpoint = category === "Garbage" ? "http://127.0.0.1:7000/api/garbage/" : "http://127.0.0.1:7000/api/pothole/";
// //     const imageFormData = new FormData();
// //     imageFormData.append("image", image);

// //     try {
// //       setSubmissionStatus("validating-image");
// //       toast({
// //         title: "Validating Image",
// //         description: `Checking if the image matches ${category} issue...`,
// //       });

// //       const response = await fetch(endpoint, {
// //         method: "POST",
// //         body: imageFormData,
// //       });

// //       if (!response.ok) {
// //         throw new Error(`Image validation failed for ${category}`);
// //       }

// //       const result = await response.json();
// //       if (result.prediction.toLowerCase() === "yes") {
// //         toast({
// //           title: "Image Validated",
// //           description: `${category} issue confirmed with confidence ${result.confidence}.`,
// //         });
// //         return true;
// //       } else {
// //         toast({
// //           title: "Image Validation Failed",
// //           description: `The uploaded image does not match a ${category} issue.`,
// //           variant: "destructive",
// //         });
// //         return false;
// //       }
// //     } catch (error) {
// //       toast({
// //         title: "Image Validation Error",
// //         description: error.message || "Failed to validate image.",
// //         variant: "destructive",
// //       });
// //       return false;
// //     }
// //   };

// //   const predictUrgency = async (description: string): Promise<string> => {
// //     try {
// //       setSubmissionStatus("predicting-urgency");
// //       toast({
// //         title: "Predicting Urgency",
// //         description: "Analyzing description to determine urgency level...",
// //       });

// //       const response = await fetch("http://127.0.0.1:7000/api/urgency/", {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify({ text: description }),
// //       });

// //       if (!response.ok) {
// //         throw new Error("Failed to predict urgency");
// //       }

// //       const result = await response.json();
// //       const urgency = result.urgency === "High" ? "High" : "Low";
// //       toast({
// //         title: "Urgency Predicted",
// //         description: `Urgency level determined as ${urgency}.`,
// //       });
// //       return urgency;
// //     } catch (error) {
// //       toast({
// //         title: "Urgency Prediction Error",
// //         description: error.message || "Failed to predict urgency. Defaulting to Low.",
// //         variant: "destructive",
// //       });
// //       return "Low"; // Default to Low if urgency prediction fails
// //     }
// //   };

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     if (
// //       !formData.title ||
// //       !formData.category ||
// //       !formData.description ||
// //       !formData.district ||
// //       !formData.city ||
// //       !formData.state ||
// //       !formData.image ||
// //       !detectedLocation
// //     ) {
// //       toast({
// //         title: "Missing Information",
// //         description: "Please fill in all required fields, including an image and location.",
// //         variant: "destructive",
// //       });
// //       return;
// //     }

// //     setIsSubmitting(true);

// //     // Step 1: Validate image for Garbage or Road Damage
// //     const isImageValid = await validateImage(formData.category, formData.image);
// //     if (!isImageValid) {
// //       setIsSubmitting(false);
// //       setSubmissionStatus("error");
// //       return;
// //     }

// //     // Step 2: Predict urgency from description
// //     const urgency = await predictUrgency(formData.description);
// //     if (!urgency) {
// //       setIsSubmitting(false);
// //       setSubmissionStatus("error");
// //       return;
// //     }

// //     // Step 3: Submit complaint
// //     const formDataToSend = new FormData();
// //     formDataToSend.append("title", formData.title);
// //     formDataToSend.append("category", formData.category);
// //     formDataToSend.append("description", formData.description);
// //     formDataToSend.append("district", formData.district);
// //     formDataToSend.append("city", formData.city);
// //     formDataToSend.append("state", formData.state);
// //     formDataToSend.append("location", detectedLocation);
// //     formDataToSend.append("urgency", urgency);
// //     formDataToSend.append("image", formData.image);

// //     try {
// //       setSubmissionStatus("submitting");
// //       toast({
// //         title: "Submitting Complaint",
// //         description: "Sending complaint to the server...",
// //       });

// //       const response = await fetch("http://localhost:5000/api/complaint/register", {
// //         method: "POST",
// //         body: formDataToSend,
// //       });

// //       if (!response.ok) {
// //         throw new Error("Failed to submit complaint");
// //       }

// //       const { complaint } = await response.json();
// //       setSubmissionStatus("success");
// //       setIsSubmitting(false);

// //       toast({
// //         title: "Complaint Submitted Successfully!",
// //         description: `Your complaint ID is ${complaint.id}`,
// //       });

// //       navigate(`/confirmation/${complaint.id}`, { state: { complaintData: complaint } });
// //     } catch (error) {
// //       setSubmissionStatus("error");
// //       setIsSubmitting(false);
// //       toast({
// //         title: "Submission Failed",
// //         description: error.message || "An error occurred while submitting your complaint.",
// //         variant: "destructive",
// //       });
// //     }
// //   };

// //   const getStatusMessage = () => {
// //     switch (submissionStatus) {
// //       case "validating-image":
// //         return "Validating image with AI model...";
// //       case "predicting-urgency":
// //         return "Predicting urgency level...";
// //       case "submitting":
// //         return "Submitting complaint...";
// //       case "success":
// //         return "Complaint submitted successfully!";
// //       case "error":
// //         return "Error occurred. Please try again.";
// //       default:
// //         return "Submit Report";
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-6 md:py-8">
// //       <div className="container mx-auto px-4 max-w-2xl">
// //         <div className="space-y-6">
// //           {/* Header */}
// //           <div className="text-center space-y-3">
// //             <div className="mx-auto flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-primary/10">
// //               <QrCode className="h-5 w-5 md:h-6 md:w-6 text-primary" />
// //             </div>
// //             <h1 className="text-2xl md:text-3xl font-bold">QR-Triggered Reporting</h1>
// //             <p className="text-sm md:text-base text-muted-foreground">
// //               Auto-captured location and timestamp • AI-powered classification
// //             </p>
// //           </div>

// //           {/* Report Form */}
// //           <Card>
// //             <CardHeader className="pb-4">
// //               <CardTitle className="flex items-center space-x-2 text-lg">
// //                 <FileText className="h-5 w-5" />
// //                 <span>Issue Details</span>
// //               </CardTitle>
// //               <CardDescription className="text-sm">
// //                 AI will auto-classify and route to the appropriate department
// //               </CardDescription>
// //             </CardHeader>
// //             <CardContent>
// //               <form onSubmit={handleSubmit} className="space-y-4">
// //                 {/* Detected Location */}
// //                 <div className="space-y-2">
// //                   <Label htmlFor="detectedLocation" className="text-sm font-medium">
// //                     Detected Location *
// //                   </Label>
// //                   <div className="flex items-center space-x-2">
// //                     <MapPin className="h-5 w-5 text-muted-foreground" />
// //                     <Input
// //                       id="detectedLocation"
// //                       value={detectedLocation}
// //                       readOnly
// //                       placeholder="Fetching location..."
// //                       className="h-10 bg-muted/50"
// //                     />
// //                   </div>
// //                   {detectedLocation.includes("permission denied") && (
// //                     <p className="text-xs text-destructive">
// //                       Please enable location permissions in your browser settings and refresh.
// //                     </p>
// //                   )}
// //                 </div>

// //                 {/* Title */}
// //                 <div className="space-y-2">
// //                   <Label htmlFor="title" className="text-sm font-medium">
// //                     Issue Title *
// //                   </Label>
// //                   <Input
// //                     id="title"
// //                     placeholder="Brief description of the issue"
// //                     value={formData.title}
// //                     onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
// //                     className="h-10"
// //                     required
// //                   />
// //                 </div>

// //                 {/* Category */}
// //                 <div className="space-y-2">
// //                   <Label htmlFor="category" className="text-sm font-medium">
// //                     Issue Category *
// //                   </Label>
// //                   <Select
// //                     value={formData.category}
// //                     onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
// //                   >
// //                     <SelectTrigger className="h-10">
// //                       <SelectValue placeholder="Select issue category" />
// //                     </SelectTrigger>
// //                     <SelectContent>
// //                       <SelectItem value="Garbage">🗑️ Garbage Collection</SelectItem>
// //                       <SelectItem value="Water Leakage">💧 Water Leakage</SelectItem>
// //                       <SelectItem value="Street Light">💡 Street Light</SelectItem>
// //                       <SelectItem value="Road Damage">🛣️ Road Damage</SelectItem>
// //                       <SelectItem value="Other">📋 Other</SelectItem>
// //                     </SelectContent>
// //                   </Select>
// //                   {formData.category && (
// //                     <p className="text-xs text-muted-foreground">
// //                       → {complaintCategories.find((t) => t.value === formData.category)?.dept || "General Admin"}
// //                     </p>
// //                   )}
// //                 </div>

// //                 {/* Description */}
// //                 <div className="space-y-2">
// //                   <Label htmlFor="description" className="text-sm font-medium">
// //                     Description *
// //                   </Label>
// //                   <Textarea
// //                     id="description"
// //                     placeholder="Describe the issue in detail..."
// //                     value={formData.description}
// //                     onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
// //                     rows={3}
// //                     className="resize-none"
// //                     required
// //                   />
// //                 </div>

// //                 {/* Location Details */}
// //                 <div className="space-y-2">
// //                   <Label htmlFor="district" className="text-sm font-medium">
// //                     District *
// //                   </Label>
// //                   <Input
// //                     id="district"
// //                     placeholder="Enter district"
// //                     value={formData.district}
// //                     onChange={(e) => setFormData((prev) => ({ ...prev, district: e.target.value }))}
// //                     className="h-10"
// //                     required
// //                   />
// //                 </div>
// //                 <div className="space-y-2">
// //                   <Label htmlFor="city" className="text-sm font-medium">
// //                     City *
// //                   </Label>
// //                   <Input
// //                     id="city"
// //                     placeholder="Enter city"
// //                     value={formData.city}
// //                     onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
// //                     className="h-10"
// //                     required
// //                   />
// //                 </div>
// //                 <div className="space-y-2">
// //                   <Label htmlFor="state" className="text-sm font-medium">
// //                     State *
// //                   </Label>
// //                   <Input
// //                     id="state"
// //                     placeholder="Enter state"
// //                     value={formData.state}
// //                     onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
// //                     className="h-10"
// //                     required
// //                   />
// //                 </div>

// //                 {/* Image Upload */}
// //                 <div className="space-y-2">
// //                   <Label className="text-sm font-medium">Photo Evidence *</Label>
// //                   <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
// //                     <div className="space-y-2">
// //                       <Camera className="h-6 w-6 mx-auto text-muted-foreground" />
// //                       <div className="space-y-1">
// //                         <p className="text-sm font-medium">
// //                           {formData.image ? formData.image.name : "Tap to capture or upload photo"}
// //                         </p>
// //                         <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
// //                       </div>
// //                       <Input
// //                         id="image"
// //                         type="file"
// //                         accept="image/*"
// //                         capture="environment"
// //                         onChange={handleImageUpload}
// //                         className="hidden"
// //                         required
// //                       />
// //                       <Button
// //                         type="button"
// //                         variant="outline"
// //                         size="sm"
// //                         onClick={() => document.getElementById("image")?.click()}
// //                       >
// //                         <Camera className="h-4 w-4 mr-2" />
// //                         {formData.image ? "Change Photo" : "Take Photo"}
// //                       </Button>
// //                     </div>
// //                   </div>
// //                 </div>

// //                 {/* Submit Button */}
// //                 <div className="pt-2">
// //                   <Button
// //                     type="submit"
// //                     className="w-full h-11 bg-gradient-to-r from-primary to-gov-blue-light"
// //                     disabled={isSubmitting}
// //                   >
// //                     {isSubmitting ? (
// //                       <>
// //                         <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
// //                         {getStatusMessage()}
// //                       </>
// //                     ) : (
// //                       <>
// //                         <Upload className="h-4 w-4 mr-2" />
// //                         Submit Report
// //                       </>
// //                     )}
// //                   </Button>
// //                 </div>
// //               </form>
// //             </CardContent>
// //           </Card>

// //           {/* AI Processing Notice */}
// //           <Card className="bg-accent/5 border-accent/20">
// //             <CardContent className="p-4">
// //               <div className="flex items-center space-x-3">
// //                 <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20">
// //                   <CheckCircle2 className="h-4 w-4 text-accent-foreground" />
// //                 </div>
// //                 <div className="space-y-1">
// //                   <p className="text-sm font-medium">AI-Powered Department Assignment</p>
// //                   <p className="text-xs text-muted-foreground">
// //                     Your complaint will be automatically analyzed, validated, and assigned to the appropriate department based on the category, image, and urgency.
// //                   </p>
// //                 </div>
// //               </div>
// //             </CardContent>
// //           </Card>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default ReportIssue;
