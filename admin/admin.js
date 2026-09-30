/* =========================================================
   UASSET ADMIN — ADMIN.JS
   Clean unified version

   Features:
   - Dashboard statistics
   - Icon list
   - Create icon
   - Edit icon
   - Hide / Unhide icon
   - Delete icon
   - Collections list
   - Create collection
   - Edit collection
   - Hide / Unhide collection
   - Delete collection
   - Bean authentication via backend APIs
   ========================================================= */


/* =========================================================
   DOM HELPERS
   ========================================================= */

function $(id) {
  return document.getElementById(id);
}


/* =========================================================
   PRIMARY ELEMENTS
   ========================================================= */

const newIconButton =
  $("newIconButton");

const manageIconsButton =
  $("manageIconsButton");

const quickNewIcon =
  $("quickNewIcon");

const quickUpload =
  $("quickUpload");

const quickCollection =
  $("quickCollection");

const quickCategory =
  $("quickCategory");

const newCollectionButton =
  $("newCollectionButton");


/* =========================================================
   ICON MODAL ELEMENTS
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


/* =========================================================
   DASHBOARD ELEMENTS
   ========================================================= */

const adminIconsBody =
  $("adminIconsBody");

const totalIcons =
  $("totalIcons");

const freeIcons =
  $("freeIcons");

const proIcons =
  $("proIcons");

const totalCollections =
  $("totalCollections");


/* =========================================================
   API ENDPOINTS
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
  }

};


/* =========================================================
   APPLICATION STATE
   ========================================================= */

const state = {

  selectedPlan:
    "free",

  editingIconId:
    null,

  editingCollectionId:
    null,

  icons:
    [],

  collections:
    [],

  loadingIcons:
    false,

  loadingCollections:
    false

};


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHtml(value) {

  return String(value ?? "")
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


/* =========================================================
   ID NORMALIZATION
   ========================================================= */

function normalizeId(value) {

  return String(value || "")
    .trim()
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


/* =========================================================
   COMMA LIST
   ========================================================= */

function parseCommaList(value) {

  return [
    ...new Set(
      String(value || "")
        .split(",")
        .map(
          item =>
            item.trim()
        )
        .filter(Boolean)
    )
  ];
}


/* =========================================================
   JSON RESPONSE
   ========================================================= */

async function readJson(response) {

  try {

    return await response.json();

  } catch {

    return {};

  }

}


/* =========================================================
   API ERROR
   ========================================================= */

function apiErrorMessage(
  data,
  fallback
) {

  let message =
    data?.error ||
    fallback;

  if (
    data?.code
  ) {

    message +=
      `\n\nCode: ${data.code}`;
  }

  return message;
}


/* =========================================================
   MODAL CSS
   ========================================================= */

function injectAdminStyles() {

  if (
    $("uassetAdminRuntimeStyles")
  ) {

    return;

  }


  const style =
    document.createElement(
      "style"
    );


  style.id =
    "uassetAdminRuntimeStyles";


  style.textContent = `

    body.uasset-modal-open {
      overflow: hidden;
    }


    .uasset-icon-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }


    .uasset-icon-action {
      border: 1px solid var(--line);
      border-radius: 8px;

      padding: 6px 9px;

      background: var(--surface);
      color: var(--text);

      font-size: 10px;
      line-height: 1;

      cursor: pointer;

      transition:
        background .15s ease,
        border-color .15s ease,
        transform .15s ease;
    }


    .uasset-icon-action:hover {
      background: var(--surface-soft);
      border-color: var(--line-strong);
      transform: translateY(-1px);
    }


    .uasset-icon-action.danger:hover {
      border-color: #b54b4b;
    }


    .uasset-action-disabled {
      opacity: .55;
      pointer-events: none;
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
      gap: 12px;
      flex-wrap: wrap;
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
      min-width: 720px;

      border-collapse: collapse;
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

      color: var(--muted);

      font-size: 9px;
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
    }


    .uasset-small-button:hover {
      background: var(--surface-soft);
      border-color: var(--line-strong);
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

      .uasset-collection-form {
        padding: 16px;
      }

      .uasset-icon-actions {
        align-items: flex-start;
      }

    }

  `;


  document.head.appendChild(
    style
  );
}


/* =========================================================
   ICON MODAL OPEN/CLOSE
   ========================================================= */

function openIconModal() {

  if (!newIconModal) {
    return;
  }


  newIconModal.classList.add(
    "open"
  );

  newIconModal.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.classList.add(
    "uasset-modal-open"
  );
}


function closeIconModal() {

  if (!newIconModal) {
    return;
  }


  newIconModal.classList.remove(
    "open"
  );

  newIconModal.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.classList.remove(
    "uasset-modal-open"
  );


  state.editingIconId =
    null;


  setIconModalCreateMode();

}


/* =========================================================
   ICON CREATE MODE
   ========================================================= */

function setIconModalCreateMode() {

  const title =
    $("newIconTitle");

  const subtitle =
    newIconModal?.querySelector(
      ".admin-modal-head .admin-panel-subtitle"
    );


  if (title) {

    title.textContent =
      "Create New Icon";
  }


  if (subtitle) {

    subtitle.textContent =
      "Create and prepare a new UAsset asset.";
  }


  if (saveNewIcon) {

    saveNewIcon.textContent =
      "Prepare Icon";
  }


  if (iconId) {

    iconId.disabled =
      false;
  }


  if (iconSvg) {

    iconSvg.placeholder =
      '<svg xmlns="http://www.w3.org/2000/svg" ...></svg>';
  }
}


/* =========================================================
   ICON EDIT MODE
   ========================================================= */

function setIconModalEditMode() {

  const title =
    $("newIconTitle");

  const subtitle =
    newIconModal?.querySelector(
      ".admin-modal-head .admin-panel-subtitle"
    );


  if (title) {

    title.textContent =
      "Edit Icon";
  }


  if (subtitle) {

    subtitle.textContent =
      "Update icon metadata and settings.";
  }


  if (saveNewIcon) {

    saveNewIcon.textContent =
      "Save Changes";
  }


  if (iconId) {

    iconId.disabled =
      true;
  }


  if (iconSvg) {

    iconSvg.placeholder =
      "Leave blank to keep the current SVG.";
  }
}


/* =========================================================
   RESET ICON FORM
   ========================================================= */

function resetIconForm() {

  if (iconName) {
    iconName.value =
      "";
  }

  if (iconId) {
    iconId.value =
      "";
    iconId.disabled =
      false;
  }

  if (iconCategory) {
    iconCategory.value =
      "";
  }

  if (iconTags) {
    iconTags.value =
      "";
  }

  if (iconDescription) {
    iconDescription.value =
      "";
  }

  if (iconSvg) {
    iconSvg.value =
      "";
  }


  state.selectedPlan =
    "free";

  state.editingIconId =
    null;


  updatePlanUI();

  updateIconPreview();

}


/* =========================================================
   ICON PLAN UI
   ========================================================= */

function updatePlanUI() {

  document
    .querySelectorAll(
      "[data-plan]"
    )
    .forEach(
      button => {

        const active =
          button.dataset.plan ===
          state.selectedPlan;

        button.classList.toggle(
          "active",
          active
        );
      }
    );


  if (previewPlan) {

    previewPlan.textContent =
      state.selectedPlan.toUpperCase();

    previewPlan.className =
      state.selectedPlan ===
        "pro"
        ? "admin-badge pro"
        : "admin-badge free";
  }
}


/* =========================================================
   ICON SUMMARY
   ========================================================= */

function updateIconSummary() {

  if (previewName) {

    previewName.textContent =
      iconName?.value.trim() ||
      "New Icon";
  }


  if (previewId) {

    previewId.textContent =
      iconId?.value.trim() ||
      "new-icon";
  }


  updatePlanUI();
}


/* =========================================================
   ICON SVG PREVIEW
   ========================================================= */

function updateIconPreview() {

  if (!iconLivePreview) {
    return;
  }


  const svg =
    iconSvg?.value.trim() ||
    "";


  if (!svg) {

    iconLivePreview.innerHTML = `
      <span
        class="preview-placeholder"
      >
        SVG preview
      </span>
    `;

    updateIconSummary();

    return;
  }


  if (!isValidSvg(svg)) {

    iconLivePreview.innerHTML = `
      <span
        class="preview-placeholder"
      >
        Invalid SVG markup
      </span>
    `;

    updateIconSummary();

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
      <span
        class="preview-placeholder"
      >
        Invalid SVG
      </span>
    `;

    updateIconSummary();

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
    "currentColor";


  updateIconSummary();
}


/* =========================================================
   SVG VALIDATION
   ========================================================= */

function isValidSvg(value) {

  const svg =
    String(value || "")
      .trim();


  return (
    svg.length > 0 &&
    svg.length <= 200000 &&
    /^<svg\b/i.test(svg) &&
    /<\/svg>\s*$/i.test(svg)
  );
}


/* =========================================================
   ICON FORM VALIDATION
   ========================================================= */

function validateIconForm(
  requireSvg
) {

  const name =
    iconName?.value.trim() ||
    "";

  const id =
    iconId?.value.trim() ||
    "";

  const category =
    iconCategory?.value.trim() ||
    "";

  const svg =
    iconSvg?.value.trim() ||
    "";


  if (!name) {

    alert(
      "Please enter an icon name."
    );

    iconName?.focus();

    return false;
  }


  if (
    !id ||
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
    requireSvg &&
    !isValidSvg(svg)
  ) {

    alert(
      "Please paste a valid complete SVG."
    );

    iconSvg?.focus();

    return false;
  }


  if (
    svg &&
    !isValidSvg(svg)
  ) {

    alert(
      "The SVG code is not valid."
    );

    iconSvg?.focus();

    return false;
  }


  return true;
}


/* =========================================================
   OPEN NEW ICON
   ========================================================= */

function openNewIcon() {

  if (!newIconModal) {
    return;
  }


  resetIconForm();

  setIconModalCreateMode();

  openIconModal();


  setTimeout(
    () => {
      iconName?.focus();
    },
    40
  );
}


/* =========================================================
   OPEN EDIT ICON
   ========================================================= */

function openEditIcon(
  id
) {

  const icon =
    state.icons.find(
      item =>
        String(item.id) ===
        String(id)
    );


  if (!icon) {

    alert(
      "Icon not found."
    );

    return;
  }


  state.editingIconId =
    icon.id;


  if (iconName) {

    iconName.value =
      icon.name ||
      "";
  }


  if (iconId) {

    iconId.value =
      icon.id ||
      "";

    iconId.disabled =
      true;
  }


  if (iconCategory) {

    iconCategory.value =
      icon.category ||
      "";
  }


  if (iconTags) {

    iconTags.value =
      Array.isArray(
        icon.tags
      )
        ? icon.tags.join(", ")
        : "";
  }


  if (iconDescription) {

    iconDescription.value =
      icon.description ||
      "";
  }


  if (iconSvg) {

    iconSvg.value =
      "";

    iconSvg.placeholder =
      "Leave blank to keep the current SVG.";
  }


  state.selectedPlan =
    icon.plan === "pro"
      ? "pro"
      : "free";


  updatePlanUI();

  updateIconSummary();

  updateIconPreview();

  setIconModalEditMode();

  openIconModal();


  setTimeout(
    () => {
      iconName?.focus();
    },
    40
  );
}


/* =========================================================
   CREATE ICON REQUEST
   ========================================================= */

async function createIcon() {

  const svg =
    iconSvg?.value.trim() ||
    "";


  if (
    !validateIconForm(
      true
    )
  ) {

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
      state.selectedPlan,

    svg

  };


  const originalText =
    saveNewIcon?.textContent ||
    "Prepare Icon";


  if (saveNewIcon) {

    saveNewIcon.disabled =
      true;

    saveNewIcon.textContent =
      "Saving...";
  }


  try {

    const response =
      await fetch(
        API.icons.create,
        {

          method:
            "POST",

          credentials:
            "include",

          cache:
            "no-store",

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
      await readJson(
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
      data.success !==
        true
    ) {

      throw new Error(
        apiErrorMessage(
          data,
          "Unable to create icon."
        )
      );
    }


    alert(
      `Icon "${payload.name}" saved successfully!`
    );


    closeIconModal();

    resetIconForm();

    await loadIcons();

  } catch (error) {

    console.error(
      "UAsset create icon failed:",
      error
    );


    alert(
      error?.message ||
      "Unable to create icon."
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
   UPDATE ICON REQUEST
   ========================================================= */

async function updateIcon() {

  const id =
    state.editingIconId;


  if (!id) {

    alert(
      "No icon is selected for editing."
    );

    return;
  }


  if (
    !validateIconForm(
      false
    )
  ) {

    return;
  }


  const originalIcon =
    state.icons.find(
      item =>
        String(item.id) ===
        String(id)
    );


  if (!originalIcon) {

    alert(
      "Original icon could not be found."
    );

    return;
  }


  const newSvg =
    iconSvg?.value.trim() ||
    "";


  const planChanged =
    state.selectedPlan !==
    (
      originalIcon.plan ===
      "pro"
        ? "pro"
        : "free"
    );


  /*
    Backend requires a new SVG when
    Free -> Pro or Pro -> Free.
  */

  if (
    planChanged &&
    !isValidSvg(
      newSvg
    )
  ) {

    alert(
      "Please paste the SVG when changing the Free/Pro plan."
    );

    iconSvg?.focus();

    return;
  }


  const payload = {

    id,

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
      state.selectedPlan

  };


  if (newSvg) {

    payload.svg =
      newSvg;
  }


  const originalText =
    saveNewIcon?.textContent ||
    "Save Changes";


  if (saveNewIcon) {

    saveNewIcon.disabled =
      true;

    saveNewIcon.textContent =
      "Saving...";
  }


  try {

    const response =
      await fetch(
        API.icons.update,
        {

          method:
            "PATCH",

          credentials:
            "include",

          cache:
            "no-store",

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
      await readJson(
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
      data.success !==
        true
    ) {

      throw new Error(
        apiErrorMessage(
          data,
          "Unable to update icon."
        )
      );
    }


    alert(
      `Icon "${payload.name}" updated successfully!`
    );


    closeIconModal();

    await loadIcons();

  } catch (error) {

    console.error(
      "UAsset update icon failed:",
      error
    );


    alert(
      error?.message ||
      "Unable to update icon."
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
   SAVE ICON
   ========================================================= */

async function saveIcon() {

  if (
    state.editingIconId
  ) {

    await updateIcon();

    return;
  }


  await createIcon();
}


/* =========================================================
   ICON HIDE / UNHIDE
   ========================================================= */

async function toggleIcon(
  id
) {

  const icon =
    state.icons.find(
      item =>
        String(item.id) ===
        String(id)
    );


  if (!icon) {

    alert(
      "Icon not found."
    );

    return;
  }


  const currentActive =
    icon.isActive ===
    true;


  const nextActive =
    !currentActive;


  const action =
    nextActive
      ? "unhide"
      : "hide";


  const confirmed =
    window.confirm(
      `Are you sure you want to ${action} "${icon.name}"?`
    );


  if (!confirmed) {
    return;
  }


  try {

    const response =
      await fetch(
        API.icons.update,
        {

          method:
            "PATCH",

          credentials:
            "include",

          cache:
            "no-store",

          headers: {

            Accept:
              "application/json",

            "Content-Type":
              "application/json"

          },

          body:
            JSON.stringify({

              id,

              is_active:
                nextActive

            })

        }
      );


    const data =
      await readJson(
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
      data.success !==
        true
    ) {

      throw new Error(
        apiErrorMessage(
          data,
          "Unable to update icon status."
        )
      );
    }


    await loadIcons();

  } catch (error) {

    console.error(
      "UAsset toggle icon failed:",
      error
    );


    alert(
      error?.message ||
      "Unable to update icon status."
    );
  }
}


/* =========================================================
   DELETE ICON
   ========================================================= */

async function deleteIcon(
  id
) {

  const icon =
    state.icons.find(
      item =>
        String(item.id) ===
        String(id)
    );


  if (!icon) {

    alert(
      "Icon not found."
    );

    return;
  }


  const confirmed =
    window.confirm(
      `Delete icon "${icon.name}"?\n\nThis action cannot be undone.`
    );


  if (!confirmed) {
    return;
  }


  try {

    const response =
      await fetch(
        `${API.icons.delete}?id=${encodeURIComponent(id)}`,
        {

          method:
            "DELETE",

          credentials:
            "include",

          cache:
            "no-store",

          headers: {

            Accept:
              "application/json"

          }

        }
      );


    const data =
      await readJson(
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
      data.success !==
        true
    ) {

      throw new Error(
        apiErrorMessage(
          data,
          "Unable to delete icon."
        )
      );
    }


    if (
      data.storageCleanup ===
      false
    ) {

      alert(
        `Icon "${icon.name}" was deleted, but the storage file needs cleanup.`
      );

    } else {

      alert(
        `Icon "${icon.name}" deleted successfully!`
      );

    }


    await loadIcons();

  } catch (error) {

    console.error(
      "UAsset delete icon failed:",
      error
    );


    alert(
      error?.message ||
      "Unable to delete icon."
    );
  }
}


/* =========================================================
   ICON TABLE HEADER
   ========================================================= */

function ensureIconActionsHeader() {

  if (!adminIconsBody) {
    return;
  }


  const table =
    adminIconsBody.closest(
      "table"
    );


  if (!table) {
    return;
  }


  const headRow =
    table.querySelector(
      "thead tr"
    );


  if (!headRow) {
    return;
  }


  if (
    headRow.querySelector(
      '[data-uasset-action-header="true"]'
    )
  ) {

    return;
  }


  const th =
    document.createElement(
      "th"
    );


  th.dataset.uassetActionHeader =
    "true";

  th.textContent =
    "ACTIONS";


  headRow.appendChild(
    th
  );
}


/* =========================================================
   ICON ROW RENDER
   ========================================================= */

function renderIcons() {

  if (!adminIconsBody) {
    return;
  }


  ensureIconActionsHeader();


  if (
    state.icons.length ===
    0
  ) {

    adminIconsBody.innerHTML = `

      <tr>

        <td
          colspan="5"
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
    state.icons
      .map(
        icon => {

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

          const statusText =
            active
              ? "Active"
              : "Hidden";


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
                      style="opacity:.34;"
                    >

                      <rect
                        x="5"
                        y="5"
                        width="14"
                        height="14"
                        rx="3"
                      />

                      <path
                        d="M8 12h8"
                      />

                    </svg>

                  </div>


                  <div
                    class="admin-live-icon-copy"
                  >

                    <div
                      class="admin-live-icon-name"
                    >
                      ${name}
                    </div>

                    <div
                      class="admin-live-icon-id"
                    >
                      ${id}
                    </div>

                  </div>

                </div>

              </td>


              <td>
                ${category}
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
                  class="admin-status-dot"
                ></span>

                ${statusText}

              </td>


              <td>

                <div
                  class="uasset-icon-actions"
                >

                  <button
                    type="button"
                    class="uasset-icon-action"
                    data-action="edit-icon"
                    data-id="${id}"
                  >
                    Edit
                  </button>


                  <button
                    type="button"
                    class="uasset-icon-action"
                    data-action="toggle-icon"
                    data-id="${id}"
                  >
                    ${
                      active
                        ? "Hide"
                        : "Unhide"
                    }
                  </button>


                  <button
                    type="button"
                    class="uasset-icon-action danger"
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
      )
      .join("");


  attachIconTableEvents();
}


/* =========================================================
   ICON TABLE EVENTS
   ========================================================= */

function attachIconTableEvents() {

  if (!adminIconsBody) {
    return;
  }


  adminIconsBody
    .querySelectorAll(
      "[data-action]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const action =
              button.dataset.action;

            const id =
              button.dataset.id;


            if (
              action ===
              "edit-icon"
            ) {

              openEditIcon(id);

              return;
            }


            if (
              action ===
              "toggle-icon"
            ) {

              toggleIcon(id);

              return;
            }


            if (
              action ===
              "delete-icon"
            ) {

              deleteIcon(id);

            }

          }
        );

      }
    );
}


/* =========================================================
   LOAD ICONS
   ========================================================= */

async function loadIcons() {

  if (
    state.loadingIcons
  ) {

    return;
  }


  state.loadingIcons =
    true;


  if (adminIconsBody) {

    adminIconsBody.innerHTML = `

      <tr>

        <td
          colspan="5"
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
        API.icons.list,
        {

          method:
            "GET",

          credentials:
            "include",

          cache:
            "no-store",

          headers: {

            Accept:
              "application/json"

          }

        }
      );


    const data =
      await readJson(
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
      data.success !==
        true
    ) {

      throw new Error(
        apiErrorMessage(
          data,
          "Unable to load admin icon library."
        )
      );
    }


    state.icons =
      Array.isArray(
        data.icons
      )
        ? data.icons
        : [];


    updateIconStats(
      data.stats || {}
    );


    renderIcons();


  } catch (error) {

    console.error(
      "UAsset load icons failed:",
      error
    );


    if (adminIconsBody) {

      adminIconsBody.innerHTML = `

        <tr>

          <td
            colspan="5"
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

    state.loadingIcons =
      false;
  }
}


/* =========================================================
   ICON STATS
   ========================================================= */

function updateIconStats(
  stats
) {

  if (totalIcons) {

    totalIcons.textContent =
      Number(
        stats.totalIcons ??
        state.icons.length
      );
  }


  if (freeIcons) {

    freeIcons.textContent =
      Number(
        stats.freeIcons ??
        state.icons.filter(
          icon =>
            icon.plan ===
            "free"
        ).length
      );
  }


  if (proIcons) {

    proIcons.textContent =
      Number(
        stats.proIcons ??
        state.icons.filter(
          icon =>
            icon.plan ===
            "pro"
        ).length
      );
  }
}


/* =========================================================
   COLLECTION MODAL CREATION
   ========================================================= */

function ensureCollectionModal() {

  let modal =
    $("uassetCollectionModal");


  if (modal) {
    return modal;
  }


  modal =
    document.createElement(
      "div"
    );


  modal.id =
    "uassetCollectionModal";


  modal.className =
    "admin-modal-backdrop";


  modal.setAttribute(
    "aria-hidden",
    "true"
  );


  modal.innerHTML = `

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
            Create a curated collection.
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
            placeholder="Business Essentials"
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

          <span
            class="admin-help"
          >
            Separate categories with commas.
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
            style="
              min-height:110px;
              resize:vertical;
            "
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
    modal
  );


  $("uassetCollectionClose")
    ?.addEventListener(
      "click",
      closeCollectionModal
    );


  $("uassetCollectionCancel")
    ?.addEventListener(
      "click",
      closeCollectionModal
    );


  $("uassetCollectionSave")
    ?.addEventListener(
      "click",
      saveCollection
    );


  modal.addEventListener(
    "click",
    event => {

      if (
        event.target ===
        modal
      ) {

        closeCollectionModal();
      }
    }
  );


  return modal;
}


/* =========================================================
   OPEN NEW COLLECTION
   ========================================================= */

function openCollectionModal() {

  const modal =
    ensureCollectionModal();


  state.editingCollectionId =
    null;


  $("uassetCollectionModalTitle").textContent =
    "New Collection";


  $("uassetCollectionModalSubtitle").textContent =
    "Create a curated collection.";


  $("uassetCollectionName").value =
    "";

  $("uassetCollectionId").value =
    "";

  $("uassetCollectionCategories").value =
    "";

  $("uassetCollectionDescription").value =
    "";

  $("uassetCollectionActive").checked =
    true;


  $("uassetCollectionId").disabled =
    false;


  $("uassetCollectionSave").textContent =
    "Create Collection";


  modal.classList.add(
    "open"
  );


  modal.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.classList.add(
    "uasset-modal-open"
  );


  setTimeout(
    () => {
      $("uassetCollectionName")?.focus();
    },
    40
  );
}


/* =========================================================
   OPEN EDIT COLLECTION
   ========================================================= */

function openEditCollection(
  id
) {

  const collection =
    state.collections.find(
      item =>
        String(item.id) ===
        String(id)
    );


  if (!collection) {

    alert(
      "Collection not found."
    );

    return;
  }


  const modal =
    ensureCollectionModal();


  state.editingCollectionId =
    collection.id;


  $("uassetCollectionModalTitle").textContent =
    "Edit Collection";


  $("uassetCollectionModalSubtitle").textContent =
    "Update collection details and visibility.";


  $("uassetCollectionName").value =
    collection.name ||
    "";


  $("uassetCollectionId").value =
    collection.id ||
    "";


  $("uassetCollectionId").disabled =
    true;


  $("uassetCollectionCategories").value =
    Array.isArray(
      collection.categories
    )
      ? collection.categories.join(", ")
      : "";


  $("uassetCollectionDescription").value =
    collection.description ||
    "";


  $("uassetCollectionActive").checked =
    collection.is_active ===
    true;


  $("uassetCollectionSave").textContent =
    "Save Changes";


  modal.classList.add(
    "open"
  );


  modal.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.classList.add(
    "uasset-modal-open"
  );


  setTimeout(
    () => {
      $("uassetCollectionName")?.focus();
    },
    40
  );
}


/* =========================================================
   CLOSE COLLECTION MODAL
   ========================================================= */

function closeCollectionModal() {

  const modal =
    $("uassetCollectionModal");


  if (!modal) {
    return;
  }


  modal.classList.remove(
    "open"
  );


  modal.setAttribute(
    "aria-hidden",
    "true"
  );


  document.body.classList.remove(
    "uasset-modal-open"
  );


  state.editingCollectionId =
    null;
}


/* =========================================================
   COLLECTION UI
   ========================================================= */

function ensureCollectionsManagerUI() {

  const section =
    $("collections");


  if (!section) {
    return null;
  }


  let manager =
    $("uassetCollectionsManager");


  if (manager) {
    return manager;
  }


  const body =
    section.querySelector(
      ".admin-panel-body"
    );


  if (!body) {
    return null;
  }


  manager =
    document.createElement(
      "div"
    );


  manager.id =
    "uassetCollectionsManager";


  manager.className =
    "uasset-collection-manager";


  body.innerHTML =
    "";


  body.appendChild(
    manager
  );


  return manager;
}


/* =========================================================
   RENDER COLLECTIONS
   ========================================================= */

function renderCollections() {

  const manager =
    ensureCollectionsManagerUI();


  if (!manager) {
    return;
  }


  if (
    state.collections.length ===
    0
  ) {

    manager.innerHTML = `

      <div
        class="uasset-collection-toolbar"
      >

        <div
          class="uasset-collection-toolbar-copy"
        >
          No collections found.
        </div>


        <button
          type="button"
          class="admin-button"
          id="uassetInlineNewCollection"
        >
          + New Collection
        </button>

      </div>

    `;


    $("uassetInlineNewCollection")
      ?.addEventListener(
        "click",
        openCollectionModal
      );


    return;
  }


  manager.innerHTML = `

    <div
      class="uasset-collection-toolbar"
    >

      <div
        class="uasset-collection-toolbar-copy"
      >
        ${state.collections.length}
        collection(s) loaded.
      </div>


      <button
        type="button"
        class="admin-button"
        id="uassetInlineNewCollection"
      >
        + New Collection
      </button>

    </div>


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
            state.collections
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

                  const categoriesHtml =
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
                    collection.is_active ===
                    true;


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
                            categoriesHtml ||
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
                          class="admin-badge ${
                            active
                              ? "free"
                              : ""
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
                        ${escapeHtml(
                          created
                        )}
                      </td>


                      <td>

                        <div
                          class="uasset-collection-actions"
                        >

                          <button
                            type="button"
                            class="uasset-small-button"
                            data-collection-action="edit"
                            data-collection-id="${id}"
                          >
                            Edit
                          </button>


                          <button
                            type="button"
                            class="uasset-small-button"
                            data-collection-action="toggle"
                            data-collection-id="${id}"
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
                            data-collection-action="delete"
                            data-collection-id="${id}"
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

  `;


  $("uassetInlineNewCollection")
    ?.addEventListener(
      "click",
      openCollectionModal
    );


  manager
    .querySelectorAll(
      "[data-collection-action]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const action =
              button.dataset.collectionAction;

            const id =
              button.dataset.collectionId;


            if (
              action ===
              "edit"
            ) {

              openEditCollection(
                id
              );

              return;
            }


            if (
              action ===
              "toggle"
            ) {

              toggleCollection(
                id
              );

              return;
            }


            if (
              action ===
              "delete"
            ) {

              deleteCollection(
                id
              );

            }

          }
        );

      }
    );
}


/* =========================================================
   LOAD COLLECTIONS
   ========================================================= */

async function loadCollections() {

  if (
    state.loadingCollections
  ) {

    return;
  }


  state.loadingCollections =
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
        `${API.collections.list}?include_inactive=true`,
        {

          method:
            "GET",

          credentials:
            "include",

          cache:
            "no-store",

          headers: {

            Accept:
              "application/json"

          }

        }
      );


    const data =
      await readJson(
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
      data.success !==
        true
    ) {

      throw new Error(
        apiErrorMessage(
          data,
          "Unable to load collections."
        )
      );
    }


    state.collections =
      Array.isArray(
        data.collections
      )
        ? data.collections
        : [];


    if (totalCollections) {

      totalCollections.textContent =
        state.collections.length;
    }


    renderCollections();


  } catch (error) {

    console.error(
      "UAsset load collections failed:",
      error
    );


    const errorManager =
      ensureCollectionsManagerUI();


    if (errorManager) {

      errorManager.innerHTML = `

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

    state.loadingCollections =
      false;
  }
}


/* =========================================================
   SAVE COLLECTION
   ========================================================= */

async function saveCollection() {

  const name =
    $("uassetCollectionName")
      ?.value
      .trim() ||
    "";


  const id =
    normalizeId(
      $("uassetCollectionId")
        ?.value
    );


  const categories =
    parseCommaList(
      $("uassetCollectionCategories")
        ?.value
    );


  const description =
    $("uassetCollectionDescription")
      ?.value
      .trim() ||
    "";


  const isActive =
    $("uassetCollectionActive")
      ?.checked ===
    true;


  if (!name) {

    alert(
      "Please enter a collection name."
    );

    $("uassetCollectionName")
      ?.focus();

    return;
  }


  if (
    !id ||
    !/^[a-z0-9-]+$/.test(
      id
    )
  ) {

    alert(
      "Collection ID must contain only lowercase letters, numbers and hyphens."
    );

    $("uassetCollectionId")
      ?.focus();

    return;
  }


  if (
    categories.length ===
    0
  ) {

    alert(
      "Please add at least one category."
    );

    $("uassetCollectionCategories")
      ?.focus();

    return;
  }


  const editing =
    !!state.editingCollectionId;


  const endpoint =
    editing
      ? API.collections.update
      : API.collections.create;


  const method =
    editing
      ? "PATCH"
      : "POST";


  const payload = {

    id,

    name,

    description,

    categories,

    is_active:
      isActive

  };


  const button =
    $("uassetCollectionSave");


  const oldText =
    button?.textContent ||
    "Save";


  if (button) {

    button.disabled =
      true;

    button.textContent =
      editing
        ? "Saving..."
        : "Creating...";
  }


  try {

    const response =
      await fetch(
        endpoint,
        {

          method,

          credentials:
            "include",

          cache:
            "no-store",

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
      await readJson(
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
      data.success !==
        true
    ) {

      throw new Error(
        apiErrorMessage(
          data,
          editing
            ? "Unable to update collection."
            : "Unable to create collection."
        )
      );
    }


    alert(
      editing
        ? `Collection "${name}" updated successfully!`
        : `Collection "${name}" created successfully!`
    );


    closeCollectionModal();

    await loadCollections();


  } catch (error) {

    console.error(
      "UAsset save collection failed:",
      error
    );


    alert(
      error?.message ||
      "Unable to save collection."
    );

  } finally {

    if (button) {

      button.disabled =
        false;

      button.textContent =
        oldText;
    }
  }
}


/* =========================================================
   TOGGLE COLLECTION
   ========================================================= */

async function toggleCollection(
  id
) {

  const collection =
    state.collections.find(
      item =>
        String(item.id) ===
        String(id)
    );


  if (!collection) {

    alert(
      "Collection not found."
    );

    return;
  }


  const nextActive =
    collection.is_active !==
    true;


  const action =
    nextActive
      ? "unhide"
      : "hide";


  const confirmed =
    window.confirm(
      `Are you sure you want to ${action} "${collection.name}"?`
    );


  if (!confirmed) {
    return;
  }


  try {

    const response =
      await fetch(
        API.collections.update,
        {

          method:
            "PATCH",

          credentials:
            "include",

          cache:
            "no-store",

          headers: {

            Accept:
              "application/json",

            "Content-Type":
              "application/json"

          },

          body:
            JSON.stringify({

              id,

              is_active:
                nextActive

            })

        }
      );


    const data =
      await readJson(
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
      data.success !==
        true
    ) {

      throw new Error(
        apiErrorMessage(
          data,
          "Unable to update collection status."
        )
      );
    }


    await loadCollections();


  } catch (error) {

    console.error(
      "UAsset toggle collection failed:",
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
  id
) {

  const collection =
    state.collections.find(
      item =>
        String(item.id) ===
        String(id)
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
        `${API.collections.delete}?id=${encodeURIComponent(
          id
        )}`,
        {

          method:
            "DELETE",

          credentials:
            "include",

          cache:
            "no-store",

          headers: {

            Accept:
              "application/json"

          }

        }
      );


    const data =
      await readJson(
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
      data.success !==
        true
    ) {

      throw new Error(
        apiErrorMessage(
          data,
          "Unable to delete collection."
        )
      );
    }


    alert(
      `Collection "${collection.name}" deleted successfully!`
    );


    await loadCollections();


  } catch (error) {

    console.error(
      "UAsset delete collection failed:",
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
    openNewIcon
  );
}


if (
  quickNewIcon
) {

  quickNewIcon.addEventListener(
    "click",
    openNewIcon
  );
}


if (
  closeNewIcon
) {

  closeNewIcon.addEventListener(
    "click",
    closeIconModal
  );
}


if (
  cancelNewIcon
) {

  cancelNewIcon.addEventListener(
    "click",
    closeIconModal
  );
}


if (
  saveNewIcon
) {

  saveNewIcon.addEventListener(
    "click",
    saveIcon
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


if (
  manageIconsButton
) {

  manageIconsButton.addEventListener(
    "click",
    () => {

      scrollToSection(
        "icons"
      );

      loadIcons();

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

      loadCollections();

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
   PLAN BUTTONS
   ========================================================= */

document
  .querySelectorAll(
    "[data-plan]"
  )
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          state.selectedPlan =
            button.dataset.plan ===
            "pro"
              ? "pro"
              : "free";


          updatePlanUI();

        }
      );

    }
  );


/* =========================================================
   ICON FORM EVENTS
   ========================================================= */

if (
  iconName
) {

  iconName.addEventListener(
    "input",
    () => {

      if (
        !state.editingIconId &&
        iconId
      ) {

        iconId.value =
          normalizeId(
            iconName.value
          );
      }


      updateIconSummary();

    }
  );
}


if (
  iconId
) {

  iconId.addEventListener(
    "input",
    updateIconSummary
  );
}


[
  iconCategory,
  iconTags,
  iconDescription
]
  .filter(Boolean)
  .forEach(
    element => {

      element.addEventListener(
        "input",
        updateIconSummary
      );

    }
  );


if (
  iconSvg
) {

  iconSvg.addEventListener(
    "input",
    updateIconPreview
  );
}


/* =========================================================
   ICON MODAL BACKDROP
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

        closeIconModal();
      }

    }
  );
}


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
      newIconModal?.classList.contains(
        "open"
      )
    ) {

      closeIconModal();

      return;
    }


    const collectionModal =
      $("uassetCollectionModal");


    if (
      collectionModal?.classList.contains(
        "open"
      )
    ) {

      closeCollectionModal();
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
    $(id);


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


/* =========================================================
   SIDEBAR NAV
   ========================================================= */

document
  .querySelectorAll(
    ".admin-nav-link"
  )
  .forEach(
    link => {

      link.addEventListener(
        "click",
        () => {

          document
            .querySelectorAll(
              ".admin-nav-link"
            )
            .forEach(
              item => {

                item.classList.remove(
                  "active"
                );

              }
            );


          link.classList.add(
            "active"
          );


          const href =
            link.getAttribute(
              "href"
            );


          if (
            href ===
            "#collections"
          ) {

            setTimeout(
              loadCollections,
              80
            );
          }


          if (
            href ===
            "#icons"
          ) {

            setTimeout(
              loadIcons,
              80
            );
          }

        }
      );

    }
  );


/* =========================================================
   INITIAL SETUP
   ========================================================= */

injectAdminStyles();

setIconModalCreateMode();

updatePlanUI();

updateIconSummary();

updateIconPreview();

ensureIconActionsHeader();

ensureCollectionsManagerUI();

loadIcons();

loadCollections();


console.log(
  "UAsset Admin — clean unified admin.js loaded."
);
