<!doctype html>
<html lang="en">

<head>

  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <meta
    name="description"
    content="UAsset Admin Dashboard"
  >

  <title>UAsset Admin</title>


  <!-- =====================================================
       FONTS
       ===================================================== -->

  <link
    rel="preconnect"
    href="https://fonts.googleapis.com"
  >

  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin
  >

  <link
    href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&family=Sora:wght@600;700&display=swap"
    rel="stylesheet"
  >


  <!-- =====================================================
       ADMIN CSS
       ===================================================== -->

  <link
    rel="stylesheet"
    href="/admin/admin.css"
  >

</head>


<body>


  <!-- =====================================================
       APP SHELL
       ===================================================== -->

  <div class="admin-shell">


    <!-- ===================================================
         SIDEBAR
         =================================================== -->

    <aside class="admin-sidebar">


      <!-- BRAND -->

      <a
        href="/"
        class="admin-brand"
        aria-label="UAsset home"
      >

        <span class="admin-brand-mark">
          U
        </span>

        <span>
          UAsset
        </span>

      </a>


      <!-- NAV LABEL -->

      <div class="admin-nav-label">
        ADMIN
      </div>


      <!-- NAVIGATION -->

      <nav
        class="admin-nav"
        aria-label="Admin navigation"
      >


        <a
          href="#dashboard"
          class="admin-nav-link active"
        >

          <span
            class="admin-nav-icon"
            aria-hidden="true"
          >
            ◈
          </span>

          <span>
            Dashboard
          </span>

        </a>


        <a
          href="#icons"
          class="admin-nav-link"
        >

          <span
            class="admin-nav-icon"
            aria-hidden="true"
          >
            ◇
          </span>

          <span>
            Icons
          </span>

        </a>


        <a
          href="#collections"
          class="admin-nav-link"
        >

          <span
            class="admin-nav-icon"
            aria-hidden="true"
          >
            ▦
          </span>

          <span>
            Collections
          </span>

        </a>


        <a
          href="#categories"
          class="admin-nav-link"
        >

          <span
            class="admin-nav-icon"
            aria-hidden="true"
          >
            ◎
          </span>

          <span>
            Categories
          </span>

        </a>


        <a
          href="#uploads"
          class="admin-nav-link"
        >

          <span
            class="admin-nav-icon"
            aria-hidden="true"
          >
            ↑
          </span>

          <span>
            Uploads
          </span>

        </a>


        <a
          href="#settings"
          class="admin-nav-link"
        >

          <span
            class="admin-nav-icon"
            aria-hidden="true"
          >
            ⚙
          </span>

          <span>
            Settings
          </span>

        </a>


      </nav>


      <!-- SIDEBAR FOOTER -->

      <div class="admin-sidebar-footer">

        <div class="admin-user-card">

          <div class="admin-avatar">
            SA
          </div>

          <div class="admin-user-copy">

            <span class="admin-user-name">
              UAsset Admin
            </span>

            <span class="admin-user-role">
              Administrator
            </span>

          </div>

        </div>

      </div>


    </aside>


    <!-- ===================================================
         MAIN
         =================================================== -->

    <main
      class="admin-main"
      id="dashboard"
    >


      <!-- =================================================
           TOP BAR
           ================================================= -->

      <div class="admin-topbar">


        <div>

          <p class="eyebrow">
            UASSET / ADMIN
          </p>

          <h1 class="admin-page-title">
            Dashboard
          </h1>

          <p class="admin-page-subtitle">
            Manage icons, premium assets, collections
            and categories from one place.
          </p>

        </div>


        <div class="admin-top-actions">


          <a
            href="/"
            class="admin-button"
          >
            View UAsset
          </a>


          <button
            type="button"
            class="admin-button primary"
            id="newIconButton"
          >
            + New Icon
          </button>


        </div>


      </div>


      <!-- =================================================
           STATS
           ================================================= -->

      <section
        class="admin-stats"
        aria-label="UAsset statistics"
      >


        <div class="admin-stat">

          <div class="admin-stat-label">
            TOTAL ICONS
          </div>

          <div
            class="admin-stat-value"
            id="totalIcons"
          >
            25
          </div>

          <div class="admin-stat-detail">
            Current library
          </div>

        </div>


        <div class="admin-stat">

          <div class="admin-stat-label">
            FREE ICONS
          </div>

          <div
            class="admin-stat-value"
            id="freeIcons"
          >
            15
          </div>

          <div class="admin-stat-detail">
            Available to everyone
          </div>

        </div>


        <div class="admin-stat">

          <div class="admin-stat-label">
            PRO ICONS
          </div>

          <div
            class="admin-stat-value"
            id="proIcons"
          >
            10
          </div>

          <div class="admin-stat-detail">
            Premium assets
          </div>

        </div>


        <div class="admin-stat">

          <div class="admin-stat-label">
            COLLECTIONS
          </div>

          <div
            class="admin-stat-value"
            id="totalCollections"
          >
            3
          </div>

          <div class="admin-stat-detail">
            Curated sets
          </div>

        </div>


      </section>


      <!-- =================================================
           CONTENT GRID
           ================================================= -->

      <section class="admin-content-grid">


        <!-- ICON LIBRARY -->

        <div
          class="admin-panel"
          id="icons"
        >


          <div class="admin-panel-head">


            <div>

              <h2 class="admin-panel-title">
                Icon Library
              </h2>

              <p class="admin-panel-subtitle">
                Manage your current UAsset icon collection.
              </p>

            </div>


            <button
              type="button"
              class="admin-button"
              id="manageIconsButton"
            >
              Manage
            </button>


          </div>


          <div class="admin-panel-body">


            <div class="admin-table-wrap">

              <table class="admin-table">

                <thead>

                  <tr>

                    <th>
                      ICON
                    </th>

                    <th>
                      CATEGORY
                    </th>

                    <th>
                      PLAN
                    </th>

                    <th>
                      STATUS
                    </th>

                  </tr>

                </thead>


                <tbody>


                  <tr>

                    <td>
                      Time
                    </td>

                    <td>
                      Time
                    </td>

                    <td>
                      <span class="admin-badge free">
                        FREE
                      </span>
                    </td>

                    <td>
                      Active
                    </td>

                  </tr>


                  <tr>

                    <td>
                      Calendar
                    </td>

                    <td>
                      Time
                    </td>

                    <td>
                      <span class="admin-badge pro">
                        PRO
                      </span>
                    </td>

                    <td>
                      Active
                    </td>

                  </tr>


                  <tr>

                    <td>
                      History
                    </td>

                    <td>
                      Time
                    </td>

                    <td>
                      <span class="admin-badge pro">
                        PRO
                      </span>
                    </td>

                    <td>
                      Active
                    </td>

                  </tr>


                  <tr>

                    <td>
                      Search
                    </td>

                    <td>
                      Navigation
                    </td>

                    <td>
                      <span class="admin-badge free">
                        FREE
                      </span>
                    </td>

                    <td>
                      Active
                    </td>

                  </tr>


                  <tr>

                    <td>
                      Edit
                    </td>

                    <td>
                      Actions
                    </td>

                    <td>
                      <span class="admin-badge pro">
                        PRO
                      </span>
                    </td>

                    <td>
                      Active
                    </td>

                  </tr>


                </tbody>

              </table>

            </div>


          </div>


        </div>


        <!-- QUICK ACTIONS -->

        <div class="admin-panel">


          <div class="admin-panel-head">

            <div>

              <h2 class="admin-panel-title">
                Quick Actions
              </h2>

              <p class="admin-panel-subtitle">
                Common administration tasks.
              </p>

            </div>

          </div>


          <div class="admin-panel-body">


            <div class="admin-action-list">


              <button
                type="button"
                class="admin-action"
                id="quickNewIcon"
              >

                <span class="admin-action-icon">
                  +
                </span>

                <span class="admin-action-copy">

                  <span class="admin-action-title">
                    Create new icon
                  </span>

                  <span class="admin-action-text">
                    Add a new Free or Pro asset.
                  </span>

                </span>

              </button>


              <button
                type="button"
                class="admin-action"
                id="quickUpload"
              >

                <span class="admin-action-icon">
                  ↑
                </span>

                <span class="admin-action-copy">

                  <span class="admin-action-title">
                    Upload asset
                  </span>

                  <span class="admin-action-text">
                    Upload an SVG to secure storage.
                  </span>

                </span>

              </button>


              <button
                type="button"
                class="admin-action"
                id="quickCollection"
              >

                <span class="admin-action-icon">
                  ▦
                </span>

                <span class="admin-action-copy">

                  <span class="admin-action-title">
                    Create collection
                  </span>

                  <span class="admin-action-text">
                    Organize icons into curated sets.
                  </span>

                </span>

              </button>


              <button
                type="button"
                class="admin-action"
                id="quickCategory"
              >

                <span class="admin-action-icon">
                  ◎
                </span>

                <span class="admin-action-copy">

                  <span class="admin-action-title">
                    Manage categories
                  </span>

                  <span class="admin-action-text">
                    Organize your icon library.
                  </span>

                </span>

              </button>


            </div>


          </div>


        </div>


      </section>


      <!-- =================================================
           COLLECTIONS
           ================================================= -->

      <section
        class="admin-panel"
        id="collections"
        style="margin-top:18px;"
      >


        <div class="admin-panel-head">


          <div>

            <h2 class="admin-panel-title">
              Collections
            </h2>

            <p class="admin-panel-subtitle">
              Curated groups available in UAsset.
            </p>

          </div>


          <button
            type="button"
            class="admin-button"
            id="newCollectionButton"
          >
            + New Collection
          </button>


        </div>


        <div class="admin-panel-body">


          <div class="admin-content-grid">


            <div class="admin-empty">

              <div class="admin-empty-inner">

                <div class="admin-empty-mark">
                  ◌
                </div>

                <h3 class="admin-empty-title">
                  Collection manager
                </h3>

                <p class="admin-empty-text">
                  Collections will become editable here
                  once the database layer is connected.
                </p>

              </div>

            </div>


            <div
              class="admin-empty"
              id="categories"
            >

              <div class="admin-empty-inner">

                <div class="admin-empty-mark">
                  ◎
                </div>

                <h3 class="admin-empty-title">
                  Category manager
                </h3>

                <p class="admin-empty-text">
                  Categories will be managed from the
                  same admin interface.
                </p>

              </div>

            </div>


          </div>


        </div>


      </section>


      <!-- =================================================
           UPLOADS
           ================================================= -->

      <section
        class="admin-panel"
        id="uploads"
        style="margin-top:18px;"
      >


        <div class="admin-panel-head">

          <div>

            <h2 class="admin-panel-title">
              Uploads
            </h2>

            <p class="admin-panel-subtitle">
              Secure SVG asset management.
            </p>

          </div>

        </div>


        <div class="admin-panel-body">


          <div class="admin-empty">


            <div class="admin-empty-inner">


              <div class="admin-empty-mark">
                ↑
              </div>


              <h3 class="admin-empty-title">
                Upload manager
              </h3>


              <p class="admin-empty-text">
                Upload, replace and organize premium
                SVG assets from this area.
              </p>


            </div>


          </div>


        </div>


      </section>


      <!-- =================================================
           SETTINGS
           ================================================= -->

      <section
        class="admin-panel"
        id="settings"
        style="margin-top:18px;"
      >


        <div class="admin-panel-head">

          <div>

            <h2 class="admin-panel-title">
              Settings
            </h2>

            <p class="admin-panel-subtitle">
              UAsset administration and system controls.
            </p>

          </div>

        </div>


        <div class="admin-panel-body">


          <div class="admin-empty">


            <div class="admin-empty-inner">


              <div class="admin-empty-mark">
                ⚙
              </div>


              <h3 class="admin-empty-title">
                Admin settings
              </h3>


              <p class="admin-empty-text">
                Administrative controls will be connected
                after the secure backend is added.
              </p>


            </div>


          </div>


        </div>


      </section>


    </main>

  </div>


  <!-- =====================================================
       NEW ICON MODAL
       ===================================================== -->

  <div
    class="admin-modal-backdrop"
    id="newIconModal"
    aria-hidden="true"
  >

    <div
      class="admin-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="newIconTitle"
    >


      <!-- MODAL HEADER -->

      <div class="admin-modal-head">

        <div>

          <p class="eyebrow">
            UASSET / ICON MANAGER
          </p>

          <h2
            class="admin-panel-title"
            id="newIconTitle"
          >
            Create New Icon
          </h2>

          <p class="admin-panel-subtitle">
            Create and prepare a new UAsset asset.
          </p>

        </div>


        <button
          type="button"
          class="admin-modal-close"
          id="closeNewIcon"
          aria-label="Close"
        >
          ×
        </button>

      </div>


      <!-- MODAL BODY -->

      <div class="admin-modal-body">


        <!-- LEFT / FORM -->

        <div class="admin-form">


          <!-- NAME -->

          <div class="admin-field">

            <label
              class="admin-label"
              for="iconName"
            >
              Icon Name
            </label>

            <input
              class="admin-input"
              id="iconName"
              type="text"
              placeholder="Example: Idea"
              autocomplete="off"
            >

          </div>


          <!-- ID -->

          <div class="admin-field">

            <label
              class="admin-label"
              for="iconId"
            >
              Icon ID
            </label>

            <input
              class="admin-input"
              id="iconId"
              type="text"
              placeholder="Example: idea"
              autocomplete="off"
            >

            <span class="admin-help">
              Lowercase ID used by the asset system.
            </span>

          </div>


          <!-- CATEGORY + TAGS -->

          <div class="admin-form-row">


            <div class="admin-field">

              <label
                class="admin-label"
                for="iconCategory"
              >
                Category
              </label>

              <input
                class="admin-input"
                id="iconCategory"
                type="text"
                placeholder="System"
                autocomplete="off"
              >

            </div>


            <div class="admin-field">

              <label
                class="admin-label"
                for="iconTags"
              >
                Tags
              </label>

              <input
                class="admin-input"
                id="iconTags"
                type="text"
                placeholder="idea, creative"
                autocomplete="off"
              >

            </div>


          </div>


          <!-- DESCRIPTION -->

          <div class="admin-field">

            <label
              class="admin-label"
              for="iconDescription"
            >
              Description
            </label>

            <textarea
              class="admin-textarea"
              id="iconDescription"
              style="
                min-height:90px;
                font-family:Inter,sans-serif;
                resize:vertical;
              "
              placeholder="Describe this icon..."
            ></textarea>

          </div>


          <!-- PLAN -->

          <div class="admin-field">

            <span class="admin-label">
              Access Plan
            </span>

            <div
              class="admin-segmented"
              id="iconPlan"
            >

              <button
                type="button"
                class="admin-segment active"
                data-plan="free"
              >
                FREE
              </button>

              <button
                type="button"
                class="admin-segment"
                data-plan="pro"
              >
                PRO
              </button>

            </div>

          </div>


          <!-- SVG -->

          <div class="admin-field">

            <label
              class="admin-label"
              for="iconSvg"
            >
              SVG Code
            </label>

            <textarea
              class="admin-textarea"
              id="iconSvg"
              spellcheck="false"
              placeholder="<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; ...></svg>"
            ></textarea>

            <span class="admin-help">
              Paste the complete 24×24 SVG here.
            </span>

          </div>


          <!-- ACTIONS -->

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
              id="cancelNewIcon"
            >
              Cancel
            </button>


            <button
              type="button"
              class="admin-button primary"
              id="saveNewIcon"
            >
              Prepare Icon
            </button>

          </div>


        </div>


        <!-- RIGHT / PREVIEW -->

        <div class="admin-form">


          <div class="admin-field">

            <span class="admin-label">
              Live Preview
            </span>


            <div
              class="admin-icon-preview"
              id="iconLivePreview"
            >

              <span
                style="
                  color:#777871;
                  font-size:11px;
                "
              >
                SVG preview
              </span>

            </div>


          </div>


          <div class="admin-field">

            <span class="admin-label">
              Asset Summary
            </span>


            <div
              style="
                display:flex;
                flex-direction:column;
                gap:10px;
                padding:15px;
                border:1px solid var(--line);
                border-radius:var(--radius-md);
                background:var(--surface-soft);
              "
            >

              <div>

                <span
                  style="
                    display:block;
                    color:var(--muted);
                    font-size:9px;
                    margin-bottom:4px;
                    font-family:var(--mono);
                  "
                >
                  NAME
                </span>

                <strong
                  id="previewName"
                  style="font-size:12px;"
                >
                  New Icon
                </strong>

              </div>


              <div>

                <span
                  style="
                    display:block;
                    color:var(--muted);
                    font-size:9px;
                    margin-bottom:4px;
                    font-family:var(--mono);
                  "
                >
                  ID
                </span>

                <strong
                  id="previewId"
                  style="
                    font-size:11px;
                    font-family:var(--mono);
                  "
                >
                  new-icon
                </strong>

              </div>


              <div>

                <span
                  style="
                    display:block;
                    color:var(--muted);
                    font-size:9px;
                    margin-bottom:4px;
                    font-family:var(--mono);
                  "
                >
                  PLAN
                </span>

                <span
                  class="admin-badge free"
                  id="previewPlan"
                >
                  FREE
                </span>

              </div>


            </div>


          </div>


          <div class="admin-field">

            <span class="admin-label">
              Asset Standard
            </span>

            <span class="admin-help">
              24×24 viewBox · 1.75–2px stroke ·
              currentColor · no background · no gradients.
            </span>

          </div>


        </div>


      </div>


    </div>

  </div>


  <!-- =====================================================
       ADMIN JS
       ===================================================== -->

  <script
    src="/admin/admin.js"
  ></script>


</body>

</html>
