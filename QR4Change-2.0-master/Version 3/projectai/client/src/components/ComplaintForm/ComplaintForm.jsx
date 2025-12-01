
// import React, { useState, useRef, useEffect } from "react";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { AnimatePresence, motion } from "framer-motion";
// import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
// import { FaSpinner } from "react-icons/fa";
// import { useGetLoggedUserQuery } from "../../services/userAuthApi";
// import { usePredictModelMutation, usePredictUrgencyMutation,usePredictGarbageModelMutation } from "../../services/modelsApi";
// import { useRegisterComplaintMutation } from "../../services/userComplaintApi";
// import "./ComplaintForm.css";

// const ComplaintForm = () => {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const modalRef = useRef(null);

//   const city = searchParams.get("city") || "";
//   const area = searchParams.get("area") || "";

//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     type: "",
//     image: null,
//   });
//   const [showProgressModal, setShowProgressModal] = useState(false);
//   const [progressStep, setProgressStep] = useState(null);
//   const [showSuccessModal, setShowSuccessModal] = useState(false);
//   const [complaintId, setComplaintId] = useState(null);
//   const [urgency, setUrgency] = useState(null);

//   const { data: userData, error: userError } = useGetLoggedUserQuery(localStorage.getItem("token"));
//   const [predictModel, { isLoading: isPredicting }] = usePredictModelMutation();
//   const [predictUrgency, { isLoading: isUrgencyPredicting }] = usePredictUrgencyMutation();
//   const [registerComplaint, { isLoading: isSubmitting }] = useRegisterComplaintMutation();
//   const [predictGarbageModel,{ isLoading: isPredictingGarbage }] = usePredictGarbageModelMutation();

//   // Handle user fetch errors
//   useEffect(() => {
//     if (userError) {
//       toast.error("User not authenticated", {
//         position: "top-right",
//         autoClose: 3000,
//         toastId: "auth-error",
//       });
//       localStorage.removeItem("token");
//       navigate("/login");
//     }
//   }, [userError, navigate]);

//   // Close modals on outside click
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (modalRef.current && !modalRef.current.contains(event.target)) {
//         setShowProgressModal(false);
//         setShowSuccessModal(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // Close modals on Escape key
//   useEffect(() => {
//     const handleEscape = (event) => {
//       if (event.key === "Escape") {
//         setShowProgressModal(false);
//         setShowSuccessModal(false);
//       }
//     };
//     document.addEventListener("keydown", handleEscape);
//     return () => document.removeEventListener("keydown", handleEscape);
//   }, []);

//   const handleChange = (e) => {
//     const { name, value, type, files } = e.target;
//     if (type === "file") {
//       const file = files[0];
//       if (file && file.size > 5 * 1024 * 1024) {
//         toast.error("Image size must be less than 5MB", {
//           position: "top-right",
//           autoClose: 3000,
//           toastId: "image-size-error",
//         });
//         return;
//       }
//       setFormData((prev) => ({ ...prev, [name]: file }));
//       toast.info(`Selected image: ${file?.name}`, {
//         position: "top-right",
//         autoClose: 3000,
//         toastId: "image-selected",
//       });
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!userData?.user?._id) {
//       toast.error("User not authenticated", {
//         position: "top-right",
//         autoClose: 3000,
//         toastId: "auth-error",
//       });
//       return;
//     }

//     if (!formData.image) {
//       toast.error("Please upload an image", {
//         position: "top-right",
//         autoClose: 3000,
//         toastId: "image-required",
//       });
//       return;
//     }

//     setShowProgressModal(true);
//     setProgressStep("uploading");

//     try {
//       // Step 1: Upload and verify image with AI
//       const aiForm = new FormData();
//       aiForm.append("image", formData.image);
//       setProgressStep("verifying");
//       const aiResult = await predictModel(aiForm).unwrap();

//       if (aiResult.prediction !== "yes" || aiResult.confidence < 0.5) {
//         toast.error("Image verification failed. This seems to be a fake complaint.", {
//           position: "top-right",
//           autoClose: 3000,
//           toastId: "image-verification-failed",
//         });
//         setShowProgressModal(false);
//         return;
//       }
//       toast.success("Image verified successfully!", {
//         position: "top-right",
//         autoClose: 2000,
//         toastId: "image-verified",
//       });

//       // Step 2: Calculate urgency score
//       setProgressStep("calculating");
//       const urgencyResult = await predictUrgency({ text: formData.description }).unwrap();
//       setUrgency(urgencyResult.urgency);
//       toast.success(`Urgency classified: ${urgencyResult.urgency}`, {
//         position: "top-right",
//         autoClose: 2000,
//         toastId: "urgency-classified",
//       });

//       // Step 3: Submit complaint
//       setProgressStep("submitting");
//       const formPayload = new FormData();
//       formPayload.append("title", formData.title);
//       formPayload.append("description", formData.description);
//       formPayload.append("image", formData.image);
//       formPayload.append("location", area);
//       formPayload.append("city", city);
//       formPayload.append("category", formData.type);
//       formPayload.append("userId", userData.user._id);
//       formPayload.append("urgency", urgencyResult.urgency);

//       const result = await registerComplaint({
//         formData: formPayload,
//         access_token: localStorage.getItem("token"),
//       }).unwrap();

//       if (result.success) {
//         setComplaintId(result.complaint._id);
//         setShowProgressModal(false);
//         setShowSuccessModal(true);
//         toast.success("Complaint registered successfully!", {
//           position: "top-right",
//           autoClose: 3000,
//           toastId: "complaint-success",
//         });
//       } else {
//         throw new Error(result.message || "Error registering complaint");
//       }
//     } catch (error) {
//       console.error("Submission error:", error);
//       toast.error(error?.data?.message || "Something went wrong!", {
//         position: "top-right",
//         autoClose: 3000,
//         toastId: "submission-error",
//       });
//       setShowProgressModal(false);
//     }
//   };

//   const handleTrackComplaint = () => {
//     setShowSuccessModal(false);
//     navigate(`/dashboard`);
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

//   const progressSteps = [
//     { key: "uploading", label: "Uploading Image", loading: isPredicting || isUrgencyPredicting || isSubmitting },
//     { key: "verifying", label: "Verifying Image with AI", loading: isPredicting },
//     { key: "calculating", label: "Calculating Urgency Score", loading: isUrgencyPredicting },
//     { key: "submitting", label: "Submitting Complaint", loading: isSubmitting },
//   ];

//   return (
//     <motion.div
//       className="complaint-page min-h-screen bg-gradient-to-br from-teal-100 to-green-100 flex items-center justify-center p-6"
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
//         className="toast-container"
//         aria-live="polite"
//       />

//       {/* Background Pattern */}
//       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/city.png')] opacity-10 z-0"></div>

//       {/* Complaint Form */}
//       <motion.form
//         onSubmit={handleSubmit}
//         className="complaint-form bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg z-10"
//         variants={formVariants}
//         initial="hidden"
//         animate="visible"
//         encType="multipart/form-data"
//       >
//         <motion.h2
//           className="form-title text-2xl font-semibold text-teal-600 mb-6"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.2 }}
//         >
//           File a Complaint
//         </motion.h2>

//         <div className="form-group">
//           <label htmlFor="title" className="form-label">Complaint Title</label>
//           <motion.input
//             id="title"
//             name="title"
//             value={formData.title}
//             onChange={handleChange}
//             required
//             placeholder="e.g. Garbage on Road"
//             className="form-input"
//             whileFocus={{ scale: 1.02 }}
//             aria-required="true"
//           />
//         </div>

//         <div className="form-group">
//           <label htmlFor="type" className="form-label">Complaint Type</label>
//           <motion.select
//             id="type"
//             name="type"
//             value={formData.type}
//             onChange={handleChange}
//             required
//             className="form-input"
//             whileFocus={{ scale: 1.02 }}
//             aria-required="true"
//           >
//             <option value="">-- Select --</option>
//             <option value="Garbage">Garbage</option>
//             <option value="Water Leakage">Water Leakage</option>
//             <option value="Street Light">Street Light</option>
//             <option value="Road Damage">Road Damage</option>
//             <option value="Other">Other</option>
//           </motion.select>
//         </div>

//         <div className="form-group">
//           <label htmlFor="description" className="form-label">Description</label>
//           <motion.textarea
//             id="description"
//             name="description"
//             value={formData.description}
//             onChange={handleChange}
//             rows="4"
//             required
//             placeholder="Write details about the complaint..."
//             className="form-input"
//             whileFocus={{ scale: 1.02 }}
//             aria-required="true"
//           />
//         </div>

//         <div className="form-group">
//           <label htmlFor="image" className="form-label">Upload Image</label>
//           <motion.input
//             id="image"
//             type="file"
//             name="image"
//             accept="image/*"
//             onChange={handleChange}
//             required
//             className="form-input"
//             whileFocus={{ scale: 1.02 }}
//             aria-required="true"
//           />
//           {formData.image && (
//             <p className="text-sm text-gray-600 mt-2">Selected: {formData.image.name}</p>
//           )}
//         </div>

//         <div className="form-row">
//           <div className="form-group">
//             <label htmlFor="city" className="form-label">City</label>
//             <input
//               id="city"
//               type="text"
//               value={city}
//               readOnly
//               className="form-input bg-gray-100"
//               aria-readonly="true"
//             />
//           </div>
//           <div className="form-group">
//             <label htmlFor="area" className="form-label">Area</label>
//             <input
//               id="area"
//               type="text"
//               value={area}
//               readOnly
//               className="form-input bg-gray-100"
//               aria-readonly="true"
//             />
//           </div>
//         </div>

//         <motion.button
//           type="submit"
//           className="submit-btn bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-300"
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           disabled={isPredicting || isUrgencyPredicting || isSubmitting}
//           aria-label="Submit complaint"
//         >
//           {isPredicting || isUrgencyPredicting || isSubmitting ? (
//             <FaSpinner className="animate-spin inline-block mr-2" />
//           ) : null}
//           {isPredicting || isUrgencyPredicting || isSubmitting ? "Processing..." : "Submit Complaint"}
//         </motion.button>
//       </motion.form>

//       {/* Progress Modal */}
//       <AnimatePresence>
//         {showProgressModal && (
//           <motion.div
//             className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.3 }}
//             role="dialog"
//             aria-labelledby="progress-modal-title"
//             aria-modal="true"
//           >
//             <motion.div
//               ref={modalRef}
//               className="modal-box bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md border border-teal-200"
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
//             className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.3 }}
//             role="dialog"
//             aria-labelledby="success-modal-title"
//             aria-modal="true"
//           >
//             <motion.div
//               ref={modalRef}
//               className="modal-box bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md border border-teal-200"
//               variants={modalVariants}
//               initial="hidden"
//               animate="visible"
//             >
//               <div className="modal-icon">
//                 <CheckCircleIcon className="icon-success text-green-600 w-12 h-12 mx-auto" />
//               </div>
//               <h2 id="success-modal-title" className="modal-title text-xl font-semibold text-teal-600 text-center mb-4">
//                 Complaint Registered!
//               </h2>
//               <p className="modal-subtext text-gray-600 text-center mb-6">
//                 Your complaint has been successfully submitted.
//               </p>
//               <div className="modal-details space-y-3 text-left">
//                 <h3 className="text-lg font-semibold text-teal-600">Complaint Details</h3>
//                 <p className="text-sm">
//                   <b className="text-teal-600">Complaint ID:</b> <span className="text-gray-700">{complaintId}</span>
//                 </p>
//                 <p className="text-sm">
//                   <b className="text-teal-600">Title:</b> <span className="text-gray-700">{formData.title}</span>
//                 </p>
//                 <p className="text-sm">
//                   <b className="text-teal-600">Category:</b> <span className="text-gray-700">{formData.type}</span>
//                 </p>
//                 <p className="text-sm">
//                   <b className="text-teal-600">Location:</b> <span className="text-gray-700">{area}, {city}</span>
//                 </p>
//                 <p className="text-sm">
//                   <b className="text-teal-600">Description:</b> <span className="text-gray-700">{formData.description}</span>
//                 </p>
//                 <p className="text-sm">
//                   <b className="text-teal-600">Urgency:</b> <span className="text-gray-700">{urgency || "N/A"}</span>
//                 </p>
//               </div>
//               <div className="modal-actions flex justify-end gap-3 mt-6">
//                 <motion.button
//                   onClick={handleTrackComplaint}
//                   className="btn-track bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-lg shadow-md"
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   aria-label="Track complaint"
//                 >
//                   Track Complaint
//                 </motion.button>
//                 {/* <motion.button
//                   onClick={handleGoHome}
//                   className="btn-home bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg shadow-md"
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   aria-label="Go to dashboard"
//                 >
//                   Go to Dashboard
//                 </motion.button> */}
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </motion.div>
//   );
// };

// export default ComplaintForm;

import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { FaSpinner } from "react-icons/fa";
import { useGetLoggedUserQuery } from "../../services/userAuthApi";
import { usePredictModelMutation, usePredictUrgencyMutation, usePredictGarbageModelMutation } from "../../services/modelsApi";
import { useRegisterComplaintMutation } from "../../services/userComplaintApi";
import "./ComplaintForm.css";

const ComplaintForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const modalRef = useRef(null);

  const city = searchParams.get("city") || "";
  const area = searchParams.get("area") || "";

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    image: null,
  });
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressStep, setProgressStep] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [complaintId, setComplaintId] = useState(null);
  const [urgency, setUrgency] = useState(null);

  const { data: userData, error: userError } = useGetLoggedUserQuery(localStorage.getItem("token"));
  const [predictModel, { isLoading: isPredicting }] = usePredictModelMutation();
  const [predictUrgency, { isLoading: isUrgencyPredicting }] = usePredictUrgencyMutation();
  const [registerComplaint, { isLoading: isSubmitting }] = useRegisterComplaintMutation();
  const [predictGarbageModel, { isLoading: isPredictingGarbage }] = usePredictGarbageModelMutation();

  // Handle user fetch errors
  useEffect(() => {
    if (userError) {
      toast.error("User not authenticated", {
        position: "top-right",
        autoClose: 3000,
        toastId: "auth-error",
      });
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [userError, navigate]);

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

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      const file = files[0];
      if (file && file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB", {
          position: "top-right",
          autoClose: 3000,
          toastId: "image-size-error",
        });
        return;
      }
      setFormData((prev) => ({ ...prev, [name]: file }));
      toast.info(`Selected image: ${file?.name}`, {
        position: "top-right",
        autoClose: 3000,
        toastId: "image-selected",
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userData?.user?._id) {
      toast.error("User not authenticated", {
        position: "top-right",
        autoClose: 3000,
        toastId: "auth-error",
      });
      return;
    }

    if (!formData.image) {
      toast.error("Please upload an image", {
        position: "top-right",
        autoClose: 3000,
        toastId: "image-required",
      });
      return;
    }

    setShowProgressModal(true);
    setProgressStep("uploading");

    try {
      // Step 1: Upload and verify image with AI
      const aiForm = new FormData();
      aiForm.append("image", formData.image);
      setProgressStep("verifying");
      let aiResult;
      if (formData.type === "Garbage") {
        aiResult = await predictGarbageModel(aiForm).unwrap();
      } else {
        aiResult = await predictModel(aiForm).unwrap();
      }

      if (aiResult.prediction !== "yes" && aiResult.prediction !== "Yes"|| aiResult.confidence < 0.5) {
        toast.error("Image verification failed. This seems to be a fake complaint.", {
          position: "top-right",
          autoClose: 3000,
          toastId: "image-verification-failed",
        });
        setShowProgressModal(false);
        return;
      }
      toast.success("Image verified successfully!", {
        position: "top-right",
        autoClose: 2000,
        toastId: "image-verified",
      });

      // Step 2: Calculate urgency score
      setProgressStep("calculating");
      const urgencyResult = await predictUrgency({ text: formData.description }).unwrap();
      setUrgency(urgencyResult.urgency);
      toast.success(`Urgency classified: ${urgencyResult.urgency}`, {
        position: "top-right",
        autoClose: 2000,
        toastId: "urgency-classified",
      });

      // Step 3: Submit complaint
      setProgressStep("submitting");
      const formPayload = new FormData();
      formPayload.append("title", formData.title);
      formPayload.append("description", formData.description);
      formPayload.append("image", formData.image);
      formPayload.append("location", area);
      formPayload.append("city", city);
      formPayload.append("category", formData.type);
      formPayload.append("userId", userData.user._id);
      formPayload.append("urgency", urgencyResult.urgency);

      const result = await registerComplaint({
        formData: formPayload,
        access_token: localStorage.getItem("token"),
      }).unwrap();

      if (result.success) {
        setComplaintId(result.complaint._id);
        setShowProgressModal(false);
        setShowSuccessModal(true);
        toast.success("Complaint registered successfully!", {
          position: "top-right",
          autoClose: 3000,
          toastId: "complaint-success",
        });
      } else {
        throw new Error(result.message || "Error registering complaint");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error?.data?.message || "Something went wrong!", {
        position: "top-right",
        autoClose: 3000,
        toastId: "submission-error",
      });
      setShowProgressModal(false);
    }
  };

  const handleTrackComplaint = () => {
    setShowSuccessModal(false);
    navigate(`/dashboard`);
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

  const progressSteps = [
    { key: "uploading", label: "Uploading Image", loading: isPredicting || isPredictingGarbage || isUrgencyPredicting || isSubmitting },
    { key: "verifying", label: "Verifying Image with AI", loading: isPredicting || isPredictingGarbage },
    { key: "calculating", label: "Calculating Urgency Score", loading: isUrgencyPredicting },
    { key: "submitting", label: "Submitting Complaint", loading: isSubmitting },
  ];

  return (
    <motion.div
      className="complaint-page min-h-screen bg-gradient-to-br from-teal-100 to-green-100 flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Toast Container */}
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
        className="toast-container"
        aria-live="polite"
      />

      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/city.png')] opacity-10 z-0"></div>

      {/* Complaint Form */}
      <motion.form
        onSubmit={handleSubmit}
        className="complaint-form bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg z-10"
        variants={formVariants}
        initial="hidden"
        animate="visible"
        encType="multipart/form-data"
      >
        <motion.h2
          className="form-title text-2xl font-semibold text-teal-600 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          File a Complaint
        </motion.h2>

        <div className="form-group">
          <label htmlFor="title" className="form-label">Complaint Title</label>
          <motion.input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="e.g. Garbage on Road"
            className="form-input"
            whileFocus={{ scale: 1.02 }}
            aria-required="true"
          />
        </div>

        <div className="form-group">
          <label htmlFor="type" className="form-label">Complaint Type</label>
          <motion.select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="form-input"
            whileFocus={{ scale: 1.02 }}
            aria-required="true"
          >
            <option value="">-- Select --</option>
            <option value="Garbage">Garbage</option>
            <option value="Water Leakage">Water Leakage</option>
            <option value="Street Light">Street Light</option>
            <option value="Road Damage">Road Damage</option>
            <option value="Other">Other</option>
          </motion.select>
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">Description</label>
          <motion.textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            required
            placeholder="Write details about the complaint..."
            className="form-input"
            whileFocus={{ scale: 1.02 }}
            aria-required="true"
          />
        </div>

        <div className="form-group">
          <label htmlFor="image" className="form-label">Upload Image</label>
          <motion.input
            id="image"
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            required
            className="form-input"
            whileFocus={{ scale: 1.02 }}
            aria-required="true"
          />
          {formData.image && (
            <p className="text-sm text-gray-600 mt-2">Selected: {formData.image.name}</p>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="city" className="form-label">City</label>
            <input
              id="city"
              type="text"
              value={city}
              readOnly
              className="form-input bg-gray-100"
              aria-readonly="true"
            />
          </div>
          <div className="form-group">
            <label htmlFor="area" className="form-label">Area</label>
            <input
              id="area"
              type="text"
              value={area}
              readOnly
              className="form-input bg-gray-100"
              aria-readonly="true"
            />
          </div>
        </div>

        <motion.button
          type="submit"
          className="submit-btn bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isPredicting || isPredictingGarbage || isUrgencyPredicting || isSubmitting}
          aria-label="Submit complaint"
        >
          {isPredicting || isPredictingGarbage || isUrgencyPredicting || isSubmitting ? (
            <FaSpinner className="animate-spin inline-block mr-2" />
          ) : null}
          {isPredicting || isPredictingGarbage || isUrgencyPredicting || isSubmitting ? "Processing..." : "Submit Complaint"}
        </motion.button>
      </motion.form>

      {/* Progress Modal */}
      <AnimatePresence>
        {showProgressModal && (
          <motion.div
            className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-labelledby="progress-modal-title"
            aria-modal="true"
          >
            <motion.div
              ref={modalRef}
              className="modal-box bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md border border-teal-200"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
            >
              <h2 id="progress-modal-title" className="text-xl font-semibold text-teal-600 mb-4">
                Processing Complaint
              </h2>
              <div className="space-y-4">
                {progressSteps.map((step) => (
                  <div key={step.key} className="flex items-center gap-3">
                    {progressStep === step.key && step.loading ? (
                      <FaSpinner className="animate-spin text-teal-600" size={20} />
                    ) : progressStep && progressSteps.findIndex((s) => s.key === progressStep) > progressSteps.findIndex((s) => s.key === step.key) ? (
                      <CheckCircleIcon className="text-green-600 w-6 h-6" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                    )}
                    <span className={`text-sm ${progressStep === step.key ? "text-teal-600 font-semibold" : "text-gray-600"}`}>
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
            className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-labelledby="success-modal-title"
            aria-modal="true"
          >
            <motion.div
              ref={modalRef}
              className="modal-box bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md border border-teal-200"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="modal-icon">
                <CheckCircleIcon className="icon-success text-green-600 w-12 h-12 mx-auto" />
              </div>
              <h2 id="success-modal-title" className="modal-title text-xl font-semibold text-teal-600 text-center mb-4">
                Complaint Registered!
              </h2>
              <p className="modal-subtext text-gray-600 text-center mb-6">
                Your complaint has been successfully submitted.
              </p>
              <div className="modal-details space-y-3 text-left">
                <h3 className="text-lg font-semibold text-teal-600">Complaint Details</h3>
                <p className="text-sm">
                  <b className="text-teal-600">Complaint ID:</b> <span className="text-gray-700">{complaintId}</span>
                </p>
                <p className="text-sm">
                  <b className="text-teal-600">Title:</b> <span className="text-gray-700">{formData.title}</span>
                </p>
                <p className="text-sm">
                  <b className="text-teal-600">Category:</b> <span className="text-gray-700">{formData.type}</span>
                </p>
                <p className="text-sm">
                  <b className="text-teal-600">Location:</b> <span className="text-gray-700">{area}, {city}</span>
                </p>
                <p className="text-sm">
                  <b className="text-teal-600">Description:</b> <span className="text-gray-700">{formData.description}</span>
                </p>
                <p className="text-sm">
                  <b className="text-teal-600">Urgency:</b> <span className="text-gray-700">{urgency || "N/A"}</span>
                </p>
              </div>
              <div className="modal-actions flex justify-end gap-3 mt-6">
                <motion.button
                  onClick={handleTrackComplaint}
                  className="btn-track bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-lg shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Track complaint"
                >
                  Track Complaint
                </motion.button>
                {/* <motion.button
                  onClick={handleGoHome}
                  className="btn-home bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Go to dashboard"
                >
                  Go to Dashboard
                </motion.button> */}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ComplaintForm;