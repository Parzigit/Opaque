chrome.runtime.onInstalled.addListener(() => {
  console.log("MediumBuddy extension installed.");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "PING") {
    sendResponse({ status: "alive" });
  }
});