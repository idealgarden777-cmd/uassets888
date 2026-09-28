/* =========================================================
   UASSET ADMIN — ADMIN.JS
   Step 4: Live Admin Icon Dashboard
   Bean authentication handled by backend
   Icon create + database listing
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


/* =========================================================
   LIVE DASHBOARD ELEMENTS
   ========================================================= */

const adminIconsBody =
  document.getElementById(
    "adminIconsBody"
  );

const totalIcons =
  document.getElementById(
    "totalIcons"
  );

const freeIcons =
  document.getElementById(
    "freeIcons"
  );

const proIcons =
  document.getElementById(
    "proIcons"
  );

const totalCollections =
  document.getElementById(
    "totalCollections"
  );


/* =========================================================
   API
   ========================================================= */

const ADMIN_ICONS_LIST_API =
  "/api/admin/icons/list";

const ADMIN_ICONS_CREATE_API =
  "/api/admin/icons/create";


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


/* =========================================================
   INJECT MODAL CSS
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
    document.createElement(
      "style"
    );


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


    .admin-modal-backdrop
    .admin-icon-preview
    svg {
      width: 72px;
      height: 72px;
    }


    .admin-modal-backdrop
    .admin-icon-preview
    .preview-placeholder {
      color: var(--muted);
      font-size: 11px;
      text-align: center;
    }


    .admin-modal-backdrop
    button:disabled {
      opacity: .55;
      cursor: not-allowed;
      transform: none !important;
    }


    .admin-live-icon-row {
      transition:
        background .15s ease;
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

    }

  `;


  document.head.appendChild(
    style
  );
}


/* =========================================================
   GENERIC ESCAPE
   ========================================================= */

function escapeHtml(
  value
) {

  return String(
    value || ""
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


/* =========================================================
   OPEN MODAL
   ========================================================= */

function openNewIconModal() {

  if (!newIconModal) {
    return;
  }


  resetNewIconForm();


  newIconModal.classList.add(
    "open"
  );


  newIconModal.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.classList.add(
    "admin-modal-open"
  );


  setTimeout(
    () => {
      iconName?.focus();
    },
    50
  );
}


/* =========================================================
   CLOSE MODAL
   ========================================================= */

function closeNewIconModal() {

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
    "admin-modal-open"
  );
}


/* =========================================================
   RESET FORM
   ========================================================= */

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


  selectedPlan =
    "free";


  idWasManuallyEdited =
    false;


  updatePlanButtons();

  updateLivePreview();
}


/* =========================================================
   PLAN BUTTONS
   ========================================================= */

function updatePlanButtons() {

  document
    .querySelectorAll(
      "[data-plan]"
    )
    .forEach(
      button => {

        const active =
          button.dataset.plan ===
          selectedPlan;


        button.classList.toggle(
          "active",
          active
        );

      }
    );


  if (previewPlan) {

    previewPlan.textContent =
      selectedPlan.toUpperCase();


    previewPlan.className =
      selectedPlan === "pro"
        ? "admin-badge pro"
        : "admin-badge free";
  }
}


document
  .querySelectorAll(
    "[data-plan]"
  )
  .forEach(
    button => {

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

    }
  );


/* =========================================================
   GENERATE ICON ID
   ========================================================= */

function makeIconId(
  value
) {

  return String(
    value || ""
  )
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
   LIVE SUMMARY
   ========================================================= */

function updateSummary() {

  const name =
    iconName?.value.trim();


  const id =
    iconId?.value.trim();


  if (previewName) {

    previewName.textContent =
      name ||
      "New Icon";
  }


  if (previewId) {

    previewId.textContent =
      id ||
      "new-icon";
  }


  updatePlanButtons();
}


/* =========================================================
   LIVE SVG PREVIEW
   ========================================================= */

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
    !normalized.startsWith(
      "<svg"
    ) ||
    !normalized.includes(
      "</svg>"
    )
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
   AUTO ID
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


/* =========================================================
   OTHER LIVE FIELDS
   ========================================================= */

[
  iconCategory,
  iconTags,
  iconDescription
]
  .filter(Boolean)
  .forEach(
    field => {

      field.addEventListener(
        "input",
        updateSummary
      );

    }
  );


if (iconSvg) {

  iconSvg.addEventListener(
    "input",
    updateLivePreview
  );
}


/* =========================================================
   VALIDATE NEW ICON
   ========================================================= */

function validateNewIcon() {

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
    !/^[a-z0-9-]+$/.test(
      id
    )
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
    !svg.toLowerCase().startsWith(
      "<svg"
    ) ||
    !svg.toLowerCase().includes(
      "</svg>"
    )
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
   UPDATE DASHBOARD STATS
   ========================================================= */

function updateDashboardStats(
  stats
) {

  if (
    totalIcons
  ) {

    totalIcons.textContent =
      Number(
        stats?.totalIcons ??
        0
      );
  }


  if (
    freeIcons
  ) {

    freeIcons.textContent =
      Number(
        stats?.freeIcons ??
        0
      );
  }


  if (
    proIcons
  ) {

    proIcons.textContent =
      Number(
        stats?.proIcons ??
        0
      );
  }


  if (
    totalCollections &&
    Number.isFinite(
      Number(
        totalCollections.textContent
      )
    )
  ) {

    /*
      Collections are not database-powered yet.
      Keep the existing collection count.
    */

  }
}


/* =========================================================
   RENDER ADMIN ICON TABLE
   ========================================================= */

function renderAdminIcons(
  icons
) {

  if (
    !adminIconsBody
  ) {

    return;
  }


  if (
    !Array.isArray(
      icons
    ) ||
    icons.length ===
      0
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
      .map(
        icon => {

          const safeName =
            escapeHtml(
              icon.name
            );

          const safeId =
            escapeHtml(
              icon.id
            );

          const safeCategory =
            escapeHtml(
              icon.category
            );


          const plan =
            icon.plan ===
            "pro"
              ? "pro"
              : "free";


          const isActive =
            icon.isActive ===
            true;


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

        }
      )
      .join("");
}


/* =========================================================
   TABLE PLACEHOLDER
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

      <path
        d="M8 12h8"
      />

    </svg>

  `;
}


/* =========================================================
   LOAD LIVE ADMIN ICONS
   ========================================================= */

async function loadAdminIcons() {

  if (
    adminIconsLoading
  ) {

    return;
  }


  adminIconsLoading =
    true;


  if (
    adminIconsBody
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
      await response
        .json()
        .catch(
          () => ({})
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
      Array.isArray(
        data.icons
      )
        ? data.icons
        : [];


    adminIconsLoaded =
      true;


    renderAdminIcons(
      adminIcons
    );


    updateDashboardStats(
      data.stats ||
      {}
    );


    console.log(
      `UAsset Admin: ${adminIcons.length} icon(s) loaded.`
    );


  } catch (error) {

    console.error(
      "UAsset admin icon loading failed:",
      error
    );


    if (
      adminIconsBody
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

            ${escapeHtml(
              error?.message ||
              "Unable to load icons."
            )}

          </td>

        </tr>

      `;
    }


  } finally {

    adminIconsLoading =
      false;
  }
}


/* =========================================================
   SAVE NEW ICON
   ========================================================= */

async function prepareNewIcon() {

  if (
    !validateNewIcon()
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
      iconTags.value
        .split(",")
        .map(
          tag =>
            tag.trim()
        )
        .filter(Boolean),

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


  if (
    saveNewIcon
  ) {

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
      await response
        .json()
        .catch(
          () => ({})
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

      console.error(
        "UAsset icon save failed:",
        {
          status:
            response.status,

          response:
            data
        }
      );


      let message =
        data.error ||
        "Unable to save icon.";


      if (
        data.code
      ) {

        message +=
          `\n\nCode: ${data.code}`;
      }


      throw new Error(
        message
      );
    }


    console.log(
      "UAsset icon saved:",
      data
    );


    alert(
      `Icon "${payload.name}" saved successfully!`
    );


    closeNewIconModal();

    resetNewIconForm();


    /*
      Refresh the live dashboard immediately.
    */

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

    if (
      saveNewIcon
    ) {

      saveNewIcon.disabled =
        false;

      saveNewIcon.textContent =
        originalText;
    }
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


/* =========================================================
   BACKDROP CLICK
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
      "Escape" &&
      newIconModal?.classList.contains(
        "open"
      )
    ) {

      closeNewIconModal();
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


  if (
    !section
  ) {

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


if (
  newCollectionButton
) {

  newCollectionButton.addEventListener(
    "click",
    () => {

      scrollToSection(
        "collections"
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
  Load the real database-backed admin library.
*/

loadAdminIcons();


console.log(
  "UAsset Admin — live dashboard loaded."
);
