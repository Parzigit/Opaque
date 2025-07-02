let currentWordIndex = 0;
let words = [];
let lastRate = 1;

function injectAndSendMessage(tabId, message, onSuccess) {
  chrome.scripting.executeScript({
    target: { tabId },
    files: ["content.js"]
  }, () => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Failed to send message:", chrome.runtime.lastError.message);
        return;
      }
      onSuccess(response);
    });
  });
}

function speakFromIndex(tabId, index = 0, rate = 1) {
  chrome.scripting.executeScript({
    target: { tabId },
    args: [index, rate],
    func: (startIndex, rate) => {
      if (window.ttsUtterance) {
        speechSynthesis.cancel();
      }

      const paragraphs = [...document.querySelectorAll("article p")]
        .map(p => p.textContent.trim())
        .filter(p => p && !/^(\d+|Medium Staff highlighted|Top highlight|Listen|Share|More|K|Responses|\d+\.\d+K|\d+\.\d+)$/i.test(p));

      const fullText = paragraphs.join(" ");
      const wordList = fullText.split(/\s+/);
      const remaining = wordList.slice(startIndex).join(" ");

      const utterance = new SpeechSynthesisUtterance(remaining);
      utterance.lang = "en-US";
      utterance.rate = rate;

      let currentIndex = startIndex;
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          chrome.runtime.sendMessage({ type: "UPDATE_WORD_INDEX", index: currentIndex++ });
        }
      };

      window.ttsUtterance = utterance;
      speechSynthesis.speak(utterance);
    }
  });
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "UPDATE_WORD_INDEX") {
    currentWordIndex = msg.index;
  } else if (msg.type === "SAVE_ARTICLE_DATA") {
    chrome.storage.local.get("articles", (res) => {
      const articles = res.articles || [];
      articles.push(msg.data);
      chrome.storage.local.set({ articles });
    });
  }
});

document.getElementById("read-btn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    currentWordIndex = 0;
    lastRate = 1;
    speakFromIndex(tab.id, 0, 1);
  });
});

document.getElementById("pause-btn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => speechSynthesis.pause()
    });
  });
});

document.getElementById("resume-btn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => speechSynthesis.resume()
    });
  });
});

document.getElementById("speed-range").addEventListener("input", (e) => {
  const speed = parseFloat(e.target.value);
  lastRate = speed;
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    speakFromIndex(tab.id, currentWordIndex, speed);
  });
});

document.getElementById("save-btn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    injectAndSendMessage(tab.id, { type: "GET_ARTICLE_META" }, (response) => {
      if (!response || !response.title) {
        console.error("No metadata response.");
        return;
      }

      console.log("Saving article:", response.title);

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const header = document.querySelector("h1")?.innerText || "Untitled";
          // const cont = [];
          const rem = /^(\d+|Medium Staff highlighted|Top highlight|Listen|Share|More|K|Responses|\d+\.\d+K|\d+\.\d+)$/i;
          const article = document.querySelector("article");
          const contentBlocks = [];
          if(article){
            article.querySelectorAll("p,img,a,pre,code,h2,h3,h4").forEach(element=>{
              if(element.tagName === "IMG") {
                contentBlocks.push({ type: "image", value: element.src });
              } 
              else if(element.tagName === "P") {
                const text=element.innerText.trim();
                if(!rem.test(text) && text)contentBlocks.push({type:"text",value:text });
              } 
              else if(element.tagName === "A") {
                const text=element.innerText.trim();
                const href=element.href;
                if(href && text)contentBlocks.push({type:"link",value:{text,href }});
              } 
              else if(/^H[2-4]$/.test(element.tagName)) {
                const header= element.innerText.trim();
                if(header)
                  contentBlocks.push({ type: "heading", value: header, level: element.tagName });
              } 
              else if(element.tagName === "PRE" ) {
                const code = element.textContent.trim();
                if(code)
                  contentBlocks.push({ type: "code", value: code });
              } 
              // else{
              //   const html = element.innerHTML.trim();
              //   if(html && !/^(\d+|Medium Staff highlighted|Top highlight|Listen|Share|More)$/i.test(html)) {
              //     contentBlocks.push({ type: "html", value: html });
              //   }
              // }
            });
          }
          const data = {
            header,
            content : contentBlocks,
            savedAt:new Date().toISOString()
          };
          chrome.runtime.sendMessage({ type: "SAVE_ARTICLE_DATA", data });
          alert("Article saved for offline viewing");
        }
      });
    });
  });
});

document.getElementById("view-btn").addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("view.html") });
});
