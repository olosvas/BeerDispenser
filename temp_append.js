
    if (initialScreen) {
        restoreUIState(initialScreen);
    }

    // Add event listener for language switch to save state
    const languageSwitchBtn = document.getElementById("language-switch-btn");
    if (languageSwitchBtn) {
        languageSwitchBtn.addEventListener("click", function() {
            saveStateToServer();
        });
    }
});
