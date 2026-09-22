const els = {
  heroSearch: document.getElementById("heroSearch"),
  librarySearch: document.getElementById("librarySearch"),
  filters: document.getElementById("filters"),
  iconGrid: document.getElementById("iconGrid"),
  emptyState: document.getElementById("emptyState"),
  iconOverlay: document.getElementById("iconOverlay"),
  beanOverlay: document.getElementById("beanOverlay"),
  toast: document.getElementById("toast"),
  openBean: document.getElementById("openBean"),
  beanForm: document.getElementById("beanForm"),
  copySvg: document.getElementById("copySvg"),
  downloadSvg: document.getElementById("downloadSvg"),
  proButton: document.getElementById("proButton")
};

let activeCategory = "All";
let selectedIcon = null;

const categories = ["All", ...new Set(ICONS.map(icon => icon.category))];

function searchValue() {
  return (els.librarySearch.value || "").trim().toLowerCase();
}

function renderFilters() {
  els.filters.innerHTML = categories.map(category => `
    <button class="filter ${category === activeCategory ? "active" : ""}" data-category="${category}">
      ${category}
    </button>
  `).join("");

  els.filters.querySelectorAll("[data-category]").forEach(button => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category;
      renderFilters();
      renderIcons(searchValue());
    });
  });
}

function renderIcons(term = "") {
  const visible = ICONS.filter(icon => {
    const matchesCategory =
      activeCategory === "All" || icon.category === activeCategory;

    const text = [icon.name, icon.category, ...icon.tags]
      .join(" ")
      .toLowerCase();

    return matchesCategory && (!term || text.includes(term));
  });

  els.iconGrid.innerHTML = visible.map(icon => `
    <button class="icon-card" data-icon="${icon.id}">
      <div class="icon-draw">${icon.svg}</div>
      <div>
        <div class="icon-title">${icon.name}</div>
        <div class="icon-category">${icon.category}</div>
      </div>
    </button>
  `).join("");

  els.emptyState.classList.toggle("hidden", visible.length > 0);

  els.iconGrid.querySelectorAll("[data-icon]").forEach(card => {
    card.addEventListener("click", () => openIcon(card.dataset.icon));
  });
}

function openIcon(id) {
  selectedIcon = ICONS.find(icon => icon.id === id);
  if (!selectedIcon) return;

  document.getElementById("iconPreview").innerHTML = selectedIcon.svg;
  document.getElementById("detailCategory").textContent = selectedIcon.category.toUpperCase();
  document.getElementById("detailName").textContent = selectedIcon.name;
  document.getElementById("detailDescription").textContent = selectedIcon.description;
  document.getElementById("detailTags").innerHTML =
    selectedIcon.tags.map(tag => `<span class="tag">${tag}</span>`).join("");
  document.getElementById("svgCode").textContent = selectedIcon.svg;

  els.iconOverlay.classList.remove("hidden");
}

function closeOverlay(id) {
  document.getElementById(id)?.classList.add("hidden");
}

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.remove("hidden");

  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => {
    els.toast.classList.add("hidden");
  }, 1800);
}

async function copySvg() {
  if (!selectedIcon) return;

  try {
    await navigator.clipboard.writeText(selectedIcon.svg);
    toast("SVG copied");
  } catch {
    toast("Copy failed");
  }
}

function downloadSvg() {
  if (!selectedIcon) return;

  const blob = new Blob([selectedIcon.svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${selectedIcon.id}.svg`;
  link.click();

  URL.revokeObjectURL(url);
  toast("SVG downloaded");
}

els.heroSearch.addEventListener("input", () => {
  els.librarySearch.value = els.heroSearch.value;
  renderIcons(searchValue());
});

els.librarySearch.addEventListener("input", () => {
  els.heroSearch.value = els.librarySearch.value;
  renderIcons(searchValue());
});

els.openBean.addEventListener("click", () => {
  els.beanOverlay.classList.remove("hidden");
});

els.copySvg.addEventListener("click", copySvg);
els.downloadSvg.addEventListener("click", downloadSvg);

els.proButton.addEventListener("click", () => {
  toast("Pro is coming after the core library");
});

els.beanForm.addEventListener("submit", event => {
  event.preventDefault();

  const data = new FormData(els.beanForm);
  const beanId = String(data.get("beanId") || "").trim();

  if (!beanId) return;

  // Demo-only state. Replace this with the real Bean ID API later.
  localStorage.setItem("uasset_demo_bean_id", beanId);

  els.beanOverlay.classList.add("hidden");
  els.openBean.innerHTML = `<span class="bean-dot"></span>${beanId}`;
  els.beanForm.reset();

  toast(`Signed in as ${beanId}`);
});

document.querySelectorAll("[data-close]").forEach(button => {
  button.addEventListener("click", () => closeOverlay(button.dataset.close));
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeOverlay("iconOverlay");
    closeOverlay("beanOverlay");
  }

  if (
    event.key === "/" &&
    !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
  ) {
    event.preventDefault();
    els.heroSearch.focus();
  }
});

const savedBeanId = localStorage.getItem("uasset_demo_bean_id");
if (savedBeanId) {
  els.openBean.innerHTML = `<span class="bean-dot"></span>${savedBeanId}`;
}

renderFilters();
renderIcons();
