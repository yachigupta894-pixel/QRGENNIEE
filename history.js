/* =========================================================
   QR GENIE - HISTORY
   File: js/history.js
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    // -----------------------------------------------------
    // GET HTML ELEMENTS
    // -----------------------------------------------------

    const historyContainer =
        document.getElementById("historyContainer");

    const historyTableBody =
        document.getElementById("historyTableBody");

    const emptyHistory =
        document.getElementById("emptyHistory");

    const searchInput =
        document.getElementById("historySearch");

    const filterSelect =
        document.getElementById("historyFilter");

    const clearHistoryBtn =
        document.getElementById("clearHistory");

    const deleteAllBtn =
        document.getElementById("deleteAllHistory");


    // -----------------------------------------------------
    // VARIABLES
    // -----------------------------------------------------

    let history = [];

    let filteredHistory = [];


    // -----------------------------------------------------
    // LOAD HISTORY
    // -----------------------------------------------------

    function loadHistory() {

        try {

            history =
                JSON.parse(
                    localStorage.getItem(
                        "qr-genie-history"
                    )
                ) || [];

        } catch (error) {

            console.error(
                "Unable to load history:",
                error
            );

            history = [];
        }


        filteredHistory =
            [...history];

        renderHistory();
    }


    // -----------------------------------------------------
    // SAVE HISTORY
    // -----------------------------------------------------

    function saveHistory() {

        localStorage.setItem(
            "qr-genie-history",
            JSON.stringify(history)
        );
    }


    // -----------------------------------------------------
    // RENDER HISTORY
    // -----------------------------------------------------

    function renderHistory() {

        if (!historyTableBody) {
            return;
        }


        historyTableBody.innerHTML = "";


        // Empty state
        if (
            filteredHistory.length === 0
        ) {

            if (emptyHistory) {
                emptyHistory.style.display =
                    "block";
            }

            if (historyContainer) {
                historyContainer.style.display =
                    "none";
            }

            return;
        }


        // Show table
        if (emptyHistory) {
            emptyHistory.style.display =
                "none";
        }

        if (historyContainer) {
            historyContainer.style.display =
                "block";
        }


        // Add rows
        filteredHistory.forEach(
            (item, index) => {

                const row =
                    createHistoryRow(
                        item,
                        index
                    );

                historyTableBody.appendChild(
                    row
                );
            }
        );
    }


    // -----------------------------------------------------
    // CREATE HISTORY ROW
    // -----------------------------------------------------

    function createHistoryRow(
        item,
        index
    ) {

        const row =
            document.createElement("tr");


        // Content
        const contentCell =
            document.createElement("td");

        contentCell.className =
            "history-content";


        const content =
            item.content || "";


        contentCell.textContent =
            truncateText(
                content,
                55
            );


        contentCell.title =
            content;


        // Date
        const dateCell =
            document.createElement("td");

        dateCell.textContent =
            formatDate(
                item.createdAt
            );


        // Time
        const timeCell =
            document.createElement("td");

        timeCell.textContent =
            formatTime(
                item.createdAt
            );


        // Type
        const typeCell =
            document.createElement("td");

        typeCell.innerHTML =
            `<span class="history-type">
                ${getContentType(content)}
            </span>`;


        // Actions
        const actionCell =
            document.createElement("td");

        actionCell.className =
            "history-actions";


        // Copy button
        const copyBtn =
            createActionButton(
                "Copy",
                "copy",
                () => {
                    copyContent(content);
                }
            );


        // Generate again button
        const generateBtn =
            createActionButton(
                "Generate",
                "generate",
                () => {
                    generateAgain(content);
                }
            );


        // Delete button
        const deleteBtn =
            createActionButton(
                "Delete",
                "delete",
                () => {
                    deleteHistoryItem(
                        item.id
                    );
                }
            );


        actionCell.appendChild(
            copyBtn
        );

        actionCell.appendChild(
            generateBtn
        );

        actionCell.appendChild(
            deleteBtn
        );


        // Add cells
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
            typeCell
        );

        row.appendChild(
            actionCell
        );


        return row;
    }


    // -----------------------------------------------------
    // CREATE ACTION BUTTON
    // -----------------------------------------------------

    function createActionButton(
        text,
        className,
        callback
    ) {

        const button =
            document.createElement("button");

        button.type = "button";

        button.textContent =
            text;

        button.className =
            `history-action ${className}`;

        button.addEventListener(
            "click",
            callback
        );

        return button;
    }


    // -----------------------------------------------------
    // SEARCH HISTORY
    // -----------------------------------------------------

    function searchHistory() {

        const searchTerm =
            searchInput
                ? searchInput.value
                    .trim()
                    .toLowerCase()
                : "";


        filteredHistory =
            history.filter(item => {

                const content =
                    (
                        item.content || ""
                    ).toLowerCase();


                return content.includes(
                    searchTerm
                );
            });


        applyFilter(false);
    }


    // -----------------------------------------------------
    // FILTER HISTORY
    // -----------------------------------------------------

    function applyFilter(
        resetSearch = true
    ) {

        let result =
            [...history];


        if (
            resetSearch &&
            searchInput
        ) {

            searchInput.value = "";
        }


        const searchTerm =
            searchInput
                ? searchInput.value
                    .trim()
                    .toLowerCase()
                : "";


        // Search
        if (searchTerm) {

            result =
                result.filter(item =>
                    (
                        item.content || ""
                    )
                    .toLowerCase()
                    .includes(searchTerm)
                );
        }


        // Filter
        const filter =
            filterSelect
                ? filterSelect.value
                : "all";


        if (filter !== "all") {

            result =
                result.filter(item => {

                    const type =
                        getContentType(
                            item.content || ""
                        ).toLowerCase();

                    return type ===
                        filter.toLowerCase();
                });
        }


        filteredHistory =
            result;


        renderHistory();
    }


    // -----------------------------------------------------
    // GET CONTENT TYPE
    // -----------------------------------------------------

    function getContentType(
        content
    ) {

        if (!content) {
            return "Text";
        }


        try {

            const url =
                new URL(content);


            if (
                url.protocol ===
                    "http:" ||
                url.protocol ===
                    "https:"
            ) {
                return "URL";
            }

        } catch {
            // Not a URL
        }


        if (
            content.startsWith(
                "mailto:"
            )
        ) {
            return "Email";
        }


        if (
            content.startsWith(
                "tel:"
            )
        ) {
            return "Phone";
        }


        if (
            content.startsWith(
                "WIFI:"
            )
        ) {
            return "WiFi";
        }


        return "Text";
    }


    // -----------------------------------------------------
    // DELETE SINGLE ITEM
    // -----------------------------------------------------

    function deleteHistoryItem(
        id
    ) {

        const confirmed =
            confirm(
                "Delete this QR code from history?"
            );


        if (!confirmed) {
            return;
        }


        history =
            history.filter(
                item =>
                    item.id !== id
            );


        saveHistory();

        applyFilter(false);


        showToast(
            "QR code removed from history.",
            "success"
        );
    }


    // -----------------------------------------------------
    // CLEAR ALL HISTORY
    // -----------------------------------------------------

    function clearAllHistory() {

        if (
            history.length === 0
        ) {

            showToast(
                "History is already empty.",
                "error"
            );

            return;
        }


        const confirmed =
            confirm(
                "Are you sure you want to clear all QR history?"
            );


        if (!confirmed) {
            return;
        }


        history = [];

        filteredHistory = [];


        saveHistory();

        renderHistory();


        showToast(
            "QR history cleared.",
            "success"
        );
    }


    // -----------------------------------------------------
    // COPY CONTENT
    // -----------------------------------------------------

    async function copyContent(
        content
    ) {

        try {

            await navigator.clipboard
                .writeText(content);


            showToast(
                "Content copied!",
                "success"
            );

        } catch (error) {

            console.error(
                "Copy error:",
                error
            );


            showToast(
                "Unable to copy content.",
                "error"
            );
        }
    }


    // -----------------------------------------------------
    // GENERATE AGAIN
    // -----------------------------------------------------

    function generateAgain(
        content
    ) {

        // Save content for index page
        localStorage.setItem(
            "qr-genie-generate-content",
            content
        );


        // Redirect
        window.location.href =
            "index.html";
    }


    // -----------------------------------------------------
    // TRUNCATE TEXT
    // -----------------------------------------------------

    function truncateText(
        text,
        maxLength
    ) {

        if (
            text.length <=
            maxLength
        ) {
            return text;
        }


        return (
            text.substring(
                0,
                maxLength
            ) + "..."
        );
    }


    // -----------------------------------------------------
    // FORMAT DATE
    // -----------------------------------------------------

    function formatDate(
        date
    ) {

        if (!date) {
            return "-";
        }


        const parsedDate =
            new Date(date);


        if (
            isNaN(
                parsedDate.getTime()
            )
        ) {
            return "-";
        }


        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    }


    // -----------------------------------------------------
    // FORMAT TIME
    // -----------------------------------------------------

    function formatTime(
        date
    ) {

        if (!date) {
            return "-";
        }


        const parsedDate =
            new Date(date);


        if (
            isNaN(
                parsedDate.getTime()
            )
        ) {
            return "-";
        }


        return parsedDate.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    }


    // -----------------------------------------------------
    // TOAST
    // -----------------------------------------------------

    function showToast(
        message,
        type = "success"
    ) {

        let toast =
            document.getElementById(
                "toast"
            );


        if (!toast) {

            toast =
                document.createElement(
                    "div"
                );

            toast.id = "toast";

            toast.className =
                "toast";

            document.body.appendChild(
                toast
            );
        }


        toast.textContent =
            message;


        toast.classList.remove(
            "success",
            "error",
            "show"
        );


        toast.classList.add(
            type
        );


        void toast.offsetWidth;


        toast.classList.add(
            "show"
        );


        clearTimeout(
            toast.hideTimeout
        );


        toast.hideTimeout =
            setTimeout(
                () => {

                    toast.classList.remove(
                        "show"
                    );

                },
                2500
            );
    }


    // -----------------------------------------------------
    // SEARCH EVENT
    // -----------------------------------------------------

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            () => {
                applyFilter(false);
            }
        );
    }


    // -----------------------------------------------------
    // FILTER EVENT
    // -----------------------------------------------------

    if (filterSelect) {

        filterSelect.addEventListener(
            "change",
            () => {
                applyFilter(false);
            }
        );
    }


    // -----------------------------------------------------
    // CLEAR BUTTON
    // -----------------------------------------------------

    if (clearHistoryBtn) {

        clearHistoryBtn.addEventListener(
            "click",
            clearAllHistory
        );
    }


    // -----------------------------------------------------
    // DELETE ALL BUTTON
    // -----------------------------------------------------

    if (deleteAllBtn) {

        deleteAllBtn.addEventListener(
            "click",
            clearAllHistory
        );
    }


    // -----------------------------------------------------
    // LOAD HISTORY WHEN PAGE OPENS
    // -----------------------------------------------------

    loadHistory();

});