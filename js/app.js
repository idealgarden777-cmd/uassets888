const els = {
  heroSearch: document.getElementById("heroSearch"),
  librarySearch: document.getElementById("librarySearch"),

  filters: document.getElementById("filters"),
  iconGrid: document.getElementById("iconGrid"),
  emptyState: document.getElementById("emptyState"),

  iconOverlay: document.getElementById("iconOverlay"),
  beanOverlay: document.getElementById("beanOverlay"),

  iconPreview: document.getElementById("iconPreview"),
  detailCategory: document.getElementById("detailCategory"),
  detailName: document.getElementById("detailName"),
  detailDescription: document.getElementById("detailDescription"),
  detailTags: document.getElementById("detailTags"),

  svgCode: document.getElementById("svgCode"),
  codeLabel: document.getElementById("codeLabel"),

  copySvg: document.getElementById("copySvg"),
  downloadSvg: document.getElementById("downloadSvg"),

  openBean: document.getElementById("openBean"),
  beanForm: document.getElementById("beanForm"),

  toast: document.getElementById("toast"),
  proButton: document.getElementById("proButton")
};

let activeCategory = "All";
let selectedIcon = null;
let activeCodeTab = "svg";

let beanUser = null;
let beanLogoutButton = null;

const BEAN_API_BASE =
  "https://accounts.signaturesi.com";


/* =========================================================
   CATEGORIES
   ========================================================= */

const categories = [
  "All",
  ...new Set(
    ICONS.map(icon => icon.category)
  )
];


/* =========================================================
   SEARCH
   ========================================================= */

function getSearchTerm() {
  return els.librarySearch.value
    .trim()
    .toLowerCase();
}


/* =========================================================
   FILTERS
   ========================================================= */

function renderFilters() {
  els.filters.innerHTML =
    categories
      .map(
        category => `
          <button
            type="button"
            class="filter ${
              category === activeCategory
                ? "active"
                : ""
            }"
            data-category="${category}"
          >
            ${category}
          </button>
        `
      )
      .join("");

  els.filters
    .querySelectorAll("[data-category]")
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          activeCategory =
            button.dataset.category;

          renderFilters();

          renderIcons(
            getSearchTerm()
          );
        }
      );
    });
}


/* =========================================================
   ICON MATCHING
   ========================================================= */

function matchesIcon(icon, term) {
  if (
    activeCategory !== "All" &&
    icon.category !== activeCategory
  ) {
    return false;
  }

  if (!term) {
    return true;
  }

  const searchableText = [
    icon.name,
    icon.category,
    ...icon.tags
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(term);
}


/* =========================================================
   ICON GRID
   ========================================================= */

function renderIcons(term = "") {
  const visibleIcons =
    ICONS.filter(icon =>
      matchesIcon(icon, term)
    );

  els.iconGrid.innerHTML =
    visibleIcons
      .map(
        icon => `
          <button
            type="button"
            class="icon-card"
            data-icon="${icon.id}"
            aria-label="Open ${icon.name} icon"
          >
            <div class="icon-draw">
              ${icon.svg}
            </div>

            <div>
              <div class="icon-title">
                ${icon.name}
              </div>

              <div class="icon-category">
                ${icon.category}
              </div>
            </div>
          </button>
        `
      )
      .join("");

  els.emptyState.classList.toggle(
    "hidden",
    visibleIcons.length !== 0
  );

  els.iconGrid
    .querySelectorAll("[data-icon]")
    .forEach(card => {
      card.addEventListener(
        "click",
        () => {
          openIcon(
            card.dataset.icon
          );
        }
      );
    });
}


/* =========================================================
   REACT CODE
   ========================================================= */

function toComponentName(name) {
  return name
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .map(
      word =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join("");
}

function getReactCode(icon) {
  const componentName =
    toComponentName(icon.name);

  return `const ${componentName} = () => (
  ${icon.svg}
);`;
}


/* =========================================================
   HTML CODE
   ========================================================= */

function getHtmlCode(icon) {
  return icon.svg;
}


/* =========================================================
   ACTIVE CODE
   ========================================================= */

function getActiveCode() {
  if (!selectedIcon) {
    return "";
  }

  switch (activeCodeTab) {
    case "react":
      return getReactCode(
        selectedIcon
      );

    case "html":
      return getHtmlCode(
        selectedIcon
      );

    case "svg":
    default:
      return selectedIcon.svg;
  }
}


/* =========================================================
   OPEN ICON
   ========================================================= */

function openIcon(id) {
  const icon =
    ICONS.find(
      item => item.id === id
    );

  if (!icon) {
    return;
  }

  selectedIcon = icon;
  activeCodeTab = "svg";

  els.iconPreview.innerHTML =
    icon.svg;

  els.detailCategory.textContent =
    icon.category.toUpperCase();

  els.detailName.textContent =
    icon.name;

  els.detailDescription.textContent =
    icon.description;

  els.detailTags.innerHTML =
    icon.tags
      .map(
        tag =>
          `<span class="tag">${tag}</span>`
      )
      .join("");

  updateCodeTabs();
  updateCodePanel();

  els.iconOverlay.classList.remove(
    "hidden"
  );

  document.body.classList.add(
    "modal-open"
  );
}


/* =========================================================
   CODE TABS
   ========================================================= */

function updateCodeTabs() {
  document
    .querySelectorAll(
      "[data-code-tab]"
    )
    .forEach(tab => {
      tab.classList.toggle(
        "active",
        tab.dataset.codeTab ===
          activeCodeTab
      );
    });
}

function updateCodePanel() {
  const labels = {
    svg: "SVG",
    react: "React",
    html: "HTML"
  };

  els.codeLabel.textContent =
    labels[activeCodeTab];

  els.svgCode.textContent =
    getActiveCode();
}

document
  .querySelectorAll(
    "[data-code-tab]"
  )
  .forEach(tab => {
    tab.addEventListener(
      "click",
      () => {
        activeCodeTab =
          tab.dataset.codeTab;

        updateCodeTabs();
        updateCodePanel();
      }
    );
  });


/* =========================================================
   CLOSE MODALS
   ========================================================= */

function closeOverlay(id) {
  const overlay =
    document.getElementById(id);

  if (!overlay) {
    return;
  }

  overlay.classList.add(
    "hidden"
  );

  if (
    els.iconOverlay.classList.contains(
      "hidden"
    ) &&
    els.beanOverlay.classList.contains(
      "hidden"
    )
  ) {
    document.body.classList.remove(
      "modal-open"
    );
  }
}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message) {
  els.toast.textContent =
    message;

  els.toast.classList.remove(
    "hidden"
  );

  clearTimeout(
    showToast.timer
  );

  showToast.timer =
    setTimeout(
      () => {
        els.toast.classList.add(
          "hidden"
        );
      },
      1800
    );
}


/* =========================================================
   SEARCH SYNC
   ========================================================= */

function syncSearch(
  source,
  target
) {
  target.value =
    source.value;

  renderIcons(
    getSearchTerm()
  );
}

els.heroSearch.addEventListener(
  "input",
  () => {
    syncSearch(
      els.heroSearch,
      els.librarySearch
    );
  }
);

els.librarySearch.addEventListener(
  "input",
  () => {
    syncSearch(
      els.librarySearch,
      els.heroSearch
    );
  }
);


/* =========================================================
   COPY CODE
   ========================================================= */

async function copyCurrentCode() {
  const code =
    getActiveCode();

  if (!code) {
    return;
  }

  try {
    await navigator.clipboard.writeText(
      code
    );

    showToast(
      `${activeCodeTab.toUpperCase()} copied`
    );

  } catch (error) {
    console.error(
      "Copy error:",
      error
    );

    showToast(
      "Copy failed"
    );
  }
}

els.copySvg.addEventListener(
  "click",
  copyCurrentCode
);


/* =========================================================
   DOWNLOAD SVG
   ========================================================= */

function downloadSelectedSvg() {
  if (!selectedIcon) {
    return;
  }

  const blob =
    new Blob(
      [selectedIcon.svg],
      {
        type:
          "image/svg+xml;charset=utf-8"
      }
    );

  const url =
    URL.createObjectURL(
      blob
    );

  const link =
    document.createElement(
      "a"
    );

  link.href = url;

  link.download =
    `${selectedIcon.id}.svg`;

  document.body.appendChild(
    link
  );

  link.click();

  link.remove();

  URL.revokeObjectURL(
    url
  );

  showToast(
    "SVG downloaded"
  );
}

els.downloadSvg.addEventListener(
  "click",
  downloadSelectedSvg
);


/* =========================================================
   BEAN API REQUEST
   ========================================================= */

async function beanRequest(
  path,
  options = {}
) {
  const headers =
    new Headers(
      options.headers || {}
    );

  if (
    options.body &&
    !headers.has(
      "Content-Type"
    )
  ) {
    headers.set(
      "Content-Type",
      "application/json"
    );
  }

  const response =
    await fetch(
      `${BEAN_API_BASE}${path}`,
      {
        ...options,
        headers,
        credentials: "include"
      }
    );

  let data = {};

  try {
    data =
      await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const error =
      new Error(
        data.error ||
        "Bean ID request failed."
      );

    error.status =
      response.status;

    throw error;
  }

  return data;
}


/* =========================================================
   BEAN BUTTON
   ========================================================= */

function updateBeanButton() {
  if (
    beanUser &&
    beanUser.beanId
  ) {
    els.openBean.innerHTML = `
      <span class="bean-dot"></span>
      ${beanUser.beanId}
    `;

    return;
  }

  els.openBean.innerHTML = `
    <span class="bean-dot"></span>
    Login with Bean ID
  `;
}


/* =========================================================
   BEAN MODAL
   ========================================================= */

const beanNotice =
  document.querySelector(
    ".bean-modal .notice"
  );

function updateBeanModal() {
  if (!beanNotice) {
    return;
  }

  if (!beanUser) {
    els.beanForm.classList.remove(
      "hidden"
    );

    beanNotice.textContent =
      "Sign in with your real Bean ID. Your session is stored in a secure HttpOnly cookie.";

    if (
      beanLogoutButton
    ) {
      beanLogoutButton.classList.add(
        "hidden"
      );
    }

    return;
  }

  els.beanForm.classList.add(
    "hidden"
  );

  beanNotice.textContent =
    `Signed in as ${beanUser.beanId}.`;

  if (
    !beanLogoutButton
  ) {
    beanLogoutButton =
      document.createElement(
        "button"
      );

    beanLogoutButton.type =
      "button";

    beanLogoutButton.className =
      "light-button full";

    beanLogoutButton.textContent =
      "Log out";

    beanLogoutButton.addEventListener(
      "click",
      handleBeanLogout
    );

    els.beanForm.parentNode.insertBefore(
      beanLogoutButton,
      els.beanForm.nextSibling
    );
  }

  beanLogoutButton.classList.remove(
    "hidden"
  );
}


/* =========================================================
   SET BEAN USER
   ========================================================= */

function setBeanUser(user) {
  beanUser =
    user || null;

  updateBeanButton();
  updateBeanModal();
}


/* =========================================================
   LOAD BEAN SESSION
   ========================================================= */

async function loadBeanSession() {
  try {
    const data =
      await beanRequest(
        "/api/auth/session",
        {
          method: "GET"
        }
      );

    if (
      data.authenticated &&
      data.user
    ) {
      setBeanUser(
        data.user
      );
    } else {
      setBeanUser(
        null
      );
    }

  } catch (error) {
    console.error(
      "Bean session check failed:",
      error
    );

    setBeanUser(
      null
    );
  }
}


/* =========================================================
   OPEN BEAN
   ========================================================= */

els.openBean.addEventListener(
  "click",
  () => {
    updateBeanModal();

    els.beanOverlay.classList.remove(
      "hidden"
    );

    document.body.classList.add(
      "modal-open"
    );
  }
);


/* =========================================================
   BEAN LOGIN
   ========================================================= */

els.beanForm.addEventListener(
  "submit",
  async event => {
    event.preventDefault();

    const formData =
      new FormData(
        els.beanForm
      );

    const username =
      String(
        formData.get(
          "beanId"
        ) || ""
      ).trim();

    const password =
      String(
        formData.get(
          "password"
        ) || ""
      );

    if (
      !username ||
      !password
    ) {
      showToast(
        "Bean ID and password are required"
      );

      return;
    }

    const submitButton =
      els.beanForm.querySelector(
        'button[type="submit"]'
      );

    const originalText =
      submitButton
        ? submitButton.textContent
        : "";

    if (submitButton) {
      submitButton.disabled =
        true;

      submitButton.textContent =
        "Signing in...";
    }

    try {
      const data =
        await beanRequest(
          "/api/auth/login",
          {
            method: "POST",
            body:
              JSON.stringify({
                username,
                password
              })
          }
        );

      setBeanUser(
        data.user
      );

      els.beanForm.reset();

      closeOverlay(
        "beanOverlay"
      );

      showToast(
        `Signed in as ${data.user.beanId}`
      );

    } catch (error) {
      console.error(
        "Bean login failed:",
        error
      );

      if (
        error.status === 401
      ) {
        showToast(
          "Invalid Bean ID or password"
        );

      } else if (
        error.status === 429
      ) {
        showToast(
          "Too many login attempts. Try again later."
        );

      } else {
        showToast(
          error.message ||
          "Bean login failed"
        );
      }

    } finally {
      if (submitButton) {
        submitButton.disabled =
          false;

        submitButton.textContent =
          originalText;
      }
    }
  }
);


/* =========================================================
   BEAN LOGOUT
   ========================================================= */

async function handleBeanLogout() {
  if (!beanUser) {
    return;
  }

  try {
    await beanRequest(
      "/api/auth/logout",
      {
        method: "POST"
      }
    );

  } catch (error) {
    console.error(
      "Bean logout failed:",
      error
    );
  }

  setBeanUser(
    null
  );

  els.beanForm.reset();

  closeOverlay(
    "beanOverlay"
  );

  showToast(
    "Logged out"
  );
}


/* =========================================================
   CLOSE BUTTONS
   ========================================================= */

document
  .querySelectorAll(
    "[data-close]"
  )
  .forEach(button => {
    button.addEventListener(
      "click",
      () => {
        closeOverlay(
          button.dataset.close
        );
      }
    );
  });


/* =========================================================
   CLICK OUTSIDE MODAL
   ========================================================= */

document.addEventListener(
  "click",
  event => {
    if (
      event.target.classList.contains(
        "overlay"
      )
    ) {
      closeOverlay(
        event.target.id
      );
    }
  }
);


/* =========================================================
   KEYBOARD
   ========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape"
    ) {
      closeOverlay(
        "iconOverlay"
      );

      closeOverlay(
        "beanOverlay"
      );
    }

    if (
      event.key === "/" &&
      ![
        "INPUT",
        "TEXTAREA"
      ].includes(
        document.activeElement.tagName
      )
    ) {
      event.preventDefault();

      els.heroSearch.focus();
    }

  }
);


/* =========================================================
   INITIALIZE
   ========================================================= */

renderFilters();

renderIcons();

updateBeanButton();

updateBeanModal();

loadBeanSession();
