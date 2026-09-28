/* =========================================================
   UASSET ADMIN — INTERACTIVE CORE
   Step 1: Working dashboard interactions
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


/* =========================================================
   HELPERS
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


function showMessage(message) {
  alert(message);
}


/* =========================================================
   NEW ICON
   ========================================================= */

function openNewIcon() {
  showMessage(
    "New Icon manager will open here."
  );
}


/* =========================================================
   MANAGE ICONS
   ========================================================= */

function openIconManager() {
  scrollToSection("icons");
}


/* =========================================================
   UPLOAD
   ========================================================= */

function openUploadManager() {
  scrollToSection("uploads");
}


/* =========================================================
   COLLECTION
   ========================================================= */

function openCollectionManager() {
  scrollToSection("collections");
}


/* =========================================================
   CATEGORY
   ========================================================= */

function openCategoryManager() {
  scrollToSection("categories");
}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

if (newIconButton) {
  newIconButton.addEventListener(
    "click",
    openNewIcon
  );
}


if (manageIconsButton) {
  manageIconsButton.addEventListener(
    "click",
    openIconManager
  );
}


if (quickNewIcon) {
  quickNewIcon.addEventListener(
    "click",
    openNewIcon
  );
}


if (quickUpload) {
  quickUpload.addEventListener(
    "click",
    openUploadManager
  );
}


if (quickCollection) {
  quickCollection.addEventListener(
    "click",
    openCollectionManager
  );
}


if (quickCategory) {
  quickCategory.addEventListener(
    "click",
    openCategoryManager
  );
}


if (newCollectionButton) {
  newCollectionButton.addEventListener(
    "click",
    openCollectionManager
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
   READY
   ========================================================= */

console.log(
  "UAsset Admin interactive core loaded."
);
