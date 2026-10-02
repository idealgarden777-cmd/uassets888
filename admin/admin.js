/* =========================================================
   UASSET ADMIN
   FINAL CLEAN REBUILD
   admin/admin.js
   ========================================================= */


/* =========================================================
   DOM HELPERS
   ========================================================= */

function $(id) {
  return document.getElementById(id);
}

function qs(selector, root = document) {
  return root.querySelector(selector);
}

function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}


/* =========================================================
   API
   ========================================================= */

const API = {
  icons: {
    list: "/api/admin/icons/list",
    create: "/api/admin/icons/create",
    update: "/api/admin/icons/update",
    delete: "/api/admin/icons/delete"
  },

  collections: {
    list: "/api/admin/collections/list",
    create: "/api/admin/collections/create",
    update: "/api/admin/collections/update",
    delete: "/api/admin/collections/delete"
  },

  categories: {
    list: "/api/admin/categories/list",
    create: "/api/admin/categories/create",
    update: "/api/admin/categories/update",
    delete: "/api/admin/categories/delete"
  }
};


/* =========================================================
   SECTION META
   ========================================================= */

const SECTION_META = {
  dashboard: {
    title: "Dashboard",
    subtitle:
      "Manage your UAsset library and platform settings."
  },

  icons: {
    title: "Icon Manager",
    subtitle:
      "Manage every icon in the UAsset library."
  },

  collections: {
    title: "Collection Manager",
    subtitle:
      "Organize categories into reusable collections."
  },

  categories: {
    title: "Category Manager",
    subtitle:
      "Control categories used throughout the library."
  },

  uploads: {
    title: "Upload Manager",
    subtitle:
      "Upload SVG assets and prepare them for the library."
  },

  settings: {
    title: "Settings",
    subtitle:
      "Review UAsset system configuration and security."
  }
};


/* =========================================================
   STATE
   ========================================================= */

const state = {
  section: "dashboard",

  icons: [],
  collections: [],
  categories: [],

  loadingIcons: false,
  loadingCollections: false,
  loadingCategories: false,

  editingIconId: null,
  editingCollectionId: null,
  editingCategoryId: null,

  confirmAction: null
};


/* =========================================================
   PRIMARY ELEMENTS
   ========================================================= */

const adminPageTitle =
  $("adminPageTitle");

const adminPageSubtitle =
  $("adminPageSubtitle");

const navLinks =
  qsa(".admin-nav-link");

const sectionPanels =
  qsa("[data-section-panel]");

const globalNewButton =
  $("globalNewButton");

const newIconButton =
  $("newIconButton");

const refreshIconsButton =
  $("refreshIconsButton");

const newCollectionButton =
  $("newCollectionButton");

const refreshCollectionsButton =
  $("refreshCollectionsButton");

const newCategoryButton =
  $("newCategoryButton");

const refreshCategoriesButton =
  $("refreshCategoriesButton");

const mobileMenuButton =
  $("adminMobileMenu");

const sidebar =
  $("adminSidebar");


/* =========================================================
   DASHBOARD ELEMENTS
   ========================================================= */

const totalIcons =
  $("totalIcons");

const freeIcons =
  $("freeIcons");

const proIcons =
  $("proIcons");

const totalCollections =
  $("totalCollections");

const statusAuth =
  $("statusAuth");

const statusIcons =
  $("statusIcons");

const statusCollections =
  $("statusCollections");

const statusCategories =
  $("statusCategories");

const statusStorage =
  $("statusStorage");


/* =========================================================
   ICON ELEMENTS
   ========================================================= */

const adminIconsBody =
  $("adminIconsBody");

const iconSearch =
  $("iconSearch");

const iconCategoryFilter =
  $("iconCategoryFilter");

const iconPlanFilter =
  $("iconPlanFilter");

const iconStatusFilter =
  $("iconStatusFilter");

const iconResultsCount =
  $("iconResultsCount");


/* =========================================================
   COLLECTION ELEMENTS
   ========================================================= */

const adminCollectionsBody =
  $("adminCollectionsBody");

const collectionSearch =
  $("collectionSearch");

const collectionResultsCount =
  $("collectionResultsCount");


/* =========================================================
   CATEGORY ELEMENTS
   ========================================================= */

const adminCategoriesBody =
  $("adminCategoriesBody");

const categorySearch =
  $("categorySearch");

const categoryStatusFilter =
  $("categoryStatusFilter");

const categoryResultsCount =
  $("categoryResultsCount");


/* =========================================================
   UPLOAD ELEMENTS
   ========================================================= */

const adminUploadArea =
  $("adminUploadArea");

const adminChooseFilesButton =
  $("adminChooseFilesButton");

const adminFileInput =
  $("adminFileInput");

const adminUploadList =
  $("adminUploadList");


/* =========================================================
   ICON MODAL
   ========================================================= */

const iconModal =
  $("iconModal");

const iconModalTitle =
  $("iconModalTitle");

const formIconName =
  $("formIconName");

const formIconId =
  $("formIconId");

const formIconCategory =
  $("formIconCategory");

const formIconPlan =
  $("formIconPlan");

const formIconTags =
  $("formIconTags");

const formIconDescription =
  $("formIconDescription");

const formIconSvg =
  $("formIconSvg");

const iconPreviewBox =
  $("iconPreviewBox");

const iconPreviewName =
  $("iconPreviewName");

const iconPreviewId =
  $("iconPreviewId");

const iconPreviewPlan =
  $("iconPreviewPlan");

const saveIconButton =
  $("saveIconButton");


/* =========================================================
   COLLECTION MODAL
   ========================================================= */

const collectionModal =
  $("collectionModal");

const collectionModalTitle =
  $("collectionModalTitle");

const formCollectionName =
  $("formCollectionName");

const formCollectionId =
  $("formCollectionId");

const formCollectionCategories =
  $("formCollectionCategories");

const formCollectionDescription =
  $("formCollectionDescription");

const formCollectionStatus =
  $("formCollectionStatus");

const saveCollectionButton =
  $("saveCollectionButton");


/* =========================================================
   CATEGORY MODAL
   ========================================================= */

const categoryModal =
  $("categoryModal");

const categoryModalTitle =
  $("categoryModalTitle");

const formCategoryName =
  $("formCategoryName");

const formCategoryId =
  $("formCategoryId");

const formCategoryOrder =
  $("formCategoryOrder");

const formCategoryStatus =
  $("formCategoryStatus");

const formCategoryDescription =
  $("formCategoryDescription");

const saveCategoryButton =
  $("saveCategoryButton");


/* =========================================================
   CONFIRM MODAL
   ========================================================= */

const confirmModal =
  $("confirmModal");

const confirmModalTitle =
  $("confirmModalTitle");

const confirmModalMessage =
  $("confirmModalMessage");

const confirmActionButton =
  $("confirmActionButton");


/* =========================================================
   TOAST
   ========================================================= */

const adminToast =
  $("adminToast");

const adminToastIcon =
  $("adminToastIcon");

const adminToastMessage =
  $("adminToastMessage");

let toastTimer = null;


/* =========================================================
   BASIC HELPERS
   ========================================================= */

function cleanText(value) {
  return String(value ?? "").trim();
}


function normalizeId(value) {
  return cleanText(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}


function parseCommaList(value) {
  return [
    ...new Set(
      String(value ?? "")
        .split(",")
        .map(item => item.trim())
        .filter(Boolean)
    )
  ];
}


function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric"
    }
  );
}


function setStatus(element, type, text) {
  if (!element) {
    return;
  }

  element.textContent = text;

  element.classList.remove(
    "success",
    "warning",
    "danger"
  );

  if (type) {
    element.classList.add(type);
  }
}


function setButtonLoading(
  button,
  loading,
  loadingText,
  normalText
) {
  if (!button) {
    return;
  }

  if (loading) {
    button.disabled = true;
    button.dataset.normalText =
      normalText || button.textContent;
    button.textContent = loadingText;
  } else {
    button.disabled = false;
    button.textContent =
      normalText ||
      button.dataset.normalText ||
      button.textContent;
  }
}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(
  message,
  type = "success"
) {
  if (!adminToast) {
    return;
  }

  clearTimeout(toastTimer);

  adminToast.hidden = false;

  adminToastMessage.textContent =
    message;

  if (type === "success") {
    adminToastIcon.textContent = "✓";
  } else if (type === "error") {
    adminToastIcon.textContent = "!";
  } else {
    adminToastIcon.textContent = "•";
  }

  toastTimer = setTimeout(
    () => {
      adminToast.hidden = true;
    },
    3200
  );
}


/* =========================================================
   API REQUEST
   ========================================================= */

async function apiRequest(
  url,
  options = {}
) {
  const response =
    await fetch(
      url,
      {
        ...options,

        credentials:
          "same-origin",

        cache:
          "no-store",

        headers: {
          Accept:
            "application/json",

          ...(options.headers || {})
        }
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
    const message =
      data?.error ||
      data?.message ||
      `Request failed (${response.status})`;

    const error =
      new Error(message);

    error.status =
      response.status;

    error.data =
      data;

    throw error;
  }

  return data;
}


/* =========================================================
   SECTION NAVIGATION
   ========================================================= */

function getInitialSection() {
  const hash =
    window.location.hash
      .replace("#", "")
      .trim();

  return SECTION_META[hash]
    ? hash
    : "dashboard";
}


function closeMobileSidebar() {
  sidebar?.classList.remove(
    "open"
  );

  mobileMenuButton?.setAttribute(
    "aria-expanded",
    "false"
  );
}


function activateSection(
  section,
  updateHash = true
) {
  if (!SECTION_META[section]) {
    section = "dashboard";
  }

  state.section =
    section;

  sectionPanels.forEach(
    panel => {
      panel.hidden =
        panel.dataset.sectionPanel !==
        section;
    }
  );

  navLinks.forEach(
    link => {
      link.classList.toggle(
        "active",
        link.dataset.section ===
          section
      );
    }
  );

  const meta =
    SECTION_META[section];

  if (adminPageTitle) {
    adminPageTitle.textContent =
      meta.title;
  }

  if (adminPageSubtitle) {
    adminPageSubtitle.textContent =
      meta.subtitle;
  }

  if (updateHash) {
    window.history.replaceState(
      null,
      "",
      `#${section}`
    );
  }

  closeMobileSidebar();

  if (section === "icons") {
    loadIcons();
  }

  if (section === "collections") {
    loadCollections();
  }

  if (section === "categories") {
    loadCategories();
  }
}


/* =========================================================
   NAV EVENTS
   ========================================================= */

navLinks.forEach(
  link => {
    link.addEventListener(
      "click",
      event => {
        event.preventDefault();

        activateSection(
          link.dataset.section
        );
      }
    );
  }
);


window.addEventListener(
  "hashchange",
  () => {
    activateSection(
      getInitialSection(),
      false
    );
  }
);


/* =========================================================
   MOBILE MENU
   ========================================================= */

mobileMenuButton?.addEventListener(
  "click",
  () => {
    const open =
      sidebar?.classList.toggle(
        "open"
      );

    mobileMenuButton.setAttribute(
      "aria-expanded",
      open ? "true" : "false"
    );
  }
);


/* =========================================================
   DASHBOARD
   ========================================================= */

async function loadDashboard() {
  await loadDashboardIcons();
  await loadDashboardCollections();
  await loadDashboardCategories();
}


async function loadDashboardIcons() {
  setStatus(
    statusIcons,
    "warning",
    "Checking"
  );

  try {
    const data =
      await apiRequest(
        API.icons.list
      );

    state.icons =
      Array.isArray(data.icons)
        ? data.icons
        : [];

    updateIconStats();

    setStatus(
      statusAuth,
      "success",
      "Active"
    );

    setStatus(
      statusIcons,
      "success",
      "Online"
    );

    if (
      state.section ===
      "icons"
    ) {
      renderIcons();
    }

  } catch (error) {
    setStatus(
      statusAuth,
      "warning",
      "Unknown"
    );

    setStatus(
      statusIcons,
      "danger",
      "Error"
    );

    console.error(
      "Dashboard icon load error:",
      error
    );
  }
}


async function loadDashboardCollections() {
  setStatus(
    statusCollections,
    "warning",
    "Checking"
  );

  try {
    const data =
      await apiRequest(
        API.collections.list +
        "?include_inactive=true"
      );

    state.collections =
      normalizeCollections(
        data
      );

    totalCollections.textContent =
      String(
        state.collections.length
      );

    setStatus(
      statusCollections,
      "success",
      "Online"
    );

    if (
      state.section ===
      "collections"
    ) {
      renderCollections();
    }

  } catch (error) {
    totalCollections.textContent =
      "0";

    setStatus(
      statusCollections,
      "warning",
      "Unavailable"
    );

    console.error(
      "Dashboard collection load error:",
      error
    );
  }
}


async function loadDashboardCategories() {
  setStatus(
    statusCategories,
    "warning",
    "Checking"
  );

  try {
    const data =
      await apiRequest(
        API.categories.list +
        "?include_inactive=true"
      );

    state.categories =
      normalizeCategories(
        data
      );

    setStatus(
      statusCategories,
      "success",
      "Online"
    );

  } catch (error) {
    setStatus(
      statusCategories,
      "warning",
      "Unavailable"
    );

    console.error(
      "Dashboard category load error:",
      error
    );
  }

  setStatus(
    statusStorage,
    "success",
    "Configured"
  );
}


function updateIconStats() {
  const icons =
    state.icons;

  const total =
    icons.length;

  const free =
    icons.filter(
      icon =>
        icon.plan === "free"
    ).length;

  const pro =
    icons.filter(
      icon =>
        icon.plan === "pro"
    ).length;

  totalIcons.textContent =
    String(total);

  freeIcons.textContent =
    String(free);

  proIcons.textContent =
    String(pro);
}


/* =========================================================
   ICON CATEGORIES DROPDOWN
   ========================================================= */

function updateIconCategoryFilter() {
  if (!iconCategoryFilter) {
    return;
  }

  const current =
    iconCategoryFilter.value;

  const categories =
    [
      ...new Set(
        state.icons
          .map(
            icon =>
              cleanText(
                icon.category
              )
          )
          .filter(Boolean)
      )
    ]
      .sort(
        (a, b) =>
          a.localeCompare(b)
      );

  iconCategoryFilter.innerHTML = `
    <option value="">
      All Categories
    </option>
    ${
      categories
        .map(
          category =>
            `<option value="${escapeHtml(
              category
            )}">${escapeHtml(
              category
            )}</option>`
        )
        .join("")
    }
  `;

  if (
    categories.includes(
      current
    )
  ) {
    iconCategoryFilter.value =
      current;
  }
}


/* =========================================================
   ICONS LOAD
   ========================================================= */

async function loadIcons() {
  if (
    state.loadingIcons
  ) {
    return;
  }

  state.loadingIcons =
    true;

  renderIconLoading();

  try {
    const data =
      await apiRequest(
        API.icons.list
      );

    state.icons =
      Array.isArray(data.icons)
        ? data.icons
        : [];

    updateIconStats();
    updateIconCategoryFilter();
    renderIcons();

    setStatus(
      statusIcons,
      "success",
      "Online"
    );

  } catch (error) {
    renderIconError(
      error.message
    );

    setStatus(
      statusIcons,
      "danger",
      "Error"
    );

    console.error(
      "Icon load error:",
      error
    );

  } finally {
    state.loadingIcons =
      false;
  }
}


function renderIconLoading() {
  if (!adminIconsBody) {
    return;
  }

  adminIconsBody.innerHTML = `
    <tr>
      <td
        colspan="7"
        class="admin-table-empty"
      >
        Loading icons...
      </td>
    </tr>
  `;

}


function renderIconError(
  message
) {
  if (!adminIconsBody) {
    return;
  }

  adminIconsBody.innerHTML = `
    <tr>
      <td
        colspan="7"
        class="admin-table-empty"
      >
        ${escapeHtml(
          message ||
          "Unable to load icons."
        )}
      </td>
    </tr>
  `;

  iconResultsCount.textContent =
    "0 icons";
}


/* =========================================================
   ICON FILTER
   ========================================================= */

function getFilteredIcons() {
  const search =
    cleanText(
      iconSearch?.value
    ).toLowerCase();

  const category =
    cleanText(
      iconCategoryFilter?.value
    ).toLowerCase();

  const plan =
    cleanText(
      iconPlanFilter?.value
    ).toLowerCase();

  const status =
    cleanText(
      iconStatusFilter?.value
    ).toLowerCase();

  return state.icons.filter(
    icon => {

      const name =
        cleanText(
          icon.name
        ).toLowerCase();

      const id =
        cleanText(
          icon.id
        ).toLowerCase();

      const iconCategory =
        cleanText(
          icon.category
        ).toLowerCase();

      const tags =
        Array.isArray(
          icon.tags
        )
          ? icon.tags
              .join(" ")
              .toLowerCase()
          : "";

      const matchesSearch =
        !search ||
        name.includes(search) ||
        id.includes(search) ||
        iconCategory.includes(search) ||
        tags.includes(search);

      const matchesCategory =
        !category ||
        iconCategory ===
          category;

      const matchesPlan =
        !plan ||
        icon.plan ===
          plan;

      const active =
        icon.isActive !==
        false;

      const matchesStatus =
        status === "all"
          ? true
          : status === "active"
            ? active
            : !active;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPlan &&
        matchesStatus
      );
    }
  );
}


/* =========================================================
   ICON RENDER
   ========================================================= */

function renderIcons() {
  if (!adminIconsBody) {
    return;
  }

  const icons =
    getFilteredIcons();

  iconResultsCount.textContent =
    `${icons.length} ${
      icons.length === 1
        ? "icon"
        : "icons"
    }`;

  if (!icons.length) {
    adminIconsBody.innerHTML = `
      <tr>
        <td
          colspan="7"
          class="admin-table-empty"
        >
          No icons found.
        </td>
      </tr>
    `;

    return;
  }

  adminIconsBody.innerHTML =
    icons
      .map(
        icon =>
          renderIconRow(
            icon
          )
      )
      .join("");
}


function renderIconRow(
  icon
) {
  const id =
    escapeHtml(
      icon.id
    );

  const name =
    escapeHtml(
      icon.name ||
      "Untitled"
    );

  const category =
    escapeHtml(
      icon.category ||
      "—"
    );

  const plan =
    icon.plan ===
      "pro"
      ? "pro"
      : "free";

  const active =
    icon.isActive !==
    false;

  const status =
    active
      ? "ACTIVE"
      : "HIDDEN";

  return `
    <tr>

      <td>

        <div
          class="admin-icon-cell"
        >

          <div
            class="admin-icon-preview"
          >

            ${renderSvg(
              icon.svg ||
              icon.previewSvg ||
              ""
            )}

          </div>

        </div>

      </td>


      <td>

        <div
          class="admin-icon-name"
        >
          ${name}
        </div>

        <div
          class="admin-icon-id"
        >
          ${id}
        </div>

      </td>


      <td>
        <span
          class="admin-muted"
        >
          ${category}
        </span>
      </td>


      <td>

        <span
          class="admin-badge ${plan}"
        >
          ${plan.toUpperCase()}
        </span>

      </td>


      <td>

        <span
          class="admin-badge ${
            active
              ? "active"
              : "inactive"
          }"
        >
          ${status}
        </span>

      </td>


      <td>

        <span
          class="admin-muted"
        >
          ${formatDate(
            icon.updatedAt ||
            icon.updated_at
          )}
        </span>

      </td>


      <td>

        <div
          class="admin-icon-actions"
        >

          <button
            type="button"
            class="admin-icon-action"
            data-action="edit-icon"
            data-id="${id}"
          >
            Edit
          </button>

          <button
            type="button"
            class="admin-icon-action"
            data-action="toggle-icon"
            data-id="${id}"
            data-active="${active}"
          >
            ${
              active
                ? "Hide"
                : "Unhide"
            }
          </button>

          <button
            type="button"
            class="admin-icon-action danger"
            data-action="delete-icon"
            data-id="${id}"
          >
            Delete
          </button>

        </div>

      </td>

    </tr>
  `;
}


/* =========================================================
   SVG SANITIZATION
   ========================================================= */

function renderSvg(
  svg
) {
  const value =
    cleanText(svg);

  if (!value) {
    return "";
  }

  try {
    const parser =
      new DOMParser();

    const doc =
      parser.parseFromString(
        value,
        "image/svg+xml"
      );

    const root =
      doc.documentElement;

    if (
      !root ||
      root.tagName.toLowerCase() !==
        "svg"
    ) {
      return "";
    }

    root
      .querySelectorAll(
        "script,foreignObject"
      )
      .forEach(
        node =>
          node.remove()
      );

    root.setAttribute(
      "width",
      "21"
    );

    root.setAttribute(
      "height",
      "21"
    );

    root.setAttribute(
      "aria-hidden",
      "true"
    );

    return root.outerHTML;

  } catch {
    return "";
  }
}


/* =========================================================
   ICON MODAL
   ========================================================= */

function resetIconForm() {
  state.editingIconId =
    null;

  iconModalTitle.textContent =
    "New Icon";

  formIconName.value =
    "";

  formIconId.value =
    "";

  formIconCategory.value =
    "";

  formIconPlan.value =
    "free";

  formIconTags.value =
    "";

  formIconDescription.value =
    "";

  formIconSvg.value =
    "";

  formIconId.disabled =
    false;

  saveIconButton.textContent =
    "Save Icon";

  updateIconPreview();
}


function openIconModal(
  id = null
) {
  resetIconForm();

  if (id) {
    const icon =
      state.icons.find(
        item =>
          String(
            item.id
          ) ===
          String(id)
      );

    if (!icon) {
      showToast(
        "Icon not found.",
        "error"
      );

      return;
    }

    state.editingIconId =
      icon.id;

    iconModalTitle.textContent =
      "Edit Icon";

    formIconName.value =
      icon.name || "";

    formIconId.value =
      icon.id || "";

    formIconCategory.value =
      icon.category || "";

    formIconPlan.value =
      icon.plan === "pro"
        ? "pro"
        : "free";

    formIconTags.value =
      Array.isArray(
        icon.tags
      )
        ? icon.tags.join(
            ", "
          )
        : "";

    formIconDescription.value =
      icon.description || "";

    formIconSvg.value =
      icon.svg || "";

    formIconId.disabled =
      true;

    saveIconButton.textContent =
      "Update Icon";
  }

  openModal(
    iconModal
  );

  setTimeout(
    () =>
      formIconName?.focus(),
    40
  );

}


function updateIconPreview() {
  const name =
    cleanText(
      formIconName.value
    );

  const id =
    normalizeId(
      formIconId.value ||
      name
    );

  const plan =
    formIconPlan.value ===
      "pro"
      ? "PRO"
      : "FREE";

  const svg =
    cleanText(
      formIconSvg.value
    );

  iconPreviewName.textContent =
    name ||
    "New Icon";

  iconPreviewId.textContent =
    id ||
    "—";

  iconPreviewPlan.textContent =
    plan;

  iconPreviewBox.innerHTML =
    renderSvg(
      svg
    ) ||
    `
      <span
        class="admin-preview-placeholder"
      >
        SVG Preview
      </span>
    `;
}


/* =========================================================
   ICON SAVE
   ========================================================= */

async function saveIcon() {
  const name =
    cleanText(
      formIconName.value
    );

  const id =
    normalizeId(
      formIconId.value ||
      name
    );

  const category =
    cleanText(
      formIconCategory.value
    );

  const plan =
    formIconPlan.value ===
      "pro"
      ? "pro"
      : "free";

  const tags =
    parseCommaList(
      formIconTags.value
    );

  const description =
    cleanText(
      formIconDescription.value
    );

  const svg =
    cleanText(
      formIconSvg.value
    );

  if (!name) {
    showToast(
      "Icon name is required.",
      "error"
    );

    formIconName.focus();

    return;
  }

  if (!id) {
    showToast(
      "Icon ID is required.",
      "error"
    );

    formIconId.focus();

    return;
  }

  if (!category) {
    showToast(
      "Category is required.",
      "error"
    );

    formIconCategory.focus();

    return;
  }

  if (!svg) {
    showToast(
      "SVG code is required.",
      "error"
    );

    formIconSvg.focus();

    return;
  }

  const editing =
    !!state.editingIconId;

  setButtonLoading(
    saveIconButton,
    true,
    editing
      ? "Updating..."
      : "Saving...",
    editing
      ? "Update Icon"
      : "Save Icon"
  );

  try {
    const payload = {
      id,
      name,
      category,
      plan,
      tags,
      description,
      svg
    };

    if (editing) {
      await apiRequest(
        API.icons.update,
        {
          method:
            "PATCH",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify(
              payload
            )
        }
      );

      showToast(
        "Icon updated successfully."
      );

    } else {
      await apiRequest(
        API.icons.create,
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify(
              payload
            )
        }
      );

      showToast(
        "Icon created successfully."
      );
    }

    closeAllModals();

    await loadIcons();

    updateIconStats();

  } catch (error) {
    showToast(
      error.message ||
      "Unable to save icon.",
      "error"
    );

  } finally {
    setButtonLoading(
      saveIconButton,
      false,
      "",
      editing
        ? "Update Icon"
        : "Save Icon"
    );
  }
}


/* =========================================================
   ICON STATUS
   ========================================================= */

async function toggleIcon(
  id,
  active
) {
  const label =
    active
      ? "hide"
      : "unhide";

  const confirmed =
    window.confirm(
      `Are you sure you want to ${label} this icon?`
    );

  if (!confirmed) {
    return;
  }

  try {
    await apiRequest(
      API.icons.update,
      {
        method:
          "PATCH",

        headers: {
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify({
            id,
            is_active:
              !active
          })
      }
    );

    showToast(
      active
        ? "Icon hidden."
        : "Icon restored."
    );

    await loadIcons();

  } catch (error) {
    showToast(
      error.message ||
      "Unable to update icon.",
      "error"
    );
  }
}


/* =========================================================
   ICON DELETE
   ========================================================= */

async function deleteIcon(
  id
) {
  const icon =
    state.icons.find(
      item =>
        String(
          item.id
        ) ===
        String(id)
    );

  const label =
    icon?.name ||
    id;

  const confirmed =
    window.confirm(
      `Delete "${label}" permanently?\n\nThis action cannot be undone.`
    );

  if (!confirmed) {
    return;
  }

  try {
    await apiRequest(
      `${API.icons.delete}?id=${encodeURIComponent(id)}`,
      {
        method:
          "DELETE"
      }
    );

    showToast(
      "Icon deleted."
    );

    await loadIcons();

  } catch (error) {
    showToast(
      error.message ||
      "Unable to delete icon.",
      "error"
    );
  }
}


/* =========================================================
   COLLECTION NORMALIZATION
   ========================================================= */

function normalizeCollections(
  data
) {
  if (
    Array.isArray(
      data?.collections
    )
  ) {
    return data.collections;
  }

  if (
    Array.isArray(data)
  ) {
    return data;
  }

  return [];
}


/* =========================================================
   COLLECTIONS LOAD
   ========================================================= */

async function loadCollections() {
  if (
    state.loadingCollections
  ) {
    return;
  }

  state.loadingCollections =
    true;

  renderCollectionLoading();

  try {
    const data =
      await apiRequest(
        API.collections.list +
        "?include_inactive=true"
      );

    state.collections =
      normalizeCollections(
        data
      );

    totalCollections.textContent =
      String(
        state.collections.length
      );

    renderCollections();

    setStatus(
      statusCollections,
      "success",
      "Online"
    );

  } catch (error) {
    renderCollectionError(
      error.message
    );

    setStatus(
      statusCollections,
      "danger",
      "Error"
    );

    console.error(
      "Collection load error:",
      error
    );

  } finally {
    state.loadingCollections =
      false;
  }
}


/* =========================================================
   COLLECTION FILTER
   ========================================================= */

function getFilteredCollections() {
  const search =
    cleanText(
      collectionSearch?.value
    ).toLowerCase();

  return state.collections.filter(
    collection => {

      const name =
        cleanText(
          collection.name
        ).toLowerCase();

      const id =
        cleanText(
          collection.id
        ).toLowerCase();

      const description =
        cleanText(
          collection.description
        ).toLowerCase();

      return (
        !search ||
        name.includes(search) ||
        id.includes(search) ||
        description.includes(search)
      );
    }
  );
}


/* =========================================================
   COLLECTION RENDER
   ========================================================= */

function renderCollections() {
  if (!adminCollectionsBody) {
    return;
  }

  const collections =
    getFilteredCollections();

  collectionResultsCount.textContent =
    `${collections.length} ${
      collections.length === 1
        ? "collection"
        : "collections"
    }`;

  if (!collections.length) {
    adminCollectionsBody.innerHTML = `
      <tr>
        <td
          colspan="6"
          class="admin-table-empty"
        >
          No collections found.
        </td>
      </tr>
    `;

    return;
  }

  adminCollectionsBody.innerHTML =
    collections
      .map(
        collection => {

          const categories =
            Array.isArray(
              collection.categories
            )
              ? collection.categories
                  .join(", ")
              : "—";

          const active =
            collection.is_active !==
            false;

          return `
            <tr>

              <td>
                <strong>
                  ${escapeHtml(
                    collection.name ||
                    "Untitled"
                  )}
                </strong>
              </td>

              <td>
                <span
                  class="admin-icon-id"
                >
                  ${escapeHtml(
                    collection.id ||
                    "—"
                  )}
                </span>
              </td>

              <td>
                <span
                  class="admin-muted"
                >
                  ${escapeHtml(
                    categories
                  )}
                </span>
              </td>

              <td>
                <span
                  class="admin-badge ${
                    active
                      ? "active"
                      : "inactive"
                  }"
                >
                  ${
                    active
                      ? "ACTIVE"
                      : "HIDDEN"
                  }
                </span>
              </td>

              <td>
                <span
                  class="admin-muted"
                >
                  ${formatDate(
                    collection.created_at ||
                    collection.createdAt
                  )}
                </span>
              </td>

              <td>

                <div
                  class="admin-icon-actions"
                >

                  <button
                    type="button"
                    class="admin-icon-action"
                    data-action="edit-collection"
                    data-id="${escapeHtml(
                      collection.id
                    )}"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    class="admin-icon-action"
                    data-action="toggle-collection"
                    data-id="${escapeHtml(
                      collection.id
                    )}"
                    data-active="${active}"
                  >
                    ${
                      active
                        ? "Hide"
                        : "Unhide"
                    }
                  </button>

                  <button
                    type="button"
                    class="admin-icon-action danger"
                    data-action="delete-collection"
                    data-id="${escapeHtml(
                      collection.id
                    )}"
                  >
                    Delete
                  </button>

                </div>

              </td>

            </tr>
          `;
        }
      )
      .join("");
}


function renderCollectionLoading() {
  adminCollectionsBody.innerHTML = `
    <tr>
      <td
        colspan="6"
        class="admin-table-empty"
      >
        Loading collections...
      </td>
    </tr>
  `;
}


function renderCollectionError(
  message
) {
  adminCollectionsBody.innerHTML = `
    <tr>
      <td
        colspan="6"
        class="admin-table-empty"
      >
        ${escapeHtml(
          message ||
          "Unable to load collections."
        )}
      </td>
    </tr>
  `;

  collectionResultsCount.textContent =
    "0 collections";
}


/* =========================================================
   COLLECTION MODAL
   ========================================================= */

function resetCollectionForm() {
  state.editingCollectionId =
    null;

  collectionModalTitle.textContent =
    "New Collection";

  formCollectionName.value =
    "";

  formCollectionId.value =
    "";

  formCollectionCategories.value =
    "";

  formCollectionDescription.value =
    "";

  formCollectionStatus.value =
    "true";

  formCollectionId.disabled =
    false;

  saveCollectionButton.textContent =
    "Save Collection";
}


function openCollectionModal(
  id = null
) {
  resetCollectionForm();

  if (id) {
    const collection =
      state.collections.find(
        item =>
          String(
            item.id
          ) ===
          String(id)
      );

    if (!collection) {
      showToast(
        "Collection not found.",
        "error"
      );

      return;
    }

    state.editingCollectionId =
      collection.id;

    collectionModalTitle.textContent =
      "Edit Collection";

    formCollectionName.value =
      collection.name || "";

    formCollectionId.value =
      collection.id || "";

    formCollectionCategories.value =
      Array.isArray(
        collection.categories
      )
        ? collection.categories.join(
            ", "
          )
        : "";

    formCollectionDescription.value =
      collection.description || "";

    formCollectionStatus.value =
      collection.is_active ===
        false
        ? "false"
        : "true";

    formCollectionId.disabled =
      true;

    saveCollectionButton.textContent =
      "Update Collection";
  }

  openModal(
    collectionModal
  );

  setTimeout(
    () =>
      formCollectionName?.focus(),
    40
  );
}


/* =========================================================
   COLLECTION SAVE
   ========================================================= */

async function saveCollection() {
  const name =
    cleanText(
      formCollectionName.value
    );

  const id =
    normalizeId(
      formCollectionId.value ||
      name
    );

  const categories =
    parseCommaList(
      formCollectionCategories.value
    );

  const description =
    cleanText(
      formCollectionDescription.value
    );

  const isActive =
    formCollectionStatus.value !==
    "false";

  const editing =
    !!state.editingCollectionId;

  if (!name) {
    showToast(
      "Collection name is required.",
      "error"
    );

    return;
  }

  if (!id) {
    showToast(
      "Collection ID is required.",
      "error"
    );

    return;
  }

  if (!categories.length) {
    showToast(
      "At least one category is required.",
      "error"
    );

    return;
  }

  setButtonLoading(
    saveCollectionButton,
    true,
    editing
      ? "Updating..."
      : "Saving...",
    editing
      ? "Update Collection"
      : "Save Collection"
  );

  try {
    if (editing) {

      await apiRequest(
        API.collections.update,
        {
          method:
            "PATCH",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({
              id:
                state.editingCollectionId,

              name,

              categories,

              description,

              is_active:
                isActive
            })
        }
      );

      showToast(
        "Collection updated."
      );

    } else {

      await apiRequest(
        API.collections.create,
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({
              id,
              name,
              categories,
              description,
              is_active:
                isActive
            })
        }
      );

      showToast(
        "Collection created."
      );
    }

    closeAllModals();

    await loadCollections();

  } catch (error) {
    showToast(
      error.message ||
      "Unable to save collection.",
      "error"
    );

  } finally {
    setButtonLoading(
      saveCollectionButton,
      false,
      "",
      editing
        ? "Update Collection"
        : "Save Collection"
    );
  }
}


/* =========================================================
   COLLECTION STATUS
   ========================================================= */

async function toggleCollection(
  id,
  active
) {
  try {
    await apiRequest(
      API.collections.update,
      {
        method:
          "PATCH",

        headers: {
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify({
            id,

            is_active:
              !active
          })
      }
    );

    showToast(
      active
        ? "Collection hidden."
        : "Collection restored."
    );

    await loadCollections();

  } catch (error) {
    showToast(
      error.message ||
      "Unable to update collection.",
      "error"
    );
  }
}


/* =========================================================
   COLLECTION DELETE
   ========================================================= */

async function deleteCollection(
  id
) {
  const collection =
    state.collections.find(
      item =>
        String(
          item.id
        ) ===
        String(id)
    );

  const label =
    collection?.name ||
    id;

  const confirmed =
    window.confirm(
      `Delete "${label}" permanently?`
    );

  if (!confirmed) {
    return;
  }

  try {
    await apiRequest(
      `${API.collections.delete}?id=${encodeURIComponent(id)}`,
      {
        method:
          "DELETE"
      }
    );

    showToast(
      "Collection deleted."
    );

    await loadCollections();

  } catch (error) {
    showToast(
      error.message ||
      "Unable to delete collection.",
      "error"
    );
  }
}


/* =========================================================
   CATEGORY NORMALIZATION
   ========================================================= */

function normalizeCategories(
  data
) {
  if (
    Array.isArray(
      data?.categories
    )
  ) {
    return data.categories;
  }

  if (
    Array.isArray(data)
  ) {
    return data;
  }

  return [];
}


/* =========================================================
   CATEGORIES LOAD
   ========================================================= */

async function loadCategories() {
  if (
    state.loadingCategories
  ) {
    return;
  }

  state.loadingCategories =
    true;

  renderCategoryLoading();

  try {
    const data =
      await apiRequest(
        API.categories.list +
        "?include_inactive=true"
      );

    state.categories =
      normalizeCategories(
        data
      );

    renderCategories();

    populateCategorySelect();

    setStatus(
      statusCategories,
      "success",
      "Online"
    );

  } catch (error) {
    renderCategoryError(
      error.message
    );

    setStatus(
      statusCategories,
      "danger",
      "Error"
    );

    console.error(
      "Category load error:",
      error
    );

  } finally {
    state.loadingCategories =
      false;
  }
}


/* =========================================================
   CATEGORY SELECT
   ========================================================= */

function populateCategorySelect() {
  const current =
    formIconCategory.value;

  formIconCategory.innerHTML = `
    <option value="">
      Select Category
    </option>
  `;

  state.categories
    .filter(
      category =>
        category.is_active !==
        false
    )
    .sort(
      (a, b) =>
        Number(
          a.sort_order || 0
        ) -
        Number(
          b.sort_order || 0
        )
    )
    .forEach(
      category => {

        const option =
          document.createElement(
            "option"
          );

        option.value =
          category.name ||
          category.id;

        option.textContent =
          category.name ||
          category.id;

        formIconCategory.appendChild(
          option
        );
      }
    );

  if (
    current
  ) {
    formIconCategory.value =
      current;
  }
}


/* =========================================================
   CATEGORY FILTER
   ========================================================= */

function getFilteredCategories() {
  const search =
    cleanText(
      categorySearch?.value
    ).toLowerCase();

  const status =
    cleanText(
      categoryStatusFilter?.value
    );

  return state.categories.filter(
    category => {

      const name =
        cleanText(
          category.name
        ).toLowerCase();

      const id =
        cleanText(
          category.id
        ).toLowerCase();

      const description =
        cleanText(
          category.description
        ).toLowerCase();

      const active =
        category.is_active !==
        false;

      const matchesSearch =
        !search ||
        name.includes(search) ||
        id.includes(search) ||
        description.includes(search);

      const matchesStatus =
        status === "all"
          ? true
          : status === "active"
            ? active
            : !active;

      return (
        matchesSearch &&
        matchesStatus
      );
    }
  );
}


/* =========================================================
   CATEGORY RENDER
   ========================================================= */

function renderCategories() {
  if (!adminCategoriesBody) {
    return;
  }

  const categories =
    getFilteredCategories();

  categoryResultsCount.textContent =
    `${categories.length} ${
      categories.length === 1
        ? "category"
        : "categories"
    }`;

  if (!categories.length) {
    adminCategoriesBody.innerHTML = `
      <tr>
        <td
          colspan="6"
          class="admin-table-empty"
        >
          No categories found.
        </td>
      </tr>
    `;

    return;
  }

  adminCategoriesBody.innerHTML =
    categories
      .map(
        category => {

          const active =
            category.is_active !==
            false;

          return `
            <tr>

              <td>

                <strong>
                  ${escapeHtml(
                    category.name ||
                    "Untitled"
                  )}
                </strong>

              </td>


              <td>

                <span
                  class="admin-icon-id"
                >
                  ${escapeHtml(
                    category.id ||
                    "—"
                  )}
                </span>

              </td>


              <td>

                <span
                  class="admin-muted"
                >
                  ${escapeHtml(
                    category.description ||
                    "—"
                  )}
                </span>

              </td>


              <td>

                <span
                  class="admin-muted"
                >
                  ${escapeHtml(
                    category.sort_order ??
                    0
                  )}
                </span>

              </td>


              <td>

                <span
                  class="admin-badge ${
                    active
                      ? "active"
                      : "inactive"
                  }"
                >
                  ${
                    active
                      ? "ACTIVE"
                      : "HIDDEN"
                  }
                </span>

              </td>


              <td>

                <div
                  class="admin-icon-actions"
                >

                  <button
                    type="button"
                    class="admin-icon-action"
                    data-action="edit-category"
                    data-id="${escapeHtml(
                      category.id
                    )}"
                  >
                    Edit
                  </button>


                  <button
                    type="button"
                    class="admin-icon-action"
                    data-action="toggle-category"
                    data-id="${escapeHtml(
                      category.id
                    )}"
                    data-active="${active}"
                  >
                    ${
                      active
                        ? "Hide"
                        : "Unhide"
                    }
                  </button>


                  <button
                    type="button"
                    class="admin-icon-action danger"
                    data-action="delete-category"
                    data-id="${escapeHtml(
                      category.id
                    )}"
                  >
                    Delete
                  </button>

                </div>

              </td>

            </tr>
          `;
        }
      )
      .join("");
}


function renderCategoryLoading() {
  adminCategoriesBody.innerHTML = `
    <tr>
      <td
        colspan="6"
        class="admin-table-empty"
      >
        Loading categories...
      </td>
    </tr>
  `;
}


function renderCategoryError(
  message
) {
  adminCategoriesBody.innerHTML = `
    <tr>
      <td
        colspan="6"
        class="admin-table-empty"
      >
        ${escapeHtml(
          message ||
          "Unable to load categories."
        )}
      </td>
    </tr>
  `;

  categoryResultsCount.textContent =
    "0 categories";
}


/* =========================================================
   CATEGORY MODAL
   ========================================================= */

function resetCategoryForm() {
  state.editingCategoryId =
    null;

  categoryModalTitle.textContent =
    "New Category";

  formCategoryName.value =
    "";

  formCategoryId.value =
    "";

  formCategoryOrder.value =
    "0";

  formCategoryStatus.value =
    "true";

  formCategoryDescription.value =
    "";

  formCategoryId.disabled =
    false;

  saveCategoryButton.textContent =
    "Save Category";
}


function openCategoryModal(
  id = null
) {
  resetCategoryForm();

  if (id) {
    const category =
      state.categories.find(
        item =>
          String(
            item.id
          ) ===
          String(id)
      );

    if (!category) {
      showToast(
        "Category not found.",
        "error"
      );

      return;
    }

    state.editingCategoryId =
      category.id;

    categoryModalTitle.textContent =
      "Edit Category";

    formCategoryName.value =
      category.name || "";

    formCategoryId.value =
      category.id || "";

    formCategoryOrder.value =
      Number(
        category.sort_order ||
        0
      );

    formCategoryStatus.value =
      category.is_active ===
        false
        ? "false"
        : "true";

    formCategoryDescription.value =
      category.description ||
      "";

    formCategoryId.disabled =
      true;

    saveCategoryButton.textContent =
      "Update Category";
  }

  openModal(
    categoryModal
  );

  setTimeout(
    () =>
      formCategoryName?.focus(),
    40
  );
}


/* =========================================================
   CATEGORY SAVE
   ========================================================= */

async function saveCategory() {
  const name =
    cleanText(
      formCategoryName.value
    );

  const id =
    normalizeId(
      formCategoryId.value ||
      name
    );

  const sortOrder =
    Number(
      formCategoryOrder.value
    );

  const isActive =
    formCategoryStatus.value !==
    "false";

  const description =
    cleanText(
      formCategoryDescription.value
    );

  const editing =
    !!state.editingCategoryId;

  if (!name) {
    showToast(
      "Category name is required.",
      "error"
    );

    return;
  }

  if (!id) {
    showToast(
      "Category ID is required.",
      "error"
    );

    return;
  }

  if (
    !Number.isFinite(
      sortOrder
    )
  ) {
    showToast(
      "Sort order is invalid.",
      "error"
    );

    return;
  }

  setButtonLoading(
    saveCategoryButton,
    true,
    editing
      ? "Updating..."
      : "Saving...",
    editing
      ? "Update Category"
      : "Save Category"
  );

  try {
    if (editing) {

      await apiRequest(
        API.categories.update,
        {
          method:
            "PATCH",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({
              id:
                state.editingCategoryId,

              name,

              sort_order:
                Math.trunc(
                  sortOrder
                ),

              is_active:
                isActive,

              description
            })
        }
      );

      showToast(
        "Category updated."
      );

    } else {

      await apiRequest(
        API.categories.create,
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({
              id,
              name,

              sort_order:
                Math.trunc(
                  sortOrder
                ),

              is_active:
                isActive,

              description
            })
        }
      );

      showToast(
        "Category created."
      );
    }

    closeAllModals();

    await loadCategories();

  } catch (error) {
    showToast(
      error.message ||
      "Unable to save category.",
      "error"
    );

  } finally {
    setButtonLoading(
      saveCategoryButton,
      false,
      "",
      editing
        ? "Update Category"
        : "Save Category"
    );
  }
}


/* =========================================================
   CATEGORY STATUS
   ========================================================= */

async function toggleCategory(
  id,
  active
) {
  try {
    await apiRequest(
      API.categories.update,
      {
        method:
          "PATCH",

        headers: {
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify({
            id,

            is_active:
              !active
          })
      }
    );

    showToast(
      active
        ? "Category hidden."
        : "Category restored."
    );

    await loadCategories();

  } catch (error) {
    showToast(
      error.message ||
      "Unable to update category.",
      "error"
    );
  }
}


/* =========================================================
   CATEGORY DELETE
   ========================================================= */

async function deleteCategory(
  id
) {
  const category =
    state.categories.find(
      item =>
        String(
          item.id
        ) ===
        String(id)
    );

  const label =
    category?.name ||
    id;

  const confirmed =
    window.confirm(
      `Delete "${label}" permanently?`
    );

  if (!confirmed) {
    return;
  }

  try {
    await apiRequest(
      `${API.categories.delete}?id=${encodeURIComponent(id)}`,
      {
        method:
          "DELETE"
      }
    );

    showToast(
      "Category deleted."
    );

    await loadCategories();

  } catch (error) {
    showToast(
      error.message ||
      "Unable to delete category.",
      "error"
    );
  }
}


/* =========================================================
   MODAL HELPERS
   ========================================================= */

function openModal(
  modal
) {
  if (!modal) {
    return;
  }

  modal.hidden =
    false;

  modal.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.classList.add(
    "uasset-modal-open"
  );
}


function closeModal(
  modal
) {
  if (!modal) {
    return;
  }

  modal.hidden =
    true;

  modal.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.classList.remove(
    "uasset-modal-open"
  );
}


function closeAllModals() {
  closeModal(iconModal);
  closeModal(collectionModal);
  closeModal(categoryModal);
  closeModal(confirmModal);
}


qsa(
  "[data-close-modal]"
).forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        const id =
          button.dataset.closeModal;

        closeModal(
          $(id)
        );

      }
    );

  }
);


/* =========================================================
   CONFIRM MODAL
   ========================================================= */

function openConfirm(
  title,
  message,
  action
) {
  state.confirmAction =
    typeof action ===
    "function"
      ? action
      : null;

  confirmModalTitle.textContent =
    title;

  confirmModalMessage.textContent =
    message;

  openModal(
    confirmModal
  );
}


confirmActionButton?.addEventListener(
  "click",
  async () => {

    if (
      typeof state.confirmAction !==
      "function"
    ) {
      closeModal(
        confirmModal
      );

      return;
    }

    const action =
      state.confirmAction;

    state.confirmAction =
      null;

    setButtonLoading(
      confirmActionButton,
      true,
      "Working...",
      "Confirm"
    );

    try {
      await action();

    } finally {
      setButtonLoading(
        confirmActionButton,
        false,
        "",
        "Confirm"
      );

      closeModal(
        confirmModal
      );
    }

  }
);


/* =========================================================
   UPLOAD UI
   ========================================================= */

function formatFileSize(
  bytes
) {
  const value =
    Number(bytes);

  if (
    !Number.isFinite(
      value
    )
  ) {
    return "0 B";
  }

  if (
    value <
    1024
  ) {
    return `${value} B`;
  }

  if (
    value <
    1024 * 1024
  ) {
    return `${(
      value /
      1024
    ).toFixed(1)} KB`;
  }

  return `${(
    value /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}


function renderUploadFiles(
  fileList
) {
  const files =
    Array.from(
      fileList || []
    );

  if (!adminUploadList) {
    return;
  }

  if (!files.length) {
    adminUploadList.innerHTML =
      "";

    return;
  }

  adminUploadList.innerHTML =
    files
      .map(
        file => `
          <div
            class="admin-setting-row"
            style="margin: 0 20px;"
          >

            <div
              class="admin-setting-copy"
            >

              <strong>
                ${escapeHtml(
                  file.name
                )}
              </strong>

              <span>
                ${escapeHtml(
                  formatFileSize(
                    file.size
                  )
                )}
              </span>

            </div>

            <span
              class="admin-status-badge success"
            >
              READY
            </span>

          </div>
        `
      )
      .join("");
}


adminChooseFilesButton?.addEventListener(
  "click",
  () => {
    adminFileInput?.click();
  }
);


adminFileInput?.addEventListener(
  "change",
  () => {
    renderUploadFiles(
      adminFileInput.files
    );
  }
);


adminUploadArea?.addEventListener(
  "dragover",
  event => {
    event.preventDefault();

    adminUploadArea.style.borderColor =
      "#111111";
  }
);


adminUploadArea?.addEventListener(
  "dragleave",
  () => {
    adminUploadArea.style.borderColor =
      "";
  }
);


adminUploadArea?.addEventListener(
  "drop",
  event => {

    event.preventDefault();

    adminUploadArea.style.borderColor =
      "";

    renderUploadFiles(
      event.dataTransfer?.files
    );

  }
);


/* =========================================================
   EVENT DELEGATION
   ========================================================= */

document.addEventListener(
  "click",
  event => {

    const button =
      event.target.closest(
        "[data-action]"
      );

    if (!button) {
      return;
    }

    const action =
      button.dataset.action;

    const id =
      button.dataset.id;

    if (
      action ===
      "new-icon"
    ) {
      activateSection(
        "icons"
      );

      openIconModal();

      return;
    }

    if (
      action ===
      "new-collection"
    ) {
      activateSection(
        "collections"
      );

      openCollectionModal();

      return;
    }

    if (
      action ===
      "new-category"
    ) {
      activateSection(
        "categories"
      );

      openCategoryModal();

      return;
    }

    if (
      action ===
      "upload"
    ) {
      activateSection(
        "uploads"
      );

      adminFileInput?.click();

      return;
    }

    if (
      action ===
      "edit-icon"
    ) {
      openIconModal(
        id
      );

      return;
    }

    if (
      action ===
      "toggle-icon"
    ) {
      toggleIcon(
        id,
        button.dataset.active ===
          "true"
      );

      return;
    }

    if (
      action ===
      "delete-icon"
    ) {
      deleteIcon(
        id
      );

      return;
    }

    if (
      action ===
      "edit-collection"
    ) {
      openCollectionModal(
        id
      );

      return;
    }

    if (
      action ===
      "toggle-collection"
    ) {
      toggleCollection(
        id,
        button.dataset.active ===
          "true"
      );

      return;
    }

    if (
      action ===
      "delete-collection"
    ) {
      deleteCollection(
        id
      );

      return;
    }

    if (
      action ===
      "edit-category"
    ) {
      openCategoryModal(
        id
      );

      return;
    }

    if (
      action ===
      "toggle-category"
    ) {
      toggleCategory(
        id,
        button.dataset.active ===
          "true"
      );

      return;
    }

    if (
      action ===
      "delete-category"
    ) {
      deleteCategory(
        id
      );

    }

  }
);


/* =========================================================
   QUICK ACTION CARDS
   ========================================================= */

qsa(
  "[data-action]"
).forEach(
  element => {

    if (
      element.closest(
        "tbody"
      )
    ) {
      return;
    }

    element.addEventListener(
      "click",
      () => {

        const action =
          element.dataset.action;

        if (
          action ===
          "new-icon"
        ) {

          activateSection(
            "icons"
          );

          openIconModal();

        }

        if (
          action ===
          "new-collection"
        ) {

          activateSection(
            "collections"
          );

          openCollectionModal();

        }

        if (
          action ===
          "new-category"
        ) {

          activateSection(
            "categories"
          );

          openCategoryModal();

        }

        if (
          action ===
          "upload"
        ) {

          activateSection(
            "uploads"
          );

          adminFileInput?.click();

        }

      }
    );

  }
);


/* =========================================================
   TOP BUTTONS
   ========================================================= */

globalNewButton?.addEventListener(
  "click",
  () => {

    if (
      state.section ===
      "collections"
    ) {

      openCollectionModal();

      return;
    }

    if (
      state.section ===
      "categories"
    ) {

      openCategoryModal();

      return;
    }

    openIconModal();

  }
);


newIconButton?.addEventListener(
  "click",
  () =>
    openIconModal()
);


refreshIconsButton?.addEventListener(
  "click",
  () =>
    loadIcons()
);


newCollectionButton?.addEventListener(
  "click",
  () =>
    openCollectionModal()
);


refreshCollectionsButton?.addEventListener(
  "click",
  () =>
    loadCollections()
);


newCategoryButton?.addEventListener(
  "click",
  () =>
    openCategoryModal()
);


refreshCategoriesButton?.addEventListener(
  "click",
  () =>
    loadCategories()
);


/* =========================================================
   FORM BUTTONS
   ========================================================= */

saveIconButton?.addEventListener(
  "click",
  saveIcon
);

saveCollectionButton?.addEventListener(
  "click",
  saveCollection
);

saveCategoryButton?.addEventListener(
  "click",
  saveCategory
);


/* =========================================================
   LIVE PREVIEW
   ========================================================= */

[
  formIconName,
  formIconId,
  formIconPlan,
  formIconSvg
]
  .filter(Boolean)
  .forEach(
    element => {

      element.addEventListener(
        "input",
        updateIconPreview
      );

      element.addEventListener(
        "change",
        updateIconPreview
      );

    }
  );


formIconName?.addEventListener(
  "input",
  () => {

    if (
      !state.editingIconId &&
      !formIconId.value.trim()
    ) {

      formIconId.value =
        normalizeId(
          formIconName.value
        );

    }

    updateIconPreview();

  }
);


/* =========================================================
   FILTER EVENTS
   ========================================================= */

[
  iconSearch,
  iconCategoryFilter,
  iconPlanFilter,
  iconStatusFilter
]
  .filter(Boolean)
  .forEach(
    element => {

      element.addEventListener(
        "input",
        renderIcons
      );

      element.addEventListener(
        "change",
        renderIcons
      );

    }
  );


[
  collectionSearch
]
  .filter(Boolean)
  .forEach(
    element => {

      element.addEventListener(
        "input",
        renderCollections
      );

    }
  );


[
  categorySearch,
  categoryStatusFilter
]
  .filter(Boolean)
  .forEach(
    element => {

      element.addEventListener(
        "input",
        renderCategories
      );

      element.addEventListener(
        "change",
        renderCategories
      );

    }
  );


/* =========================================================
   ESC KEY
   ========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key !==
      "Escape"
    ) {
      return;
    }

    closeAllModals();
    closeMobileSidebar();

  }
);


/* =========================================================
   MODAL BACKDROP
   ========================================================= */

[
  iconModal,
  collectionModal,
  categoryModal,
  confirmModal
]
  .filter(Boolean)
  .forEach(
    modal => {

      modal.addEventListener(
        "click",
        event => {

          if (
            event.target ===
            modal
          ) {
            closeModal(
              modal
            );
          }

        }
      );

    }
  );


/* =========================================================
   INIT
   ========================================================= */

async function initAdmin() {

  activateSection(
    getInitialSection()
  );

  updateIconPreview();

  await loadDashboard();

}


if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initAdmin
  );

} else {

  initAdmin();

}
