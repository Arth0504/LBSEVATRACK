import { useRef, useState, useEffect, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import API from "../api/axios";
import { ScanLine, Search, CheckCircle, XCircle, AlertCircle, Loader2, RotateCcw, Camera, Zap, Focus, ZoomIn } from "lucide-react";

const SCANNER_ELEMENT_ID = "reader";
const CAMERA_START_TIMEOUT_MS = 12000;
const SCAN_FPS = 25;
const TARGET_SCAN_MS = 1000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const nextFrame = () => new Promise((resolve) => window.requestAnimationFrame(() => resolve()));

const withTimeout = (promise, ms, message) => {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(message)), ms);
  });

  return Promise.race([promise, timeout]).finally(() => window.clearTimeout(timeoutId));
};

const isMobileDevice = () => /Android|iPhone|iPad|iPod|Mobile/i.test(window.navigator.userAgent);

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getCameraErrorMessage = (error) => {
  const name = error?.name || "";
  const message = error?.message || "";

  if (message.includes("timed out")) {
    return "Camera startup took too long. Close other apps using the camera and try again.";
  }

  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "Camera permission was blocked. Allow camera access in browser site settings, then retry.";
  }

  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "No camera was found on this device.";
  }

  if (name === "NotReadableError" || name === "TrackStartError") {
    return "Camera is busy or unavailable. Close other camera tabs/apps and retry.";
  }

  if (name === "OverconstrainedError" || name === "ConstraintNotSatisfiedError") {
    return "The selected camera could not start. Retrying with another camera may fix it.";
  }

  if (window.location.protocol !== "https:" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return "Chrome requires HTTPS or localhost for camera access.";
  }

  return "Camera could not start. Check permission, refresh the page, or try another camera.";
};

const getOptimizedVideoConstraints = (fastScan) => {
  if (fastScan) {
    return {
      width: { ideal: 480 },
      height: { ideal: 480 },
      frameRate: { ideal: 25 }
    };
  }
  return {
    width: { ideal: 640 },
    height: { ideal: 480 },
    frameRate: { ideal: SCAN_FPS }
  };
};

const getFastQrbox = (viewfinderWidth, viewfinderHeight, fastScan) => {
  const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
  const isDesktop = !isMobileDevice();
  const pct = fastScan ? 0.80 : (isDesktop ? 0.65 : 0.70);
  const size = clamp(Math.floor(minEdge * pct), 180, 400);
  return { width: size, height: size };
};

const GateVerify = () => {
  const [id, setId] = useState("");
  const [data, setData] = useState(null);
  const [scannerStatus, setScannerStatus] = useState("stopped");
  const [scanPhase, setScanPhase] = useState("idle");
  const [fastScan, setFastScan] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  
  const [zoomSupported, setZoomSupported] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(1);
  const [maxZoom, setMaxZoom] = useState(1);
  
  const [focusSupported, setFocusSupported] = useState(false);

  const [lastScanMs, setLastScanMs] = useState(null);
  const [debugLogs, setDebugLogs] = useState([]);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const [scanTimeoutMsg, setScanTimeoutMsg] = useState("");

  const isVerifyingRef = useRef(false);
  const scanLockedRef = useRef(false);
  const scannerRef = useRef(null);
  const readerRef = useRef(null);
  const scannerShellRef = useRef(null);
  const startRequestRef = useRef(0);
  const scannerStatusRef = useRef("stopped");
  const scanStartedAtRef = useRef(0);

  const scannerVisible = scannerStatus === "starting" || scannerStatus === "active";
  const scannerBusy = scannerVisible;

  const setScannerState = useCallback((status) => {
    scannerStatusRef.current = status;
    setScannerStatus(status);
  }, []);

  const addDebugLog = useCallback((msg) => {
    setDebugLogs(prev => {
      const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric", second: "numeric" });
      return [...prev.slice(-4), `${time} - ${msg}`];
    });
  }, []);

  useEffect(() => {
    let timeoutId;
    if (scannerStatus === "active") {
      timeoutId = setTimeout(() => {
        setScanTimeoutMsg("Camera active but QR not detected. Please bring it closer or adjust lighting.");
      }, 5000);
    } else {
      setScanTimeoutMsg("");
    }
    return () => clearTimeout(timeoutId);
  }, [scannerStatus]);

  const parseQRData = (decodedText) => {
    try {
      const parsed = JSON.parse(decodedText);
      return parsed.bookingId || decodedText;
    } catch {
      return decodedText;
    }
  };

  const destroyScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    setTorchSupported(false);
    setTorchOn(false);
    setZoomSupported(false);
    setFocusSupported(false);

    if (scanner) {
      try {
        if (scanner.isScanning) {
          await scanner.stop();
        }
      } catch (e) {
        console.error("Error stopping scanner", e);
      }

      try {
        scanner.clear();
      } catch (e) {
        console.error("Error clearing scanner", e);
      }
    }

    if (readerRef.current) {
      readerRef.current.innerHTML = "";
    }
  }, []);

  const stopScan = useCallback(async () => {
    startRequestRef.current += 1;
    scanLockedRef.current = false;
    await destroyScanner();
    setScannerState("stopped");
    setScanPhase("idle");
  }, [destroyScanner, setScannerState]);

  const verify = useCallback(async (bid) => {
    if (!bid) return;

    try {
      isVerifyingRef.current = true;
      setScanPhase("verifying");
      setError("");
      setLoading(true);
      const res = await API.post("/gates/verify", { bookingId: bid });
      setData(res.data.booking);
    } catch (e) {
      setError(e.response?.data?.message || "Verification Failed");
    } finally {
      setLoading(false);
      isVerifyingRef.current = false;
      scanLockedRef.current = false;
      setScanPhase("idle");
    }
  }, []);

  const onScanSuccess = useCallback(async (decodedText) => {
    if (scanLockedRef.current || isVerifyingRef.current) return;

    const extractedId = parseQRData(decodedText);
    if (!extractedId) return;

    scanLockedRef.current = true;
    setScanPhase("found");
    addDebugLog("QR detected");
    
    const currentTime = performance.now();
    const elapsedMs = scanStartedAtRef.current ? Math.round(currentTime - scanStartedAtRef.current) : null;
    setLastScanMs(elapsedMs);
    console.info(`[QR-Detect] Successful decode at ${currentTime.toFixed(2)}ms`);
    console.info(`QR detected in ${elapsedMs ?? "unknown"}ms${elapsedMs && elapsedMs <= TARGET_SCAN_MS ? " (target met)" : ""}`);

    if (window.navigator?.vibrate) {
      window.navigator.vibrate([200]);
    }

    setId(extractedId);
    await destroyScanner();
    setScannerState("stopped");
    verify(extractedId);
  }, [destroyScanner, setScannerState, verify]);

  const buildScanner = () => {
    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID, {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      verbose: false,
    });
    scannerRef.current = scanner;
    return scanner;
  };

  const waitForScannerContainer = async () => {
    await nextFrame();
    await nextFrame();

    for (let attempt = 0; attempt < 12; attempt += 1) {
      const shellRect = scannerShellRef.current?.getBoundingClientRect();
      const readerRect = readerRef.current?.getBoundingClientRect();

      if (
        document.getElementById(SCANNER_ELEMENT_ID) &&
        shellRect?.width > 0 &&
        shellRect?.height > 0 &&
        readerRect?.width > 0 &&
        readerRect?.height > 0
      ) {
        return;
      }
      await wait(50);
    }

    throw new Error("Scanner view is not ready yet. Please retry.");
  };

  const waitForLiveVideo = async (requestId) => {
    for (let attempt = 0; attempt < 40; attempt += 1) {
      if (startRequestRef.current !== requestId) return false;

      const video = readerRef.current?.querySelector("video");
      const hasLiveStream = video?.srcObject instanceof MediaStream && video.srcObject.active;
      const hasVideoSize = video?.videoWidth > 0 && video?.videoHeight > 0;

      if (hasLiveStream || hasVideoSize) {
        return true;
      }

      await wait(100);
    }

    return false;
  };

  const tuneRunningCamera = useCallback(async (scanner) => {
    try {
      const capabilities = scanner.getRunningTrackCapabilities?.() || {};
      const settings = scanner.getRunningTrackSettings?.() || {};

      setTorchSupported(Boolean(capabilities.torch));
      setTorchOn(Boolean(settings.torch));

      const advanced = [];
      if (Array.isArray(capabilities.focusMode) && capabilities.focusMode.includes("continuous")) {
        advanced.push({ focusMode: "continuous" });
        setFocusSupported(true);
      }
      
      if (capabilities.zoom) {
         setZoomSupported(true);
         const maxZ = capabilities.zoom.max || 1;
         const minZ = capabilities.zoom.min || 1;
         setMaxZoom(maxZ);
         setMinZoom(minZ);
         const currentZ = settings.zoom || minZ;
         setZoom(currentZ);
      }

      if (advanced.length > 0) {
        await scanner.applyVideoConstraints({ ...getOptimizedVideoConstraints(fastScan), advanced });
      } else {
        await scanner.applyVideoConstraints(getOptimizedVideoConstraints(fastScan));
      }
    } catch (cameraTuneError) {
      console.warn("Camera speed tuning skipped.", cameraTuneError);
    }
  }, [fastScan]);

  const toggleTorch = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner || !torchSupported) return;

    try {
      const nextTorchState = !torchOn;
      await scanner.applyVideoConstraints({ advanced: [{ torch: nextTorchState }] });
      setTorchOn(nextTorchState);
    } catch (torchError) {
      console.warn("Torch toggle failed.", torchError);
      setError("Torch is not available on this camera.");
    }
  }, [torchOn, torchSupported]);

  const handleZoomChange = async (e) => {
    const val = parseFloat(e.target.value);
    setZoom(val);
    const scanner = scannerRef.current;
    if (scanner && zoomSupported) {
      try {
        await scanner.applyVideoConstraints({ advanced: [{ zoom: val }] });
      } catch (err) {
        console.warn("Zoom error", err);
      }
    }
  };

  const triggerFocus = async () => {
    const scanner = scannerRef.current;
    if (scanner && focusSupported) {
      try {
        await scanner.applyVideoConstraints({ advanced: [{ focusMode: "manual" }] });
        await wait(50);
        await scanner.applyVideoConstraints({ advanced: [{ focusMode: "continuous" }] });
        addDebugLog("Refocused camera");
      } catch (err) {
        console.warn("Focus error", err);
      }
    }
  };

  const startScan = useCallback(async () => {
    const requestId = startRequestRef.current + 1;
    startRequestRef.current = requestId;

    try {
      setError("");
      setData(null);
      setId("");
      setLastScanMs(null);
      setScanTimeoutMsg("");
      setDebugLogs([]);
      scanLockedRef.current = false;
      setScannerState("starting");
      setScanPhase("searching");
      addDebugLog("Camera starting...");

      await destroyScanner();
      await wait(0);
      await waitForScannerContainer();

      let currentDevices = availableCameras;
      let targetId = selectedCameraId;
      
      if (currentDevices.length === 0) {
        try {
          addDebugLog("Fetching cameras...");
          currentDevices = await withTimeout(Html5Qrcode.getCameras(), CAMERA_START_TIMEOUT_MS, "Camera lookup timed out.");
          setAvailableCameras(currentDevices);
          if (!targetId && currentDevices.length > 0) {
            const rearCamera = currentDevices.find((device) => /back|rear|environment|world|wide/i.test(device.label || ""));
            targetId = rearCamera ? rearCamera.id : currentDevices[0].id;
            setSelectedCameraId(targetId);
          }
        } catch (err) {
          console.warn("Camera enumeration failed", err);
          addDebugLog("Camera enumeration failed");
        }
      }

      if (startRequestRef.current !== requestId) return;

      const candidate = targetId ? targetId : { facingMode: "environment" };

      await destroyScanner();
      await waitForScannerContainer();
      const scanner = buildScanner();

      try {
        scanStartedAtRef.current = performance.now();
        addDebugLog("Decoder active");
        console.info(`[QR-Detect] Starting decoder at ${scanStartedAtRef.current.toFixed(2)}ms`);
        
        const startPromise = scanner.start(
          candidate,
          {
            fps: fastScan ? 25 : SCAN_FPS,
            qrbox: (w, h) => getFastQrbox(w, h, fastScan),
            disableFlip: true,
            videoConstraints: getOptimizedVideoConstraints(fastScan),
          },
          onScanSuccess,
          () => {}
        );

        await withTimeout(
          Promise.race([
            startPromise,
            waitForLiveVideo(requestId).then((hasLiveVideo) => (hasLiveVideo ? true : new Promise(() => {}))),
          ]),
          CAMERA_START_TIMEOUT_MS,
          "Camera startup timed out."
        );

        if (startRequestRef.current !== requestId) {
          await destroyScanner();
          return;
        }

        setScannerState("active");
        addDebugLog("Camera started successfully");
        await tuneRunningCamera(scanner);
        startPromise.catch(async (startError) => {
          if (startRequestRef.current === requestId && scannerRef.current === scanner) {
            await destroyScanner();
            setScannerState("stopped");
            setScanPhase("idle");
            const errorMsg = getCameraErrorMessage(startError);
            setError(errorMsg);
            addDebugLog(`Camera failed: ${errorMsg}`);
            console.error(startError);
          }
        });
      } catch (candidateError) {
        await destroyScanner();
        setScannerState("stopped");
        setScanPhase("idle");
        const errorMsg = getCameraErrorMessage(candidateError);
        setError(errorMsg);
        addDebugLog(`Camera failed: ${errorMsg}`);
        console.error(candidateError);
      }
    } catch (e) {
      await destroyScanner();
      setScannerState("stopped");
      setScanPhase("idle");
      const errorMsg = getCameraErrorMessage(e);
      setError(errorMsg);
      addDebugLog(`Camera failed: ${errorMsg}`);
      console.error(e);
    }
  }, [destroyScanner, onScanSuccess, setScannerState, tuneRunningCamera, availableCameras, selectedCameraId, addDebugLog, fastScan]);

  useEffect(() => {
    return () => {
      startRequestRef.current += 1;
      destroyScanner();
    };
  }, [destroyScanner]);

  const handleManualVerify = () => {
    if (id.trim()) {
      verify(id.trim());
    }
  };

  const clearResult = () => {
    setData(null);
    setId("");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 relative z-10 px-4">
      <div className="fixed top-20 left-10 w-72 h-72 bg-accent-200/30 rounded-full blur-3xl pointer-events-none -z-10 animate-blob-1"></div>
      <div className="fixed top-80 right-10 w-96 h-96 bg-gold-200/30 rounded-full blur-3xl pointer-events-none -z-10 animate-blob-2"></div>

      <div className="text-center pt-8 pb-4 border-b border-gray-150/50">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-800">Gate Verification</h1>
        <p className="text-sm md:text-base text-gray-500 mt-2">Scan QR code or enter booking ID manually</p>
      </div>

      <div className="card-glass p-6">
        <h3 className="font-serif text-base font-semibold text-gray-800 mb-4">Manual Entry</h3>
        <div className="flex gap-3">
          <input
            className="input flex-1 bg-white/60 focus:bg-white focus:ring-accent-400 focus:border-accent-400 transition-colors shadow-inner"
            type="text"
            placeholder="Enter Booking ID (e.g. B-12345)"
            value={id}
            onChange={e => setId(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleManualVerify()}
            disabled={loading || scannerBusy}
          />
          <button
            onClick={handleManualVerify}
            className="btn-primary px-5 gap-2 shadow-accent-sm"
            disabled={loading || !id.trim() || scannerBusy}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            Verify
          </button>
        </div>
      </div>

      <div className="card-glass p-6 relative overflow-hidden">
        <div className="relative">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-serif text-base font-semibold text-gray-800">QR Scanner</h3>
            {scannerVisible && (
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-500"></span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
             <div className="flex flex-col">
               <span className="text-sm font-semibold text-gray-800">Fast Scan Mode</span>
               <span className="text-xs text-gray-500">Max qrbox, 25 FPS, 480p focus</span>
             </div>
             <button 
                onClick={() => {
                   setFastScan(!fastScan);
                   if (scannerVisible) {
                     stopScan().then(startScan);
                   }
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${fastScan ? 'bg-accent-500' : 'bg-gray-300'}`}
             >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${fastScan ? 'translate-x-6' : 'translate-x-1'}`} />
             </button>
          </div>

          <div className="flex flex-wrap gap-3 mb-5 justify-center sm:justify-start">
            {!scannerVisible ? (
              <button
                onClick={startScan}
                className="btn-primary gap-2 w-full sm:w-auto shadow-accent-sm"
                disabled={loading}
              >
                <ScanLine size={16} /> Start Scanner
              </button>
            ) : (
              <>
                {torchSupported && (
                  <button onClick={toggleTorch} className="btn-secondary gap-2 w-full sm:w-auto text-gray-600 bg-white/80 hover:bg-white border-white/50 shadow-sm">
                    <Zap size={16} /> {torchOn ? "Flash On" : "Flash"}
                  </button>
                )}
                <button onClick={stopScan} className="btn-secondary gap-2 w-full sm:w-auto text-gray-600 bg-white/80 hover:bg-white border-white/50 shadow-sm">
                  {scannerStatus === "starting" ? "Cancel Startup" : "Stop Scanner"}
                </button>
                <button onClick={startScan} className="btn-secondary gap-2 w-full sm:w-auto text-gray-600 bg-white/80 hover:bg-white border-white/50 shadow-sm">
                  <RotateCcw size={16} /> Restart
                </button>
              </>
            )}
          </div>

          {availableCameras.length > 0 && (
            <div className="mb-4">
              <select
                value={selectedCameraId}
                onChange={(e) => setSelectedCameraId(e.target.value)}
                className="w-full text-sm p-2.5 rounded-xl border border-gray-200 bg-white/80 focus:ring-accent-400 outline-none shadow-sm"
                disabled={scannerVisible}
              >
                {availableCameras.map(cam => (
                  <option key={cam.id} value={cam.id}>{cam.label || `Camera ${cam.id}`}</option>
                ))}
              </select>
            </div>
          )}

          {scanTimeoutMsg && (
             <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-xl flex items-center gap-2 shadow-sm">
                <AlertCircle size={18} className="flex-shrink-0" />
                <span className="leading-relaxed">{scanTimeoutMsg}</span>
             </div>
          )}

          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-white/60 bg-white/55 p-3 text-xs leading-relaxed text-gray-500 shadow-sm">
            <Camera size={16} className="mt-0.5 flex-shrink-0 text-accent-500" />
            <span>Allow camera access when Chrome asks. On mobile, the scanner will prefer the rear camera for faster QR detection.</span>
          </div>

          <div ref={scannerShellRef} className={`relative overflow-hidden rounded-2xl bg-stone-950 mx-auto ${scannerVisible ? "mb-2 min-h-[350px]" : "pointer-events-none h-0"}`}>
            
            {/* Overlay */}
            {scannerStatus === "active" && (
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-20">
                <div className="bg-black/50 text-white font-semibold text-xs px-4 py-2 rounded-full self-center backdrop-blur-md border border-white/20 text-center animate-pulse shadow-xl mt-4">
                  {scanPhase === "searching" ? "Searching QR..." : scanPhase === "found" ? "QR Found!" : scanPhase === "verifying" ? "Verifying..." : ""}
                </div>
                <div className="flex flex-col gap-2 items-center mb-4">
                   <div className="bg-black/40 text-white/90 text-[11px] font-medium px-3 py-1.5 rounded-md backdrop-blur-md shadow-lg border border-white/10">Hold QR 15–20 cm away</div>
                   <div className="bg-black/40 text-white/90 text-[11px] font-medium px-3 py-1.5 rounded-md backdrop-blur-md shadow-lg border border-white/10 text-center">Keep QR inside frame<br/>Increase phone brightness</div>
                </div>
              </div>
            )}

            <div id={SCANNER_ELEMENT_ID} ref={readerRef} className="w-full max-w-sm mx-auto h-full min-h-[350px] contrast-125 brightness-110 grayscale-[0.1]" />

            {scannerStatus === "starting" && (
              <div className="absolute inset-0 flex items-center justify-center bg-stone-950 z-20">
                <div className="flex flex-col items-center gap-4 text-stone-200">
                  <div className="relative h-16 w-16">
                    <span className="absolute inset-0 rounded-full border-2 border-accent-400/25"></span>
                    <span className="absolute inset-2 rounded-full border-2 border-t-accent-400 border-r-transparent border-b-accent-200/30 border-l-transparent animate-spin"></span>
                    <Loader2 size={22} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-accent-300" />
                  </div>
                  <div className="text-center">
                    <span className="block text-sm font-semibold">Initializing camera...</span>
                    <span className="mt-1 block text-xs text-stone-400">Waiting for permission and live video feed</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {scannerStatus === "active" && (
            <div className="mt-4 flex flex-col gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
               {zoomSupported && (
                 <div className="flex items-center gap-3 px-2">
                   <ZoomIn size={16} className="text-gray-400" />
                   <input 
                     type="range" 
                     min={minZoom} max={maxZoom} step="0.1" 
                     value={zoom} onChange={handleZoomChange}
                     className="flex-1 accent-accent-500 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                   />
                   <span className="text-xs text-gray-500 font-mono w-8 text-right font-medium">{zoom.toFixed(1)}x</span>
                 </div>
               )}
               {focusSupported && (
                 <button onClick={triggerFocus} className="btn-secondary w-full py-2.5 text-xs font-semibold gap-2 border-gray-200 bg-white shadow-sm hover:bg-gray-50 text-gray-600">
                   <Focus size={14} /> Tap to Refocus
                 </button>
               )}
               {(!zoomSupported && !focusSupported) && (
                 <p className="text-xs text-center text-gray-400 italic py-1">Manual camera controls not supported by device</p>
               )}
            </div>
          )}

          {lastScanMs !== null && (
            <p className="mt-3 text-center text-xs font-semibold text-emerald-600">
              QR detected in {lastScanMs}ms
            </p>
          )}

          {debugLogs.length > 0 && (
            <div className="mt-4 p-3 bg-stone-900 rounded-xl font-mono text-[11px] text-emerald-400 space-y-1.5 shadow-inner max-h-32 overflow-y-auto">
               {debugLogs.map((log, i) => <div key={i}>{log}</div>)}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50/80 backdrop-blur-md border border-red-200/50 rounded-2xl text-red-600 text-sm animate-fade-in shadow-sm">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={startScan} className="btn-secondary gap-2 bg-white/80 px-3 py-2 text-xs text-red-600 hover:bg-red-50 hover:border-red-200">
            <RotateCcw size={14} /> Retry
          </button>
        </div>
      )}

      {data && (
        <div className="card-glass overflow-hidden border border-emerald-200/40 animate-fade-in shadow-lg">
          <div className="px-6 py-4 bg-gradient-to-r from-emerald-50/90 to-emerald-100/50 border-b border-emerald-100/60 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 shadow-sm">
              <CheckCircle size={18} className="text-emerald-600" />
            </div>
            <h3 className="font-serif text-lg font-bold text-emerald-800 tracking-wide">Entry Verified</h3>
          </div>

          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-6 mb-8">
              {data.userPhoto && (
                <img src={data.userPhoto} alt="User" className="w-24 h-24 sm:w-20 sm:h-20 rounded-2xl object-cover border-[3px] border-white shadow-md flex-shrink-0 mx-auto sm:mx-0" />
              )}
              <div className="space-y-3 text-sm w-full bg-white/40 p-4 rounded-2xl border border-white/60 shadow-sm">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200/50">
                  <span className="text-gray-500 uppercase tracking-wider text-xs font-semibold">Booking ID</span>
                  <span className="font-mono text-xs text-emerald-800 bg-emerald-100/80 border border-emerald-200 px-2.5 py-1 rounded-md font-bold shadow-sm">{data.bookingId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Devotee Name</span>
                  <span className="text-gray-800 font-semibold">{data.userName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Temple</span>
                  <span className="text-gray-800 font-semibold">{data.templeName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Members</span>
                  <span className="text-gray-800 font-semibold">{data.totalMembers} <span className="text-gray-400 font-normal text-xs ml-1">({data.adultCount}A, {data.childCount}C)</span></span>
                </div>
              </div>
            </div>

            {data.members?.length > 0 && (
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 ml-1">Verified Members</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {data.members.map((m, i) => (
                    <div key={i} className="p-3 text-center text-xs border border-white/60 hover:border-accent-200 transition-colors bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm group">
                      {m.photo && <img src={m.photo} alt="Member" className="w-12 h-12 object-cover rounded-full mx-auto mb-2 border-2 border-white shadow-sm group-hover:scale-105 transition-transform" />}
                      <p className="font-semibold text-gray-800 mt-1 truncate">{m.fullName}</p>
                      <p className="text-gray-500 mt-0.5">{m.age}y - <span className="capitalize">{m.category}</span></p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-5 border-t border-gray-200/50">
              <button onClick={() => { alert("Entry Approved"); clearResult(); }} className="btn-primary flex-1 py-3.5 gap-2 bg-emerald-600 hover:bg-emerald-700 !shadow-none text-white border-0 transition-transform active:scale-95">
                <CheckCircle size={18} /> Approve Entry
              </button>
              <button onClick={() => { alert("Entry Rejected"); clearResult(); }} className="btn-danger flex-1 py-3.5 gap-2 bg-red-50/80 backdrop-blur-sm transition-transform active:scale-95">
                <XCircle size={18} /> Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GateVerify;
