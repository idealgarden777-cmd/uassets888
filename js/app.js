const els = {
  heroSearch: document.getElementById("heroSearch"),
  librarySearch: document.getElementById("librarySearch"),

  filters: document.getElementById("filters"),
  iconGrid: document.getElementById("iconGrid"),
  emptyState: document.getElementById("emptyState"),

  iconOverlay: document.getElementById("iconOverlay"),

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

  toast: document.getElementById("toast"),
  proButton: document.getElementById("proButton")
};


/* =========================================================
   UASSET AUTH / CENTRAL ACCOUNTS
   Same architecture as NEYO
   ========================================================= */

const ACCOUNTS_ORIGIN =
  "https://accounts.signaturesi.com";

const LOGIN_URL =
  `${ACCOUNTS_ORIGIN}/?mode=login`;

const SESSION_ENDPOINT =
  `${ACCOUNTS_ORIGIN}/api/auth/session`;

const LOGOUT_ENDPOINT =
  `${ACCOUNTS_ORIGIN}/api/auth/logout`;

let authenticated = false;
let currentUser = null;
let restoringSession = null;
let loggingOut = false;


/* =========================================================
   AUTH HELPERS
   ========================================================= */

function redirectToLogin() {
  window.location.replace(
    LOGIN_URL
  );
}

function setAuthenticatedUser(user) {
  if (
    !user ||
    typeof user !== "object" ||
    !user.id
  ) {
    authenticated = false;
    currentUser = null;

    return false;
  }

  currentUser = {
    id:
      user.id || null,

    username:
      user.username || "user",

    displayName:
      user.displayName ||
      user.username ||
      "user",

    beanId:
      user.beanId || null,

    email:
      user.email || null,

    planType:
      user.planType || "free"
  };

  authenticated = true;

  return true;
}

function updateBeanButton() {
  if (
    authenticated &&
    currentUser?.beanId
  ) {
    els.openBean.innerHTML = `
      <span class="bean-dot"></span>
      ${currentUser.beanId}
    `;

    return;
  }

  els.openBean.innerHTML = `
    <span class="bean-dot"></span>
    Login with Bean ID
  `;
}


/* =========================================================
   SESSION RESTORE
   ========================================================= */

async function performSessionRestore() {
  try {
    const response =
      await fetch(
        SESSION_ENDPOINT,
        {
          method: "GET",

          credentials: "include",

          cache: "no-store",

          headers: {
            Accept:
              "application/json"
          }
        }
      );

    const data =
      await response
        .json()
        .catch(
          () => ({})
        );

    if (
      !response.ok ||
      !data.authenticated ||
      !data.user
    ) {
      authenticated = false;
      currentUser = null;

      updateBeanButton();

      return false;
    }

    if (
      !setAuthenticatedUser(
        data.user
      )
    ) {
      updateBeanButton();

      return false;
    }

    updateBeanButton();

    return true;

  } catch (error) {
    console.error(
      "Bean session restore failed:",
      error
    );

    authenticated = false;
    currentUser = null;

    updateBeanButton();

    return false;
  }
}

async function restoreSession() {
  if (restoringSession) {
    return restoringSession;
  }

  restoringSession =
    performSessionRestore();

  try {
    return await restoringSession;
  } finally {
    restoringSession = null;
  }
}


/* =========================================================
   LOGOUT
   ========================================================= */

async function logout() {
  if (
    loggingOut ||
    !authenticated
  ) {
    return false;
  }

  loggingOut = true;

  try {
    await fetch(
      LOGOUT_ENDPOINT,
      {
        method: "POST",

        credentials: "include",

        cache: "no-store",

        headers: {
          Accept:
            "application/json"
        }
      }
    );
  } catch (error) {
    console.warn(
      "Bean logout failed:",
      error
    );
  }

  authenticated = false;
  currentUser = null;

  updateBeanButton();

  loggingOut = false;

  redirectToLogin();

  return true;
}


/* =========================================================
   PUBLIC UASSET AUTH API
   ========================================================= */

window.UAssetAuth =
  Object.freeze({
    restore:
      restoreSession,

    login:
      redirectToLogin,

    logout,

    isAuthenticated:
      () =>
        authenticated,

    getUser:
      () =>
        currentUser
          ? {
              ...currentUser
            }
          : null,

    getAccountsOrigin:
      () =>
        ACCOUNTS_ORIGIN,

    getLoginUrl:
      () =>
        LOGIN_URL
  });


/* =========================================================
   BEAN BUTTON
   ========================================================= */

els.openBean.addEventListener(
  "click",
  () => {
    redirectToLogin();
  }
);


/* =========================================================
   ICON LIBRARY
   ========================================================= */

let activeCategory = "All";
let selectedIcon = null;
let activeCodeTab = "svg";

const categories = [
  "All",
  ...new Set(
    ICONS.map(
      icon => icon.category
    )
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
    .querySelectorAll(
      "[data-category]"
    )
    .forEach(
      button => {
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
      }
    );
}


/* =========================================================
   ICON MATCHING
   ========================================================= */

function matchesIcon(
  icon,
  term
) {
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

  return searchableText.includes(
    term
  );
}


/* =========================================================
   ICON GRID
   ========================================================= */

function renderIcons(
  term = ""
) {
  const visibleIcons =
    ICONS.filter(
      icon =>
        matchesIcon(
          icon,
          term
        )
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
    .querySelectorAll(
      "[data-icon]"
    )
    .forEach(
      card => {
        card.addEventListener(
          "click",
          () => {
            openIcon(
              card.dataset.icon
            );
          }
        );
      }
    );
}


/* =========================================================
   REACT CODE
   ========================================================= */

function toComponentName(
  name
) {
  return name
    .replace(
      /[^a-zA-Z0-9 ]/g,
      ""
    )
    .split(" ")
    .filter(Boolean)
    .map(
      word =>
        word
          .charAt(0)
          .toUpperCase() +
        word.slice(1)
    )
    .join("");
}

function getReactCode(
  icon
) {
  const componentName =
    toComponentName(
      icon.name
    );

  return `const ${componentName} = () => (
  ${icon.svg}
);`;
}


/* =========================================================
   HTML CODE
   ========================================================= */

function getHtmlCode(
  icon
) {
  return icon.svg;
}


/* =========================================================
   ACTIVE CODE
   ========================================================= */

function getActiveCode() {
  if (!selectedIcon) {
    return "";
  }

  switch (
    activeCodeTab
  ) {
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

  activeCodeTab =
    "svg";

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
    .forEach(
      tab => {
        tab.classList.toggle(
          "active",
          tab.dataset.codeTab ===
            activeCodeTab
        );
      }
    );
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
  .forEach(
    tab => {
      tab.addEventListener(
        "click",
        () => {
          activeCodeTab =
            tab.dataset.codeTab;

          updateCodeTabs();

          updateCodePanel();
        }
      );
    }
  );


/* =========================================================
   CLOSE MODALS
   ========================================================= */

function closeOverlay(
  id
) {
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

function showToast(
  message
) {
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

  link.href =
    url;

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
   CLOSE BUTTONS
   ========================================================= */

document
  .querySelectorAll(
    "[data-close]"
  )
  .forEach(
    button => {
      button.addEventListener(
        "click",
        () => {
          closeOverlay(
            button.dataset.close
          );
        }
      );
    }
  );


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
      event.key ===
      "Escape"
    ) {
      closeOverlay(
        "iconOverlay"
      );
    }

    if (
      event.key === "/" &&
      ![
        "INPUT",
        "TEXTAREA"
      ].includes(
        document.activeElement
          .tagName
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

restoreSession();
