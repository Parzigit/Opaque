chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_ARTICLE_META") {
    const title = document.querySelector("h1")?.innerText || "Untitled";
    sendResponse({ title });
  }
});

document.querySelectorAll("article p").forEach(p => {
  p.style.transition = "background-color 0.3s ease";
  p.addEventListener("mouseenter", () => p.style.backgroundColor = "#fffdd0");
  p.addEventListener("mouseleave", () => p.style.backgroundColor = "transparent");
});