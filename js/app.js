const els = {
  heroSearch:
    document.getElementById("heroSearch"),

  librarySearch:
    document.getElementById("librarySearch"),

  filters:
    document.getElementById("filters"),

  collectionContext:
    document.getElementById("collectionContext"),

  collectionContextName:
    document.getElementById(
      "collectionContextName"
    ),

  clearCollection:
    document.getElementById(
      "clearCollection"
    ),

  iconGrid:
    document.getElementById("iconGrid"),

  emptyState:
    document.getElementById(
      "emptyState"
    ),

  iconOverlay:
    document.getElementById(
      "iconOverlay"
    ),

  iconPreview:
    document.getElementById(
      "iconPreview"
    ),

  detailCategory:
    document.getElementById(
      "detailCategory"
    ),

  detailName:
    document.getElementById(
      "detailName"
    ),

  detailDescription:
    document.getElementById(
      "detailDescription"
    ),

  detailTags:
    document.getElementById(
      "detailTags"
    ),

  svgCode:
    document.getElementById(
      "svgCode"
    ),

  codeLabel:
    document.getElementById(
      "codeLabel"
    ),

  copySvg:
    document.getElementById(
      "copySvg"
    ),

  downloadSvg:
    document.getElementById(
      "downloadSvg"
    ),

  openBean:
    document.getElementById(
      "openBean"
    ),

  toast:
    document.getElementById("toast"),

  proButton:
    document.getElementById(
      "proButton"
    ),

  proPlanDescription:
    document.getElementById(
      "proPlanDescription"
    ),

  proPlanBox:
    document.getElementById(
      "proPlanBox"
    ),

  proPlanBadge:
    document.getElementById(
      "proPlanBadge"
    ),

  proPrice:
    document.getElementById(
      "proPrice"
    ),

  proPlanStatus:
    document.getElementById(
      "proPlanStatus"
    )
};


/* =========================================================
   UASSET AUTH
   ========================================================= */

const ACCOUNTS_ORIGIN =
  "https://accounts.signaturesi.com";

const LOGIN_URL =
  `${ACCOUNTS_ORIGIN}/?mode=login&app=uasset`;

const SESSION_ENDPOINT =
  `${ACCOUNTS_ORIGIN}/api/auth/session`;

const LOGOUT_ENDPOINT =
  `${ACCOUNTS_ORIGIN}/api/auth/logout`;


/* =========================================================
   UASSET BILLING
   ========================================================= */

const BILLING_STATUS_ENDPOINT =
  "/api/billing/status";

const BILLING_CHECKOUT_ENDPOINT =
  "/api/billing/create-checkout";


/* =========================================================
   SECURE PRO ASSET API
   ========================================================= */

const PRO_ASSET_ENDPOINT =
  "/api/assets/pro";


/* =========================================================
   AUTH STATE
   ========================================================= */

let authenticated =
  false;

let currentUser =
  null;

let restoringSession =
  null;

let loggingOut =
  false;


/* =========================================================
   BILLING STATE
   ========================================================= */

let billingState = {
  loaded:
    false,

  pro:
    false,

  plan:
    "free",

  testMode:
    true,

  subscription:
    null
};


/* =========================================================
   PRO ASSET CACHE
   ========================================================= */

const proAssetCache =
  new Map();

const proAssetPromises =
  new Map();


/* =========================================================
   AUTH HELPERS
   ========================================================= */

function redirectToLogin() {
  window.location.replace(
    LOGIN_URL
  );
}


function resetProAssetCache() {
  proAssetCache.clear();
  proAssetPromises.clear();
}


function resetBillingState() {
  billingState = {
    loaded:
      false,

    pro:
      false,

    plan:
      "free",

    testMode:
      true,

    subscription:
      null
  };

  resetProAssetCache();
}


function setAuthenticatedUser(
  user
) {
  if (
    !user ||
    typeof user !==
      "object" ||
    !user.id
  ) {
    authenticated =
      false;

    currentUser =
      null;

    resetBillingState();

    updateBeanButton();

    updateProPlanUI();

    return false;
  }


  currentUser = {
    id:
      user.id || null,

    username:
      user.username ||
      "user",

    displayName:
      user.displayName ||
      user.username ||
      "user",

    beanId:
      user.beanId ||
      null,

    email:
      user.email ||
      null
  };


  authenticated =
    true;


  updateBeanButton();

  updateProPlanUI();

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
   PLAN HELPERS
   ========================================================= */

function getPlanType() {
  if (
    !authenticated
  ) {
    return "free";
  }

  return billingState.pro
    ? "pro"
    : "free";
}


function isProUser() {
  return (
    authenticated &&
    billingState.pro ===
      true
  );
}


function getPlanLabel() {
  return isProUser()
    ? "PRO"
    : "FREE";
}


/* =========================================================
   ICON ACCESS
   ========================================================= */

function isProIcon(
  icon
) {
  return (
    icon?.pro === true
  );
}


function canAccessIcon(
  icon
) {
  if (
    !isProIcon(icon)
  ) {
    return true;
  }

  return isProUser();
}


function getLockSvg() {
  return `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2"
      />
      <path
        d="M8 10V7a4 4 0 018 0v3"
      />
    </svg>
  `;
}


function getProBadge(
  icon
) {
  if (
    !isProIcon(icon)
  ) {
    return "";
  }

  return `
    <span
      style="
        display:inline-flex;
        align-items:center;
        gap:4px;
        margin-left:6px;
        font-size:10px;
        line-height:1;
        font-weight:600;
        letter-spacing:.06em;
        opacity:.7;
        vertical-align:middle;
      "
    >
      ${
        !isProUser()
          ? getLockSvg()
          : ""
      }
      PRO
    </span>
  `;
}


/* =========================================================
   SECURE PRO SVG LOADER
   ========================================================= */

async function getSecureProSvg(
  assetId
) {
  if (
    !assetId ||
    !PRO_ASSET_IDS.has(
      assetId
    )
  ) {
    throw new Error(
      "Invalid Pro asset"
    );
  }


  if (
    proAssetCache.has(
      assetId
    )
  ) {
    return proAssetCache.get(
      assetId
    );
  }


  if (
    proAssetPromises.has(
      assetId
    )
  ) {
    return proAssetPromises.get(
      assetId
    );
  }


  const promise =
    (async () => {
      const response =
        await fetch(
          `${PRO_ASSET_ENDPOINT}?id=${encodeURIComponent(
            assetId
          )}`,
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
        !response.ok ||
        !data.success ||
        !data.pro ||
        !data.url
      ) {
        throw new Error(
          data.error ||
          "Unable to load Pro asset"
        );
      }


      const svgResponse =
        await fetch(
          data.url,
          {
            method:
              "GET",

            cache:
              "no-store",

            headers: {
              Accept:
                "image/svg+xml,text/plain,*/*"
            }
          }
        );


      if (
        !svgResponse.ok
      ) {
        throw new Error(
          "Unable to download Pro SVG"
        );
      }


      const svg =
        await svgResponse.text();


      const normalizedSvg =
        String(
          svg
        ).trim();


      if (
        !normalizedSvg ||
        !normalizedSvg
          .toLowerCase()
          .startsWith(
            "<svg"
          )
      ) {
        throw new Error(
          "Invalid SVG asset"
        );
      }


      proAssetCache.set(
        assetId,
        normalizedSvg
      );


      return normalizedSvg;
    })();


  proAssetPromises.set(
    assetId,
    promise
  );


  try {
    return await promise;

  } finally {
    proAssetPromises.delete(
      assetId
    );
  }
}


/* =========================================================
   PRO ASSET PLACEHOLDERS
   ========================================================= */

function getProLoadingPreview() {
  return `
    <div
      style="
        width:30px;
        height:30px;
        border:1.5px solid currentColor;
        border-radius:50%;
        opacity:.28;
      "
      aria-hidden="true"
    ></div>
  `;
}


function getProLockedPreview() {
  return `
    <div
      style="
        width:34px;
        height:34px;
        display:flex;
        align-items:center;
        justify-content:center;
        border:1px solid currentColor;
        border-radius:999px;
        opacity:.48;
      "
      aria-hidden="true"
    >
      ${getLockSvg()}
    </div>
  `;
}


/* =========================================================
   HYDRATE PRO ICON PREVIEWS
   ========================================================= */

async function hydrateProIconPreviews() {
  if (
    !isProUser()
  ) {
    return;
  }


  const nodes =
    Array.from(
      els.iconGrid.querySelectorAll(
        "[data-pro-asset]"
      )
    );


  if (
    nodes.length === 0
  ) {
    return;
  }


  await Promise.all(
    nodes.map(
      async node => {
        const assetId =
          node.dataset.proAsset;

        if (!assetId) {
          return;
        }


        try {
          const svg =
            await getSecureProSvg(
              assetId
            );


          if (
            !node.isConnected
          ) {
            return;
          }


          node.innerHTML =
            svg;

          node.style.opacity =
            "1";

        } catch (error) {
          console.error(
            `Failed to load Pro asset ${assetId}:`,
            error
          );

          if (
            node.isConnected
          ) {
            node.innerHTML =
              getProLoadingPreview();

            node.style.opacity =
              ".35";
          }
        }
      }
    )
  );
}


/* =========================================================
   PRO PLAN UI
   ========================================================= */

function updateProPlanUI() {
  if (
    !els.proPlanBadge ||
    !els.proPlanStatus ||
    !els.proPlanDescription ||
    !els.proButton
  ) {
    return;
  }


  if (
    authenticated &&
    !billingState.loaded
  ) {
    els.proPlanBadge.textContent =
      "PLAN";

    els.proPlanBadge.classList.remove(
      "free",
      "pro"
    );

    els.proPlanStatus.textContent =
      "Checking current plan...";

    els.proPlanDescription.textContent =
      "Checking your UAsset subscription.";

    els.proButton.textContent =
      "View UAsset Pro";

    if (
      els.proPlanBox
    ) {
      els.proPlanBox.classList.remove(
        "pro-active"
      );
    }

    return;
  }


  if (
    isProUser()
  ) {
    els.proPlanBadge.textContent =
      "PRO";

    els.proPlanBadge.classList.remove(
      "free"
    );

    els.proPlanBadge.classList.add(
      "pro"
    );

    els.proPlanStatus.textContent =
      "Current plan: UAsset Pro";

    els.proPlanDescription.textContent =
      "Your UAsset Pro subscription is active.";

    els.proButton.textContent =
      "UAsset Pro Active";

    if (
      els.proPlanBox
    ) {
      els.proPlanBox.classList.add(
        "pro-active"
      );
    }

    return;
  }


  els.proPlanBadge.textContent =
    "FREE";

  els.proPlanBadge.classList.remove(
    "pro"
  );

  els.proPlanBadge.classList.add(
    "free"
  );

  els.proPlanStatus.textContent =
    authenticated
      ? "Current plan: Free"
      : "Login to see your current plan";

  els.proPlanDescription.textContent =
    authenticated
      ? "Upgrade to UAsset Pro for premium SVG icon access."
      : "Sign in with Bean ID to connect your UAsset plan.";

  els.proButton.textContent =
    authenticated
      ? "View UAsset Pro"
      : "Login to UAsset Pro";


  if (
    els.proPlanBox
  ) {
    els.proPlanBox.classList.remove(
      "pro-active"
    );
  }
}


/* =========================================================
   LOAD BILLING STATUS
   ========================================================= */

async function loadBillingStatus() {
  if (
    !authenticated ||
    !currentUser?.id
  ) {
    resetBillingState();

    updateProPlanUI();

    renderIcons(
      getSearchTerm()
    );

    return false;
  }


  try {
    const response =
      await fetch(
        BILLING_STATUS_ENDPOINT,
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
      resetBillingState();

      billingState.loaded =
        true;

      updateProPlanUI();

      renderIcons(
        getSearchTerm()
      );

      return false;
    }


    if (
      !response.ok ||
      data.authenticated !==
        true
    ) {
      console.error(
        "UAsset billing status error:",
        data
      );

      resetBillingState();

      billingState.loaded =
        true;

      updateProPlanUI();

      renderIcons(
        getSearchTerm()
      );

      return false;
    }


    billingState = {
      loaded:
        true,

      pro:
        data.pro ===
        true,

      plan:
        data.plan ===
        "pro"
          ? "pro"
          : "free",

      testMode:
        data.testMode ===
        true,

      subscription:
        data.subscription ||
        null
    };


    updateProPlanUI();

    renderIcons(
      getSearchTerm()
    );


    if (
      isProUser()
    ) {
      hydrateProIconPreviews();
    }


    return true;

  } catch (error) {
    console.error(
      "UAsset billing status failed:",
      error
    );

    resetBillingState();

    billingState.loaded =
      true;

    updateProPlanUI();

    renderIcons(
      getSearchTerm()
    );

    return false;
  }
}


/* =========================================================
   CREATE PRO CHECKOUT
   ========================================================= */

async function startProCheckout() {
  if (
    !authenticated
  ) {
    redirectToLogin();

    return;
  }


  if (
    isProUser()
  ) {
    showToast(
      "UAsset Pro is already active"
    );

    return;
  }


  const originalText =
    els.proButton.textContent;


  els.proButton.disabled =
    true;

  els.proButton.textContent =
    "Opening checkout...";


  try {
    const response =
      await fetch(
        BILLING_CHECKOUT_ENDPOINT,
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
            JSON.stringify({})
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
      redirectToLogin();

      return;
    }


    if (
      !response.ok ||
      !data.success ||
      !data.checkoutUrl
    ) {
      console.error(
        "UAsset checkout failed:",
        data
      );

      showToast(
        data.error ||
          "Unable to create UAsset Pro checkout"
      );

      return;
    }


    window.location.assign(
      data.checkoutUrl
    );

  } catch (error) {
    console.error(
      "UAsset checkout error:",
      error
    );

    showToast(
      "Unable to create UAsset Pro checkout"
    );

  } finally {
    els.proButton.disabled =
      false;

    els.proButton.textContent =
      originalText;
  }
}


/* =========================================================
   PREMIUM ACCESS API
   ========================================================= */

function requirePro(
  callback
) {
  if (
    !authenticated
  ) {
    redirectToLogin();

    return false;
  }


  if (
    !isProUser()
  ) {
    showToast(
      "UAsset Pro access required"
    );

    return false;
  }


  if (
    typeof callback ===
    "function"
  ) {
    callback();
  }


  return true;
}


window.UAssetAccess =
  Object.freeze({
    isAuthenticated:
      () =>
        authenticated,

    isPro:
      () =>
        isProUser(),

    getPlan:
      () =>
        getPlanType(),

    getPlanLabel:
      () =>
        getPlanLabel(),

    requirePro
  });


/* =========================================================
   SESSION RESTORE
   ========================================================= */

async function performSessionRestore() {
  try {
    const response =
      await fetch(
        SESSION_ENDPOINT,
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
      !response.ok ||
      !data.authenticated ||
      !data.user
    ) {
      authenticated =
        false;

      currentUser =
        null;

      resetBillingState();

      updateBeanButton();

      updateProPlanUI();

      renderIcons(
        getSearchTerm()
      );

      return false;
    }


    if (
      !setAuthenticatedUser(
        data.user
      )
    ) {
      return false;
    }


    await loadBillingStatus();

    return true;

  } catch (error) {
    console.error(
      "Bean session restore failed:",
      error
    );

    authenticated =
      false;

    currentUser =
      null;

    resetBillingState();

    updateBeanButton();

    updateProPlanUI();

    renderIcons(
      getSearchTerm()
    );

    return false;
  }
}


async function restoreSession() {
  if (
    restoringSession
  ) {
    return restoringSession;
  }


  restoringSession =
    performSessionRestore();


  try {
    return await restoringSession;

  } finally {
    restoringSession =
      null;
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


  loggingOut =
    true;


  try {
    await fetch(
      LOGOUT_ENDPOINT,
      {
        method:
          "POST",

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

  } catch (error) {
    console.warn(
      "Bean logout failed:",
      error
    );
  }


  authenticated =
    false;

  currentUser =
    null;

  resetBillingState();

  updateBeanButton();

  updateProPlanUI();

  renderIcons(
    getSearchTerm()
  );

  loggingOut =
    false;


  redirectToLogin();

  return true;
}


/* =========================================================
   PUBLIC AUTH API
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
   PRO BUTTON
   ========================================================= */

els.proButton.addEventListener(
  "click",
  startProCheckout
);


/* =========================================================
   ICON LIBRARY
   ========================================================= */

let activeCategory =
  "All";

let activeCollection =
  null;

let selectedIcon =
  null;

let selectedIconSvg =
  null;

let activeCodeTab =
  "svg";


/* =========================================================
   PRO ICON IDS
   ========================================================= */

const PRO_ASSET_IDS =
  new Set([
    "calendar",
    "history",
    "edit",
    "trash",
    "download",
    "upload",
    "folder",
    "heart",
    "shield",
    "info"
  ]);


/* =========================================================
   COLLECTIONS
   ========================================================= */

const collections = [
  {
    id:
      "essential-ui",

    name:
      "Essential UI",

    categories: [
      "Navigation",
      "Actions",
      "System"
    ]
  },

  {
    id:
      "time-calendar",

    name:
      "Time & Calendar",

    categories: [
      "Time"
    ]
  },

  {
    id:
      "files-product",

    name:
      "Files & Product",

    categories: [
      "Files",
      "Security",
      "Communication"
    ]
  }
];


const categories = [
  "All",

  ...new Set(
    ICONS.map(
      icon =>
        icon.category
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
              category ===
              activeCategory
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

            activeCollection =
              null;

            renderFilters();

            renderCollectionContext();

            renderIcons(
              getSearchTerm()
            );
          }
        );
      }
    );
}


/* =========================================================
   ACTIVE COLLECTION
   ========================================================= */

function getActiveCollection() {
  if (
    !activeCollection
  ) {
    return null;
  }


  return (
    collections.find(
      collection =>
        collection.id ===
        activeCollection
    ) || null
  );
}


/* =========================================================
   COLLECTION CONTEXT
   ========================================================= */

function renderCollectionContext() {
  const collection =
    getActiveCollection();


  if (!collection) {
    els.collectionContext.classList.add(
      "hidden"
    );

    els.collectionContextName.textContent =
      "";

    return;
  }


  const count =
    ICONS.filter(
      icon =>
        collection.categories.includes(
          icon.category
        )
    ).length;


  els.collectionContextName.textContent =
    collection.name +
    " · " +
    count +
    " " +
    (
      count === 1
        ? "icon"
        : "icons"
    );


  els.collectionContext.classList.remove(
    "hidden"
  );
}


/* =========================================================
   SELECT COLLECTION
   ========================================================= */

function selectCollection(
  collectionId
) {
  const collection =
    collections.find(
      item =>
        item.id ===
        collectionId
    );


  if (!collection) {
    return;
  }


  activeCollection =
    collection.id;

  activeCategory =
    "All";

  renderFilters();

  renderCollectionContext();

  renderIcons(
    getSearchTerm()
  );


  document
    .getElementById(
      "library"
    )
    ?.scrollIntoView({
      behavior:
        "smooth",

      block:
        "start"
    });
}


/* =========================================================
   COLLECTION CARD EVENTS
   ========================================================= */

document
  .querySelectorAll(
    "[data-collection]"
  )
  .forEach(
    card => {
      card.addEventListener(
        "click",
        () => {
          selectCollection(
            card.dataset.collection
          );
        }
      );
    }
  );


/* =========================================================
   CLEAR COLLECTION
   ========================================================= */

els.clearCollection.addEventListener(
  "click",
  () => {
    activeCollection =
      null;

    activeCategory =
      "All";

    renderFilters();

    renderCollectionContext();

    renderIcons(
      getSearchTerm()
    );
  }
);


/* =========================================================
   ICON MATCHING
   ========================================================= */

function matchesIcon(
  icon,
  term
) {
  const collection =
    getActiveCollection();


  if (collection) {
    if (
      !collection.categories.includes(
        icon.category
      )
    ) {
      return false;
    }

  } else if (
    activeCategory !==
      "All" &&
    icon.category !==
      activeCategory
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
   ICON PREVIEW
   ========================================================= */

function getIconPreview(
  icon
) {
  if (
    isProIcon(icon)
  ) {
    if (
      !isProUser()
    ) {
      return getProLockedPreview();
    }


    const cachedSvg =
      proAssetCache.get(
        icon.id
      );


    if (cachedSvg) {
      return cachedSvg;
    }


    return getProLoadingPreview();
  }


  return icon.svg;
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
        icon => {
          const locked =
            isProIcon(icon) &&
            !isProUser();


          const preview =
            getIconPreview(
              icon
            );


          const previewOpacity =
            locked
              ? "opacity:.48;"
              : "";


          return `
            <button
              type="button"
              class="icon-card"
              data-icon="${icon.id}"
              aria-label="Open ${icon.name}"
              style="position:relative;"
            >

              ${
                locked
                  ? `
                    <span
                      aria-hidden="true"
                      style="
                        position:absolute;
                        top:10px;
                        right:10px;
                        width:26px;
                        height:26px;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        border:1px solid currentColor;
                        border-radius:999px;
                        opacity:.7;
                        pointer-events:none;
                      "
                    >
                      ${getLockSvg()}
                    </span>
                  `
                  : ""
              }

              <div
                class="icon-draw"
                data-pro-asset="${
                  isProIcon(icon)
                    ? icon.id
                    : ""
                }"
                style="${previewOpacity}"
              >
                ${preview}
              </div>

              <div>

                <div class="icon-title">
                  ${icon.name}
                  ${getProBadge(icon)}
                </div>

                <div class="icon-category">
                  ${icon.category}
                </div>

              </div>

            </button>
          `;
        }
      )
      .join("");


  els.emptyState.classList.toggle(
    "hidden",
    visibleIcons.length !==
      0
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


  if (
    isProUser()
  ) {
    hydrateProIconPreviews();
  }
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
  icon,
  svg
) {
  const componentName =
    toComponentName(
      icon.name
    );


  return `const ${componentName} = () => (
  ${svg}
);`;
}


/* =========================================================
   HTML CODE
   ========================================================= */

function getHtmlCode(
  svg
) {
  return svg;
}


/* =========================================================
   SELECTED SVG
   ========================================================= */

function getSelectedSvg() {
  if (
    !selectedIcon
  ) {
    return "";
  }


  return (
    selectedIconSvg ||
    selectedIcon.svg ||
    ""
  );
}


/* =========================================================
   ACTIVE CODE
   ========================================================= */

function getActiveCode() {
  const svg =
    getSelectedSvg();


  if (
    !svg
  ) {
    return "";
  }


  switch (
    activeCodeTab
  ) {
    case "react":
      return getReactCode(
        selectedIcon,
        svg
      );

    case "html":
      return getHtmlCode(
        svg
      );

    case "svg":
    default:
      return svg;
  }
}


/* =========================================================
   OPEN ICON
   ========================================================= */

async function openIcon(
  id
) {
  const icon =
    ICONS.find(
      item =>
        item.id ===
        id
    );


  if (!icon) {
    return;
  }


  if (
    !canAccessIcon(
      icon
    )
  ) {
    if (
      !authenticated
    ) {
      redirectToLogin();

      return;
    }


    showToast(
      "UAsset Pro access required"
    );

    return;
  }


  selectedIcon =
    icon;

  selectedIconSvg =
    null;

  activeCodeTab =
    "svg";


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


  els.iconOverlay.classList.remove(
    "hidden"
  );

  document.body.classList.add(
    "modal-open"
  );


  if (
    isProIcon(icon)
  ) {
    els.iconPreview.innerHTML = `
      <div
        style="
          width:42px;
          height:42px;
          border:1.5px solid currentColor;
          border-radius:50%;
          opacity:.25;
        "
        aria-hidden="true"
      ></div>
    `;


    els.svgCode.textContent =
      "Loading secure Pro asset...";


    try {
      const svg =
        await getSecureProSvg(
          icon.id
        );


      if (
        selectedIcon?.id !==
        icon.id
      ) {
        return;
      }


      selectedIconSvg =
        svg;

      els.iconPreview.innerHTML =
        svg;

      updateCodeTabs();
      updateCodePanel();

    } catch (error) {
      console.error(
        "Pro icon load failed:",
        error
      );

      showToast(
        error.message ||
          "Unable to load Pro icon"
      );

      els.iconPreview.innerHTML =
        getProLockedPreview();

      els.svgCode.textContent =
        "Unable to load secure Pro asset";
    }


    return;
  }


  selectedIconSvg =
    icon.svg;


  els.iconPreview.innerHTML =
    icon.svg;


  updateCodeTabs();

  updateCodePanel();
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
    svg:
      "SVG",

    react:
      "React",

    html:
      "HTML"
  };


  els.codeLabel.textContent =
    labels[
      activeCodeTab
    ];


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
    document.getElementById(
      id
    );


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
  if (
    !selectedIcon
  ) {
    return;
  }


  if (
    !canAccessIcon(
      selectedIcon
    )
  ) {
    showToast(
      "UAsset Pro access required"
    );

    return;
  }


  const code =
    getActiveCode();


  if (
    !code
  ) {
    showToast(
      "Asset is still loading"
    );

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
  if (
    !selectedIcon
  ) {
    return;
  }


  if (
    !canAccessIcon(
      selectedIcon
    )
  ) {
    showToast(
      "UAsset Pro access required"
    );

    return;
  }


  const svg =
    getSelectedSvg();


  if (
    !svg
  ) {
    showToast(
      "Asset is still loading"
    );

    return;
  }


  const blob =
    new Blob(
      [svg],
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
      event.key ===
        "/" &&
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

renderCollectionContext();

renderIcons();

updateBeanButton();

updateProPlanUI();

restoreSession();
