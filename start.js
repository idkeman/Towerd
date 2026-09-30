/* Towerd startup bridge — keeps the start control independent from the game UI bindings. */
(() => {
  "use strict";

  function launch() {
    if (typeof window.towerdStart === "function") {
      window.towerdStart();
      return;
    }
    window.setTimeout(launch, 50);
  }

  document.addEventListener("click", event => {
    const button = event.target.closest("#startButton");
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    launch();
  }, true);
})();