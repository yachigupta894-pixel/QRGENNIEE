/* =========================================================
   QR GENIE - ANALYTICS
   File: js/analytics.js
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    // -----------------------------------------------------
    // ELEMENTS
    // -----------------------------------------------------

    const dateRange =
        document.getElementById("dateRange");

    const totalQRs =
        document.getElementById("totalQRs");

    const totalScans =
        document.getElementById("totalScans");

    const activeQRs =
        document.getElementById("activeQRs");

    const avgScans =
        document.getElementById("avgScans");

    const scanChart =
        document.getElementById("scanChart");

    const mobilePercentage =
        document.getElementById("mobilePercentage");

    const desktopPercentage =
        document.getElementById("desktopPercentage");

    const tabletPercentage =
        document.getElementById("tabletPercentage");

    const otherPercentage =
        document.getElementById("otherPercentage");

    const topQRContainer =
        document.getElementById("topQRContainer");

    const recentScansBody =
        document.getElementById("recentScansBody");

    const emptyAnalytics =
        document.getElementById("emptyAnalytics");


    // -----------------------------------------------------
    // DATA
    // -----------------------------------------------------

    let qrHistory = [];

    let scanHistory = [];

    let selectedRange = 30;


    // -----------------------------------------------------
    // LOAD DATA
    // -----------------------------------------------------

    function loadData() {

        try {

            qrHistory =
                JSON.parse(
                    localStorage.getItem(
                        "qr-genie-history"
                    )
                ) || [];

        } catch (error) {

            console.error(
                "QR history error:",
                error
            );

            qrHistory = [];
        }


        try {

            scanHistory =
                JSON.parse(
                    localStorage.getItem(
                        "qr-genie-scan-history"
                    )
                ) || [];

        } catch (error) {

            console.error(
                "Scan history error:",
                error
            );

            scanHistory = [];
        }


        updateAnalytics();
    }


    // -----------------------------------------------------
    // UPDATE EVERYTHING
    // -----------------------------------------------------

    function updateAnalytics() {

        const filteredQRs =
            getFilteredQRs();

        const filteredScans =
            getFilteredScans();


        updateStats(
            filteredQRs,
            filteredScans
        );

        updateScanChart(
            filteredScans
        );

        updateDeviceBreakdown(
            filteredScans
        );

        updateTopQRs(
            filteredQRs
        );

        updateRecentScans(
            filteredScans
        );


        // Empty state
        if (
            qrHistory.length === 0 &&
            scanHistory.length === 0
        ) {

            if (emptyAnalytics) {
                emptyAnalytics.style.display =
                    "block";
            }

        } else {

            if (emptyAnalytics) {
                emptyAnalytics.style.display =
                    "none";
            }
        }
    }


    // -----------------------------------------------------
    // DATE RANGE
    // -----------------------------------------------------

    function getFilteredQRs() {

        if (
            selectedRange === "all"
        ) {
            return [...qrHistory];
        }


        const cutoff =
            getCutoffDate(
                Number(selectedRange)
            );


        return qrHistory.filter(
            item => {

                const date =
                    new Date(
                        item.createdAt
                    );

                return date >= cutoff;
            }
        );
    }


    function getFilteredScans() {

        if (
            selectedRange === "all"
        ) {
            return [...scanHistory];
        }


        const cutoff =
            getCutoffDate(
                Number(selectedRange)
            );


        return scanHistory.filter(
            item => {

                const date =
                    new Date(
                        item.scannedAt
                    );

                return date >= cutoff;
            }
        );
    }


    function getCutoffDate(
        days
    ) {

        const date =
            new Date();

        date.setHours(
            0,
            0,
            0,
            0
        );

        date.setDate(
            date.getDate() - days
        );

        return date;
    }


    // -----------------------------------------------------
    // STATISTICS
    // -----------------------------------------------------

    function updateStats(
        qrs,
        scans
    ) {

        const qrCount =
            qrs.length;


        const scanCount =
            scans.length;


        const activeCount =
            qrs.filter(
                qr => {

                    return (
                        Number(
                            qr.scans || 0
                        ) > 0
                    );
                }
            ).length;


        const average =
            qrCount > 0
                ? scanCount / qrCount
                : 0;


        setText(
            totalQRs,
            qrCount
        );

        setText(
            totalScans,
            scanCount
        );

        setText(
            activeQRs,
            activeCount
        );

        setText(
            avgScans,
            average.toFixed(1)
        );
    }


    // -----------------------------------------------------
    // SCAN CHART
    // -----------------------------------------------------

    function updateScanChart(
        scans
    ) {

        if (!scanChart) {
            return;
        }


        scanChart.innerHTML = "";


        const days =
            getChartDays();


        const values =
            days.map(day => {

                return scans.filter(
                    scan => {

                        const date =
                            new Date(
                                scan.scannedAt
                            );

                        return isSameDay(
                            date,
                            day
                        );
                    }
                ).length;

            });


        const maxValue =
            Math.max(
                ...values,
                1
            );


        values.forEach(
            (value, index) => {

                const wrapper =
                    document.createElement(
                        "div"
                    );

                wrapper.className =
                    "chart-bar-wrapper";


                const valueLabel =
                    document.createElement(
                        "span"
                    );

                valueLabel.className =
                    "chart-value";

                valueLabel.textContent =
                    value;


                const bar =
                    document.createElement(
                        "div"
                    );

                bar.className =
                    "chart-bar";


                bar.style.height =
                    `${Math.max(
                        (value / maxValue) * 100,
                        value > 0 ? 8 : 2
                    )}%`;


                const dayLabel =
                    document.createElement(
                        "span"
                    );

                dayLabel.className =
                    "chart-label";

                dayLabel.textContent =
                    formatShortDay(
                        days[index]
                    );


                wrapper.appendChild(
                    valueLabel
                );

                wrapper.appendChild(
                    bar
                );

                wrapper.appendChild(
                    dayLabel
                );


                scanChart.appendChild(
                    wrapper
                );
            }
        );
    }


    // -----------------------------------------------------
    // GET CHART DAYS
    // -----------------------------------------------------

    function getChartDays() {

        const days = [];

        const count =
            selectedRange === "7"
                ? 7
                : 7;


        const today =
            new Date();

        today.setHours(
            0,
            0,
            0,
            0
        );


        for (
            let i = count - 1;
            i >= 0;
            i--
        ) {

            const date =
                new Date(today);

            date.setDate(
                today.getDate() - i
            );

            days.push(date);
        }


        return days;
    }


    // -----------------------------------------------------
    // DEVICE BREAKDOWN
    // -----------------------------------------------------

    function updateDeviceBreakdown(
        scans
    ) {

        let mobile = 0;
        let desktop = 0;
        let tablet = 0;
        let other = 0;


        scans.forEach(
            scan => {

                const device =
                    (
                        scan.device ||
                        detectDevice()
                    ).toLowerCase();


                if (
                    device.includes(
                        "mobile"
                    ) ||
                    device.includes(
                        "phone"
                    )
                ) {

                    mobile++;

                } else if (
                    device.includes(
                        "tablet"
                    ) ||
                    device.includes(
                        "ipad"
                    )
                ) {

                    tablet++;

                } else if (
                    device.includes(
                        "desktop"
                    ) ||
                    device.includes(
                        "computer"
                    ) ||
                    device.includes(
                        "laptop"
                    )
                ) {

                    desktop++;

                } else {

                    other++;
                }
            }
        );


        const total =
            mobile +
            desktop +
            tablet +
            other;


        const mobilePct =
            percentage(
                mobile,
                total
            );

        const desktopPct =
            percentage(
                desktop,
                total
            );

        const tabletPct =
            percentage(
                tablet,
                total
            );

        const otherPct =
            percentage(
                other,
                total
            );


        setPercentage(
            mobilePercentage,
            mobilePct
        );

        setPercentage(
            desktopPercentage,
            desktopPct
        );

        setPercentage(
            tabletPercentage,
            tabletPct
        );

        setPercentage(
            otherPercentage,
            otherPct
        );


        updateProgressBars(
            mobilePct,
            desktopPct,
            tabletPct,
            otherPct
        );
    }


    // -----------------------------------------------------
    // UPDATE PROGRESS BARS
    // -----------------------------------------------------

    function updateProgressBars(
        mobile,
        desktop,
        tablet,
        other
    ) {

        const bars =
            document.querySelectorAll(
                ".breakdown-progress"
            );


        const values = [
            mobile,
            desktop,
            tablet,
            other
        ];


        bars.forEach(
            (bar, index) => {

                if (
                    values[index] !==
                    undefined
                ) {

                    bar.style.width =
                        `${values[index]}%`;
                }
            }
        );
    }


    // -----------------------------------------------------
    // TOP QR CODES
    // -----------------------------------------------------

    function updateTopQRs(
        qrs
    ) {

        if (!topQRContainer) {
            return;
        }


        topQRContainer.innerHTML = "";


        const sorted =
            [...qrs]
                .sort(
                    (a, b) =>
                        Number(
                            b.scans || 0
                        ) -
                        Number(
                            a.scans || 0
                        )
                )
                .slice(0, 5);


        if (
            sorted.length === 0
        ) {

            topQRContainer.innerHTML =
                `<p class="analytics-empty-text">
                    No QR codes available.
                </p>`;

            return;
        }


        sorted.forEach(
            (qr, index) => {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "top-qr-item";


                const number =
                    document.createElement(
                        "span"
                    );

                number.className =
                    "top-qr-number";

                number.textContent =
                    index + 1;


                const info =
                    document.createElement(
                        "div"
                    );

                info.className =
                    "top-qr-info";


                const title =
                    document.createElement(
                        "strong"
                    );

                title.textContent =
                    getQRName(
                        qr.content
                    );


                const content =
                    document.createElement(
                        "small"
                    );

                content.textContent =
                    truncateText(
                        qr.content || "",
                        45
                    );


                const scans =
                    document.createElement(
                        "span"
                    );

                scans.className =
                    "top-qr-scans";

                scans.textContent =
                    `${Number(
                        qr.scans || 0
                    )} scans`;


                info.appendChild(
                    title
                );

                info.appendChild(
                    content
                );


                item.appendChild(
                    number
                );

                item.appendChild(
                    info
                );

                item.appendChild(
                    scans
                );


                topQRContainer.appendChild(
                    item
                );
            }
        );
    }


    // -----------------------------------------------------
    // RECENT SCANS
    // -----------------------------------------------------

    function updateRecentScans(
        scans
    ) {

        if (!recentScansBody) {
            return;
        }


        recentScansBody.innerHTML = "";


        const recent =
            [...scans]
                .sort(
                    (a, b) =>
                        new Date(
                            b.scannedAt
                        ) -
                        new Date(
                            a.scannedAt
                        )
                )
                .slice(0, 10);


        if (
            recent.length === 0
        ) {

            recentScansBody.innerHTML =
                `<tr>
                    <td colspan="4">
                        No recent scans.
                    </td>
                </tr>`;

            return;
        }


        recent.forEach(
            scan => {

                const row =
                    document.createElement(
                        "tr"
                    );


                const contentCell =
                    document.createElement(
                        "td"
                    );

                contentCell.textContent =
                    truncateText(
                        scan.content || "QR Code",
                        40
                    );


                const dateCell =
                    document.createElement(
                        "td"
                    );

                dateCell.textContent =
                    formatDate(
                        scan.scannedAt
                    );


                const timeCell =
                    document.createElement(
                        "td"
                    );

                timeCell.textContent =
                    formatTime(
                        scan.scannedAt
                    );


                const deviceCell =
                    document.createElement(
                        "td"
                    );

                deviceCell.textContent =
                    getDeviceName(
                        scan.device
                    );


                row.appendChild(
                    contentCell
                );

                row.appendChild(
                    dateCell
                );

                row.appendChild(
                    timeCell
                );

                row.appendChild(
                    deviceCell
                );


                recentScansBody.appendChild(
                    row
                );
            }
        );
    }


    // -----------------------------------------------------
    // GET QR NAME
    // -----------------------------------------------------

    function getQRName(
        content
    ) {

        if (!content) {
            return "Untitled QR";
        }


        try {

            const url =
                new URL(content);

            return url.hostname;

        } catch {

            return truncateText(
                content,
                30
            );
        }
    }


    // -----------------------------------------------------
    // DEVICE DETECTION
    // -----------------------------------------------------

    function detectDevice() {

        const ua =
            navigator.userAgent
                .toLowerCase();


        if (
            /ipad|tablet/.test(ua)
        ) {

            return "Tablet";
        }


        if (
            /mobile|android|iphone/.test(ua)
        ) {

            return "Mobile";
        }


        if (
            /windows|macintosh|linux/.test(ua)
        ) {

            return "Desktop";
        }


        return "Other";
    }


    function getDeviceName(
        device
    ) {

        if (!device) {
            return detectDevice();
        }


        const value =
            device.toLowerCase();


        if (
            value.includes("mobile") ||
            value.includes("phone")
        ) {
            return "Mobile";
        }


        if (
            value.includes("tablet") ||
            value.includes("ipad")
        ) {
            return "Tablet";
        }


        if (
            value.includes("desktop") ||
            value.includes("computer") ||
            value.includes("laptop")
        ) {
            return "Desktop";
        }


        return "Other";
    }


    // -----------------------------------------------------
    // DATE HELPERS
    // -----------------------------------------------------

    function isSameDay(
        date1,
        date2
    ) {

        return (
            date1.getFullYear() ===
                date2.getFullYear() &&

            date1.getMonth() ===
                date2.getMonth() &&

            date1.getDate() ===
                date2.getDate()
        );
    }


    function formatShortDay(
        date
    ) {

        return date.toLocaleDateString(
            "en-IN",
            {
                weekday: "short"
            }
        );
    }


    function formatDate(
        date
    ) {

        const value =
            new Date(date);


        if (
            isNaN(
                value.getTime()
            )
        ) {
            return "-";
        }


        return value.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    }


    function formatTime(
        date
    ) {

        const value =
            new Date(date);


        if (
            isNaN(
                value.getTime()
            )
        ) {
            return "-";
        }


        return value.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    }


    // -----------------------------------------------------
    // UTILITY FUNCTIONS
    // -----------------------------------------------------

    function percentage(
        value,
        total
    ) {

        if (total === 0) {
            return 0;
        }


        return Math.round(
            (value / total) * 100
        );
    }


    function truncateText(
        text,
        length
    ) {

        if (
            text.length <= length
        ) {
            return text;
        }


        return (
            text.substring(
                0,
                length
            ) + "..."
        );
    }


    function setText(
        element,
        value
    ) {

        if (element) {
            element.textContent =
                value;
        }
    }


    function setPercentage(
        element,
        value
    ) {

        if (!element) {
            return;
        }


        element.textContent =
            `${value}%`;
    }


    // -----------------------------------------------------
    // DATE RANGE CHANGE
    // -----------------------------------------------------

    if (dateRange) {

        dateRange.addEventListener(
            "change",
            () => {

                selectedRange =
                    dateRange.value ===
                    "all"
                        ? "all"
                        : Number(
                            dateRange.value
                        );

                updateAnalytics();
            }
        );


        // Initial value
        selectedRange =
            dateRange.value ===
            "all"
                ? "all"
                : Number(
                    dateRange.value
                );
    }


    // -----------------------------------------------------
    // REFRESH WHEN TAB BECOMES ACTIVE
    // -----------------------------------------------------

    window.addEventListener(
        "storage",
        event => {

            if (
                event.key ===
                    "qr-genie-history" ||
                event.key ===
                    "qr-genie-scan-history"
            ) {

                loadData();
            }
        }
    );


    // -----------------------------------------------------
    // INITIALIZE
    // -----------------------------------------------------

    loadData();

});