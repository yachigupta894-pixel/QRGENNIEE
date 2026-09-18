/* =========================================================
   QR GENIE - QR GENERATOR
   File: js/qr-generator.js
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    // -----------------------------------------------------
    // GET HTML ELEMENTS
    // -----------------------------------------------------

    const qrInput = document.getElementById("qrInput");
    const generateBtn = document.getElementById("generateBtn");
    const clearBtn = document.getElementById("clearBtn");

    const qrResult = document.getElementById("qrResult");
    const qrCodeContainer = document.getElementById("qrcode");

    const downloadBtn = document.getElementById("downloadBtn");
    const copyBtn = document.getElementById("copyBtn");

    const qrSize = document.getElementById("qrSize");
    const qrColor = document.getElementById("qrColor");
    const qrBgColor = document.getElementById("qrBgColor");

    const errorCorrection = document.getElementById("errorCorrection");
    const includeLogo = document.getElementById("includeLogo");

    // -----------------------------------------------------
    // CHECK IF REQUIRED ELEMENTS EXIST
    // -----------------------------------------------------

    if (!qrInput || !generateBtn || !qrCodeContainer) {
        console.warn("QR Generator: Required HTML elements not found.");
        return;
    }

    // -----------------------------------------------------
    // VARIABLES
    // -----------------------------------------------------

    let qrCode = null;

    // -----------------------------------------------------
    // DEFAULT SETTINGS
    // -----------------------------------------------------

    const defaultSettings = {
        size: 300,
        errorCorrection: "M",
        qrColor: "#000000",
        backgroundColor: "#ffffff"
    };


    // -----------------------------------------------------
    // LOAD SAVED SETTINGS
    // -----------------------------------------------------

    function loadSettings() {

        const savedSettings =
            JSON.parse(localStorage.getItem("qr-genie-settings")) || {};

        if (qrSize) {
            qrSize.value =
                savedSettings.qrSize || defaultSettings.size;
        }

        if (qrColor) {
            qrColor.value =
                savedSettings.qrColor || defaultSettings.qrColor;
        }

        if (qrBgColor) {
            qrBgColor.value =
                savedSettings.backgroundColor ||
                defaultSettings.backgroundColor;
        }

        if (errorCorrection) {
            errorCorrection.value =
                savedSettings.errorCorrection ||
                defaultSettings.errorCorrection;
        }
    }

    loadSettings();


    // -----------------------------------------------------
    // GET SELECTED QR SIZE
    // -----------------------------------------------------

    function getQRSize() {

        const size = parseInt(
            qrSize?.value || defaultSettings.size
        );

        return isNaN(size) ? 300 : size;
    }


    // -----------------------------------------------------
    // GET QR COLORS
    // -----------------------------------------------------

    function getQRColor() {

        return qrColor?.value ||
            defaultSettings.qrColor;
    }

    function getBackgroundColor() {

        return qrBgColor?.value ||
            defaultSettings.backgroundColor;
    }


    // -----------------------------------------------------
    // GET ERROR CORRECTION LEVEL
    // -----------------------------------------------------

    function getErrorCorrection() {

        return errorCorrection?.value ||
            defaultSettings.errorCorrection;
    }


    // -----------------------------------------------------
    // VALIDATE INPUT
    // -----------------------------------------------------

    function validateInput() {

        const value = qrInput.value.trim();

        if (!value) {

            showToast(
                "Please enter text or a URL.",
                "error"
            );

            qrInput.focus();

            return false;
        }

        return true;
    }


    // -----------------------------------------------------
    // GENERATE QR CODE
    // -----------------------------------------------------

    function generateQRCode() {

        if (!validateInput()) {
            return;
        }

        const value = qrInput.value.trim();

        // Clear previous QR code
        qrCodeContainer.innerHTML = "";

        // Get settings
        const size = getQRSize();
        const color = getQRColor();
        const background = getBackgroundColor();
        const correction = getErrorCorrection();

        // Check QRCode library
        if (typeof QRCode === "undefined") {

            showToast(
                "QR Code library not loaded.",
                "error"
            );

            console.error(
                "QRCode library is missing."
            );

            return;
        }

        // Create QR code
        qrCode = new QRCode(qrCodeContainer, {

            text: value,

            width: size,
            height: size,

            colorDark: color,
            colorLight: background,

            correctLevel:
                getQRCodeCorrection(correction)

        });


        // Show result section
        if (qrResult) {
            qrResult.style.display = "block";
        }

        // Save history
        saveToHistory(value);

        // Apply logo if enabled
        if (includeLogo?.checked) {

            setTimeout(() => {
                addLogoToQR();
            }, 150);
        }

        showToast(
            "QR Code generated successfully!",
            "success"
        );
    }


    // -----------------------------------------------------
    // ERROR CORRECTION CONVERTER
    // -----------------------------------------------------

    function getQRCodeCorrection(level) {

        if (
            typeof QRCode === "undefined" ||
            !QRCode.CorrectLevel
        ) {
            return 1;
        }

        switch (level) {

            case "L":
                return QRCode.CorrectLevel.L;

            case "M":
                return QRCode.CorrectLevel.M;

            case "Q":
                return QRCode.CorrectLevel.Q;

            case "H":
                return QRCode.CorrectLevel.H;

            default:
                return QRCode.CorrectLevel.M;
        }
    }


    // -----------------------------------------------------
    // ADD LOGO
    // -----------------------------------------------------

    function addLogoToQR() {

        const canvas =
            qrCodeContainer.querySelector("canvas");

        if (!canvas) {
            return;
        }

        const ctx = canvas.getContext("2d");

        if (!ctx) {
            return;
        }

        const size = canvas.width;

        // Logo size
        const logoSize = size * 0.20;

        const x = (size - logoSize) / 2;
        const y = (size - logoSize) / 2;

        // White background behind logo
        ctx.fillStyle = "#ffffff";

        ctx.fillRect(
            x - 6,
            y - 6,
            logoSize + 12,
            logoSize + 12
        );

        // QR Genie logo
        const logo = new Image();

        logo.onload = () => {

            ctx.drawImage(
                logo,
                x,
                y,
                logoSize,
                logoSize
            );
        };

        logo.onerror = () => {

            console.warn(
                "QR Genie logo could not be loaded."
            );
        };

        logo.src = "assets/logo.png";
    }


    // -----------------------------------------------------
    // DOWNLOAD QR CODE
    // -----------------------------------------------------

    function downloadQRCode() {

        if (!qrCodeContainer) {
            return;
        }

        const canvas =
            qrCodeContainer.querySelector("canvas");

        if (!canvas) {

            showToast(
                "Generate a QR code first.",
                "error"
            );

            return;
        }

        try {

            const link =
                document.createElement("a");

            link.download =
                "qr-genie-" +
                Date.now() +
                ".png";

            link.href =
                canvas.toDataURL("image/png");

            link.click();

            showToast(
                "QR Code downloaded!",
                "success"
            );

        } catch (error) {

            console.error(
                "Download error:",
                error
            );

            showToast(
                "Unable to download QR code.",
                "error"
            );
        }
    }


    // -----------------------------------------------------
    // COPY QR CODE IMAGE
    // -----------------------------------------------------

    async function copyQRCode() {

        const canvas =
            qrCodeContainer.querySelector("canvas");

        if (!canvas) {

            showToast(
                "Generate a QR code first.",
                "error"
            );

            return;
        }

        try {

            const blob =
                await new Promise(resolve =>
                    canvas.toBlob(resolve, "image/png")
                );

            if (
                !navigator.clipboard ||
                !window.ClipboardItem
            ) {

                showToast(
                    "Copy is not supported in this browser.",
                    "error"
                );

                return;
            }

            await navigator.clipboard.write([
                new ClipboardItem({
                    "image/png": blob
                })
            ]);

            showToast(
                "QR Code copied!",
                "success"
            );

        } catch (error) {

            console.error(
                "Copy error:",
                error
            );

            showToast(
                "Unable to copy QR code.",
                "error"
            );
        }
    }


    // -----------------------------------------------------
    // CLEAR QR CODE
    // -----------------------------------------------------

    function clearQRCode() {

        qrInput.value = "";

        qrCodeContainer.innerHTML = "";

        qrCode = null;

        if (qrResult) {
            qrResult.style.display = "none";
        }

        showToast(
            "QR Code cleared.",
            "success"
        );
    }


    // -----------------------------------------------------
    // SAVE QR TO HISTORY
    // -----------------------------------------------------

    function saveToHistory(value) {

        const saveHistory =
            localStorage.getItem(
                "qr-genie-save-history"
            );

        // If setting is explicitly disabled
        if (saveHistory === "false") {
            return;
        }

        let history =
            JSON.parse(
                localStorage.getItem(
                    "qr-genie-history"
                )
            ) || [];


        // Create history item
        const historyItem = {

            id: Date.now(),

            content: value,

            createdAt:
                new Date().toISOString(),

            scans: 0

        };


        // Add newest item first
        history.unshift(historyItem);


        // Keep maximum 100 items
        history =
            history.slice(0, 100);


        localStorage.setItem(
            "qr-genie-history",
            JSON.stringify(history)
        );
    }


    // -----------------------------------------------------
    // TOAST MESSAGE
    // -----------------------------------------------------

    function showToast(message, type = "success") {

        let toast =
            document.getElementById("toast");

        // Create toast if it doesn't exist
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

        // Force animation restart
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
    // GENERATE BUTTON
    // -----------------------------------------------------

    generateBtn.addEventListener(
        "click",
        generateQRCode
    );


    // -----------------------------------------------------
    // CLEAR BUTTON
    // -----------------------------------------------------

    if (clearBtn) {

        clearBtn.addEventListener(
            "click",
            clearQRCode
        );
    }


    // -----------------------------------------------------
    // DOWNLOAD BUTTON
    // -----------------------------------------------------

    if (downloadBtn) {

        downloadBtn.addEventListener(
            "click",
            downloadQRCode
        );
    }


    // -----------------------------------------------------
    // COPY BUTTON
    // -----------------------------------------------------

    if (copyBtn) {

        copyBtn.addEventListener(
            "click",
            copyQRCode
        );
    }


    // -----------------------------------------------------
    // ENTER KEY
    // -----------------------------------------------------

    qrInput.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                event.preventDefault();

                generateQRCode();
            }
        }
    );


    // -----------------------------------------------------
    // AUTO REGENERATE WHEN SETTINGS CHANGE
    // -----------------------------------------------------

    [
        qrSize,
        qrColor,
        qrBgColor,
        errorCorrection,
        includeLogo
    ].forEach(element => {

        if (!element) {
            return;
        }

        element.addEventListener(
            "change",
            () => {

                if (
                    qrInput.value.trim()
                ) {
                    generateQRCode();
                }
            }
        );
    });


    // -----------------------------------------------------
    // SAVE CURRENT SETTINGS
    // -----------------------------------------------------

    function saveCurrentSettings() {

        const settings =
            JSON.parse(
                localStorage.getItem(
                    "qr-genie-settings"
                )
            ) || {};

        settings.qrSize =
            getQRSize();

        settings.qrColor =
            getQRColor();

        settings.backgroundColor =
            getBackgroundColor();

        settings.errorCorrection =
            getErrorCorrection();

        localStorage.setItem(
            "qr-genie-settings",
            JSON.stringify(settings)
        );
    }


    // Save settings before leaving page
    window.addEventListener(
        "beforeunload",
        saveCurrentSettings
    );


    // -----------------------------------------------------
    // THEME SUPPORT
    // -----------------------------------------------------

    function loadTheme() {

        const savedTheme =
            localStorage.getItem(
                "qr-genie-theme"
            );

        if (
            savedTheme === "dark"
        ) {
            document.body.classList.add(
                "dark-mode"
            );
        }
    }

    loadTheme();


    // -----------------------------------------------------
    // INITIAL STATE
    // -----------------------------------------------------

    if (qrResult) {

        qrResult.style.display = "none";
    }

});