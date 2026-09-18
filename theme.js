/* =========================================================
   QR GENIE - THEME MANAGER
   File: js/theme.js
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    // -----------------------------------------------------
    // ELEMENTS
    // -----------------------------------------------------

    const themeToggle =
        document.getElementById("themeToggle");

    const themeIcon =
        document.getElementById("themeIcon");


    // -----------------------------------------------------
    // STORAGE KEY
    // -----------------------------------------------------

    const THEME_KEY =
        "qr-genie-theme";


    // -----------------------------------------------------
    // GET SAVED THEME
    // -----------------------------------------------------

    function getSavedTheme() {

        return localStorage.getItem(
            THEME_KEY
        );
    }


    // -----------------------------------------------------
    // GET SYSTEM THEME
    // -----------------------------------------------------

    function getSystemTheme() {

        return window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches
            ? "dark"
            : "light";
    }


    // -----------------------------------------------------
    // APPLY THEME
    // -----------------------------------------------------

    function applyTheme(
        theme
    ) {

        if (theme === "dark") {

            document.body.classList.add(
                "dark-mode"
            );

        } else {

            document.body.classList.remove(
                "dark-mode"
            );
        }


        updateThemeIcon(
            theme
        );
    }


    // -----------------------------------------------------
    // UPDATE THEME ICON
    // -----------------------------------------------------

    function updateThemeIcon(
        theme
    ) {

        if (!themeIcon) {
            return;
        }


        if (theme === "dark") {

            themeIcon.textContent =
                "☀️";

            themeIcon.setAttribute(
                "aria-label",
                "Switch to light mode"
            );

        } else {

            themeIcon.textContent =
                "🌙";

            themeIcon.setAttribute(
                "aria-label",
                "Switch to dark mode"
            );
        }
    }


    // -----------------------------------------------------
    // INITIALIZE THEME
    // -----------------------------------------------------

    function initializeTheme() {

        const savedTheme =
            getSavedTheme();


        if (
            savedTheme === "dark" ||
            savedTheme === "light"
        ) {

            applyTheme(
                savedTheme
            );

        } else {

            // Use system preference
            applyTheme(
                getSystemTheme()
            );
        }
    }


    // -----------------------------------------------------
    // TOGGLE THEME
    // -----------------------------------------------------

    function toggleTheme() {

        const isDark =
            document.body.classList.contains(
                "dark-mode"
            );


        const newTheme =
            isDark
                ? "light"
                : "dark";


        // Apply new theme
        applyTheme(
            newTheme
        );


        // Save preference
        localStorage.setItem(
            THEME_KEY,
            newTheme
        );


        showToast(
            newTheme === "dark"
                ? "Dark mode enabled."
                : "Light mode enabled."
        );
    }


    // -----------------------------------------------------
    // THEME BUTTON
    // -----------------------------------------------------

    if (themeToggle) {

        themeToggle.addEventListener(
            "click",
            toggleTheme
        );
    }


    // -----------------------------------------------------
    // SYSTEM THEME CHANGE
    // -----------------------------------------------------

    const mediaQuery =
        window.matchMedia(
            "(prefers-color-scheme: dark)"
        );


    mediaQuery.addEventListener(
        "change",
        event => {

            // Only follow system theme
            // if user hasn't selected one manually
            if (!getSavedTheme()) {

                applyTheme(
                    event.matches
                        ? "dark"
                        : "light"
                );
            }
        }
    );


    // -----------------------------------------------------
    // TOAST
    // -----------------------------------------------------

    function showToast(
        message
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

            toast.id =
                "toast";

            toast.className =
                "toast";

            document.body.appendChild(
                toast
            );
        }


        toast.textContent =
            message;


        toast.classList.remove(
            "show"
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
                1800
            );
    }


    // -----------------------------------------------------
    // INITIALIZE
    // -----------------------------------------------------

    initializeTheme();

});