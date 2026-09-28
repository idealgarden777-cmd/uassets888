/* =========================================================
   UASSET ADMIN — ADMIN.JS
   Step 2: New Icon Manager
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
   STATE
   ========================================================= */

let selectedPlan =
  "free";


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

      background: rgba(0, 0, 0, 0.28);

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
        0 30px 90px rgba(0, 0, 0, 0.16);
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
        minmax(0, 1fr)
        minmax(280px, 0.72fr);

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
    }
  `;

  document.head.appendChild(style);
}


/* =========================================================
   OPEN MODAL
   ========================================================= */

function openNewIconModal() {
  if (!newIconModal) return;

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


/* =========================================================
   CLOSE MODAL
   ========================================================= */

function closeNewIconModal() {
  if (!newIconModal) return;

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


document
  .querySelectorAll(
    "[data-plan]"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        selectedPlan =
          button.dataset.plan === "pro"
            ? "pro"
            : "free";

        updatePlanButtons();
      }
    );

  });


/* =========================================================
   GENERATE DEFAULT ID
   ========================================================= */

function makeIconId(value) {
  return String(
    value || ""
  )
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(value) {
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
  if (!iconLivePreview) return;

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


  /* -------------------------------------------------------
     Basic SVG validation
     ------------------------------------------------------- */

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


  /* -------------------------------------------------------
     Render SVG
     ------------------------------------------------------- */

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
   AUTO ID FROM NAME
   ========================================================= */

let idWasManuallyEdited =
  false;


if (iconId) {
  iconId.addEventListener(
    "input",
    () => {
      idWasManuallyEdited = true;

      updateSummary();
    }
  );
}


if (iconName) {
  iconName.addEventListener(
    "input",
    () => {

      if (!idWasManuallyEdited) {
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


  if (!/^[a-z0-9-]+$/.test(id)) {
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
   PREPARE NEW ICON
   ========================================================= */

function prepareNewIcon() {

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
      iconTags.value
        .split(",")
        .map(tag =>
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


  console.log(
    "UAsset new icon prepared:",
    payload
  );


  alert(
    `Icon "${payload.name}" is ready.\n\nNext step: save it to UAsset database and storage.`
  );
}


/* =========================================================
   BUTTON EVENTS
   ========================================================= */

if (newIconButton) {
  newIconButton.addEventListener(
    "click",
    openNewIconModal
  );
}


if (quickNewIcon) {
  quickNewIcon.addEventListener(
    "click",
    openNewIconModal
  );
}


if (closeNewIcon) {
  closeNewIcon.addEventListener(
    "click",
    closeNewIconModal
  );
}


if (cancelNewIcon) {
  cancelNewIcon.addEventListener(
    "click",
    closeNewIconModal
  );
}


if (saveNewIcon) {
  saveNewIcon.addEventListener(
    "click",
    prepareNewIcon
  );
}


/* =========================================================
   CLICK BACKDROP TO CLOSE
   ========================================================= */

if (newIconModal) {
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
   ESC KEY
   ========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape" &&
      newIconModal?.classList.contains(
        "open"
      )
    ) {
      closeNewIconModal();
    }

  }
);


/* =========================================================
   EXISTING NAVIGATION
   ========================================================= */

function scrollToSection(id) {

  const section =
    document.getElementById(id);

  if (!section) return;

  section.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}


if (manageIconsButton) {
  manageIconsButton.addEventListener(
    "click",
    () => {
      scrollToSection("icons");
    }
  );
}


if (quickUpload) {
  quickUpload.addEventListener(
    "click",
    () => {
      scrollToSection("uploads");
    }
  );
}


if (quickCollection) {
  quickCollection.addEventListener(
    "click",
    () => {
      scrollToSection("collections");
    }
  );
}


if (quickCategory) {
  quickCategory.addEventListener(
    "click",
    () => {
      scrollToSection("categories");
    }
  );
}


if (newCollectionButton) {
  newCollectionButton.addEventListener(
    "click",
    () => {
      scrollToSection("collections");
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


navLinks.forEach(link => {

  link.addEventListener(
    "click",
    () => {

      navLinks.forEach(item => {
        item.classList.remove(
          "active"
        );
      });

      link.classList.add(
        "active"
      );

    }
  );

});


/* =========================================================
   INITIALIZE
   ========================================================= */

injectModalStyles();

updatePlanButtons();

updateSummary();

updateLivePreview();


console.log(
  "UAsset Admin — New Icon Manager loaded."
);
