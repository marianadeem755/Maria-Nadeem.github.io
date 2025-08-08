document.addEventListener("DOMContentLoaded", () => {
  // Initial setup on page load
  init();

  // Setup Header Navigation for dynamic loading
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(link => {
    link.addEventListener('click', handleNavClick);
  });

  // Handle browser back/forward buttons
  window.addEventListener('popstate', (event) => {
    loadNewContent(window.location.pathname, false);
    updateActiveLinks(window.location.pathname);
  });

  // Initial state setup
  updateActiveLinks(window.location.pathname);
});

// Function to handle link clicks and prevent default reload
// Function to handle link clicks and prevent default reload
async function handleNavClick(event) {
  event.preventDefault();

  const targetUrl = event.currentTarget.getAttribute('href');
  if (!targetUrl || targetUrl.startsWith('#')) return; // Ignore anchor links

  // Construct a consistent, absolute URL for pushState
  let absoluteUrl = new URL(targetUrl, window.location.origin).pathname;

  // Ensure root path is consistent
  if (absoluteUrl === '/' || absoluteUrl === '/index.html') {
    absoluteUrl = '/';
  }

  // Add loading animation to clicked button
  const clickedButton = event.currentTarget;
  clickedButton.style.transform = 'scale(0.95)';
  clickedButton.style.opacity = '0.7';

  setTimeout(() => {
    clickedButton.style.transform = '';
    clickedButton.style.opacity = '';
  }, 150);

  // Use pushState to update the URL in the browser without a reload
  window.history.pushState({}, '', absoluteUrl);

  // Load new content
  await loadNewContent(targetUrl);

  // Update active state of links with the consistent URL
  updateActiveLinks(absoluteUrl);

  // Re-run the TOC and other init functions after content loads
  setTimeout(createLeftSidebarTOC, 100);
}
// Function to fetch and replace page content
async function loadNewContent(url, scrollToTop = true) {
  try {
    // Determine the base path for fetching content
    // This removes the leading '/' to make the path relative
    let path = url.startsWith('/') ? url.substring(1) : url;

    // Handle the root path specifically for index.html
    if (path === '' || path === '.') {
      path = 'index.html';
    } else if (!path.endsWith('.html')) {
      // Ensure all other links point to a proper .html file
      path = path + '.html';
    }

    console.log('Fetching URL:', path);

    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html = await response.text();
    const parser = new DOMParser();
    const newDoc = parser.parseFromString(html, 'text/html');

    const newContentElement = newDoc.querySelector('.md-content__inner');
    const mainContentElement = document.querySelector('.md-content__inner');

    if (mainContentElement && newContentElement) {
      mainContentElement.innerHTML = newContentElement.innerHTML;
    } else {
      console.warn('Cannot find content container in current page or new page.');
    }

    if (scrollToTop) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }

  } catch (error) {
    console.error('Failed to load new content:', error);
    // Fallback to a full page reload if dynamic load fails
    window.location.href = url;
  }
}

// Helper to attach listeners to nav links
function attachNavLinkListeners() {
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(link => {
    link.addEventListener('click', handleNavClick);

    // Add enhanced button interactions
    link.addEventListener('mouseenter', handleButtonHover);
    link.addEventListener('mouseleave', handleButtonLeave);
    link.addEventListener('mousedown', handleButtonPress);
    link.addEventListener('mouseup', handleButtonRelease);
  });
}

// Enhanced button interactions
function handleButtonHover(event) {
  const button = event.currentTarget;
  if (!button.classList.contains('active')) {
    button.style.transform = 'translateY(-2px) scale(1.02)';
  }
}

function handleButtonLeave(event) {
  const button = event.currentTarget;
  if (!button.classList.contains('active')) {
    button.style.transform = 'translateY(0) scale(1)';
  }
}

function handleButtonPress(event) {
  const button = event.currentTarget;
  button.style.transform = 'translateY(0) scale(0.98)';
}

function handleButtonRelease(event) {
  const button = event.currentTarget;
  if (button.classList.contains('active')) {
    button.style.transform = 'translateY(-1px) scale(1)';
  } else {
    button.style.transform = 'translateY(-2px) scale(1.02)';
  }
}

// Helper to attach listeners to TOC links
function attachTocLinkListeners() {
  const newTocLinks = document.querySelectorAll('.toc-list a');
  newTocLinks.forEach(link => {
    link.addEventListener('click', handleTocLinkClick);
  });
}

function handleTocLinkClick(event) {
  event.preventDefault();
  event.stopPropagation();
  const headingId = event.currentTarget.getAttribute('data-heading-id');
  const target = document.getElementById(headingId);

  if (target) {
    window.disableScrollTracking();
    const headerHeight = 110; // Updated for new header height
    const targetPosition = target.offsetTop - headerHeight;

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });

    window.updateActiveTOCItem(event.currentTarget);

    setTimeout(() => {
      window.enableScrollTracking();
    }, 1000);

    if (window.innerWidth <= 480) {
      setTimeout(() => {
        window.closeTOC();
      }, 800);
    }
  }
}

// Function to manage which links are "active" with enhanced animations
function updateActiveLinks(currentPath) {
  const allLinks = document.querySelectorAll('.nav-links a, .toc-list a');
  allLinks.forEach(link => {
    link.classList.remove('active');

    // Reset nav button styles
    if (link.closest('.nav-links')) {
      link.style.transform = 'translateY(0) scale(1)';
    }

    try {
      const linkPath = new URL(link.href).pathname;
      if (linkPath === currentPath) {
        link.classList.add('active');

        // Add active animation for nav buttons
        if (link.closest('.nav-links')) {
          link.style.transform = 'translateY(-1px) scale(1)';

          // Add a subtle pulse effect for active button
          setTimeout(() => {
            link.style.animation = 'activeButtonPulse 2s ease-in-out infinite';
          }, 100);
        }
      }
    } catch (e) {
      // In case of invalid URLs or local anchors
    }
  });
}

// Global state management
let tocState = {
  isOpen: false,
  currentPage: '',
  headings: [],
  observer: null
};

function getCurrentPage() {
  const path = window.location.pathname.toLowerCase();
  const url = window.location.href.toLowerCase();

  // Correctly check the path to match the new URL format
  if (path === '/' || path.includes('/index.html')) {
    return 'home';
  }
  if (path.includes('/about.html')) return 'about';
  if (path.includes('/projects.html')) return 'projects';
  if (path.includes('/skills.html')) return 'skills';
  if (path.includes('/certifications.html')) return 'certifications';
  if (path.includes('/resume.html')) return 'resume';
  if (path.includes('/experience.html')) return 'experience';
  if (path.includes('/achievements.html')) return 'achievements';

  // Fallback
  return 'home';
}

function createLeftSidebarTOC() {
  const currentPage = getCurrentPage();
  const existingSidebar = document.querySelector('.custom-sidebar-toc');
  const existingToggle = document.querySelector('.toc-toggle-btn');

  if (tocState.currentPage === currentPage && existingSidebar && existingToggle) {
    updateTOCContent();
    return;
  }

  if (existingSidebar) existingSidebar.remove();
  if (existingToggle) existingToggle.remove();
  if (tocState.observer) tocState.observer.disconnect();

  tocState.currentPage = currentPage;
  tocState.isOpen = false;

  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');

  const contentHeadings = Array.from(headings).filter(heading => {
    const computedStyle = window.getComputedStyle(heading);
    const isHidden = computedStyle.display === 'none' || computedStyle.visibility === 'hidden';
    const isMainTitle = heading.matches('.md-typeset > h1:first-child, .md-content__inner > h1:first-child, article > h1:first-child, .md-content__title, .md-typeset h1:first-of-type');
    return !isHidden && !isMainTitle && heading.textContent.trim().length > 0;
  });

  tocState.headings = contentHeadings;

  if (contentHeadings.length === 0) return;

  const sidebar = document.createElement('div');
  sidebar.className = 'custom-sidebar-toc';

  // Completely new TOC toggle button design
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'toc-toggle-btn';
  toggleBtn.setAttribute('aria-label', 'Toggle Table of Contents');
  toggleBtn.innerHTML = `
    <svg class="hamburger-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="line top-line" d="M4 6H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path class="line middle-line" d="M4 12H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path class="line bottom-line" d="M4 18H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  const sidebarHeader = document.createElement('div');
  sidebarHeader.className = 'toc-header';
  sidebarHeader.innerHTML = '<i class="fas fa-list-ul"></i> Table of Contents';

  const tocList = document.createElement('div');
  tocList.className = 'toc-list';

  contentHeadings.forEach((heading, index) => {
    if (!heading.id) {
      const cleanText = heading.textContent
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim()
        .substring(0, 50);
      heading.id = `heading-${index}-${cleanText}`;
    }

    const tocItem = document.createElement('a');
    tocItem.href = `#${heading.id}`;
    tocItem.textContent = heading.textContent.trim();
    const level = parseInt(heading.tagName.substring(1));
    tocItem.setAttribute('data-level', level);
    tocItem.setAttribute('data-heading-id', heading.id);
    tocItem.addEventListener('click', handleTocLinkClick);
    tocList.appendChild(tocItem);
  });

  sidebar.appendChild(sidebarHeader);
  sidebar.appendChild(tocList);

  function openTOC() {
    sidebar.classList.add('open');
    toggleBtn.classList.add('open');
    const topLine = toggleBtn.querySelector('.top-line');
    const middleLine = toggleBtn.querySelector('.middle-line');
    const bottomLine = toggleBtn.querySelector('.bottom-line');
    if (topLine && middleLine && bottomLine) {
      topLine.setAttribute('d', 'M6 6L18 18');
      middleLine.style.opacity = '0';
      bottomLine.setAttribute('d', 'M6 18L18 6');
    }
    document.body.classList.add('toc-open');
    tocState.isOpen = true;
  }

  function closeTOC() {
    sidebar.classList.remove('open');
    toggleBtn.classList.remove('open');
    const topLine = toggleBtn.querySelector('.top-line');
    const middleLine = toggleBtn.querySelector('.middle-line');
    const bottomLine = toggleBtn.querySelector('.bottom-line');
    if (topLine && middleLine && bottomLine) {
      topLine.setAttribute('d', 'M4 6H20');
      middleLine.style.opacity = '1';
      bottomLine.setAttribute('d', 'M4 18H20');
    }
    document.body.classList.remove('toc-open');
    tocState.isOpen = false;
  }

  window.closeTOC = closeTOC;
  window.openTOC = openTOC;

  toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (tocState.isOpen) {
      closeTOC();
    } else {
      openTOC();
    }
  });

  document.addEventListener('click', (e) => {
    if (tocState.isOpen &&
      !sidebar.contains(e.target) &&
      e.target !== toggleBtn &&
      !e.target.closest('.toc-toggle-btn') &&
      !e.target.closest('.custom-sidebar-toc')) {

      if (window.innerWidth > 768) {
        closeTOC();
      }
    }
  }, {
    passive: true
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && tocState.isOpen) {
      closeTOC();
    }
  });

  function updateActiveTOCItem(activeItem = null) {
    const allItems = tocList.querySelectorAll('a');
    allItems.forEach(item => {
      item.classList.remove('active');
      item.style.background = 'transparent';
      item.style.borderLeftColor = 'transparent';
      item.style.color = '#cbd5e1';
      item.style.transform = 'translateX(0)';
      item.style.fontWeight = item.getAttribute('data-level') === '1' ? '700' : '500';
      item.style.boxShadow = 'none';
    });

    if (activeItem) {
      activeItem.classList.add('active');
      activeItem.style.background = 'rgba(99, 102, 241, 0.25)';
      activeItem.style.borderLeftColor = '#6366f1';
      activeItem.style.color = '#f8fafc';
      activeItem.style.fontWeight = '600';
      activeItem.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.3)';
    }
  }

  window.updateActiveTOCItem = updateActiveTOCItem;

  let scrollTrackingEnabled = true;
  let scrollTimeout;

  function disableScrollTracking() {
    scrollTrackingEnabled = false;
  }

  function enableScrollTracking() {
    scrollTrackingEnabled = true;
  }

  window.disableScrollTracking = disableScrollTracking;
  window.enableScrollTracking = enableScrollTracking;

  function updateActiveSection() {
    if (!scrollTrackingEnabled) return;
    const scrollPos = window.scrollY + 150;
    let activeHeading = null;
    for (let i = contentHeadings.length - 1; i >= 0; i--) {
      const heading = contentHeadings[i];
      if (!heading.offsetParent) continue;
      const headingTop = heading.offsetTop;
      if (scrollPos >= headingTop - 50) {
        activeHeading = heading;
        break;
      }
    }

    if (activeHeading) {
      const activeLink = tocList.querySelector(`a[data-heading-id="${activeHeading.id}"]`);
      if (activeLink && !activeLink.classList.contains('active')) {
        updateActiveTOCItem(activeLink);
        if (tocState.isOpen) {
          activeLink.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest'
          });
        }
      }
    }
  }

  let isScrolling = false;
  const scrollHandler = () => {
    if (!isScrolling && scrollTrackingEnabled) {
      window.requestAnimationFrame(() => {
        updateActiveSection();
        isScrolling = false;
      });
      isScrolling = true;
    }
  };

  window.removeEventListener('scroll', window.tocScrollHandler);
  window.tocScrollHandler = scrollHandler;
  window.addEventListener('scroll', scrollHandler, {
    passive: true
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && tocState.isOpen) {
      document.body.classList.add('toc-open');
    } else if (window.innerWidth <= 768 && tocState.isOpen) {
      document.body.classList.remove('toc-open');
    }
  });

  document.body.appendChild(sidebar);
  document.body.appendChild(toggleBtn);

  setTimeout(() => {
    if (scrollTrackingEnabled) {
      updateActiveSection();
    }
  }, 500);
  console.log(`TOC created for ${currentPage} with ${contentHeadings.length} headings`);
}

function updateTOCContent() {
  const sidebar = document.querySelector('.custom-sidebar-toc');
  const tocList = sidebar?.querySelector('.toc-list');

  if (!tocList) return;
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const contentHeadings = Array.from(headings).filter(heading => {
    const computedStyle = window.getComputedStyle(heading);
    const isHidden = computedStyle.display === 'none' || computedStyle.visibility === 'hidden';
    const isMainTitle = heading.matches('.md-typeset > h1:first-child, .md-content__inner > h1:first-child, article > h1:first-child, .md-content__title, .md-typeset h1:first-of-type');
    return !isHidden && !isMainTitle && heading.textContent.trim().length > 0;
  });

  tocState.headings = contentHeadings;

  if (contentHeadings.length === 0) {
    sidebar.style.display = 'none';
    const toggleBtn = document.querySelector('.toc-toggle-btn');
    if (toggleBtn) toggleBtn.style.display = 'none';
    return;
  } else {
    sidebar.style.display = 'block';
    const toggleBtn = document.querySelector('.toc-toggle-btn');
    if (toggleBtn) toggleBtn.style.display = 'flex';
  }

  tocList.innerHTML = '';

  contentHeadings.forEach((heading, index) => {
    if (!heading.id) {
      const cleanText = heading.textContent
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim()
        .substring(0, 50);
      heading.id = `heading-${index}-${cleanText}`;
    }

    const tocItem = document.createElement('a');
    tocItem.href = `#${heading.id}`;
    tocItem.textContent = heading.textContent.trim();
    const level = parseInt(heading.tagName.substring(1));
    tocItem.setAttribute('data-level', level);
    tocItem.setAttribute('data-heading-id', heading.id);
    tocItem.addEventListener('click', handleTocLinkClick);
    tocList.appendChild(tocItem);
  });

  setTimeout(() => {
    if (window.enableScrollTracking) {
      const event = new Event('scroll');
      window.dispatchEvent(event);
    }
  }, 200);
}

function createHeader() {
  const header = document.querySelector(".md-header");
  if (!header) return;
  if (header.querySelector(".custom-header-content")) return;

  header.innerHTML = '';
  const gradientLine = document.createElement("div");
  gradientLine.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #6366f1, #f59e0b, #e11d48, #8b5cf6);
    background-size: 300% 300%;
    animation: gradientShift 4s ease-in-out infinite;
  `;
  header.appendChild(gradientLine);

  const headerContent = document.createElement("div");
  headerContent.className = "custom-header-content";

  const brand = document.createElement("div");
  brand.className = "header-brand";

  const logo = document.createElement("div");
  logo.className = "header-logo";
  logo.innerHTML = '<span style="font-size: 24px; line-height: 1;">👩🏻‍💻</span>';

  const title = document.createElement("div");
  title.className = "header-title";
  title.innerHTML = "Maria Nadeem | AI & ML Engineer";

  brand.appendChild(logo);
  brand.appendChild(title);
  const nav = document.createElement("div");
  nav.className = "nav-links";

  // Use absolute paths for the links
  const links = [
    { name: "🏠 Home", url: "index.html", key: "home" },
    { name: "👤 About", url: "about.html", key: "about" },
    { name: "💼 Projects", url: "projects.html", key: "projects" },
    { name: "🛠️ Skills", url: "skills.html", key: "skills" },
    { name: "📜 Certifications", url: "certifications.html", key: "certifications" },
    { name: "📄 Resume", url: "resume.html", key: "resume" },
    { name: "💻 Experience", url: "experience.html", key: "experience" },
    { name: "🏆 Achievements", url: "achievements.html", key: "achievements" }
  ];

  const currentPage = getCurrentPage();

  links.forEach(link => {
    const a = document.createElement("a");
    a.href = link.url;
    a.textContent = link.name;
    if (link.key === currentPage) {
      a.classList.add('active');
    }

    a.addEventListener('mouseenter', handleButtonHover);
    a.addEventListener('mouseleave', handleButtonLeave);
    a.addEventListener('mousedown', handleButtonPress);
    a.addEventListener('mouseup', handleButtonRelease);

    a.addEventListener('click', function(e) {
      nav.querySelectorAll('a').forEach(navLink => {
        navLink.classList.remove('active');
        navLink.style.animation = '';
      });
      this.classList.add('active');

      if (window.closeTOC) {
        window.closeTOC();
      }
    });

    nav.appendChild(a);
  });

  headerContent.appendChild(brand);
  headerContent.appendChild(nav);
  header.appendChild(headerContent);

  setTimeout(() => {
    attachNavLinkListeners();
  }, 100);
}

function createFooter() {
  const existingFooters = document.querySelectorAll(".custom-footer");
  existingFooters.forEach(footer => footer.remove());

  const footer = document.createElement("div");
  footer.className = "custom-footer";

  footer.style.cssText = `
    background: #0f172a !important;
    border-top: 1px solid #334155 !important;
    padding: 25px 20px 15px !important;
    margin-top: 60px !important;
    text-align: center !important;
    width: 100% !important;
    position: relative !important;
    z-index: 100 !important;
  `;

  const icons = document.createElement("div");
  icons.className = "footer-icons";
  icons.style.cssText = `
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    gap: 15px !important;
    margin-bottom: 12px !important;
    flex-wrap: wrap !important;
  `;

  const socialLinks = [
    {
      href: "https://github.com/marianadeem755",
      icon: "fab fa-github",
      title: "GitHub"
    },
    {
      href: "https://www.linkedin.com/in/marianadeem755",
      icon: "fab fa-linkedin-in",
      title: "LinkedIn"
    },
    {
      href: "https://www.kaggle.com/marianadeem755",
      icon: "fab fa-kaggle",
      title: "Kaggle"
    },
    {
      href: "mailto:marianadeem755@gmail.com",
      icon: "fas fa-envelope",
      title: "Email"
    }
  ];

  socialLinks.forEach(link => {
    const a = document.createElement("a");
    a.href = link.href;
    a.target = link.href.startsWith('mailto:') ? '' : '_blank';
    a.title = link.title;
    a.rel = link.href.startsWith('mailto:') ? '' : 'noopener noreferrer';
    a.style.cssText = `
      width: 40px !important;
      height: 40px !important;
      min-width: 40px !important;
      min-height: 40px !important;
      max-width: 40px !important;
      max-height: 40px !important;
      background: #1e293b !important;
      border-radius: 50% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      color: #f8fafc !important;
      font-size: 16px !important;
      text-decoration: none !important;
      transition: all 0.3s ease !important;
      border: 1px solid #334155 !important;
      box-sizing: border-box !important;
      overflow: hidden !important;
    `;

    const i = document.createElement("i");
    i.className = link.icon;
    i.style.cssText = `
      font-size: 16px !important;
      line-height: 1 !important;
      width: 16px !important;
      height: 16px !important;
      display: block !important;
    `;

    a.appendChild(i);

    a.addEventListener('mouseenter', () => {
      a.style.background = '#6366f1 !important';
      a.style.transform = 'translateY(-2px) scale(1.05) !important';
      a.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4) !important';
      a.style.color = 'white !important';
    });

    a.addEventListener('mouseleave', () => {
      a.style.background = '#1e293b !important';
      a.style.transform = 'none !important';
      a.style.boxShadow = 'none !important';
      a.style.color = '#f8fafc !important';
    });

    icons.appendChild(a);
  });

  const text = document.createElement("div");
  text.className = "footer-text";
  text.style.cssText = `
    font-size: 14px !important;
    color: #94a3b8 !important;
    margin-top: 10px !important;
  `;
  text.innerHTML = "© 2024 Maria Nadeem | AI & ML Engineer. Built with passion for innovation.";

  footer.appendChild(icons);
  footer.appendChild(text);

  document.body.appendChild(footer);
}

function hidePageTitles() {
  const pageTitleSelectors = [
    '.md-content__title',
    '.md-typeset > h1:first-child',
    'article > h1:first-child',
    '.md-content__inner > h1:first-child'
  ];
  pageTitleSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.style.display = 'none';
      el.style.visibility = 'hidden';
      el.style.height = '0';
      el.style.margin = '0';
      el.style.padding = '0';
      el.style.overflow = 'hidden';
    });
  });
}

function ensureConsistentTheme() {
  const body = document.body;
  const html = document.documentElement;

  body.style.background = 'linear-gradient(135deg, #020617 0%, #0f172a 100%)';
  body.style.color = '#f8fafc';
  html.style.background = 'linear-gradient(135deg, #020617 0%, #0f172a 100%)';

  const elementsToHide = [
    '.md-sidebar', '.md-sidebar--primary', '.md-sidebar--secondary',
    '.md-nav--primary', '.md-nav--secondary', '.md-nav__title',
    '.md-nav__item', '.md-nav__link', '.md-search', '.md-search__form',
    '.md-search__input', '.md-tabs', '.md-tabs__list', '.md-tabs__item',
    '.md-tabs__link', '.md-header-nav__topic', '.md-header-nav__button',
    '.md-header__title', '.md-header-nav__title'
  ];

  elementsToHide.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.style.display = 'none';
      el.style.visibility = 'hidden';
    });
  });
}

document.addEventListener('click', function(e) {
  if (e.target.tagName === 'A' && e.target.getAttribute('href')?.startsWith('#') && !e.target.closest('.toc-list')) {
    e.preventDefault();
    const target = document.querySelector(e.target.getAttribute('href'));
    if (target) {
      const headerHeight = 110;
      const targetPosition = target.offsetTop - headerHeight;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  }
});

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function init() {
  try {
    ensureConsistentTheme();
    createHeader();
    createFooter();
    addDynamicStyles();
    setTimeout(hidePageTitles, 100);
    setTimeout(createLeftSidebarTOC, 200);
    updateActiveLinks(window.location.pathname);
  } catch (error) {
    console.warn('Portfolio initialization error:', error);
  }
}

function addDynamicStyles() {
  if (!document.getElementById('dynamic-button-styles')) {
    const style = document.createElement('style');
    style.id = 'dynamic-button-styles';
    style.textContent = `
      @keyframes activeButtonPulse {
        0%, 100% {
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
        }
        50% {
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.6);
        }
      }
      @keyframes gradientShift {
        0%, 100% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
      }
      .nav-links a:focus-visible {
        outline: 2px solid #6366f1 !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2) !important;
      }
      .toc-toggle-btn .line {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: center;
      }`;
    document.head.appendChild(style);
  }
}

const debouncedInit = debounce(() => {
  const newPage = getCurrentPage();
  if (newPage !== tocState.currentPage) {
    console.log(`Page changed from ${tocState.currentPage} to ${newPage}. Re-initializing.`);
    init();
  } else {
    console.log('Content changed on the same page. Updating TOC.');
    updateTOCContent();
  }
}, 300);

const observer = new MutationObserver(function(mutations) {
  let shouldReinit = false;
  mutations.forEach(function(mutation) {
    if (mutation.type === 'childList' && mutation.target.matches('.md-content, .md-main__inner')) {
      shouldReinit = true;
    }
  });

  if (shouldReinit) {
    debouncedInit();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

window.addEventListener('load', init);
window.addEventListener('popstate', debouncedInit);

document.addEventListener('keydown', function(e) {
  if (e.key === 'Tab') {
    document.body.classList.add('keyboard-navigation');
  }
});

document.addEventListener('mousedown', function() {
  document.body.classList.remove('keyboard-navigation');
});

const keyboardStyle = document.createElement('style');
keyboardStyle.textContent = `
  .keyboard-navigation *:focus {
    outline: 2px solid #6366f1 !important;
    outline-offset: 2px !important;
  }
  .keyboard-navigation .nav-links a:focus {
    transform: translateY(-2px) scale(1.02) !important;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3) !important;
  }
`;
document.head.appendChild(keyboardStyle);