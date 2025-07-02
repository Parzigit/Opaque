chrome.storage.local.get("articles", ({ articles }) => {
  const container = document.getElementById("article-container");

  if (!articles || articles.length === 0) {
    container.textContent = "No saved articles found.";
    return;
  }

  const latest = articles[articles.length - 1];

  const articleDiv = document.createElement("div");
  articleDiv.className = "article-card";

  const heading = document.createElement("h2");
  heading.textContent = latest.header;
  articleDiv.appendChild(heading);

  const timestamp = document.createElement("p");
  timestamp.className = "timestamp";
  timestamp.textContent = `🕒 Saved on ${new Date(latest.savedAt).toLocaleString()}`;
  articleDiv.appendChild(timestamp);

  latest.content.forEach(block => {
    if(block.type === "image") {
      const img = document.createElement("img");
      img.src = block.value;
      img.style.maxWidth = "100%";
      img.style.margin = "10px 0";
      articleDiv.appendChild(img);
    }
    else if(block.type === "link") {
      const p = document.createElement("p");
      p.href = block.value.href;
      p.target = "_blank";
      p.textContent = block.value.text;
      p.rel="noopener noreferrer";
      const a = document.createElement("a");
      a.appendChild(p);
      articleDiv.appendChild(a);  
    }
    else if(block.type === "code") {
      const pre = document.createElement("pre");
      const code = document.createElement("code");
      code.textContent = block.value;
      pre.appendChild(code);
      pre.style.background="#f4f4f4";
      pre.style.padding="10px";
      pre.style.borderRadius="5px";
      pre.style.overflowX="auto";
      articleDiv.appendChild(pre);  
    }
    else if(block.type === "heading") {
      const p = document.createElement(block.level.toLowerCase());
      p.textContent=block.value;
      articleDiv.appendChild(p);  
    }
    else if(block.type === "html") {
      const p = document.createElement("p");
      p.innerHTML=block.value;
      articleDiv.appendChild(p);  
    }
    else if(block.type === "text") {
      const p = document.createElement("p");
      p.textContent=block.value;
      articleDiv.appendChild(p);  
    }
  });

  container.appendChild(articleDiv);
});

document.getElementById("export-html").addEventListener("click", () => {
  const blob = new Blob([document.documentElement.outerHTML], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "article.html";
  a.click();
});

document.getElementById("export-md").addEventListener("click", () => {
  chrome.storage.local.get("articles", ({ articles }) => {
    if (!articles || articles.length === 0) return;

    const latest = articles[articles.length - 1];
    const mdContent = [
      `# ${latest.header}`,
      '',
      ...latest.content.filter(b => b.type === "text").map(b => b.value)
    ].join('\n\n');

    const blob = new Blob([mdContent], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "article.md";
    a.click();
  });
});
