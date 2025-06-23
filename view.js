chrome.storage.local.get("articles", ({ articles }) => {
    const container = document.getElementById("article-container");
  
    if (!articles || articles.length === 0) {
      container.innerHTML = "<p>No saved articles found.</p>";
      return;
    }
    const latest = articles[articles.length - 1];
  
    const articleDiv = document.createElement("div");
    articleDiv.className = "article-card";
    articleDiv.innerHTML = `
      <h2>${latest.header}</h2>
      <p class="timestamp">🕒Saved on ${new Date(latest.savedAt).toLocaleString()}</p>
      <div class="content">
        ${latest.para.map(p => `<p>${p}</p>`).join("")}
        ${latest.img.map(src => `<img src="${src}" />`).join("")}
      </div>
    `;
    container.appendChild(articleDiv);
    document.getElementById("export-html").addEventListener("click", () => {
      const blob = new Blob([document.documentElement.outerHTML], { type: "text/html" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "article.html";
      a.click();
    });
  
    document.getElementById("export-md").addEventListener("click", () => {
      const md = `# ${latest.header}\n\n` + latest.para.join('\n\n');
      const blob = new Blob([md], { type: "text/markdown" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "article.md";
      a.click();
    });
  });
  