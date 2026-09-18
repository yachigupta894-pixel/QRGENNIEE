/* =========================================================
   QR GENIE - QR SCANNER
   File: js/scanner.js
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    // -----------------------------------------------------
    // GET HTML ELEMENTS
    // -----------------------------------------------------

    const scannerContainer =
        document.getElementById("qr-reader");

    const startBtn =
        document.getElementById("startScanner");

    const stopBtn =
        document.getElementById("stopScanner");

    const resultBox =
        document.getElementById("scanResult");

    const resultText =
        document.getElementById("scanResultText");

    const copyBtn =
        document.getElementById("copyScanResult");

    const openBtn =
        document.getElementById("openScanResult");

    const clearBtn =
        document.getElementById("clearScanResult");


    // -----------------------------------------------------
    // VARIABLES
    // -----------------------------------------------------

    let scanner = null;
    let isScanning = false;
    let lastScannedText = "";


    // -----------------------------------------------------
    // CHECK REQUIRED ELEMENT
    // -----------------------------------------------------

    if (!scannerContainer) {

        console.warn(
            "QR Scanner: #qr-reader not found."
        );

        return;
    }


    // -----------------------------------------------------
    // SHOW TOAST
    // -----------------------------------------------------

    function showToast(
        message,
        type = "success"
    ) {

        let toast =
            document.getElementById("toast");

        if (!toast) {

            toast =
                document.createElement("div");

            toast.id = "toast";

            toast.className = "toast";

            document.body.appendChild(toast);
        }

        toast.textContent = message;

        toast.classList.remove(
            "success",
            "error",
            "show"
        );

        toast.classList.add(type);

        void toast.offsetWidth;

        toast.classList.add("show");

        clearTimeout(
            toast.hideTimeout
        );

        toast.hideTimeout =
            setTimeout(() => {

                toast.classList.remove(
                    "show"
                );

            }, 2500);
    }


    // -----------------------------------------------------
    // START SCANNER
    // -----------------------------------------------------

    async function startScanner() {

        if (isScanning) {
            return;
        }

        // Check library
        if (
            typeof Html5Qrcode ===
            "undefined"
        ) {

            showToast(
                "QR scanner library is not loaded.",
                "error"
            );

            console.error(
                "Html5Qrcode library not found."
            );

            return;
        }


        try {

            scanner =
                new Html5Qrcode(
                    "qr-reader"
                );


            // Start camera
            await scanner.start(

                {
                    facingMode: "environment"
                },

                {
                    fps: 10,

                    qrbox: {
                        width: 250,
                        height: 250
                    },

                    aspectRatio: 1.0
                },

                onScanSuccess,

                onScanFailure
            );


            isScanning = true;


            // Button states
            if (startBtn) {
                startBtn.disabled = true;
            }

            if (stopBtn) {
                stopBtn.disabled = false;
            }


            showToast(
                "Scanner started.",
                "success"
            );

        } catch (error) {

            console.error(
                "Camera error:",
                error
            );

            showToast(
                "Unable to access camera. Please allow camera permission.",
                "error"
            );

            scanner = null;
        }
    }


    // -----------------------------------------------------
    // STOP SCANNER
    // -----------------------------------------------------

    async function stopScanner() {

        if (
            !scanner ||
            !isScanning
        ) {
            return;
        }


        try {

            await scanner.stop();

            scanner.clear();

            isScanning = false;


            if (startBtn) {
                startBtn.disabled = false;
            }

            if (stopBtn) {
                stopBtn.disabled = true;
            }


            showToast(
                "Scanner stopped.",
                "success"
            );

        } catch (error) {

            console.error(
                "Stop scanner error:",
                error
            );
        }
    }


    // -----------------------------------------------------
    // SCAN SUCCESS
    // -----------------------------------------------------

    function onScanSuccess(
        decodedText,
        decodedResult
    ) {

        // Ignore duplicate scans
        if (
            decodedText ===
            lastScannedText
        ) {
            return;
        }

        lastScannedText =
            decodedText;


        console.log(
            "QR Code:",
            decodedText
        );


        // Show result
        displayScanResult(
            decodedText
        );


        // Save scan history
        saveScanHistory(
            decodedText
        );


        showToast(
            "QR Code scanned successfully!",
            "success"
        );


        // Stop camera after successful scan
        stopScanner();
    }


    // -----------------------------------------------------
    // SCAN FAILURE
    // -----------------------------------------------------

    function onScanFailure(errorMessage) {

        // QR scanning continuously reports
        // failures while searching.
        // We don't show an error toast here.
    }


    // -----------------------------------------------------
    // DISPLAY RESULT
    // -----------------------------------------------------

    function displayScanResult(
        text
    ) {

        if (resultBox) {

            resultBox.style.display =
                "block";
        }

        if (resultText) {

            resultText.textContent =
                text;
        }

        // Check whether result is a URL
        if (openBtn) {

            if (isValidURL(text)) {

                openBtn.style.display =
                    "inline-flex";

            } else {

                openBtn.style.display =
                    "none";
            }
        }
    }


    // -----------------------------------------------------
    // CHECK URL
    // -----------------------------------------------------

    function isValidURL(value) {

        try {

            const url =
                new URL(value);

            return (
                url.protocol ===
                    "http:" ||
                url.protocol ===
                    "https:"
            );

        } catch {

            return false;
        }
    }


    // -----------------------------------------------------
    // OPEN SCANNED URL
    // -----------------------------------------------------

    function openScanResult() {

        if (!lastScannedText) {
            return;
        }

        if (
            !isValidURL(
                lastScannedText
            )
        ) {

            showToast(
                "This QR code does not contain a valid web link.",
                "error"
            );

            return;
        }


        window.open(
            lastScannedText,
            "_blank",
            "noopener,noreferrer"
        );
    }


    // -----------------------------------------------------
    // COPY RESULT
    // -----------------------------------------------------

    async function copyScanResult() {

        if (!lastScannedText) {

            showToast(
                "No scanned result available.",
                "error"
            );

            return;
        }


        try {

            await navigator.clipboard.writeText(
                lastScannedText
            );

            showToast(
                "Result copied!",
                "success"
            );

        } catch (error) {

            console.error(
                "Copy error:",
                error
            );

            showToast(
                "Unable to copy result.",
                "error"
            );
        }
    }


    // -----------------------------------------------------
    // CLEAR RESULT
    // -----------------------------------------------------

    function clearScanResult() {

        lastScannedText = "";

        if (resultText) {
            resultText.textContent = "";
        }

        if (resultBox) {
            resultBox.style.display = "none";
        }

        showToast(
            "Scan result cleared.",
            "success"
        );
    }


    // -----------------------------------------------------
    // SAVE SCAN HISTORY
    // -----------------------------------------------------

    function saveScanHistory(
        scannedText
    ) {

        const saveHistory =
            localStorage.getItem(
                "qr-genie-save-history"
            );

        // Don't save if disabled
        if (
            saveHistory ===
            "false"
        ) {
            return;
        }


        let history =
            JSON.parse(
                localStorage.getItem(
                    "qr-genie-scan-history"
                )
            ) || [];


        const scanItem = {

            id: Date.now(),

            content:
                scannedText,

            scannedAt:
                new Date().toISOString()
        };


        // Newest first
        history.unshift(
            scanItem
        );


        // Keep last 100 scans
        history =
            history.slice(
                0,
                100
            );


        localStorage.setItem(
            "qr-genie-scan-history",
            JSON.stringify(history)
        );
    }


    // -----------------------------------------------------
    // START BUTTON
    // -----------------------------------------------------

    if (startBtn) {

        startBtn.addEventListener(
            "click",
            startScanner
        );
    }


    // -----------------------------------------------------
    // STOP BUTTON
    // -----------------------------------------------------

    if (stopBtn) {

        stopBtn.disabled = true;

        stopBtn.addEventListener(
            "click",
            stopScanner
        );
    }


    // -----------------------------------------------------
    // COPY BUTTON
    // -----------------------------------------------------

    if (copyBtn) {

        copyBtn.addEventListener(
            "click",
            copyScanResult
        );
    }


    // -----------------------------------------------------
    // OPEN BUTTON
    // -----------------------------------------------------

    if (openBtn) {

        openBtn.addEventListener(
            "click",
            openScanResult
        );
    }


    // -----------------------------------------------------
    // CLEAR BUTTON
    // -----------------------------------------------------

    if (clearBtn) {

        clearBtn.addEventListener(
            "click",
            clearScanResult
        );
    }


    // -----------------------------------------------------
    // STOP CAMERA WHEN LEAVING PAGE
    // -----------------------------------------------------

    window.addEventListener(
        "beforeunload",
        () => {

            if (
                scanner &&
                isScanning
            ) {

                scanner.stop()
                    .catch(() => {});
            }
        }
    );

});