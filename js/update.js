(() => {
  if (!("serviceWorker" in navigator)) return;
  const banner = document.getElementById("updateBanner");
  const updateNowButton = document.getElementById("updateNowButton");
  const updateLaterButton = document.getElementById("updateLaterButton");
  let registration = null;
  let refreshing = false;
  const showUpdateMessage = () => { if (banner) banner.hidden = false; };
  const hideUpdateMessage = () => { if (banner) banner.hidden = true; };
  function watchInstallingWorker(worker) {
    if (!worker) return;
    worker.addEventListener("statechange", () => {
      if (worker.state === "installed" && navigator.serviceWorker.controller) showUpdateMessage();
    });
  }
  window.addEventListener("load", async () => {
    try {
      registration = await navigator.serviceWorker.register("./service-worker.js", { updateViaCache: "none" });
      if (registration.waiting) showUpdateMessage();
      if (registration.installing) watchInstallingWorker(registration.installing);
      registration.addEventListener("updatefound", () => watchInstallingWorker(registration.installing));
      await registration.update();
      setInterval(() => registration.update(), 60 * 60 * 1000);
    } catch (error) {
      console.warn("Verificarea actualizării nu a reușit:", error);
    }
  });
  updateNowButton?.addEventListener("click", () => {
    if (!registration?.waiting) return;
    updateNowButton.disabled = true;
    updateNowButton.textContent = "Se actualizează...";
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
  });
  updateLaterButton?.addEventListener("click", hideUpdateMessage);
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
})();
