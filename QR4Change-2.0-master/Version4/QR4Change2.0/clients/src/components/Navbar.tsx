import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Shield, Users } from "lucide-react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const isScanningRef = useRef(false);
  const modalRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    if (showScanner && scannerRef.current && !isScanningRef.current) {
      console.log("Starting QR scanner...");
      isScanningRef.current = true;

      if (!scannerRef.current) {
        console.error("scannerRef.current is null, cannot initialize scanner");
        toast.error("Failed to initialize scanner: Container not found.", {
          position: "top-right",
          autoClose: 5000,
          toastId: "scanner-ref-error",
        });
        isScanningRef.current = false;
        setShowScanner(false);
        return;
      }

      // Debug: Log container dimensions
      const container = scannerRef.current;
      console.log("QR reader container:", {
        id: container.id,
        width: container.offsetWidth,
        height: container.offsetHeight,
        isVisible: container.offsetParent !== null,
      });

      // Debug: Log modal position
      if (modalRef.current) {
        const modal = modalRef.current;
        const rect = modal.getBoundingClientRect();
        console.log("Modal position:", {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          isVisible: modal.offsetParent !== null,
        });
      }

      const config = { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE] // Restrict to QR codes only
      };
      const qrCodeRegionId = "qr-reader";

      html5QrCodeRef.current = new Html5Qrcode(qrCodeRegionId, { verbose: false });

      const startScanner = async () => {
        try {
          console.log("Checking camera permissions...");
          const permissionStatus = await navigator.permissions.query({ name: "camera" });
          if (permissionStatus.state === "denied") {
            console.log("Camera permission denied");
            toast.error("Camera permission denied. Please allow camera access in your browser settings.", {
              position: "top-right",
              autoClose: 5000,
              toastId: "camera-denied",
            });
            isScanningRef.current = false;
            setShowScanner(false);
            return;
          }

          console.log("Fetching available cameras...");
          const cameras = await Html5Qrcode.getCameras();
          console.log("Available cameras:", cameras);
          if (!cameras || cameras.length === 0) {
            console.log("No cameras found");
            toast.error("No cameras found on this device. Please use a device with a camera.", {
              position: "top-right",
              autoClose: 5000,
              toastId: "no-cameras",
            });
            isScanningRef.current = false;
            setShowScanner(false);
            return;
          }

          const selectedCamera = cameras.find(cam => cam.label.includes("back") || cam.label.includes("rear")) || cameras[0];
          console.log("Starting scanner with camera:", selectedCamera);

          await html5QrCodeRef.current.start(
            selectedCamera.id || { facingMode: "environment" },
            config,
            (decodedText) => {
              console.log("QR code scanned successfully:", decodedText);
              // Immediately stop the scanner
              if (html5QrCodeRef.current && isScanningRef.current) {
                try {
                  console.log("Attempting to stop scanner...");
                  html5QrCodeRef.current.stop();
                  console.log("Scanner stopped after successful scan");
                } catch (err) {
                  console.error("Error stopping scanner after scan:", err);
                  toast.error("Failed to stop scanner. Please try again.", {
                    position: "top-right",
                    autoClose: 3000,
                    toastId: "stop-error",
                  });
                }
              }
              isScanningRef.current = false;
              setShowScanner(false);
              toast.success("QR Code scanned successfully! Redirecting...", {
                position: "top-right",
                autoClose: 2000,
                toastId: "qr-success",
              });
              // Delay navigation to ensure scanner stops
              setTimeout(() => {
                try {
                  const url = new URL(decodedText);
                  const pathParts = url.pathname.split("/").filter(Boolean);
                  if (pathParts[0] === "report" && pathParts.length >= 4) {
                    const [_, city, district, state] = pathParts;
                    navigate(`/report/${encodeURIComponent(city)}/${encodeURIComponent(district)}/${encodeURIComponent(state)}`);
                  } else {
                    toast.error("Invalid QR code format. Expected /report/:city/:district/:state", {
                      position: "top-right",
                      autoClose: 3000,
                      toastId: "qr-error",
                    });
                  }
                } catch (error) {
                  console.error("Failed to parse QR code URL:", error);
                  toast.error("Failed to parse QR code URL", {
                    position: "top-right",
                    autoClose: 3000,
                    toastId: "qr-error",
                  });
                }
              }, 100);
            },
            () => {} // Suppress verbose NotFoundException logs
          );
          console.log("Scanner started successfully");
          // Debug: Check if video element is created
          setTimeout(() => {
            const videoElement = container.querySelector("video");
            if (!videoElement) {
              console.error("No video element found in #qr-reader");
              toast.error("Camera feed failed to initialize. Please try again or use a different camera.", {
                position: "top-right",
                autoClose: 5000,
                toastId: "video-error",
              });
            } else {
              console.log("Video element found:", {
                width: videoElement.offsetWidth,
                height: videoElement.offsetHeight,
                isVisible: videoElement.offsetParent !== null,
              });
            }
          }, 2500);
          // Fallback: Stop scanner after 30 seconds if not stopped
          setTimeout(() => {
            if (isScanningRef.current && html5QrCodeRef.current) {
              console.log("Fallback: Stopping scanner after 30 seconds");
              try {
                html5QrCodeRef.current.stop();
                isScanningRef.current = false;
                setShowScanner(false);
                toast.warn("Scanner stopped automatically after timeout.", {
                  position: "top-right",
                  autoClose: 3000,
                  toastId: "timeout-stop",
                });
              } catch (err) {
                console.error("Error in fallback scanner stop:", err);
              }
            }
          }, 30000);
        } catch (err) {
          console.error("Unable to start scanning:", err);
          toast.error("Failed to start scanner. Please ensure camera permissions are granted and try again.", {
            position: "top-right",
            autoClose: 5000,
            toastId: "scanner-error",
          });
          isScanningRef.current = false;
          setShowScanner(false);
        }
      };

      // Keep 2000ms delay to ensure modal is fully rendered
      console.log("Scheduling scanner start...");
      const timeoutId = setTimeout(() => {
        console.log("Executing startScanner...");
        startScanner();
      }, 2000);

      return () => {
        console.log("Clearing scanner timeout...");
        clearTimeout(timeoutId);
      };
    }

    return () => {
      console.log("Cleaning up scanner...");
      if (html5QrCodeRef.current && isScanningRef.current) {
        try {
          html5QrCodeRef.current.stop();
          html5QrCodeRef.current.clear();
          console.log("Scanner stopped successfully");
        } catch (err) {
          console.error("Error stopping scanner:", err);
        }
      }
      isScanningRef.current = false;
    };
  }, [showScanner, navigate]);

  const handleReportIssue = () => {
    if (!isScanningRef.current) {
      console.log("Opening QR scanner modal...");
      setShowScanner(true);
    } else {
      console.log("Scanner already active, ignoring click");
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-primary to-gov-blue-light">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">QR4Change</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/track" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/track') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Track Complaint
            </Link>
            <Link 
              to="/transparency" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/transparency') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Public Dashboard
            </Link>
            <Link 
              to="/admin-login" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/admin-login') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Admin
            </Link>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/track">Track Complaint</Link>
            </Button>
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-primary to-gov-blue-light" 
              onClick={handleReportIssue}
              disabled={showScanner}
            >
              Report Issue
            </Button>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <div 
          ref={modalRef}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000] p-4 overflow-y-visible max-h-none transition-none"
          style={{ top: 0, left: 0, width: '100vw', height: '100vh', transform: 'none' }}
        >
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md border border-teal-200">
            <h3 className="text-lg font-semibold text-teal-600 mb-4">Scan QR Code</h3>
            <div 
              id="qr-reader" 
              ref={scannerRef} 
              className="w-full h-[300px] bg-black rounded-lg overflow-hidden"
              style={{ position: "relative", zIndex: 10, minHeight: "300px" }}
            ></div>
            <p className="text-sm text-gray-600 text-center mt-2">
              {showScanner ? "Point your camera at the QR code to scan." : "Initializing camera..."}
            </p>
            <Button
              onClick={() => {
                console.log("Stop Scanning clicked");
                setShowScanner(false);
              }}
              className="bg-red-500 hover:bg-red-600 text-white mt-4 mx-auto"
              aria-label="Stop QR code scanning"
            >
              Stop Scanning
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
// import { Link, useLocation } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { MapPin, Shield, Users } from "lucide-react";

// const Navbar = () => {
//   const location = useLocation();
  
//   const isActive = (path: string) => location.pathname === path;
  
//   return (
//     <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
//       <div className="container mx-auto px-4">
//         <div className="flex h-16 items-center justify-between">
//           <Link to="/" className="flex items-center space-x-2">
//             <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-primary to-gov-blue-light">
//               <Shield className="h-5 w-5 text-primary-foreground" />
//             </div>
//             <span className="font-bold text-lg">QR4Change</span>
//           </Link>
          
//           <div className="hidden md:flex items-center space-x-6">
//             <Link 
//               to="/" 
//               className={`text-sm font-medium transition-colors hover:text-primary ${
//                 isActive('/') ? 'text-primary' : 'text-muted-foreground'
//               }`}
//             >
//               Home
//             </Link>
//             <Link 
//               to="/track" 
//               className={`text-sm font-medium transition-colors hover:text-primary ${
//                 isActive('/track') ? 'text-primary' : 'text-muted-foreground'
//               }`}
//             >
//               Track Complaint
//             </Link>
//             <Link 
//               to="/transparency" 
//               className={`text-sm font-medium transition-colors hover:text-primary ${
//                 isActive('/transparency') ? 'text-primary' : 'text-muted-foreground'
//               }`}
//             >
//               Public Dashboard
//             </Link>
//             <Link 
//               to="/admin-login" 
//               className={`text-sm font-medium transition-colors hover:text-primary ${
//                 isActive('/admin') ? 'text-primary' : 'text-muted-foreground'
//               }`}
//             >
//               Admin
//             </Link>
//           </div>
          
//           <div className="flex items-center space-x-2">
//             <Button variant="outline" size="sm" asChild>
//               <Link to="/track">Track Complaint</Link>
//             </Button>
//             <Button size="sm" className="bg-gradient-to-r from-primary to-gov-blue-light" asChild>
//               <Link to="/report">Report Issue</Link>
//             </Button>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;