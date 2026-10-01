/* =========================================================
   UASSET ADMIN — CLEAN REBUILD
   admin/admin.js

   Sections:
   - Dashboard
   - Icons
   - Collections
   - Categories
   - Uploads
   - Settings

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
   PRIMARY ELEMENTS
   ========================================================= */

const pageTitle =
  $("adminPageTitle");

const pageSubtitle =
  $("adminPageSubtitle");

const navLinks =
  qsa(".admin-nav-link");

const sectionPanels =
  qsa("[data-section-panel]");

const newIconButton =
  $("newIconButton");

const iconsNewButton =
  $("iconsNewButton");

const manageIconsButton =
  $("manageIconsButton");

const refreshCollectionsButton =
  $("refreshCollectionsButton");

const refreshCategoriesButton =
  $("refreshCategoriesButton");

const newCollectionButton =
  $("newCollectionButton");

const newCategoryButton =
  $("newCategoryButton");

const quickNewIcon =
  $("quickNewIcon");

const quickUpload =
  $("quickUpload");

const quickCollection =
  $("quickCollection");

const quickCategory =
  $("quickCategory");


/* =========================================================
   DASHBOARD
   ========================================================= */

const totalIcons =
  $("totalIcons");

const freeIcons =
  $("freeIcons");

const proIcons =
  $("proIcons");

const totalCollections =
  $("totalCollections");

const adminAuthStatus =
  $("adminAuthStatus");

const adminIconsStatus =
  $("adminIconsStatus");

const adminCollectionsStatus =
  $("adminCollectionsStatus");

const adminCategoriesStatus =
  $("adminCategoriesStatus");


/* =========================================================
   ICON ELEMENTS
   ========================================================= */

const adminIconsBody =
  $("adminIconsBody");

const iconSearch =
  $("iconSearch");

const iconPlanFilter =
  $("iconPlanFilter");

const iconStatusFilter =
  $("iconStatusFilter");

const iconResultsCount =
  $("iconResultsCount");


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

const adminUploadButton =
  $("adminUploadButton");

const adminFileInput =
  $("adminFileInput");

const adminUploadArea =
  $("adminUploadArea");

const adminUploadList =
  $("adminUploadList");


/* =========================================================
   ICON MODAL
   ========================================================= */

const newIconModal =
  $("newIconModal");

const closeNewIcon =
  $("closeNewIcon");

const cancelNewIcon =
  $("cancelNewIcon");

const saveNewIcon =
  $("saveNewIcon");

const iconName =
  $("iconName");

const iconId =
  $("iconId");

const iconCategory =
  $("iconCategory");

const iconTags =
  $("iconTags");

const iconDescription =
  $("iconDescription");

const iconPlan =
  $("iconPlan");

const iconSvg =
  $("iconSvg");

const iconLivePreview =
  $("iconLivePreview");

const previewName =
  $("previewName");

const previewId =
  $("previewId");

const previewPlan =
  $("previewPlan");

const newIconModalTitle =
  $("newIconModalTitle");


/* =========================================================
   API
   ========================================================= */

const API = {

  icons: {
    list:
      "/api/admin/icons/list",

    create:
      "/api/admin/icons/create",

    update:
      "/api/admin/icons/update",

    delete:
      "/api/admin/icons/delete"
  },

  collections: {
    list:
      "/api/admin/collections/list",

    create:
      "/api/admin/collections/create",

    update:
      "/api/admin/collections/update",

    delete:
      "/api/admin/collections/delete"
  },

  categories: {
    list:
      "/api/admin/categories/list",

    create:
      "/api/admin/categories/create",

    update:
      "/api/admin/categories/update",

    delete:
      "/api/admin/categories/delete"
  }

};


/* =========================================================
   PAGE META
   ========================================================= */

const SECTION_META = {

  dashboard: {
    title:
      "Dashboard",

    subtitle:
      "Manage icons, collections, categories, uploads and system settings."
  },

  icons: {
    title:
      "Icon Manager",

    subtitle:
      "Create, edit, hide and delete UAsset icons."
  },

  collections: {
    title:
      "Collections",

    subtitle:
      "Group categories into curated collections."
  },

  categories: {
    title:
      "Categories",

    subtitle:
      "Manage categories used by the UAsset library."
  },

  uploads: {
    title:
      "Uploads",

    subtitle:
      "Upload and manage UAsset files."
  },

  settings: {
    title:
      "Settings",

    subtitle:
      "UAsset admin and library configuration."
  }

};


/* =========================================================
   APPLICATION STATE
   ========================================================= */

const state = {

  currentSection:
    "dashboard",

  icons:
    [],

  collections:
    [],

  categories:
    [],

  editingIconId:
    null,

  editingCollectionId:
    null,

  editingCategoryId:
    null,

  loadingIcons:
    false,

  loadingCollections:
    false,

  loadingCategories:
    false

};


/* =========================================================
   GENERIC HELPERS
   ========================================================= */

function escapeHtml(value) {

  return String(
    value ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


function cleanText(value) {

  return String(
    value ?? ""
  ).trim();

}


function normalizeId(value) {

  return cleanText(
    value
  )
    .toLowerCase()
    .replace(
      /&/g,
      "and"
    )
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    )
    .slice(
      0,
      60
    );

}


function parseCommaList(value) {

  return [
    ...new Set(
      String(
        value ?? ""
      )
        .split(",")
        .map(
          item =>
            item.trim()
        )
        .filter(Boolean)
    )
  ];

}


function formatDate(value) {

  if (!value) {
    return "—";
  }

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    undefined,
    {
      year:
        "numeric",

      month:
        "short",

      day:
        "numeric"
    }
  );

}


function setStatus(
  element,
  status,
  text
) {

  if (!element) {
    return;
  }

  element.textContent =
    text;

  element.classList.remove(
    "success",
    "warning",
    "danger"
  );

  if (
    status ===
    "success"
  ) {

    element.classList.add(
      "success"
    );

  } else if (
    status ===
    "warning"
  ) {

    element.classList.add(
      "warning"
    );

  } else if (
    status ===
    "danger"
  ) {

    element.classList.add(
      "danger"
    );

  }

}


async function readResponse(
  response
) {

  let data = {};

  try {

    data =
      await response.json();

  } catch {

    data = {};

  }

  return {
    response,
    data
  };

}


function getErrorMessage(
  data,
  fallback
) {

  return (
    data?.error ||
    data?.message ||
    fallback
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
        credentials:
          "same-origin",

        cache:
          "no-store",

        ...options,

        headers: {
          Accept:
            "application/json",

          ...(options.headers || {})
        }
      }
    );

  const result =
    await readResponse(
      response
    );

  if (
    !result.response.ok
  ) {

    throw new Error(
      getErrorMessage(
        result.data,
        `Request failed (${result.response.status})`
      )
    );

  }

  return result.data;

}


/* =========================================================
   SECTION NAVIGATION
   ========================================================= */

function activateSection(
  section
) {

  if (
    !SECTION_META[
      section
    ]
  ) {
    section =
      "dashboard";
  }

  state.currentSection =
    section;

  sectionPanels.forEach(
    panel => {

      const isActive =
        panel.dataset.sectionPanel ===
        section;

      panel.hidden =
        !isActive;

    }
  );

  navLinks.forEach(
    link => {

      const isActive =
        link.dataset.section ===
        section;

      link.classList.toggle(
        "active",
        isActive
      );

    }
  );

  const meta =
    SECTION_META[
      section
    ];

  if (pageTitle) {
    pageTitle.textContent =
      meta.title;
  }

  if (pageSubtitle) {
    pageSubtitle.textContent =
      meta.subtitle;
  }

  window.history.replaceState(
    null,
    "",
    `#${section}`
  );

  if (
    section ===
    "icons"
  ) {

    loadIcons();

  }

  if (
    section ===
    "collections"
  ) {

    loadCollections();

  }

  if (
    section ===
    "categories"
  ) {

    loadCategories();

  }

}


function readInitialSection() {

  const hash =
    window.location.hash
      .replace(
        "#",
        ""
      )
      .trim();

  if (
    SECTION_META[
      hash
    ]
  ) {

    return hash;

  }

  return "dashboard";

}


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


/* =========================================================
   DASHBOARD LOAD
   ========================================================= */

async function loadDashboard() {

  setStatus(
    adminAuthStatus,
    "warning",
    "Checking"
  );

  setStatus(
    adminIconsStatus,
    "warning",
    "Checking"
  );

  setStatus(
    adminCollectionsStatus,
    "warning",
    "Checking"
  );

  setStatus(
    adminCategoriesStatus,
    "warning",
    "Checking"
  );


  try {

    const data =
      await apiRequest(
        API.icons.list
      );

    state.icons =
      Array.isArray(
        data.icons
      )
        ? data.icons
        : [];

    updateIconStats();

    setStatus(
      adminAuthStatus,
      "success",
      "Active"
    );

    setStatus(
      adminIconsStatus,
      "success",
      "Online"
    );

  } catch (
    error
  ) {

    setStatus(
      adminAuthStatus,
      "warning",
      "Unknown"
    );

    setStatus(
      adminIconsStatus,
      "danger",
      "Error"
    );

    console.error(
      "Dashboard icon load failed:",
      error
    );

  }


  try {

    const data =
      await apiRequest(
        API.collections.list
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
      adminCollectionsStatus,
      "success",
      "Online"
    );

  } catch (
    error
  ) {

    totalCollections.textContent =
      "0";

    setStatus(
      adminCollectionsStatus,
      "warning",
      "Unavailable"
    );

    console.warn(
      "Dashboard collection load failed:",
      error
    );

  }


  try {

    const data =
      await apiRequest(
        API.categories.list
      );

    state.categories =
      normalizeCategories(
        data
      );

    setStatus(
      adminCategoriesStatus,
      "success",
      "Online"
    );

  } catch (
    error
  ) {

    setStatus(
      adminCategoriesStatus,
      "warning",
      "Unavailable"
    );

    console.warn(
      "Dashboard category load failed:",
      error
    );

  }

}


/* =========================================================
   ICON STATS
   ========================================================= */

function updateIconStats() {

  const icons =
    state.icons;

  const total =
    icons.length;

  const free =
    icons.filter(
      icon =>
        icon.plan ===
        "free"
    ).length;

  const pro =
    icons.filter(
      icon =>
        icon.plan ===
        "pro"
    ).length;

  if (totalIcons) {
    totalIcons.textContent =
      String(total);
  }

  if (freeIcons) {
    freeIcons.textContent =
      String(free);
  }

  if (proIcons) {
    proIcons.textContent =
      String(pro);
  }

}


/* =========================================================
   ICONS — LOAD
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
      Array.isArray(
        data.icons
      )
        ? data.icons
        : [];

    updateIconStats();

    renderIcons();

    setStatus(
      adminIconsStatus,
      "success",
      "Online"
    );

  } catch (
    error
  ) {

    renderIconError(
      error.message
    );

    setStatus(
      adminIconsStatus,
      "danger",
      "Error"
    );

  } finally {

    state.loadingIcons =
      false;

  }

}


/* =========================================================
   ICON FILTER
   ========================================================= */

function getFilteredIcons() {

  const search =
    cleanText(
      iconSearch?.value
    )
      .toLowerCase();

  const plan =
    iconPlanFilter?.value ||
    "";

  const status =
    iconStatusFilter?.value ||
    "active";

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

      const category =
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
        category.includes(search) ||
        tags.includes(search);

      const matchesPlan =
        !plan ||
        icon.plan ===
          plan;

      const active =
        icon.isActive ===
        true;

      const matchesStatus =
        status ===
          "all"
          ? true
          : status ===
              "active"
            ? active
            : !active;

      return (
        matchesSearch &&
        matchesPlan &&
        matchesStatus
      );

    }
  );

}


/* =========================================================
   ICONS — RENDER
   ========================================================= */

function renderIcons() {

  if (!adminIconsBody) {
    return;
  }

  const icons =
    getFilteredIcons();

  if (iconResultsCount) {

    iconResultsCount.textContent =
      `${icons.length} ${
        icons.length === 1
          ? "icon"
          : "icons"
      }`;

  }

  if (
    !icons.length
  ) {

    adminIconsBody.innerHTML = `
      <tr>
        <td
          colspan="6"
          class="admin-table-empty"
        >
          No icons found.
        </td>
      </tr>
    `;

    return;

  }


  adminIconsBody.innerHTML =
    icons.map(
      icon =>
        renderIconRow(
          icon
        )
    ).join("");

  qsa(
    "[data-icon-edit]",
    adminIconsBody
  ).forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          const id =
            button.dataset.iconEdit;

          openEditIcon(
            id
          );

        }
      );

    }
  );


  qsa(
    "[data-icon-toggle]",
    adminIconsBody
  ).forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          toggleIcon(
            button.dataset.iconToggle,
            button.dataset.iconActive ===
              "true"
          );

        }
      );

    }
  );


  qsa(
    "[data-icon-delete]",
    adminIconsBody
  ).forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          deleteIcon(
            button.dataset.iconDelete
          );

        }
      );

    }
  );

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
      icon.name
    );

  const category =
    escapeHtml(
      icon.category
    );

  const plan =
    icon.plan ===
      "pro"
      ? "pro"
      : "free";

  const active =
    icon.isActive ===
    true;

  const statusClass =
    active
      ? "active"
      : "inactive";

  const statusLabel =
    active
      ? "ACTIVE"
      : "HIDDEN";

  const actionLabel =
    active
      ? "Hide"
      : "Unhide";


  return `
    <tr>

      <td>

        <div class="admin-icon-cell">

          <div
            class="admin-icon-preview"
            data-svg-preview="${id}"
          >
            ${getSafeSvgPreview(
              icon.previewSvg ||
              icon.svg ||
              ""
            )}
          </div>

        </div>

      </td>


      <td>

        <div class="admin-icon-name">
          ${name}
        </div>

        <div class="admin-icon-id">
          ${id}
        </div>

      </td>


      <td>
        <span class="admin-muted">
          ${category || "—"}
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
          class="admin-badge ${statusClass}"
        >
          ${statusLabel}
        </span>

      </td>


      <td>

        <div class="admin-icon-actions">

          <button
            type="button"
            class="admin-icon-action"
            data-icon-edit="${id}"
          >
            Edit
          </button>

          <button
            type="button"
            class="admin-icon-action"
            data-icon-toggle="${id}"
            data-icon-active="${active}"
          >
            ${actionLabel}
          </button>

          <button
            type="button"
            class="admin-icon-action danger"
            data-icon-delete="${id}"
          >
            Delete
          </button>

        </div>

      </td>

    </tr>
  `;

}


/* =========================================================
   SAFE SVG PREVIEW
   ========================================================= */

function getSafeSvgPreview(
  svg
) {

  const value =
    cleanText(
      svg
    );

  if (!value) {

    return `
      <span
        class="admin-muted"
      >
        —
      </span>
    `;

  }

  try {

    const parser =
      new DOMParser();

    const documentNode =
      parser.parseFromString(
        value,
        "image/svg+xml"
      );

    const root =
      documentNode.documentElement;

    if (
      !root ||
      root.tagName.toLowerCase() !==
        "svg"
    ) {

      return "";

    }

    root.querySelectorAll(
      "script, foreignObject"
    ).forEach(
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

    root.setAttribute(
      "focusable",
      "false"
    );

    return root.outerHTML;

  } catch {

    return "";

  }

}


/* =========================================================
   ICON LOADING / ERROR
   ========================================================= */

function renderIconLoading() {

  if (!adminIconsBody) {
    return;
  }

  adminIconsBody.innerHTML = `
    <tr>
      <td
        colspan="6"
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
        colspan="6"
        class="admin-table-empty"
      >
        ${escapeHtml(
          message ||
          "Unable to load icons."
        )}
      </td>
    </tr>
  `;

  if (iconResultsCount) {
    iconResultsCount.textContent =
      "0 icons";
  }

}


/* =========================================================
   ICON MODAL
   ========================================================= */

function clearIconForm() {

  iconName.value =
    "";

  iconId.value =
    "";

  iconCategory.value =
    "";

  iconTags.value =
    "";

  iconDescription.value =
    "";

  iconPlan.value =
    "free";

  iconSvg.value =
    "";

  state.editingIconId =
    null;

  if (newIconModalTitle) {

    newIconModalTitle.textContent =
      "New Icon";

  }

  if (saveNewIcon) {

    saveNewIcon.textContent =
      "Save Icon";

  }

  updateIconPreview();

}


function fillIconForm(
  icon
) {

  iconName.value =
    icon.name ||
    "";

  iconId.value =
    icon.id ||
    "";

  iconCategory.value =
    icon.category ||
    "";

  iconTags.value =
    Array.isArray(
      icon.tags
    )
      ? icon.tags.join(
          ", "
        )
      : "";

  iconDescription.value =
    icon.description ||
    "";

  iconPlan.value =
    icon.plan ===
      "pro"
      ? "pro"
      : "free";

  iconSvg.value =
    icon.svg ||
    "";

  state.editingIconId =
    icon.id;

  if (newIconModalTitle) {

    newIconModalTitle.textContent =
      "Edit Icon";

  }

  if (saveNewIcon) {

    saveNewIcon.textContent =
      "Update Icon";

  }

  updateIconPreview();

}


function openNewIcon() {

  clearIconForm();

  openIconModal();

}


function openEditIcon(
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

  if (!icon) {

    alert(
      "Icon not found."
    );

    return;

  }

  fillIconForm(
    icon
  );

  openIconModal();

}


function openIconModal() {

  if (!newIconModal) {
    return;
  }

  newIconModal.hidden =
    false;

  newIconModal.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.classList.add(
    "uasset-modal-open"
  );

  setTimeout(
    () => {

      iconName?.focus();

    },
    30
  );

}


function closeIconModal() {

  if (!newIconModal) {
    return;
  }

  newIconModal.hidden =
    true;

  newIconModal.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.classList.remove(
    "uasset-modal-open"
  );

}


function updateIconPreview() {

  if (!iconLivePreview) {
    return;
  }

  const name =
    cleanText(
      iconName.value
    );

  const id =
    normalizeId(
      iconId.value ||
      name
    );

  const plan =
    iconPlan.value ===
      "pro"
      ? "PRO"
      : "FREE";

  if (previewName) {
    previewName.textContent =
      name ||
      "New Icon";
  }

  if (previewId) {
    previewId.textContent =
      id ||
      "—";
  }

  if (previewPlan) {
    previewPlan.textContent =
      plan;
  }

  const svg =
    cleanText(
      iconSvg.value
    );

  const preview =
    getSafeSvgPreview(
      svg
    );

  iconLivePreview.innerHTML =
    preview ||
    `
      <span
        class="admin-preview-placeholder"
      >
        SVG preview
      </span>
    `;

}


/* =========================================================
   ICON CREATE
   ========================================================= */

async function createIcon() {

  const name =
    cleanText(
      iconName.value
    );

  const id =
    normalizeId(
      iconId.value ||
      name
    );

  const category =
    cleanText(
      iconCategory.value
    );

  const tags =
    parseCommaList(
      iconTags.value
    );

  const description =
    cleanText(
      iconDescription.value
    );

  const plan =
    iconPlan.value ===
      "pro"
      ? "pro"
      : "free";

  const svg =
    cleanText(
      iconSvg.value
    );


  if (!name) {

    alert(
      "Icon name is required."
    );

    iconName.focus();

    return;

  }


  if (!id) {

    alert(
      "Valid icon ID is required."
    );

    iconId.focus();

    return;

  }


  if (!category) {

    alert(
      "Icon category is required."
    );

    iconCategory.focus();

    return;

  }


  if (!svg) {

    alert(
      "SVG code is required."
    );

    iconSvg.focus();

    return;

  }


  setButtonLoading(
    saveNewIcon,
    true,
    "Saving..."
  );


  try {

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
          JSON.stringify({
            id,
            name,
            category,
            tags,
            description,
            plan,
            svg
          })
      }
    );


    alert(
      "Icon created successfully."
    );

    closeIconModal();

    await loadIcons();

  } catch (
    error
  ) {

    alert(
      error.message ||
      "Unable to create icon."
    );

  } finally {

    setButtonLoading(
      saveNewIcon,
      false,
      state.editingIconId
        ? "Update Icon"
        : "Save Icon"
    );

  }

}


/* =========================================================
   ICON UPDATE
   ========================================================= */

async function updateIcon() {

  const existingId =
    state.editingIconId;

  if (!existingId) {

    await createIcon();

    return;

  }


  const name =
    cleanText(
      iconName.value
    );

  const category =
    cleanText(
      iconCategory.value
    );

  const tags =
    parseCommaList(
      iconTags.value
    );

  const description =
    cleanText(
      iconDescription.value
    );

  const plan =
    iconPlan.value ===
      "pro"
      ? "pro"
      : "free";

  const svg =
    cleanText(
      iconSvg.value
    );


  if (!name) {

    alert(
      "Icon name is required."
    );

    return;

  }


  if (!category) {

    alert(
      "Icon category is required."
    );

    return;

  }


  if (!svg) {

    alert(
      "SVG code is required."
    );

    return;

  }


  setButtonLoading(
    saveNewIcon,
    true,
    "Updating..."
  );


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
            id:
              existingId,

            name,
            category,
            tags,
            description,
            plan,
            svg
          })
      }
    );


    alert(
      "Icon updated successfully."
    );

    closeIconModal();

    await loadIcons();

  } catch (
    error
  ) {

    alert(
      error.message ||
      "Unable to update icon."
    );

  } finally {

    setButtonLoading(
      saveNewIcon,
      false,
      "Update Icon"
    );

  }

}


/* =========================================================
   ICON SAVE ROUTER
   ========================================================= */

async function saveIcon() {

  if (
    state.editingIconId
  ) {

    await updateIcon();

  } else {

    await createIcon();

  }

}


/* =========================================================
   ICON TOGGLE
   ========================================================= */

async function toggleIcon(
  id,
  currentlyActive
) {

  const action =
    currentlyActive
      ? "hide"
      : "unhide";

  const confirmed =
    window.confirm(
      `Are you sure you want to ${action} this icon?`
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
              !currentlyActive
          })
      }
    );


    await loadIcons();

  } catch (
    error
  ) {

    alert(
      error.message ||
      "Unable to update icon status."
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


    await loadIcons();

  } catch (
    error
  ) {

    alert(
      error.message ||
      "Unable to delete icon."
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
    Array.isArray(
      data
    )
  ) {

    return data;

  }

  return [];

}


/* =========================================================
   COLLECTIONS — LOAD
   ========================================================= */

async function loadCollections() {

  if (
    state.loadingCollections
  ) {
    return;
  }

  state.loadingCollections =
    true;

  renderCollectionsLoading();

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
      adminCollectionsStatus,
      "success",
      "Online"
    );

  } catch (
    error
  ) {

    renderCollectionsError(
      error.message
    );

    setStatus(
      adminCollectionsStatus,
      "danger",
      "Error"
    );

  } finally {

    state.loadingCollections =
      false;

  }

}


/* =========================================================
   COLLECTIONS — RENDER
   ========================================================= */

function renderCollections() {

  const body =
    $("adminCollectionsBody");

  if (!body) {
    return;
  }

  if (
    !state.collections.length
  ) {

    body.innerHTML = `
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


  body.innerHTML =
    state.collections
      .map(
        collection => {

          const categories =
            Array.isArray(
              collection.categories
            )
              ? collection.categories
                  .map(
                    category =>
                      escapeHtml(
                        category
                      )
                  )
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
                <span class="admin-icon-id">
                  ${escapeHtml(
                    collection.id ||
                    "—"
                  )}
                </span>
              </td>

              <td>
                <span class="admin-muted">
                  ${categories}
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
                <span class="admin-muted">
                  ${formatDate(
                    collection.created_at ||
                    collection.createdAt
                  )}
                </span>
              </td>

              <td>

                <div class="admin-icon-actions">

                  <button
                    type="button"
                    class="admin-icon-action"
                    data-collection-edit="${
                      escapeHtml(
                        collection.id
                      )
                    }"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    class="admin-icon-action"
                    data-collection-toggle="${
                      escapeHtml(
                        collection.id
                      )
                    }"
                    data-collection-active="${
                      active
                    }"
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
                    data-collection-delete="${
                      escapeHtml(
                        collection.id
                      )
                    }"
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


  qsa(
    "[data-collection-edit]",
    body
  ).forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          openCollectionModal(
            button.dataset.collectionEdit
          );

        }
      );

    }
  );


  qsa(
    "[data-collection-toggle]",
    body
  ).forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          toggleCollection(
            button.dataset.collectionToggle,
            button.dataset.collectionActive ===
              "true"
          );

        }
      );

    }
  );


  qsa(
    "[data-collection-delete]",
    body
  ).forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          deleteCollection(
            button.dataset.collectionDelete
          );

        }
      );

    }
  );

}


function renderCollectionsLoading() {

  const body =
    $("adminCollectionsBody");

  if (!body) {
    return;
  }

  body.innerHTML = `
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


function renderCollectionsError(
  message
) {

  const body =
    $("adminCollectionsBody");

  if (!body) {
    return;
  }

  body.innerHTML = `
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

}


/* =========================================================
   COLLECTION MODAL
   ========================================================= */

function ensureCollectionModal() {

  if (
    $("uassetCollectionModal")
  ) {

    return;

  }


  const modal =
    document.createElement(
      "div"
    );

  modal.id =
    "uassetCollectionModal";

  modal.className =
    "admin-modal";

  modal.hidden =
    true;

  modal.setAttribute(
    "aria-hidden",
    "true"
  );

  modal.innerHTML = `
    <div
      class="admin-modal-backdrop"
      data-collection-close
    ></div>

    <div
      class="admin-modal-card"
      role="dialog"
      aria-modal="true"
    >

      <div class="admin-modal-head">

        <div>

          <p class="admin-panel-eyebrow">
            COLLECTION MANAGER
          </p>

          <h2
            class="admin-modal-title"
            id="uassetCollectionModalTitle"
          >
            New Collection
          </h2>

          <p class="admin-modal-subtitle">
            Create a curated category collection.
          </p>

        </div>

        <button
          type="button"
          class="admin-modal-close"
          id="uassetCollectionClose"
          aria-label="Close"
        >
          ×
        </button>

      </div>


      <div class="admin-modal-body">

        <div class="admin-form-grid">

          <div class="admin-form-group">

            <label
              class="admin-label"
              for="uassetCollectionName"
            >
              Name
            </label>

            <input
              id="uassetCollectionName"
              class="admin-input"
              type="text"
              maxlength="100"
              placeholder="Business Essentials"
            >

          </div>


          <div class="admin-form-group">

            <label
              class="admin-label"
              for="uassetCollectionId"
            >
              ID
            </label>

            <input
              id="uassetCollectionId"
              class="admin-input"
              type="text"
              maxlength="60"
              placeholder="business-essentials"
            >

          </div>


          <div class="admin-form-group admin-form-full">

            <label
              class="admin-label"
              for="uassetCollectionCategories"
            >
              Categories
            </label>

            <input
              id="uassetCollectionCategories"
              class="admin-input"
              type="text"
              placeholder="business, office, finance"
            >

          </div>


          <div class="admin-form-group admin-form-full">

            <label
              class="admin-label"
              for="uassetCollectionDescription"
            >
              Description
            </label>

            <textarea
              id="uassetCollectionDescription"
              class="admin-textarea"
              rows="4"
              maxlength="500"
              placeholder="Professional business icon collection."
            ></textarea>

          </div>


          <div class="admin-form-group">

            <label
              class="admin-label"
              for="uassetCollectionActive"
            >
              Status
            </label>

            <select
              id="uassetCollectionActive"
              class="admin-select"
            >

              <option value="true">
                Active
              </option>

              <option value="false">
                Hidden
              </option>

            </select>

          </div>

        </div>

      </div>


      <div class="admin-modal-footer">

        <button
          type="button"
          class="admin-button"
          id="uassetCollectionCancel"
        >
          Cancel
        </button>

        <button
          type="button"
          class="admin-button primary"
          id="uassetCollectionSave"
        >
          Save Collection
        </button>

      </div>

    </div>
  `;


  document.body.appendChild(
    modal
  );


  $("uassetCollectionClose")
    .addEventListener(
      "click",
      closeCollectionModal
    );

  $("uassetCollectionCancel")
    .addEventListener(
      "click",
      closeCollectionModal
    );

  $("uassetCollectionSave")
    .addEventListener(
      "click",
      saveCollection
    );

  qs(
    "[data-collection-close]",
    modal
  ).addEventListener(
    "click",
    closeCollectionModal
  );

}


/* =========================================================
   COLLECTION MODAL OPEN
   ========================================================= */

function openCollectionModal(
  id = null
) {

  ensureCollectionModal();

  const modal =
    $("uassetCollectionModal");

  const title =
    $("uassetCollectionModalTitle");

  const name =
    $("uassetCollectionName");

  const collectionId =
    $("uassetCollectionId");

  const categories =
    $("uassetCollectionCategories");

  const description =
    $("uassetCollectionDescription");

  const active =
    $("uassetCollectionActive");


  state.editingCollectionId =
    null;


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

      alert(
        "Collection not found."
      );

      return;

    }

    state.editingCollectionId =
      collection.id;

    title.textContent =
      "Edit Collection";

    name.value =
      collection.name ||
      "";

    collectionId.value =
      collection.id ||
      "";

    categories.value =
      Array.isArray(
        collection.categories
      )
        ? collection.categories.join(
            ", "
          )
        : "";

    description.value =
      collection.description ||
      "";

    active.value =
      collection.is_active ===
        false
        ? "false"
        : "true";

    collectionId.disabled =
      true;

  } else {

    title.textContent =
      "New Collection";

    name.value =
      "";

    collectionId.value =
      "";

    categories.value =
      "";

    description.value =
      "";

    active.value =
      "true";

    collectionId.disabled =
      false;

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

  setTimeout(
    () => {
      name.focus();
    },
    30
  );

}


function closeCollectionModal() {

  const modal =
    $("uassetCollectionModal");

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


/* =========================================================
   COLLECTION SAVE
   ========================================================= */

async function saveCollection() {

  const name =
    cleanText(
      $("uassetCollectionName").value
    );

  const id =
    normalizeId(
      $("uassetCollectionId").value ||
      name
    );

  const categories =
    parseCommaList(
      $("uassetCollectionCategories").value
    );

  const description =
    cleanText(
      $("uassetCollectionDescription").value
    );

  const isActive =
    $("uassetCollectionActive").value !==
    "false";

  const editingId =
    state.editingCollectionId;


  if (!name) {

    alert(
      "Collection name is required."
    );

    return;

  }


  if (!id) {

    alert(
      "Collection ID is required."
    );

    return;

  }


  if (
    !categories.length
  ) {

    alert(
      "At least one category is required."
    );

    return;

  }


  const button =
    $("uassetCollectionSave");


  setButtonLoading(
    button,
    true,
    "Saving..."
  );


  try {

    if (editingId) {

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
                editingId,

              name,

              description,

              categories,

              is_active:
                isActive
            })
        }
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

              description,

              categories,

              is_active:
                isActive
            })
        }
      );

    }


    alert(
      editingId
        ? "Collection updated successfully."
        : "Collection created successfully."
    );

    closeCollectionModal();

    await loadCollections();

  } catch (
    error
  ) {

    alert(
      error.message ||
      "Unable to save collection."
    );

  } finally {

    setButtonLoading(
      button,
      false,
      editingId
        ? "Update Collection"
        : "Save Collection"
    );

  }

}


/* =========================================================
   COLLECTION TOGGLE
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

    await loadCollections();

  } catch (
    error
  ) {

    alert(
      error.message ||
      "Unable to update collection."
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

    await loadCollections();

  } catch (
    error
  ) {

    alert(
      error.message ||
      "Unable to delete collection."
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
    Array.isArray(
      data
    )
  ) {

    return data;

  }

  return [];

}


/* =========================================================
   CATEGORIES — LOAD
   ========================================================= */

async function loadCategories() {

  if (
    state.loadingCategories
  ) {
    return;
  }

  state.loadingCategories =
    true;

  renderCategoriesLoading();

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

    setStatus(
      adminCategoriesStatus,
      "success",
      "Online"
    );

  } catch (
    error
  ) {

    renderCategoriesError(
      error.message
    );

    setStatus(
      adminCategoriesStatus,
      "danger",
      "Error"
    );

  } finally {

    state.loadingCategories =
      false;

  }

}


/* =========================================================
   CATEGORY FILTER
   ========================================================= */

function getFilteredCategories() {

  const search =
    cleanText(
      categorySearch?.value
    )
      .toLowerCase();

  const status =
    categoryStatusFilter?.value ||
    "active";


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

      const matchesSearch =
        !search ||
        name.includes(
          search
        ) ||
        id.includes(
          search
        ) ||
        description.includes(
          search
        );

      const active =
        category.is_active !==
        false;

      const matchesStatus =
        status ===
          "all"
          ? true
          : status ===
              "active"
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
   CATEGORIES — RENDER
   ========================================================= */

function renderCategories() {

  if (!adminCategoriesBody) {
    return;
  }

  const categories =
    getFilteredCategories();

  if (categoryResultsCount) {

    categoryResultsCount.textContent =
      `${categories.length} ${
        categories.length === 1
          ? "category"
          : "categories"
      }`;

  }


  if (
    !categories.length
  ) {

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
                <span class="admin-icon-id">
                  ${escapeHtml(
                    category.id ||
                    "—"
                  )}
                </span>
              </td>

              <td>
                <span class="admin-muted">
                  ${escapeHtml(
                    category.description ||
                    "—"
                  )}
                </span>
              </td>

              <td>
                <span class="admin-muted">
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

                <div class="admin-icon-actions">

                  <button
                    type="button"
                    class="admin-icon-action"
                    data-category-edit="${
                      escapeHtml(
                        category.id
                      )
                    }"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    class="admin-icon-action"
                    data-category-toggle="${
                      escapeHtml(
                        category.id
                      )
                    }"
                    data-category-active="${
                      active
                    }"
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
                    data-category-delete="${
                      escapeHtml(
                        category.id
                      )
                    }"
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


  qsa(
    "[data-category-edit]",
    adminCategoriesBody
  ).forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          openCategoryModal(
            button.dataset.categoryEdit
          );

        }
      );

    }
  );


  qsa(
    "[data-category-toggle]",
    adminCategoriesBody
  ).forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          toggleCategory(
            button.dataset.categoryToggle,
            button.dataset.categoryActive ===
              "true"
          );

        }
      );

    }
  );


  qsa(
    "[data-category-delete]",
    adminCategoriesBody
  ).forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          deleteCategory(
            button.dataset.categoryDelete
          );

        }
      );

    }
  );

}


function renderCategoriesLoading() {

  if (!adminCategoriesBody) {
    return;
  }

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


function renderCategoriesError(
  message
) {

  if (!adminCategoriesBody) {
    return;
  }

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

}


/* =========================================================
   CATEGORY MODAL
   ========================================================= */

function ensureCategoryModal() {

  if (
    $("uassetCategoryModal")
  ) {

    return;

  }


  const modal =
    document.createElement(
      "div"
    );

  modal.id =
    "uassetCategoryModal";

  modal.className =
    "admin-modal";

  modal.hidden =
    true;

  modal.setAttribute(
    "aria-hidden",
    "true"
  );

  modal.innerHTML = `
    <div
      class="admin-modal-backdrop"
      data-category-close
    ></div>

    <div
      class="admin-modal-card"
      role="dialog"
      aria-modal="true"
    >

      <div class="admin-modal-head">

        <div>

          <p class="admin-panel-eyebrow">
            CATEGORY MANAGER
          </p>

          <h2
            class="admin-modal-title"
            id="uassetCategoryModalTitle"
          >
            New Category
          </h2>

          <p class="admin-modal-subtitle">
            Manage a UAsset icon category.
          </p>

        </div>

        <button
          type="button"
          class="admin-modal-close"
          id="uassetCategoryClose"
          aria-label="Close"
        >
          ×
        </button>

      </div>


      <div class="admin-modal-body">

        <div class="admin-form-grid">

          <div class="admin-form-group">

            <label
              class="admin-label"
              for="uassetCategoryName"
            >
              Name
            </label>

            <input
              id="uassetCategoryName"
              class="admin-input"
              type="text"
              maxlength="80"
              placeholder="Business"
            >

          </div>


          <div class="admin-form-group">

            <label
              class="admin-label"
              for="uassetCategoryId"
            >
              ID
            </label>

            <input
              id="uassetCategoryId"
              class="admin-input"
              type="text"
              maxlength="60"
              placeholder="business"
            >

          </div>


          <div class="admin-form-group">

            <label
              class="admin-label"
              for="uassetCategoryOrder"
            >
              Sort Order
            </label>

            <input
              id="uassetCategoryOrder"
              class="admin-input"
              type="number"
              value="0"
            >

          </div>


          <div class="admin-form-group">

            <label
              class="admin-label"
              for="uassetCategoryActive"
            >
              Status
            </label>

            <select
              id="uassetCategoryActive"
              class="admin-select"
            >

              <option value="true">
                Active
              </option>

              <option value="false">
                Hidden
              </option>

            </select>

          </div>


          <div class="admin-form-group admin-form-full">

            <label
              class="admin-label"
              for="uassetCategoryDescription"
            >
              Description
            </label>

            <textarea
              id="uassetCategoryDescription"
              class="admin-textarea"
              rows="4"
              maxlength="500"
              placeholder="Describe this category."
            ></textarea>

          </div>

        </div>

      </div>


      <div class="admin-modal-footer">

        <button
          type="button"
          class="admin-button"
          id="uassetCategoryCancel"
        >
          Cancel
        </button>

        <button
          type="button"
          class="admin-button primary"
          id="uassetCategorySave"
        >
          Save Category
        </button>

      </div>

    </div>
  `;


  document.body.appendChild(
    modal
  );


  $("uassetCategoryClose")
    .addEventListener(
      "click",
      closeCategoryModal
    );

  $("uassetCategoryCancel")
    .addEventListener(
      "click",
      closeCategoryModal
    );

  $("uassetCategorySave")
    .addEventListener(
      "click",
      saveCategory
    );

  qs(
    "[data-category-close]",
    modal
  ).addEventListener(
    "click",
    closeCategoryModal
  );

}


/* =========================================================
   CATEGORY MODAL OPEN
   ========================================================= */

function openCategoryModal(
  id = null
) {

  ensureCategoryModal();

  const modal =
    $("uassetCategoryModal");

  const title =
    $("uassetCategoryModalTitle");

  const name =
    $("uassetCategoryName");

  const categoryId =
    $("uassetCategoryId");

  const description =
    $("uassetCategoryDescription");

  const order =
    $("uassetCategoryOrder");

  const active =
    $("uassetCategoryActive");


  state.editingCategoryId =
    null;


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

      alert(
        "Category not found."
      );

      return;

    }

    state.editingCategoryId =
      category.id;

    title.textContent =
      "Edit Category";

    name.value =
      category.name ||
      "";

    categoryId.value =
      category.id ||
      "";

    description.value =
      category.description ||
      "";

    order.value =
      Number(
        category.sort_order ??
        0
      );

    active.value =
      category.is_active ===
        false
        ? "false"
        : "true";

    categoryId.disabled =
      true;

  } else {

    title.textContent =
      "New Category";

    name.value =
      "";

    categoryId.value =
      "";

    description.value =
      "";

    order.value =
      "0";

    active.value =
      "true";

    categoryId.disabled =
      false;

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

  setTimeout(
    () => {
      name.focus();
    },
    30
  );

}


function closeCategoryModal() {

  const modal =
    $("uassetCategoryModal");

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


/* =========================================================
   CATEGORY SAVE
   ========================================================= */

async function saveCategory() {

  const name =
    cleanText(
      $("uassetCategoryName").value
    );

  const id =
    normalizeId(
      $("uassetCategoryId").value ||
      name
    );

  const description =
    cleanText(
      $("uassetCategoryDescription").value
    );

  const sortOrder =
    Number(
      $("uassetCategoryOrder").value
    );

  const isActive =
    $("uassetCategoryActive").value !==
    "false";

  const editingId =
    state.editingCategoryId;


  if (!name) {

    alert(
      "Category name is required."
    );

    return;

  }


  if (!id) {

    alert(
      "Category ID is required."
    );

    return;

  }


  if (
    !Number.isFinite(
      sortOrder
    )
  ) {

    alert(
      "Sort order must be a valid number."
    );

    return;

  }


  const button =
    $("uassetCategorySave");


  setButtonLoading(
    button,
    true,
    "Saving..."
  );


  try {

    if (editingId) {

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
                editingId,

              name,

              description,

              sort_order:
                Math.trunc(
                  sortOrder
                ),

              is_active:
                isActive
            })
        }
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

              description,

              sort_order:
                Math.trunc(
                  sortOrder
                ),

              is_active:
                isActive
            })
        }
      );

    }


    alert(
      editingId
        ? "Category updated successfully."
        : "Category created successfully."
    );

    closeCategoryModal();

    await loadCategories();

  } catch (
    error
  ) {

    alert(
      error.message ||
      "Unable to save category."
    );

  } finally {

    setButtonLoading(
      button,
      false,
      editingId
        ? "Update Category"
        : "Save Category"
    );

  }

}


/* =========================================================
   CATEGORY TOGGLE
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

    await loadCategories();

  } catch (
    error
  ) {

    alert(
      error.message ||
      "Unable to update category."
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

    await loadCategories();

  } catch (
    error
  ) {

    alert(
      error.message ||
      "Unable to delete category."
    );

  }

}


/* =========================================================
   BUTTON LOADING
   ========================================================= */

function setButtonLoading(
  button,
  loading,
  label
) {

  if (!button) {
    return;
  }

  if (loading) {

    button.disabled =
      true;

    button.dataset.originalText =
      button.textContent;

    button.textContent =
      label;

  } else {

    button.disabled =
      false;

    button.textContent =
      label ||
      button.dataset.originalText ||
      button.textContent;

  }

}


/* =========================================================
   UPLOAD UI
   ========================================================= */

function showUploadMessage(
  message
) {

  if (!adminUploadList) {
    return;
  }

  adminUploadList.innerHTML = `
    <div
      class="admin-table-empty"
      style="padding:20px;"
    >
      ${escapeHtml(
        message
      )}
    </div>
  `;

}


function handleFiles(
  files
) {

  const list =
    Array.from(
      files || []
    );

  if (!list.length) {

    showUploadMessage(
      "No files selected."
    );

    return;

  }


  if (!adminUploadList) {
    return;
  }


  adminUploadList.innerHTML =
    list
      .map(
        file => `
          <div
            class="admin-setting-card"
            style="margin:10px 20px;"
          >

            <div class="admin-setting-copy">

              <h3>
                ${escapeHtml(
                  file.name
                )}
              </h3>

              <p>
                ${escapeHtml(
                  formatFileSize(
                    file.size
                  )
                )}
              </p>

            </div>

            <span class="admin-status-badge">
              Selected
            </span>

          </div>
        `
      )
      .join("");

}


function formatFileSize(
  bytes
) {

  const value =
    Number(
      bytes
    );

  if (!Number.isFinite(value)) {
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


adminUploadButton?.addEventListener(
  "click",
  () => {

    adminFileInput?.click();

  }
);


adminFileInput?.addEventListener(
  "change",
  () => {

    handleFiles(
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

    handleFiles(
      event.dataTransfer?.files
    );

  }
);


/* =========================================================
   ICON EVENTS
   ========================================================= */

newIconButton?.addEventListener(
  "click",
  openNewIcon
);

iconsNewButton?.addEventListener(
  "click",
  openNewIcon
);

manageIconsButton?.addEventListener(
  "click",
  loadIcons
);

quickNewIcon?.addEventListener(
  "click",
  openNewIcon
);

quickUpload?.addEventListener(
  "click",
  () => {

    activateSection(
      "uploads"
    );

    adminFileInput?.click();

  }
);

quickCollection?.addEventListener(
  "click",
  () => {

    activateSection(
      "collections"
    );

    openCollectionModal();

  }
);

quickCategory?.addEventListener(
  "click",
  () => {

    activateSection(
      "categories"
    );

    openCategoryModal();

  }
);


/* =========================================================
   COLLECTION EVENTS
   ========================================================= */

refreshCollectionsButton?.addEventListener(
  "click",
  loadCollections
);

newCollectionButton?.addEventListener(
  "click",
  () => {

    openCollectionModal();

  }
);


/* =========================================================
   CATEGORY EVENTS
   ========================================================= */

refreshCategoriesButton?.addEventListener(
  "click",
  loadCategories
);

newCategoryButton?.addEventListener(
  "click",
  () => {

    openCategoryModal();

  }
);


/* =========================================================
   ICON MODAL EVENTS
   ========================================================= */

closeNewIcon?.addEventListener(
  "click",
  closeIconModal
);

cancelNewIcon?.addEventListener(
  "click",
  closeIconModal
);

saveNewIcon?.addEventListener(
  "click",
  saveIcon
);


qsa(
  "[data-close-icon-modal]"
).forEach(
  element => {

    element.addEventListener(
      "click",
      closeIconModal
    );

  }
);


[
  iconName,
  iconId,
  iconCategory,
  iconTags,
  iconDescription,
  iconPlan,
  iconSvg
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


iconName?.addEventListener(
  "input",
  () => {

    if (
      !state.editingIconId &&
      !iconId.value.trim()
    ) {

      iconId.value =
        normalizeId(
          iconName.value
        );

    }

    updateIconPreview();

  }
);


/* =========================================================
   ICON FILTER EVENTS
   ========================================================= */

[
  iconSearch,
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


/* =========================================================
   CATEGORY FILTER EVENTS
   ========================================================= */

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
   KEYBOARD
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

    if (
      newIconModal &&
      !newIconModal.hidden
    ) {

      closeIconModal();

      return;

    }

    const collectionModal =
      $("uassetCollectionModal");

    if (
      collectionModal &&
      !collectionModal.hidden
    ) {

      closeCollectionModal();

      return;

    }

    const categoryModal =
      $("uassetCategoryModal");

    if (
      categoryModal &&
      !categoryModal.hidden
    ) {

      closeCategoryModal();

    }

  }
);


/* =========================================================
   GLOBAL CLICK SAFETY
   ========================================================= */

document.addEventListener(
  "click",
  event => {

    const target =
      event.target;

    if (
      target instanceof
      HTMLElement &&
      target.matches(
        ".admin-modal"
      )
    {

      if (
        target.id ===
        "newIconModal"
      ) {

        closeIconModal();

      }

      if (
        target.id ===
        "uassetCollectionModal"
      ) {

        closeCollectionModal();

      }

      if (
        target.id ===
        "uassetCategoryModal"
      ) {

        closeCategoryModal();

      }

    }

  }
);


/* =========================================================
   INITIALIZATION
   ========================================================= */

async function initAdmin() {

  activateSection(
    readInitialSection()
  );

  await loadDashboard();

}


initAdmin();
