const HIDDEN_FLAG_ATTR = "data-poopay-tac-hidden";

function getTarteElements() {
  if (typeof document === "undefined") return {};
  return {
    root: document.getElementById("tarteaucitronRoot"),
    alert: document.getElementById("tarteaucitronAlertBig"),
  };
}

export function hideTarteaucitronUi() {
  const { root, alert } = getTarteElements();
  if (root) {
    root.setAttribute(HIDDEN_FLAG_ATTR, "true");
    root.setAttribute("aria-hidden", "true");
    root.style.display = "none";
    root.style.pointerEvents = "none";
    root.style.opacity = "0";
  }
  if (alert) {
    alert.style.display = "none";
    alert.style.pointerEvents = "none";
    alert.style.opacity = "0";
  }
}

export function showTarteaucitronUi() {
  const { root, alert } = getTarteElements();
  if (root) {
    root.removeAttribute(HIDDEN_FLAG_ATTR);
    root.removeAttribute("aria-hidden");
    root.style.display = "";
    root.style.pointerEvents = "";
    root.style.opacity = "";
  }
  if (alert) {
    alert.style.display = "";
    alert.style.pointerEvents = "";
    alert.style.opacity = "";
  }
}
