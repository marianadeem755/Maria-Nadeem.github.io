document.addEventListener("DOMContentLoaded", function () {
  // Function to customize the header
  function customizeHeader() {
    const header = document.querySelector(".md-header");
    if (!header) return;

    // Prevent duplication if already customized
    if (header.querySelector(".custom-header-content")) return;

    // Create a wrapper without deleting original header content
    const headerContent = document.createElement("div");
    headerContent.className = "custom-header-content";
    headerContent.style.textAlign = "center";
    headerContent.style.width = "100%";

    // Site name
    const siteName = document.createElement("div");
    siteName.textContent = "AI Innovations by Maria Nadeem";
    siteName.style.fontSize = "22px";
    siteName.style.fontWeight = "bold";
    siteName.style.marginBottom = "5px";

    // Favicon
    const faviconImg = document.createElement("img");
    faviconImg.src = "images/favicon.ico";
    faviconImg.alt = "Favicon";
    faviconImg.style.maxWidth = "30px";
    faviconImg.style.height = "30px";
    faviconImg.style.marginBottom = "5px";

    // Navigation links (you must use correct final .html URLs)
    const navLinksContainer = document.createElement("div");
    navLinksContainer.style.marginTop = "5px";
    navLinksContainer.style.textAlign = "center";

    const navLinks = [
      { name: "Home", url: "../index.html" },
      { name: "About", url: "../about/" },
      { name: "Projects", url: "../projects/" },
      { name: "Skills", url: "../skills/" },
      { name: "Certifications", url: "../certifications/" },
      { name: "Resume", url: "../resume/" },
      { name: "Achievements & Future Goals", url: "../achievements/" }
    ];

    navLinks.forEach(link => {
      const navItem = document.createElement("a");
      navItem.href = link.url;
      navItem.textContent = link.name;
      navItem.style.margin = "0 10px";
      navItem.style.textDecoration = "none";
      navItem.style.color = "#fff";
      navItem.style.fontSize = "14px";
      navItem.style.fontWeight = "normal";

      navItem.addEventListener("mouseover", () => {
        navItem.style.textDecoration = "underline";
      });
      navItem.addEventListener("mouseout", () => {
        navItem.style.textDecoration = "none";
      });

      navLinksContainer.appendChild(navItem);
    });

    // Append new elements to wrapper
    headerContent.appendChild(faviconImg);
    headerContent.appendChild(siteName);
    headerContent.appendChild(navLinksContainer);

    // Append custom content without removing built-in content
    header.appendChild(headerContent);
  }

  // Function to customize the footer
  function customizeFooter() {
    if (document.querySelector(".custom-footer")) return;

    const footer = document.createElement("div");
    footer.className = "custom-footer";

    const footerIcons = document.createElement("div");
    footerIcons.className = "footer-icons";
    footerIcons.innerHTML = `
      <a href="https://github.com/marianadeem755" target="_blank" title="GitHub"><i class="fab fa-github"></i></a>
      <a href="https://www.kaggle.com/marianadeem755" target="_blank" title="Kaggle"><i class="fab fa-kaggle"></i></a>
      <a href="mailto:marianadeem755@gmail.com" title="Email"><i class="fas fa-envelope"></i></a>
    `;

    footer.appendChild(footerIcons);
    document.body.appendChild(footer);
  }

  // Observe DOM changes to reapply customization if needed
  const observer = new MutationObserver(() => {
    customizeHeader();
    customizeFooter();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Initial run
  customizeHeader();
  customizeFooter();
});
