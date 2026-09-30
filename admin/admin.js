/* =========================================================
   UASSET ADMIN — ADMIN.JS
   Icon Manager + Collections Manager
   Bean authentication handled by backend
   Live statistics
   ========================================================= */


/* =========================================================
   ELEMENTS
   ========================================================= */

const newIconButton =
  document.getElementById("newIconButton");

const manageIconsButton =
  document.getElementById("manageIconsButton");

const quickNewIcon =
  document.getElementById("quickNewIcon");

const quickUpload =
  document.getElementById("quickUpload");

const quickCollection =
  document.getElementById("quickCollection");

const quickCategory =
  document.getElementById("quickCategory");

const newCollectionButton =
  document.getElementById("newCollectionButton");

const newIconModal =
  document.getElementById("newIconModal");

const closeNewIcon =
  document.getElementById("closeNewIcon");

const cancelNewIcon =
  document.getElementById("cancelNewIcon");

const saveNewIcon =
  document.getElementById("saveNewIcon");

const iconName =
  document.getElementById("iconName");

const iconId =
  document.getElementById("iconId");

const iconCategory =
  document.getElementById("iconCategory");

const iconTags =
  document.getElementById("iconTags");

const iconDescription =
  document.getElementById("iconDescription");

const iconSvg =
  document.getElementById("iconSvg");

const iconLivePreview =
  document.getElementById("iconLivePreview");

const previewName =
  document.getElementById("previewName");

const previewId =
  document.getElementById("previewId");

const previewPlan =
  document.getElementById("previewPlan");

const adminIconsBody =
  document.getElementById("adminIconsBody");

const totalIcons =
  document.getElementById("totalIcons");

const freeIcons =
  document.getElementById("freeIcons");

const proIcons =
  document.getElementById("proIcons");

const totalCollections =
  document.getElementById("totalCollections");


/* =========================================================
   API
   ========================================================= */

const ADMIN_ICONS_LIST_API =
  "/api/admin/icons/list";

const ADMIN_ICONS_CREATE_API =
  "/api/admin/icons/create";

const ADMIN_COLLECTIONS_LIST_API =
  "/api/admin/collections/list";

const ADMIN_COLLECTIONS_CREATE_API =
  "/api/admin/collections/create";

const ADMIN_COLLECTIONS_UPDATE_API =
  "/api/admin/collections/update";

const ADMIN_COLLECTIONS_DELETE_API =
  "/api/admin/collections/delete";


/* =========================================================
   STATE
   ========================================================= */

let selectedPlan =
  "free";

let idWasManuallyEdited =
  false;

let adminIcons =
  [];

let adminIconsLoading =
  false;

let adminIconsLoaded =
  false;

let adminCollections =
  [];

let adminCollectionsLoading =
  false;

let editingCollectionId =
  null;


/* =========================================================
   SECURITY / HELPERS
   ========================================================= */

function escapeHtml(value) {

  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function makeIconId(value) {

  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}


function makeCollectionId(value) {

  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}


function parseCommaList(value) {

  return String(value || "")
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
}


/* =========================================================
   MODAL STYLES
   ========================================================= */

function injectModalStyles() {

  if (
    document.getElementById(
      "uassetAdminModalStyles"
    )
  ) {
    return;
  }

  const style =
    document.createElement("style");

  style.id =
    "uassetAdminModalStyles";

  style.textContent = `

    .admin-modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 100;

      display: none;
      align-items: center;
      justify-content: center;

      padding: 24px;

      background: rgba(0,0,0,.28);

      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }

    .admin-modal-backdrop.open {
      display: flex;
    }

    .admin-modal {
      width: min(1080px, 100%);
      max-height: calc(100vh - 48px);

      overflow: auto;

      border: 1px solid var(--line);
      border-radius: 22px;

      background: var(--surface);

      box-shadow:
        0 30px 90px rgba(0,0,0,.16);
    }

    .admin-modal-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;

      gap: 20px;

      padding: 22px;

      border-bottom: 1px solid var(--line);
    }

    .admin-modal-body {
      display: grid;

      grid-template-columns:
        minmax(0,1fr)
        minmax(280px,.72fr);

      gap: 22px;

      padding: 22px;
    }

    .admin-modal-close {
      width: 36px;
      height: 36px;

      flex: 0 0 auto;

      display: grid;
      place-items: center;

      border: 1px solid var(--line);
      border-radius: 50%;

      background: var(--surface);
      color: var(--text);

      font-size: 20px;
      line-height: 1;

      cursor: pointer;

      transition:
        background .15s ease,
        border-color .15s ease,
        transform .15s ease;
    }

    .admin-modal-close:hover {
      background: var(--surface-soft);
      border-color: var(--line-strong);
      transform: translateY(-1px);
    }

    .admin-modal-backdrop .admin-field {
      display: flex;
      flex-direction: column;
      gap: 7px;
    }

    .admin-modal-backdrop .admin-segmented {
      width: max-content;
    }

    .admin-modal-backdrop .admin-input,
    .admin-modal-backdrop .admin-textarea {
      font-family: var(--sans);
    }

    .admin-modal-backdrop #iconSvg {
      min-height: 210px;
      font-family: var(--mono);
      font-size: 11px;
      line-height: 1.6;
    }

    .admin-modal-backdrop .admin-icon-preview {
      min-height: 280px;
    }

    .admin-modal-backdrop .admin-icon-preview svg {
      width: 72px;
      height: 72px;
    }

    .admin-modal-backdrop .preview-placeholder {
      color: var(--muted);
      font-size: 11px;
      text-align: center;
    }

    .admin-modal-backdrop button:disabled {
      opacity: .55;
      cursor: not-allowed;
      transform: none !important;
    }

    .admin-live-icon-row {
      transition: background .15s ease;
    }

    .admin-live-icon-row:hover {
      background: var(--surface-soft);
    }

    .admin-live-icon-preview {
      width: 34px;
      height: 34px;

      display: flex;
      align-items: center;
      justify-content: center;
    }

    .admin-live-icon-preview svg {
      width: 26px;
      height: 26px;
    }

    .admin-live-icon-meta {
      display: flex;
      align-items: center;
      gap: 9px;
    }

    .admin-live-icon-copy {
      min-width: 0;
    }

    .admin-live-icon-name {
      font-size: 12px;
      font-weight: 600;
      line-height: 1.35;
    }

    .admin-live-icon-id {
      margin-top: 3px;

      font-family: var(--mono);
      font-size: 9px;
      color: var(--muted);

      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 220px;
    }

    .admin-status-dot {
      display: inline-block;

      width: 7px;
      height: 7px;

      margin-right: 6px;

      border-radius: 50%;

      background: currentColor;
    }

    body.admin-modal-open {
      overflow: hidden;
    }

    .uasset-collection-manager {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .uasset-collection-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;

      margin-bottom: 4px;
    }

    .uasset-collection-toolbar-copy {
      color: var(--muted);
      font-size: 11px;
    }

    .uasset-collection-table-wrap {
      overflow-x: auto;

      border: 1px solid var(--line);
      border-radius: var(--radius-md);

      background: var(--surface);
    }

    .uasset-collection-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 720px;
    }

    .uasset-collection-table th {
      padding: 11px 13px;

      border-bottom: 1px solid var(--line);

      color: var(--muted);

      font-family: var(--mono);
      font-size: 9px;
      font-weight: 500;

      text-align: left;
      white-space: nowrap;
    }

    .uasset-collection-table td {
      padding: 13px;

      border-bottom: 1px solid var(--line);

      font-size: 11px;

      vertical-align: middle;
    }

    .uasset-collection-table tr:last-child td {
      border-bottom: 0;
    }

    .uasset-collection-name {
      font-weight: 600;
    }

    .uasset-collection-id {
      margin-top: 3px;

      color: var(--muted);

      font-family: var(--mono);
      font-size: 9px;
    }

    .uasset-collection-categories {
      display: flex;
      gap: 5px;
      flex-wrap: wrap;
    }

    .uasset-collection-chip {
      display: inline-flex;
      align-items: center;

      padding: 4px 7px;

      border: 1px solid var(--line);
      border-radius: 999px;

      background: var(--surface-soft);

      font-size: 9px;
      color: var(--muted);
    }

    .uasset-collection-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .uasset-small-button {
      border: 1px solid var(--line);
      border-radius: 8px;

      padding: 7px 9px;

      background: var(--surface);
      color: var(--text);

      font-size: 10px;

      cursor: pointer;

      transition:
        background .15s ease,
        border-color .15s ease,
        transform .15s ease;
    }

    .uasset-small-button:hover {
      background: var(--surface-soft);
      border-color: var(--line-strong);
      transform: translateY(-1px);
    }

    .uasset-small-button.danger:hover {
      border-color: #b54b4b;
    }

    .uasset-collection-empty {
      padding: 30px;
      text-align: center;
      color: var(--muted);
      font-size: 11px;
    }

    .uasset-collection-form {
      display: flex;
      flex-direction: column;
      gap: 15px;
      padding: 22px;
    }

    .uasset-check-row {
      display: flex;
      align-items: center;
      gap: 8px;

      font-size: 11px;
    }

    .uasset-check-row input {
      width: 15px;
      height: 15px;
    }

    @media (max-width: 760px) {

      .admin-modal-backdrop {
        padding: 12px;
      }

      .admin-modal {
        max-height: calc(100vh - 24px);
        border-radius: 18px;
      }

      .admin-modal-head,
      .admin-modal-body {
        padding: 16px;
      }

      .admin-modal-body {
        grid-template-columns: 1fr;
      }

      .admin-live-icon-id {
        max-width: 140px;
      }

      .uasset-collection-form {
        padding: 16px;
      }

    }

  `;

  document.head.appendChild(style);
}


/* =========================================================
   ICON MODAL
   ========================================================= */

function openNewIconModal() {

  if (!newIconModal) {
    return;
  }

  resetNewIconForm();

  newIconModal.classList.add("open");

  newIconModal.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.classList.add(
    "admin-modal-open"
  );

  setTimeout(() => {
    iconName?.focus();
  }, 50);
}


function closeNewIconModal() {

  if (!newIconModal) {
    return;
  }

  newIconModal.classList.remove("open");

  newIconModal.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.classList.remove(
    "admin-modal-open"
  );
}


function resetNewIconForm() {

  if (iconName) {
    iconName.value = "";
  }

  if (iconId) {
    iconId.value = "";
  }

  if (iconCategory) {
    iconCategory.value = "";
  }

  if (iconTags) {
    iconTags.value = "";
  }

  if (iconDescription) {
    iconDescription.value = "";
  }

  if (iconSvg) {
    iconSvg.value = "";
  }

  selectedPlan = "free";

  idWasManuallyEdited = false;

  updatePlanButtons();
  updateLivePreview();
}


function updatePlanButtons() {

  document
    .querySelectorAll("[data-plan]")
    .forEach(button => {

      const active =
        button.dataset.plan ===
        selectedPlan;

      button.classList.toggle(
        "active",
        active
      );
    });

  if (previewPlan) {

    previewPlan.textContent =
      selectedPlan.toUpperCase();

    previewPlan.className =
      selectedPlan === "pro"
        ? "admin-badge pro"
        : "admin-badge free";
  }
}


/* =========================================================
   ICON LIVE SUMMARY
   ========================================================= */

function updateSummary() {

  const name =
    iconName?.value.trim();

  const id =
    iconId?.value.trim();

  if (previewName) {
    previewName.textContent =
      name || "New Icon";
  }

  if (previewId) {
    previewId.textContent =
      id || "new-icon";
  }

  updatePlanButtons();
}


function updateLivePreview() {

  if (!iconLivePreview) {
    return;
  }

  const svg =
    iconSvg?.value.trim();

  if (!svg) {

    iconLivePreview.innerHTML = `
      <span class="preview-placeholder">
        SVG preview
      </span>
    `;

    updateSummary();
    return;
  }

  const normalized =
    svg.toLowerCase();

  if (
    !normalized.startsWith("<svg") ||
    !normalized.includes("</svg>")
  ) {

    iconLivePreview.innerHTML = `
      <span
        class="preview-placeholder"
        style="color:#777871;"
      >
        Invalid SVG markup
      </span>
    `;

    updateSummary();
    return;
  }

  iconLivePreview.innerHTML =
    svg;

  const renderedSvg =
    iconLivePreview.querySelector(
      "svg"
    );

  if (!renderedSvg) {

    iconLivePreview.innerHTML = `
      <span class="preview-placeholder">
        Invalid SVG
      </span>
    `;

    updateSummary();
    return;
  }

  renderedSvg.setAttribute(
    "aria-hidden",
    "true"
  );

  renderedSvg.style.width =
    "72px";

  renderedSvg.style.height =
    "72px";

  renderedSvg.style.color =
    "#111111";

  updateSummary();
}


/* =========================================================
   ICON FORM EVENTS
   ========================================================= */

if (iconId) {

  iconId.addEventListener(
    "input",
    () => {

      idWasManuallyEdited =
        true;

      updateSummary();
    }
  );
}


if (iconName) {

  iconName.addEventListener(
    "input",
    () => {

      if (
        !idWasManuallyEdited &&
        iconId
      ) {

        iconId.value =
          makeIconId(
            iconName.value
          );
      }

      updateSummary();
    }
  );
}


[
  iconCategory,
  iconTags,
  iconDescription
]
  .filter(Boolean)
  .forEach(field => {

    field.addEventListener(
      "input",
      updateSummary
    );
  });


if (iconSvg) {

  iconSvg.addEventListener(
    "input",
    updateLivePreview
  );
}


document
  .querySelectorAll("[data-plan]")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        selectedPlan =
          button.dataset.plan ===
          "pro"
            ? "pro"
            : "free";

        updatePlanButtons();
      }
    );
  });


/* =========================================================
   VALIDATE ICON
   ========================================================= */

function validateNewIcon() {

  const name =
    iconName?.value.trim() || "";

  const id =
    iconId?.value.trim() || "";

  const category =
    iconCategory?.value.trim() || "";

  const svg =
    iconSvg?.value.trim() || "";

  if (!name) {

    alert(
      "Please enter an icon name."
    );

    iconName?.focus();

    return false;
  }

  if (
    !/^[a-z0-9-]+$/.test(id)
  ) {

    alert(
      "Icon ID must contain only lowercase letters, numbers and hyphens."
    );

    iconId?.focus();

    return false;
  }

  if (!category) {

    alert(
      "Please enter a category."
    );

    iconCategory?.focus();

    return false;
  }

  if (
    !svg ||
    !svg.toLowerCase().startsWith("<svg") ||
    !svg.toLowerCase().includes("</svg>")
  ) {

    alert(
      "Please paste a valid complete SVG."
    );

    iconSvg?.focus();

    return false;
  }

  return true;
}


/* =========================================================
   ICON STATS
   ========================================================= */

function updateDashboardStats(
  stats
) {

  if (totalIcons) {

    totalIcons.textContent =
      Number(
        stats?.totalIcons ?? 0
      );
  }

  if (freeIcons) {

    freeIcons.textContent =
      Number(
        stats?.freeIcons ?? 0
      );
  }

  if (proIcons) {

    proIcons.textContent =
      Number(
        stats?.proIcons ?? 0
      );
  }
}


/* =========================================================
   ICON TABLE
   ========================================================= */

function getAdminIconPlaceholder() {

  return `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="26"
      height="26"
      fill="none"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      style="opacity:.28;"
    >
      <rect
        x="5"
        y="5"
        width="14"
        height="14"
        rx="3"
      />

      <path d="M8 12h8" />
    </svg>
  `;
}


function renderAdminIcons(
  icons
) {

  if (!adminIconsBody) {
    return;
  }

  if (
    !Array.isArray(icons) ||
    icons.length === 0
  ) {

    adminIconsBody.innerHTML = `
      <tr>
        <td
          colspan="4"
          style="
            text-align:center;
            padding:28px;
            color:var(--muted);
          "
        >
          No icons found.
        </td>
      </tr>
    `;

    return;
  }

  adminIconsBody.innerHTML =
    icons
      .map(icon => {

        const safeName =
          escapeHtml(icon.name);

        const safeId =
          escapeHtml(icon.id);

        const safeCategory =
          escapeHtml(icon.category);

        const plan =
          icon.plan === "pro"
            ? "pro"
            : "free";

        const isActive =
          icon.isActive === true;

        const statusColor =
          isActive
            ? "currentColor"
            : "var(--muted)";

        return `
          <tr
            class="admin-live-icon-row"
          >

            <td>

              <div
                class="admin-live-icon-meta"
              >

                <div
                  class="admin-live-icon-preview"
                  aria-hidden="true"
                >
                  ${getAdminIconPlaceholder()}
                </div>

                <div
                  class="admin-live-icon-copy"
                >

                  <div
                    class="admin-live-icon-name"
                  >
                    ${safeName}
                  </div>

                  <div
                    class="admin-live-icon-id"
                  >
                    ${safeId}
                  </div>

                </div>

              </div>

            </td>

            <td>
              ${safeCategory}
            </td>

            <td>

              <span
                class="admin-badge ${plan}"
              >
                ${plan.toUpperCase()}
              </span>

            </td>

            <td
              style="color:${statusColor};"
            >

              <span
                class="admin-status-dot"
              ></span>

              ${
                isActive
                  ? "Active"
                  : "Hidden"
              }

            </td>

          </tr>
        `;
      })
      .join("");
}


/* =========================================================
   LOAD ICONS
   ========================================================= */

async function loadAdminIcons() {

  if (adminIconsLoading) {
    return;
  }

  adminIconsLoading = true;

  if (adminIconsBody) {

    adminIconsBody.innerHTML = `
      <tr>
        <td
          colspan="4"
          style="
            text-align:center;
            padding:28px;
            color:var(--muted);
          "
        >
          Loading icons...
        </td>
      </tr>
    `;
  }

  try {

    const response =
      await fetch(
        ADMIN_ICONS_LIST_API,
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
        .catch(() => ({}));

    if (
      response.status === 401
    ) {

      throw new Error(
        "Login with Bean ID required."
      );
    }

    if (
      response.status === 403
    ) {

      throw new Error(
        "UAsset admin access required."
      );
    }

    if (
      !response.ok ||
      data.success !== true
    ) {

      console.error(
        "Admin icons API error:",
        {
          status:
            response.status,
          response:
            data
        }
      );

      throw new Error(
        data.error ||
        "Unable to load admin icon library."
      );
    }

    adminIcons =
      Array.isArray(data.icons)
        ? data.icons
        : [];

    adminIconsLoaded = true;

    renderAdminIcons(
      adminIcons
    );

    updateDashboardStats(
      data.stats || {}
    );

  } catch (error) {

    console.error(
      "UAsset admin icon loading failed:",
      error
    );

    if (adminIconsBody) {

      adminIconsBody.innerHTML = `
        <tr>
          <td
            colspan="4"
            style="
              text-align:center;
              padding:28px;
              color:var(--muted);
            "
          >
            ${escapeHtml(
              error?.message ||
              "Unable to load icons."
            )}
          </td>
        </tr>
      `;
    }

  } finally {

    adminIconsLoading = false;
  }
}


/* =========================================================
   SAVE NEW ICON
   ========================================================= */

async function prepareNewIcon() {

  if (!validateNewIcon()) {
    return;
  }

  const payload = {

    id:
      iconId.value.trim(),

    name:
      iconName.value.trim(),

    category:
      iconCategory.value.trim(),

    tags:
      parseCommaList(
        iconTags.value
      ),

    description:
      iconDescription.value.trim(),

    plan:
      selectedPlan,

    svg:
      iconSvg.value.trim()
  };

  const originalText =
    saveNewIcon?.textContent ||
    "Save Icon";

  if (saveNewIcon) {

    saveNewIcon.disabled =
      true;

    saveNewIcon.textContent =
      "Saving...";
  }

  try {

    const response =
      await fetch(
        ADMIN_ICONS_CREATE_API,
        {
          method: "POST",
          credentials: "include",
          cache: "no-store",
          headers: {
            Accept:
              "application/json",
            "Content-Type":
              "application/json"
          },
          body:
            JSON.stringify(payload)
        }
      );

    const data =
      await response
        .json()
        .catch(() => ({}));

    if (
      response.status === 401
    ) {

      throw new Error(
        "Login with Bean ID required."
      );
    }

    if (
      response.status === 403
    ) {

      throw new Error(
        "UAsset admin access required."
      );
    }

    if (
      !response.ok ||
      data.success !== true
    ) {

      let message =
        data.error ||
        "Unable to save icon.";

      if (data.code) {
        message +=
          `\n\nCode: ${data.code}`;
      }

      throw new Error(
        message
      );
    }

    alert(
      `Icon "${payload.name}" saved successfully!`
    );

    closeNewIconModal();

    resetNewIconForm();

    await loadAdminIcons();

  } catch (error) {

    console.error(
      "UAsset admin save error:",
      error
    );

    alert(
      error?.message ||
      "Unable to save icon."
    );

  } finally {

    if (saveNewIcon) {

      saveNewIcon.disabled =
        false;

      saveNewIcon.textContent =
        originalText;
    }
  }
}


/* =========================================================
   COLLECTION MANAGER UI
   ========================================================= */

function getCollectionsSection() {

  return document.getElementById(
    "collections"
  );
}


function ensureCollectionsManagerUI() {

  const section =
    getCollectionsSection();

  if (!section) {
    return null;
  }

  let manager =
    document.getElementById(
      "uassetCollectionsManager"
    );

  if (manager) {
    return manager;
  }

  const panelBody =
    section.querySelector(
      ".admin-panel-body"
    );

  if (!panelBody) {
    return null;
  }

  manager =
    document.createElement("div");

  manager.id =
    "uassetCollectionsManager";

  manager.className =
    "uasset-collection-manager";

  panelBody.innerHTML = "";

  panelBody.appendChild(
    manager
  );

  return manager;
}


function renderCollections() {

  const manager =
    ensureCollectionsManagerUI();

  if (!manager) {
    return;
  }

  const collections =
    Array.isArray(
      adminCollections
    )
      ? adminCollections
      : [];

  manager.innerHTML = `

    <div
      class="uasset-collection-toolbar"
    >

      <div
        class="uasset-collection-toolbar-copy"
      >
        Manage collection groups,
        categories and visibility.
      </div>

      <button
        type="button"
        class="admin-button"
        id="uassetInlineNewCollection"
      >
        + New Collection
      </button>

    </div>

    ${
      collections.length === 0
        ? `
          <div
            class="uasset-collection-table-wrap"
          >
            <div
              class="uasset-collection-empty"
            >
              No collections found.
            </div>
          </div>
        `
        : `
          <div
            class="uasset-collection-table-wrap"
          >

            <table
              class="uasset-collection-table"
            >

              <thead>
                <tr>

                  <th>
                    COLLECTION
                  </th>

                  <th>
                    CATEGORIES
                  </th>

                  <th>
                    STATUS
                  </th>

                  <th>
                    CREATED
                  </th>

                  <th>
                    ACTIONS
                  </th>

                </tr>
              </thead>

              <tbody>

                ${
                  collections
                    .map(
                      collection => {

                        const id =
                          escapeHtml(
                            collection.id
                          );

                        const name =
                          escapeHtml(
                            collection.name
                          );

                        const categories =
                          Array.isArray(
                            collection.categories
                          )
                            ? collection.categories
                            : [];

                        const safeCategories =
                          categories
                            .map(
                              category =>
                                `
                                  <span
                                    class="uasset-collection-chip"
                                  >
                                    ${escapeHtml(
                                      category
                                    )}
                                  </span>
                                `
                            )
                            .join("");

                        const active =
                          collection.is_active === true;

                        const created =
                          collection.created_at
                            ? new Date(
                                collection.created_at
                              ).toLocaleDateString()
                            : "—";

                        return `
                          <tr>

                            <td>

                              <div
                                class="uasset-collection-name"
                              >
                                ${name}
                              </div>

                              <div
                                class="uasset-collection-id"
                              >
                                ${id}
                              </div>

                            </td>

                            <td>

                              <div
                                class="uasset-collection-categories"
                              >
                                ${
                                  safeCategories ||
                                  `
                                    <span
                                      class="uasset-collection-chip"
                                    >
                                      No categories
                                    </span>
                                  `
                                }
                              </div>

                            </td>

                            <td>

                              <span
                                class="
                                  admin-badge
                                  ${active ? "free" : ""}
                                "
                              >
                                ${active ? "ACTIVE" : "HIDDEN"}
                              </span>

                            </td>

                            <td>
                              ${escapeHtml(created)}
                            </td>

                            <td>

                              <div
                                class="uasset-collection-actions"
                              >

                                <button
                                  type="button"
                                  class="uasset-small-button"
                                  data-collection-edit="${id}"
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  class="uasset-small-button"
                                  data-collection-toggle="${id}"
                                >
                                  ${
                                    active
                                      ? "Hide"
                                      : "Unhide"
                                  }
                                </button>

                                <button
                                  type="button"
                                  class="uasset-small-button danger"
                                  data-collection-delete="${id}"
                                >
                                  Delete
                                </button>

                              </div>

                            </td>

                          </tr>
                        `;
                      }
                    )
                    .join("")
                }

              </tbody>

            </table>

          </div>
        `
    }

  `;

  const inlineButton =
    document.getElementById(
      "uassetInlineNewCollection"
    );

  if (inlineButton) {

    inlineButton.addEventListener(
      "click",
      () => {
        openCollectionModal();
      }
    );
  }

  manager
    .querySelectorAll(
      "[data-collection-edit]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          openCollectionEditModal(
            button.dataset.collectionEdit
          );
        }
      );
    });

  manager
    .querySelectorAll(
      "[data-collection-toggle]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          toggleCollection(
            button.dataset.collectionToggle
          );
        }
      );
    });

  manager
    .querySelectorAll(
      "[data-collection-delete]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          deleteCollection(
            button.dataset.collectionDelete
          );
        }
      );
    });
}


/* =========================================================
   COLLECTION MODAL
   ========================================================= */

function createCollectionModal() {

  if (
    document.getElementById(
      "uassetCollectionModal"
    )
  ) {
    return;
  }

  const backdrop =
    document.createElement("div");

  backdrop.id =
    "uassetCollectionModal";

  backdrop.className =
    "admin-modal-backdrop";

  backdrop.setAttribute(
    "aria-hidden",
    "true"
  );

  backdrop.innerHTML = `

    <div
      class="admin-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="uassetCollectionModalTitle"
    >

      <div
        class="admin-modal-head"
      >

        <div>

          <p class="eyebrow">
            UASSET / COLLECTION MANAGER
          </p>

          <h2
            class="admin-panel-title"
            id="uassetCollectionModalTitle"
          >
            New Collection
          </h2>

          <p
            class="admin-panel-subtitle"
            id="uassetCollectionModalSubtitle"
          >
            Create a curated collection of icon categories.
          </p>

        </div>

        <button
          type="button"
          class="admin-modal-close"
          id="uassetCollectionModalClose"
          aria-label="Close"
        >
          ×
        </button>

      </div>

      <div
        class="uasset-collection-form"
      >

        <div
          class="admin-field"
        >

          <label
            class="admin-label"
            for="uassetCollectionName"
          >
            Collection Name
          </label>

          <input
            class="admin-input"
            id="uassetCollectionName"
            type="text"
            maxlength="120"
            placeholder="Example: Business Essentials"
            autocomplete="off"
          >

        </div>

        <div
          class="admin-field"
        >

          <label
            class="admin-label"
            for="uassetCollectionId"
          >
            Collection ID
          </label>

          <input
            class="admin-input"
            id="uassetCollectionId"
            type="text"
            maxlength="60"
            placeholder="business-essentials"
            autocomplete="off"
          >

          <span class="admin-help">
            Lowercase letters, numbers and hyphens only.
          </span>

        </div>

        <div
          class="admin-field"
        >

          <label
            class="admin-label"
            for="uassetCollectionCategories"
          >
            Categories
          </label>

          <input
            class="admin-input"
            id="uassetCollectionCategories"
            type="text"
            maxlength="1000"
            placeholder="business, office, finance"
            autocomplete="off"
          >

          <span class="admin-help">
            Enter categories separated by commas.
          </span>

        </div>

        <div
          class="admin-field"
        >

          <label
            class="admin-label"
            for="uassetCollectionDescription"
          >
            Description
          </label>

          <textarea
            class="admin-textarea"
            id="uassetCollectionDescription"
            maxlength="1000"
            style="min-height:110px;resize:vertical;"
            placeholder="Describe this collection..."
          ></textarea>

        </div>

        <label
          class="uasset-check-row"
        >

          <input
            type="checkbox"
            id="uassetCollectionActive"
            checked
          >

          <span>
            Collection is active
          </span>

        </label>

        <div
          style="
            display:flex;
            justify-content:flex-end;
            gap:9px;
            padding-top:4px;
          "
        >

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
            Create Collection
          </button>

        </div>

      </div>

    </div>

  `;

  document.body.appendChild(
    backdrop
  );

  document
    .getElementById(
      "uassetCollectionModalClose"
    )
    ?.addEventListener(
      "click",
      closeCollectionModal
    );

  document
    .getElementById(
      "uassetCollectionCancel"
    )
    ?.addEventListener(
      "click",
      closeCollectionModal
    );

  backdrop.addEventListener(
    "click",
    event => {

      if (
        event.target ===
        backdrop
      ) {
        closeCollectionModal();
      }
    }
  );
}


function openCollectionModal() {

  createCollectionModal();

  editingCollectionId =
    null;

  const modal =
    document.getElementById(
      "uassetCollectionModal"
    );

  const title =
    document.getElementById(
      "uassetCollectionModalTitle"
    );

  const subtitle =
    document.getElementById(
      "uassetCollectionModalSubtitle"
    );

  const name =
    document.getElementById(
      "uassetCollectionName"
    );

  const id =
    document.getElementById(
      "uassetCollectionId"
    );

  const categories =
    document.getElementById(
      "uassetCollectionCategories"
    );

  const description =
    document.getElementById(
      "uassetCollectionDescription"
    );

  const active =
    document.getElementById(
      "uassetCollectionActive"
    );

  const save =
    document.getElementById(
      "uassetCollectionSave"
    );

  if (!modal) {
    return;
  }

  title.textContent =
    "New Collection";

  subtitle.textContent =
    "Create a curated collection of icon categories.";

  name.value = "";
  id.value = "";
  categories.value = "";
  description.value = "";
  active.checked = true;

  id.disabled = false;

  save.textContent =
    "Create Collection";

  modal.classList.add("open");

  modal.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.classList.add(
    "admin-modal-open"
  );

  setTimeout(() => {
    name.focus();
  }, 40);
}


function openCollectionEditModal(
  collectionId
) {

  const collection =
    adminCollections.find(
      item =>
        String(item.id) ===
        String(collectionId)
    );

  if (!collection) {

    alert(
      "Collection not found."
    );

    return;
  }

  createCollectionModal();

  editingCollectionId =
    collection.id;

  const modal =
    document.getElementById(
      "uassetCollectionModal"
    );

  const title =
    document.getElementById(
      "uassetCollectionModalTitle"
    );

  const subtitle =
    document.getElementById(
      "uassetCollectionModalSubtitle"
    );

  const name =
    document.getElementById(
      "uassetCollectionName"
    );

  const id =
    document.getElementById(
      "uassetCollectionId"
    );

  const categories =
    document.getElementById(
      "uassetCollectionCategories"
    );

  const description =
    document.getElementById(
      "uassetCollectionDescription"
    );

  const active =
    document.getElementById(
      "uassetCollectionActive"
    );

  const save =
    document.getElementById(
      "uassetCollectionSave"
    );

  title.textContent =
    "Edit Collection";

  subtitle.textContent =
    "Update collection details and visibility.";

  name.value =
    collection.name || "";

  id.value =
    collection.id || "";

  id.disabled = true;

  categories.value =
    Array.isArray(
      collection.categories
    )
      ? collection.categories.join(", ")
      : "";

  description.value =
    collection.description || "";

  active.checked =
    collection.is_active === true;

  save.textContent =
    "Save Changes";

  modal.classList.add("open");

  modal.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.classList.add(
    "admin-modal-open"
  );

  setTimeout(() => {
    name.focus();
  }, 40);
}


function closeCollectionModal() {

  const modal =
    document.getElementById(
      "uassetCollectionModal"
    );

  if (!modal) {
    return;
  }

  modal.classList.remove("open");

  modal.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.classList.remove(
    "admin-modal-open"
  );

  editingCollectionId =
    null;
}


/* =========================================================
   COLLECTION API HELPERS
   ========================================================= */

async function parseApiResponse(
  response
) {

  return response
    .json()
    .catch(() => ({}));
}


/* =========================================================
   LOAD COLLECTIONS
   ========================================================= */

async function loadAdminCollections() {

  if (adminCollectionsLoading) {
    return;
  }

  adminCollectionsLoading =
    true;

  const manager =
    ensureCollectionsManagerUI();

  if (manager) {

    manager.innerHTML = `
      <div
        class="uasset-collection-empty"
      >
        Loading collections...
      </div>
    `;
  }

  try {

    const response =
      await fetch(
        `${ADMIN_COLLECTIONS_LIST_API}?include_inactive=true`,
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
      await parseApiResponse(
        response
      );

    if (
      response.status ===
      401
    ) {

      throw new Error(
        "Login with Bean ID required."
      );
    }

    if (
      response.status ===
      403
    ) {

      throw new Error(
        "UAsset admin access required."
      );
    }

    if (
      !response.ok ||
      data.success !== true
    ) {

      throw new Error(
        data.error ||
        "Unable to load collections."
      );
    }

    adminCollections =
      Array.isArray(
        data.collections
      )
        ? data.collections
        : [];

    if (totalCollections) {

      totalCollections.textContent =
        adminCollections.length;
    }

    renderCollections();

  } catch (error) {

    console.error(
      "UAsset collection loading failed:",
      error
    );

    const managerError =
      ensureCollectionsManagerUI();

    if (managerError) {

      managerError.innerHTML = `

        <div
          class="uasset-collection-empty"
        >
          ${escapeHtml(
            error?.message ||
            "Unable to load collections."
          )}
        </div>

      `;
    }

  } finally {

    adminCollectionsLoading =
      false;
  }
}


/* =========================================================
   CREATE / UPDATE COLLECTION
   ========================================================= */

async function saveCollection() {

  const nameField =
    document.getElementById(
      "uassetCollectionName"
    );

  const idField =
    document.getElementById(
      "uassetCollectionId"
    );

  const categoriesField =
    document.getElementById(
      "uassetCollectionCategories"
    );

  const descriptionField =
    document.getElementById(
      "uassetCollectionDescription"
    );

  const activeField =
    document.getElementById(
      "uassetCollectionActive"
    );

  const saveButton =
    document.getElementById(
      "uassetCollectionSave"
    );

  const name =
    nameField?.value.trim() || "";

  const rawId =
    idField?.value.trim() || "";

  const id =
    makeCollectionId(
      rawId
    );

  const categories =
    parseCommaList(
      categoriesField?.value
    );

  const description =
    descriptionField?.value.trim() || "";

  const isActive =
    activeField?.checked === true;

  if (!name) {

    alert(
      "Please enter a collection name."
    );

    nameField?.focus();

    return;
  }

  if (
    !id ||
    !/^[a-z0-9-]+$/.test(id)
  ) {

    alert(
      "Collection ID must contain only lowercase letters, numbers and hyphens."
    );

    idField?.focus();

    return;
  }

  if (
    categories.length ===
    0
  ) {

    alert(
      "Please add at least one category."
    );

    categoriesField?.focus();

    return;
  }

  const payload = {

    id,

    name,

    description,

    categories,

    is_active:
      isActive
  };

  const isEditing =
    !!editingCollectionId;

  const endpoint =
    isEditing
      ? ADMIN_COLLECTIONS_UPDATE_API
      : ADMIN_COLLECTIONS_CREATE_API;

  const method =
    isEditing
      ? "PATCH"
      : "POST";

  const originalText =
    saveButton?.textContent ||
    "Save";

  if (saveButton) {

    saveButton.disabled =
      true;

    saveButton.textContent =
      isEditing
        ? "Saving..."
        : "Creating...";
  }

  try {

    const response =
      await fetch(
        endpoint,
        {
          method,
          credentials: "include",
          cache: "no-store",
          headers: {
            Accept:
              "application/json",
            "Content-Type":
              "application/json"
          },
          body:
            JSON.stringify(
              payload
            )
        }
      );

    const data =
      await parseApiResponse(
        response
      );

    if (
      response.status ===
      401
    ) {

      throw new Error(
        "Login with Bean ID required."
      );
    }

    if (
      response.status ===
      403
    ) {

      throw new Error(
        "UAsset admin access required."
      );
    }

    if (
      !response.ok ||
      data.success !== true
    ) {

      let message =
        data.error ||
        (
          isEditing
            ? "Unable to update collection."
            : "Unable to create collection."
        );

      if (data.code) {

        message +=
          `\n\nCode: ${data.code}`;
      }

      throw new Error(
        message
      );
    }

    alert(
      isEditing
        ? `Collection "${name}" updated successfully!`
        : `Collection "${name}" created successfully!`
    );

    closeCollectionModal();

    await loadAdminCollections();

  } catch (error) {

    console.error(
      "UAsset collection save failed:",
      error
    );

    alert(
      error?.message ||
      "Unable to save collection."
    );

  } finally {

    if (saveButton) {

      saveButton.disabled =
        false;

      saveButton.textContent =
        originalText;
    }
  }
}


/* =========================================================
   TOGGLE COLLECTION
   ========================================================= */

async function toggleCollection(
  collectionId
) {

  const collection =
    adminCollections.find(
      item =>
        String(item.id) ===
        String(collectionId)
    );

  if (!collection) {

    alert(
      "Collection not found."
    );

    return;
  }

  const nextActive =
    collection.is_active !== true;

  const actionText =
    nextActive
      ? "unhide"
      : "hide";

  const confirmed =
    window.confirm(
      `Are you sure you want to ${actionText} "${collection.name}"?`
    );

  if (!confirmed) {
    return;
  }

  try {

    const response =
      await fetch(
        ADMIN_COLLECTIONS_UPDATE_API,
        {
          method: "PATCH",
          credentials: "include",
          cache: "no-store",
          headers: {
            Accept:
              "application/json",
            "Content-Type":
              "application/json"
          },
          body:
            JSON.stringify({
              id:
                collection.id,
              is_active:
                nextActive
            })
        }
      );

    const data =
      await parseApiResponse(
        response
      );

    if (
      response.status ===
      401
    ) {

      throw new Error(
        "Login with Bean ID required."
      );
    }

    if (
      response.status ===
      403
    ) {

      throw new Error(
        "UAsset admin access required."
      );
    }

    if (
      !response.ok ||
      data.success !== true
    ) {

      throw new Error(
        data.error ||
        "Unable to update collection status."
      );
    }

    await loadAdminCollections();

  } catch (error) {

    console.error(
      "UAsset collection toggle failed:",
      error
    );

    alert(
      error?.message ||
      "Unable to update collection status."
    );
  }
}


/* =========================================================
   DELETE COLLECTION
   ========================================================= */

async function deleteCollection(
  collectionId
) {

  const collection =
    adminCollections.find(
      item =>
        String(item.id) ===
        String(collectionId)
    );

  if (!collection) {

    alert(
      "Collection not found."
    );

    return;
  }

  const confirmed =
    window.confirm(
      `Delete collection "${collection.name}"?\n\nThis action cannot be undone.`
    );

  if (!confirmed) {
    return;
  }

  try {

    const response =
      await fetch(
        `${ADMIN_COLLECTIONS_DELETE_API}?id=${encodeURIComponent(
          collection.id
        )}`,
        {
          method: "DELETE",
          credentials: "include",
          cache: "no-store",
          headers: {
            Accept:
              "application/json"
          }
        }
      );

    const data =
      await parseApiResponse(
        response
      );

    if (
      response.status ===
      401
    ) {

      throw new Error(
        "Login with Bean ID required."
      );
    }

    if (
      response.status ===
      403
    ) {

      throw new Error(
        "UAsset admin access required."
      );
    }

    if (
      response.status ===
      409
    ) {

      throw new Error(
        data.error ||
        "Collection cannot be deleted because it is still in use."
      );
    }

    if (
      !response.ok ||
      data.success !== true
    ) {

      throw new Error(
        data.error ||
        "Unable to delete collection."
      );
    }

    alert(
      `Collection "${collection.name}" deleted successfully!`
    );

    await loadAdminCollections();

  } catch (error) {

    console.error(
      "UAsset collection delete failed:",
      error
    );

    alert(
      error?.message ||
      "Unable to delete collection."
    );
  }
}


/* =========================================================
   BUTTON EVENTS
   ========================================================= */

if (
  newIconButton
) {

  newIconButton.addEventListener(
    "click",
    openNewIconModal
  );
}


if (
  quickNewIcon
) {

  quickNewIcon.addEventListener(
    "click",
    openNewIconModal
  );
}


if (
  closeNewIcon
) {

  closeNewIcon.addEventListener(
    "click",
    closeNewIconModal
  );
}


if (
  cancelNewIcon
) {

  cancelNewIcon.addEventListener(
    "click",
    closeNewIconModal
  );
}


if (
  saveNewIcon
) {

  saveNewIcon.addEventListener(
    "click",
    prepareNewIcon
  );
}


if (
  newCollectionButton
) {

  newCollectionButton.addEventListener(
    "click",
    openCollectionModal
  );
}


/* =========================================================
   BACKDROP CLICK — ICON MODAL
   ========================================================= */

if (
  newIconModal
) {

  newIconModal.addEventListener(
    "click",
    event => {

      if (
        event.target ===
        newIconModal
      ) {

        closeNewIconModal();
      }
    }
  );
}


/* =========================================================
   ESCAPE KEY
   ========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key ===
      "Escape"
    ) {

      if (
        newIconModal?.classList.contains(
          "open"
        )
      ) {

        closeNewIconModal();
        return;
      }

      const collectionModal =
        document.getElementById(
          "uassetCollectionModal"
        );

      if (
        collectionModal?.classList.contains(
          "open"
        )
      ) {

        closeCollectionModal();
      }
    }
  }
);


/* =========================================================
   NAVIGATION
   ========================================================= */

function scrollToSection(
  id
) {

  const section =
    document.getElementById(
      id
    );

  if (!section) {
    return;
  }

  section.scrollIntoView({
    behavior:
      "smooth",
    block:
      "start"
  });
}


if (
  manageIconsButton
) {

  manageIconsButton.addEventListener(
    "click",
    () => {

      scrollToSection(
        "icons"
      );
    }
  );
}


if (
  quickUpload
) {

  quickUpload.addEventListener(
    "click",
    () => {

      scrollToSection(
        "uploads"
      );
    }
  );
}


if (
  quickCollection
) {

  quickCollection.addEventListener(
    "click",
    () => {

      scrollToSection(
        "collections"
      );

      loadAdminCollections();
    }
  );
}


if (
  quickCategory
) {

  quickCategory.addEventListener(
    "click",
    () => {

      scrollToSection(
        "categories"
      );
    }
  );
}


/* =========================================================
   SIDEBAR ACTIVE STATE
   ========================================================= */

const navLinks =
  document.querySelectorAll(
    ".admin-nav-link"
  );


navLinks.forEach(
  link => {

    link.addEventListener(
      "click",
      () => {

        navLinks.forEach(
          item => {

            item.classList.remove(
              "active"
            );
          }
        );

        link.classList.add(
          "active"
        );
      }
    );

  }
);


/* =========================================================
   INITIALIZE
   ========================================================= */

injectModalStyles();

updatePlanButtons();

updateSummary();

updateLivePreview();

/*
  Prepare database-backed managers.
*/

ensureCollectionsManagerUI();

/*
  Load live database data.
*/

loadAdminIcons();

loadAdminCollections();


console.log(
  "UAsset Admin — live dashboard + collection manager loaded."
);
