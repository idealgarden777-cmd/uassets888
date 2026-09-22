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

  copySvg: document.getElementById("copySvg"),
  downloadSvg: document.getElementById("downloadSvg"),

  openBean: document.getElementById("openBean"),
  beanForm: document.getElementById("beanForm"),

  toast: document.getElementById("toast"),
  proButton: document.getElementById("proButton")
};

let activeCategory = "All";
let selectedIcon = null;

const categories = [
  "All",
  ...new Set(ICONS.map(icon => icon.category))
];

function getSearchTerm() {
  return els.librarySearch.value.trim().toLowerCase();
}

function renderFilters() {
  els.filters.innerHTML = categories
    .map(
      category => `
        <button
          type="button"
          class="filter ${category === activeCategory ? "active" : ""}"
          data-category="${category}"
        >
          ${category}
        </button>
      `
    )
    .join("");

  els.filters.querySelectorAll("[data-category]").forEach(button => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category;

      renderFilters();
      renderIcons(getSearchTerm());
    });
  });
}

function matchesIcon(icon, term) {
  if (activeCategory !== "All" && icon.category !== activeCategory) {
    return false;
  }

  if (!term) {
    return true;
  }

  const searchText = [
    icon.name,
    icon.category,
    ...icon.tags
  ]
    .join(" ")
    .toLowerCase();

  return searchText.includes(term);
}

function renderIcons(term = "") {
  const visibleIcons = ICONS.filter(icon =>
    matchesIcon(icon, term)
  );

  els.iconGrid.innerHTML = visibleIcons
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
            <div class="icon-title">${icon.name}</div>
            <div class="icon-category">${icon.category}</div>
          </div>
        </button>
      `
    )
    .join("");

  els.emptyState.classList.toggle(
    "hidden",
    visibleIcons.length !== 0
  );

  els.iconGrid.querySelectorAll("[data-icon]").forEach(card => {
    card.addEventListener("click", () => {
      openIcon(card.dataset.icon);
    });
  });
}

function openIcon(id) {
  const icon = ICONS.find(item => item.id === id);

  if (!icon) {
    return;
  }

  selectedIcon = icon;

  els.iconPreview.innerHTML = icon.svg;

  els.detailCategory.textContent =
    icon.category.toUpperCase();

  els.detailName.textContent =
    icon.name;

  els.detailDescription.textContent =
    icon.description;

  els.detailTags.innerHTML =
    icon.tags
      .map(tag => `<span class="tag">${tag}</span>`)
      .join("");

  els.svgCode.textContent =
    icon.svg;

  els.iconOverlay.classList.remove("hidden");

  document.body.classList.add("modal-open");
}

function closeOverlay(id) {
  const overlay = document.getElementById(id);

  if (!overlay) {
    return;
  }

  overlay.classList.add("hidden");

  if (
    els.iconOverlay.classList.contains("hidden") &&
    els.beanOverlay.classList.contains("hidden")
  ) {
    document.body.classList.remove("modal-open");
  }
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.remove("hidden");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    els.toast.classList.add("hidden");
  }, 1800);
}

function syncSearch(source, target) {
  target.value = source.value;
  renderIcons(getSearchTerm());
}

async function copySelectedSvg() {
  if (!selectedIcon) {
    return;
  }

  try {
    await navigator.clipboard.writeText(
      selectedIcon.svg
    );

    showToast("SVG copied");
  } catch (error) {
    console.error(error);
    showToast("Copy failed");
  }
}

function downloadSelectedSvg() {
  if (!selectedIcon) {
    return;
  }

  const blob = new Blob(
    [selectedIcon.svg],
    {
      type: "image/svg+xml;charset=utf-8"
    }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${selectedIcon.id}.svg`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);

  showToast("SVG downloaded");
}

function updateBeanButton(beanId) {
  els.openBean.innerHTML = `
    <span class="bean-dot"></span>
    ${beanId}
  `;
}

function restoreBeanSession() {
  const beanId =
    localStorage.getItem("uasset_demo_bean_id");

  if (beanId) {
    updateBeanButton(beanId);
  }
}

els.heroSearch.addEventListener("input", () => {
  syncSearch(
    els.heroSearch,
    els.librarySearch
  );
});

els.librarySearch.addEventListener("input", () => {
  syncSearch(
    els.librarySearch,
    els.heroSearch
  );
});

els.openBean.addEventListener("click", () => {
  els.beanOverlay.classList.remove("hidden");
  document.body.classList.add("modal-open");
});

els.copySvg.addEventListener(
  "click",
  copySelectedSvg
);

els.downloadSvg.addEventListener(
  "click",
  downloadSelectedSvg
);

els.proButton.addEventListener("click", () => {
  showToast("UAsset Pro is coming next");
});

els.beanForm.addEventListener("submit", event => {
  event.preventDefault();

  const formData =
    new FormData(els.beanForm);

  const beanId =
    String(formData.get("beanId") || "").trim();

  if (!beanId) {
    return;
  }

  /*
    DEMO ONLY

    Replace this later with:
    Bean ID API → secure session cookie
  */

  localStorage.setItem(
    "uasset_demo_bean_id",
    beanId
  );

  updateBeanButton(beanId);

  els.beanForm.reset();

  closeOverlay("beanOverlay");

  showToast(
    `Signed in as ${beanId}`
  );
});

document
  .querySelectorAll("[data-close]")
  .forEach(button => {
    button.addEventListener("click", () => {
      closeOverlay(
        button.dataset.close
      );
    });
  });

document.addEventListener("click", event => {
  if (
    event.target.classList.contains("overlay")
  ) {
    closeOverlay(event.target.id);
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeOverlay("iconOverlay");
    closeOverlay("beanOverlay");
  }

  if (
    event.key === "/" &&
    !["INPUT", "TEXTAREA"].includes(
      document.activeElement.tagName
    )
  ) {
    event.preventDefault();
    els.heroSearch.focus();
  }
});

renderFilters();
renderIcons();
restoreBeanSession();
