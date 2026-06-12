/* ============================================================
   STATE — single source of truth - UTILITY FUNCTIONS
   ============================================================ */
    const state = {
      levels:      JSON.parse(JSON.stringify(SEED_LEVELS)),
      projects:    JSON.parse(JSON.stringify(SEED_PROJECTS)),
      tasks:       JSON.parse(JSON.stringify(SEED_TASKS)),
      suggestions: JSON.parse(JSON.stringify(SEED_SUGGESTIONS)),
      spaceDetails:JSON.parse(JSON.stringify(SEED_SPACE_DETAILS)),
      customTags:  [],   // user-created tags appended to MASTER_TAGS at runtime
      currentProjectId: null,   // for project detail
      currentSpaceName: null,   // for space detail
      currentTaskId:    null,   // for task detail
      taskDetailMode:   "edit", // "edit" | "create"
      projectFilter:    "all",
      calendarFilter:   "all",
      noYard:           false,
    };

    // Combined tag list (master + user-added)
    function getAllTags() {
      return [...MASTER_TAGS, ...state.customTags];
    }

    // Generate a unique id
    let _idCounter = 1000;
    function uid(prefix) { _idCounter += 1; return prefix + _idCounter; }

    // Pillar-color mapping for project image placeholders
    const PILLAR_COLORS = {
      progress:  "#D85A30",
      planned:   "#EF9F27",
      idea:      "#9A9890",
      done:      "#6B8B7E",
    };

    // Asset paths for the seeded project hero images.
    // New projects (with no img key) fall back to a solid color block.
    const PROJECT_IMG_PATHS = {
      card1: "assets/imgs/projects/p1.jpg",
      card2: "assets/imgs/projects/p2.jpg",
      card3: "assets/imgs/projects/p3.jpg",
      card4: "assets/imgs/projects/p4.jpg",
      card5: "assets/imgs/projects/p5.jpg",
      card6: "assets/imgs/projects/p6.jpg",
      card7: "assets/imgs/projects/p7.jpg",
      card8: "assets/imgs/projects/p8.jpg",
    };

    const PROJECT_IMG_POSITIONS = {
      card1: "50% -37%",
      card2: "50% -38%",
      card3: "50% -192%",
      card4: "50% -323%",
      card5: "50% -20%",
      card6: "50% -257%",
      card7: "50% -236%",
      card8: "50% -300%",
    };

    // Asset path map for area images — area name → file in /assets/imgs/areas/
    const AREA_IMG_PATHS = {
      "bathroom":       "assets/imgs/areas/bathroom.png",
      "bedroom":        "assets/imgs/areas/bedroom.png",
      "dining room":    "assets/imgs/areas/dining_room.png",
      "garage":         "assets/imgs/areas/garage.png",
      "garage bay":     "assets/imgs/areas/garage.png",
      "hallway":        "assets/imgs/areas/hallway.png",
      "kitchen":        "assets/imgs/areas/kitchen.png",
      "laundry":        "assets/imgs/areas/laundry.png",
      "living room":    "assets/imgs/areas/living_room.png",
      "mudroom":        "assets/imgs/areas/mudroom.png",
      "office":         "assets/imgs/areas/office.png",
      "pantry":         "assets/imgs/areas/pantry.png",
      "storage":        "assets/imgs/areas/storage.png",
      "sunroom":        "assets/imgs/areas/sunroom.png",
      "walk-in closet": "assets/imgs/areas/walkin_closet.png",
      "workshop":       "assets/imgs/areas/workshop.png",
    };
    const AREA_IMG_FALLBACK = "assets/imgs/areas/other.png";

    function getAreaImagePath(name) {
      if (!name) return AREA_IMG_FALLBACK;
      // Normalize: lowercase + trim. Also strip auto-numbering suffix like "Bedroom 2".
      const baseName = name.trim().toLowerCase().replace(/\s+\d+$/, '');
      return AREA_IMG_PATHS[baseName] || AREA_IMG_FALLBACK;
    }

    // Spaces image bg colors
    const SPLOTCH_COLORS = ['#E8DDD1', '#E1E4DA', '#DEDCD6'];
      /*orangy-tasks, light green- projects, light grey-spaces */

    function getSplotchColor(roomName) {
      // Deterministic — same room always gets the same color
      let hash = 0;
      for (let i = 0; i < roomName.length; i++) hash = (hash * 31 + roomName.charCodeAt(i)) >>> 0;
      return SPLOTCH_COLORS[hash % SPLOTCH_COLORS.length];
    }

/* ============================================================
   RELATIONSHIP HELPERS — single source of truth for all links.
   Storage: project.spaces[], task.projects[], task.areas[].
   Reverses are computed. Every section reads/writes via these.
   ============================================================ */

    // ── All available link targets ──────────────────────────────
    function getAllSpaceNames() {
      // Every area across every level — the canonical list of spaces
      const names = [];
      state.levels.forEach(l => l.rooms.forEach(r => { if (!names.includes(r.name)) names.push(r.name); }));
      return names;
    }
    function getAllProjects()  { return state.projects; }
    function getAllTasks()     { return state.tasks; }

    // ── Project ↔ Space (stored on project.spaces) ──────────────
    function getProjectSpaces(projectId) {
      const p = state.projects.find(x => x.id === projectId);
      return p ? (p.spaces || []) : [];
    }
    function getSpaceProjects(spaceName) {
      return state.projects.filter(p => (p.spaces || []).includes(spaceName));
    }
    function toggleProjectSpace(projectId, spaceName) {
      const p = state.projects.find(x => x.id === projectId);
      if (!p) return;
      if (!p.spaces) p.spaces = [];
      const i = p.spaces.indexOf(spaceName);
      if (i >= 0) p.spaces.splice(i, 1);
      else p.spaces.push(spaceName);
    }

    // ── Task ↔ Project (stored on task.projects) ────────────────
    function getTaskProjects(taskId) {
      const t = findTaskOrSuggestion(taskId);
      return t ? (t.projects || []) : [];
    }
    function getProjectTasks(projectId) {
      return state.tasks.filter(t => (t.projects || []).includes(projectId));
    }
    function toggleTaskProject(taskId, projectId) {
      const t = findTaskOrSuggestion(taskId);
      if (!t) return;
      if (!t.projects) t.projects = [];
      const i = t.projects.indexOf(projectId);
      if (i >= 0) t.projects.splice(i, 1);
      else t.projects.push(projectId);
    }

    // ── Task ↔ Space (stored on task.areas) ─────────────────────
    function getTaskAreas(taskId) {
      const t = findTaskOrSuggestion(taskId);
      return t ? (t.areas || []) : [];
    }
    function getSpaceTasks(spaceName) {
      return state.tasks.filter(t => (t.areas || []).includes(spaceName));
    }
    function toggleTaskArea(taskId, spaceName) {
      const t = findTaskOrSuggestion(taskId);
      if (!t) return;
      if (!t.areas) t.areas = [];
      const i = t.areas.indexOf(spaceName);
      if (i >= 0) t.areas.splice(i, 1);
      else t.areas.push(spaceName);
    }

    // Helper: find a task or suggestion by id (links work on both)
    function findTaskOrSuggestion(id) {
      return state.tasks.find(t => t.id === id) || state.suggestions.find(s => s.id === id);
    }

/* ============================================================
   LINK FIELD — reusable single-URL editor with inline popover.
   Usage: renderLinkField(container, { url, fieldId, onSave })
     url     — current URL string (or '' / null if none)
     fieldId — unique id for this field instance (for open/close tracking)
     onSave  — callback(newUrl) invoked when the user commits a change
   ============================================================ */

    let openLinkFieldId = null;  // which link field's popover is currently open

    function renderLinkField(container, opts) {
      const { url, fieldId, onSave } = opts;
      const hasUrl = url && url.trim();
      const isOpen = openLinkFieldId === fieldId;

      const wrap = document.createElement('div');
      wrap.className = 'link-field';
      wrap.dataset.linkField = fieldId;

      // Display affordance — "Link 🌐" (open) or "Link +" (add)
      const display = document.createElement('div');
      display.className = 'link-field-display';
      if (hasUrl) {
        display.innerHTML = `<span class="svg link-icon"></span><span class="link-field-label">Link</span>`;
        display.dataset.action = 'open-link-popover';
      } else {
        display.innerHTML = `<span class="svg link-plus"></span><span class="link-field-label muted">Link</span>`;
        display.dataset.action = 'open-link-popover';
      }
      display.dataset.fieldId = fieldId;
      wrap.appendChild(display);

      // Popover (inline expand) — only when open
      if (isOpen) {
        const pop = document.createElement('div');
        pop.className = 'link-popover';
        pop.innerHTML = `
          <div class='row gap-8'>
          <span class="svg link-icon inner"></span><input type="text" class="link-popover-input" id="link-input-${fieldId}"
                     value="${escAttr(url || '')}" placeholder="https://..." spellcheck="false">
          </div>
          <div class="link-popover-actions">
            <div class="link-action" data-action="link-open" data-field-id="${fieldId}"><span class="svg leave-page"></span></div>
            <div class="link-action" data-action="link-copy" data-field-id="${fieldId}"><span class="svg copy-icon"></span></div>
            <div class="link-action" data-action="link-delete" data-field-id="${fieldId}"><span class="edit-remove">&times;</span></div>
          </div>
        `;
        wrap.appendChild(pop);
      }
      if (isOpen && (url && url.trim())) {
          setTimeout(() => {
            const pop = document.querySelector('.link-field[data-link-field="' + fieldId + '"] .link-popover');
            if (pop) pop.classList.add('has-content');
          }, 0);
        }

      container.appendChild(wrap);
      // Store the onSave callback so handlers can reach it
      linkFieldCallbacks[fieldId] = onSave;
    }

    // Registry of save callbacks, keyed by fieldId
    const linkFieldCallbacks = {};

    function openLinkPopover(fieldId) {
      // Commit any currently-open field before switching
      if (openLinkFieldId && openLinkFieldId !== fieldId) commitLinkField(openLinkFieldId);
      openLinkFieldId = fieldId;
      rerenderCurrentDetailScreen();
      // Focus the input after render
      setTimeout(() => document.getElementById('link-input-' + fieldId)?.focus(), 0);
    }

    function commitLinkField(fieldId) {
      const input = document.getElementById('link-input-' + fieldId);
      if (input && linkFieldCallbacks[fieldId]) {
        linkFieldCallbacks[fieldId](input.value.trim());
      }
      if (openLinkFieldId === fieldId) openLinkFieldId = null;
    }

    function closeLinkPopover() {
      if (openLinkFieldId) {
        commitLinkField(openLinkFieldId);
        openLinkFieldId = null;
        rerenderCurrentDetailScreen();
      }
    }

    function rerenderCurrentDetailScreen() {
      if (currentScreen === 'screen-project-detail') renderProjectDetail();
      else if (currentScreen === 'screen-space-detail') renderSpaceDetail();
      else if (currentScreen === 'screen-task-detail') renderTaskDetail();
    }

    let toastTimer = null;
    function showToast(message) {
      let toast = document.getElementById('app-toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'app-toast';
        toast.className = 'app-toast';
        // Append to the phone frame so it's positioned within the device
        (document.querySelector('.phone') || document.body).appendChild(toast);
      }
      toast.textContent = message;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
    }

/* ============================================================
   LINKING SECTION — reusable "linked X" component with a
   section-scoped pencil→done edit toggle. Used by projects,
   spaces, and tasks. Reads/writes via the step-0 relationship
   helpers, so all editing is two-way and consistent.

   config = {
     ownerId,        // id (project/task) or name (space) of the thing being edited
     kind,           // 'spaces' | 'projects' | 'tasks' — what we're linking TO
     title,          // section label, e.g. "Linked spaces"
     getLinked,      // () => array of linked item objects {id|name, label}
     getAll,         // () => array of all available items {id|name, label}
     toggle,         // (itemKey) => void  — link/unlink one item
     navigate,       // (itemKey) => void  — open that item's detail (display-mode tap)
     sectionKey,     // unique string id for this section instance (edit-mode tracking)
   }
   ============================================================ */

    let openLinkSectionKey = null;  // which linking section is in edit mode

    function renderLinkingSection(config) {
      const { title, getLinked, getAll, sectionKey } = config;
      const chipKindClass = 'chip-' + config.kind;  // chip-spaces / chip-projects / chip-tasks
      const isEditing = openLinkSectionKey === sectionKey;
      const linked = getLinked();

      const wrap = document.createElement('div');

      // Section label + pencil/done toggle
      const head = document.createElement('div');
      head.className = 'linking-head gap-10';
      head.innerHTML = `
        <div class="section-label small">${title}</div>
        <div class="linking-edit-toggle" data-action="toggle-linking-section" data-section-key="${sectionKey}">
          ${isEditing ? '<span class="linking-done">Done</span>' : '<span class="svg edit linking-pencil"></span>'}
        </div>
      `;
      wrap.appendChild(head);

      const card = document.createElement('div');
      // card.className = 'card o2';

      if (isEditing) {
        // Edit mode: chip-picker of all available items, selected highlighted
        const grid = document.createElement('div');
        grid.className = 'tags-card-grid';
        const linkedKeys = linked.map(x => x.key);
        getAll().forEach(item => {
          const chip = document.createElement('div');
          chip.className = 'picker-chip ' + chipKindClass + (linkedKeys.includes(item.key) ? ' selected' : '');
          chip.textContent = item.label;
          chip.dataset.action = 'toggle-linked-item';
          chip.dataset.sectionKey = sectionKey;
          chip.dataset.itemKey = item.key;
          grid.appendChild(chip);
        });
        if (getAll().length === 0) {
          const none = document.createElement('div');
          none.className = 'caption muted-empty';
          none.textContent = 'Nothing available to link yet.';
          grid.appendChild(none);
        }
        card.appendChild(grid);
      } else {
        // Display mode: linked items as navigable chips
        if (linked.length === 0) {
          const none = document.createElement('div');
          none.className = 'caption muted-empty';
          none.textContent = 'None yet — tap the pencil to add.';
          card.appendChild(none);
        } else {
          const grid = document.createElement('div');
          grid.className = 'tags-card-grid';
          linked.forEach(item => {
            const chip = document.createElement('span');
            chip.className = 'picker-chip selected ' + chipKindClass;
            chip.textContent = item.label;
            chip.dataset.action = 'navigate-linked-item';
            chip.dataset.sectionKey = sectionKey;
            chip.dataset.itemKey = item.key;
            grid.appendChild(chip);
          });
          card.appendChild(grid);
        }
      }

      wrap.appendChild(card);
      // Stash config so handlers can reach toggle/navigate callbacks
      linkingSectionConfigs[sectionKey] = config;
      return wrap;
    }

    const linkingSectionConfigs = {};

    function toggleLinkingSection(sectionKey) {
      // Close any other open section first
      openLinkSectionKey = (openLinkSectionKey === sectionKey) ? null : sectionKey;
      rerenderCurrentDetailScreen();
    }

    function toggleLinkedItem(sectionKey, itemKey) {
      const cfg = linkingSectionConfigs[sectionKey];
      if (cfg) { cfg.toggle(itemKey); rerenderCurrentDetailScreen(); }
    }

    function navigateLinkedItem(sectionKey, itemKey) {
      const cfg = linkingSectionConfigs[sectionKey];
      if (cfg) cfg.navigate(itemKey);
    }


    // Render up to maxVisible chips into a container, with a "+N" overflow chip if there are more.
    function renderTagChips(container, groups, maxVisible = 1) {
      // groups: array of { items: [...], kind: 'spaces' | 'projects' | 'tasks' }
      // Flatten into a single ordered list, preserving kind per chip.
      const flat = [];
      groups.forEach(g => {
        (g.items || []).forEach(item => flat.push({ name: item, kind: g.kind }));
      });

      const visible = flat.slice(0, maxVisible);
      visible.forEach(entry => {
        const chip = document.createElement('span');
        chip.className = 'tag-chip chip-' + entry.kind;
        chip.textContent = entry.name;
        container.appendChild(chip);
      });
      if (flat.length > maxVisible) {
        const more = document.createElement('span');
        more.className = 'tag-chip-plus';
        more.textContent = '+' + (flat.length - maxVisible);
        container.appendChild(more);
      }
    }

/* ============================================================
   GENERAL NAVIGATION
   ============================================================ */
    const navMap = {
      'screen-dashboard':      'nav-dashboard',
      'screen-projects':       'nav-projects',
      'screen-project-detail': 'nav-projects',
      'screen-spaces':         'nav-spaces',
      'screen-space-detail':   'nav-spaces',
      'screen-calendar':       'nav-calendar',
      'screen-task-detail':    'nav-calendar',
    };

    let navHistory = [];
    let currentScreen = null;

    //google analytics - GA HELPER
    function trackEvent(eventName, params = {}) { //google analytics
      if (typeof gtag === 'function') {
        gtag('event', eventName, params);
      }
    }
    function trackScreenView(screen) { //google analytics
      trackEvent('screen_view', {
        screen_name: screen
      });
    }

    function trackOnboardingView(step) {  //google analytics
      trackEvent('onboarding_view', {
        step_number: step,
        step_name: 'ob_' + step
      });
    }

    // Re-render destination if it has a renderer
    function rerenderScreen(id) {

      trackScreenView(id); //tracks google analytics with above function

      if (id === 'screen-dashboard')      renderDashboard();
      if (id === 'screen-projects')       renderProjects();
      if (id === 'screen-project-detail') renderProjectDetail();
      if (id === 'screen-spaces')         renderSpaces();
      if (id === 'screen-space-detail')   renderSpaceDetail();
      if (id === 'screen-calendar')       renderCalendar();
      if (id === 'screen-task-detail')    renderTaskDetail();
    }

    function navigate(targetId) {
      if (targetId === currentScreen) return;
      const current = currentScreen ? document.getElementById(currentScreen) : null;
      const target  = document.getElementById(targetId);
      if (!target) return;

      // Re-render destination if it has a renderer
      rerenderScreen(targetId);

      if (current) {
        navHistory.push(currentScreen);
        current.classList.remove('active');
      }

      target.classList.add('active', 'slide-in');
      target.addEventListener('animationend', () => target.classList.remove('slide-in'), { once: true });
      target.scrollTop = 0;
      const inner = target.querySelector('.screen-content');
      if (inner) inner.scrollTop = 0;
      currentScreen = targetId;

      document.getElementById('bottom-nav').classList.remove('is-hidden');
      updateNav();
    }

    function goBack() {
      if (!navHistory.length) return;
       if (currentScreen === 'screen-task-detail') captureTaskEdits();
       const prev = navHistory.pop();
      const current = document.getElementById(currentScreen);
      const target  = document.getElementById(prev);
      if (!target) return;
      rerenderScreen(prev);
      current.classList.remove('active');
      target.classList.add('active', 'slide-back-in');
      const inner = target.querySelector('.screen-content');
      if (inner) inner.scrollTop = 0;
      target.addEventListener('animationend', () => target.classList.remove('slide-back-in'), { once: true });
      currentScreen = prev;
      updateNav();
    }

    function updateNav() {
      document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('active');
        const d = el.querySelector('.nav-dot');
        if (d) d.remove();
      });
      const id = navMap[currentScreen];
      if (id) {
        const el = document.getElementById(id);
        if (el) {
          el.classList.add('active');
          const dot = document.createElement('div');
          dot.className = 'nav-dot';
          el.appendChild(dot);
        }
      }
    }


/* ============================================================
   ONBOARDING
   ============================================================ */
    const OB_STEPS = 7;
    let currentObStep = 1;
    const OB_SKIP_STEPS = [3, 4, 5, 6];

    function getObCta(step) {
      if (step === 1) return content.ob1_cta;
      if (step === 7) return content.ob7_cta;
      return content.ob_cta;
    }

    function initOB() {
      trackEvent('prototype_loaded'); //google analytics
      trackOnboardingView(1); //google analytics

      setTimeout(() => { //google analytics
          trackEvent('engaged_30_seconds');
        }, 30000);

      setTimeout(() => { //google analytics
          trackEvent('engaged_2_minutes');
        }, 120000);

      updateObPips(1);
      updateObFooter(1);
    }

    function navigateOB(toStep) {
      if (toStep < 1 || toStep > OB_STEPS) return;
      const fromStep   = currentObStep;
      const fromScreen = document.getElementById('screen-ob-' + fromStep);
      const toScreen   = document.getElementById('screen-ob-' + toStep);
      if (!toScreen) return;
      if (fromScreen) fromScreen.classList.remove('active', 'slide-in', 'slide-back-in');
      const animClass = toStep > fromStep ? 'slide-in' : 'slide-back-in';
      toScreen.classList.add('active', animClass);
      toScreen.addEventListener('animationend', () => toScreen.classList.remove('slide-in', 'slide-back-in'), { once: true });
      toScreen.scrollTop = 0;
      currentObStep = toStep;

      if (toStep === 4) renderOb4Levels();   // ensure OB-4 reflects current state

      updateObHeader(toStep);
      updateObPips(toStep);
      updateObFooter(toStep);

      trackOnboardingView(toStep);  //google analytics
    }

    function updateObHeader(step) {
      const header  = document.getElementById('ob-header');
      const titleEl = document.getElementById('ob-title');
      const subEl   = document.getElementById('ob-sub');
      if (!header) return;
      if (step === 1) {
        header.classList.add('is-hidden');
      } else {
        header.classList.remove('is-hidden');
        if (titleEl) titleEl.textContent = content['ob' + step + '_title'] || '';
        if (subEl)   subEl.textContent   = content['ob' + step + '_sub']   || '';
      }
    }

    function updateObPips(step) {
      document.querySelectorAll('.ob-pip').forEach(pip => {
        const dot = parseInt(pip.dataset.dot, 10);
        pip.classList.remove('active', 'done');
        if (dot === step)     pip.classList.add('active');
        else if (dot < step)  pip.classList.add('done');
      });
    }

    function updateObFooter(step) {
      const backBtn       = document.getElementById('ob-back-btn');
      const nextBtn       = document.getElementById('ob-next-btn');
      const secondaryLink = document.getElementById('ob-secondary-link');
      const progress      = document.querySelector('.ob-progress');

      if (progress) progress.style.display = step === 1 ? 'none' : 'flex';
      if (backBtn)  backBtn.classList.toggle('is-hidden', step === 1);
      if (nextBtn) {
        nextBtn.textContent = getObCta(step);
        nextBtn.disabled = false;
        nextBtn.classList.remove('ob-disabled');
      }
      if (secondaryLink) {
        secondaryLink.textContent    = '';
        secondaryLink.dataset.action = '';
        if (step === 1) {
          secondaryLink.textContent    = content.ob1_signin;
          secondaryLink.dataset.action = 'open-signin';
          secondaryLink.style.display  = '';
        } else if (OB_SKIP_STEPS.includes(step)) {
          secondaryLink.textContent    = content.ob_skip;
          secondaryLink.dataset.action = 'ob-skip';
          secondaryLink.style.display  = '';
        } else {
          secondaryLink.style.display  = 'none';
        }
      }
      checkObStepReady(step);
    }

    function obNext() {
      if (currentObStep === OB_STEPS) finishOnboarding();
      else navigateOB(currentObStep + 1);
    }

    function obGoBack() {
      if (currentObStep > 1) navigateOB(currentObStep - 1);
    }

    function finishOnboarding() {
      const homeName       = document.getElementById('ob2-name')?.value.trim();
      const appHeader      = document.getElementById('app-header');
      const appHeaderName  = document.getElementById('app-header-home-name');
      const settingsIcn  = document.getElementById('settings-icon');
      if (homeName && appHeaderName) appHeaderName.textContent = homeName;
      if (appHeader) appHeader.classList.remove('is-hidden');
      const obOuter = document.getElementById('ob-outer');
      if (obOuter) obOuter.classList.add('ob-done');
      navigate('screen-dashboard');
    }

    function checkObStepReady(step) {
      if (step === undefined) step = currentObStep;
      const nextBtn = document.getElementById('ob-next-btn');
      if (!nextBtn) return;
      let ready = true;

      if (step === 2) {
        const nameVal       = (document.getElementById('ob2-name')?.value     || '').trim();
        const locationVal   = (document.getElementById('ob2-location')?.value || '').trim();
        const locationValid = locationVal.length === 5 && /^\d+$/.test(locationVal);
        const typeSelected  = !!document.querySelector('#screen-ob-2 .radio-card.selected');
        ready = nameVal.length > 0 && locationValid && typeSelected;
      } else if (step === 3) {
        ready = !!document.querySelector('#screen-ob-3 .radio-card.selected');
      } else if (step === 4) {
        // Ready when at least one level with at least one room exists
        ready = state.levels.some(l => l.rooms && l.rooms.length > 0);
      } else if (step === 5) {
        ready = !!document.querySelector('#screen-ob-5 .check-card.selected');
      } else if (step === 6) {
        ready = !!document.querySelector('#screen-ob-6 .focus-card.selected');
      } else if (step === 7) {
        const remindSelected = document.querySelector('#screen-ob-7 [data-remind].selected');
        if (!remindSelected) ready = false;
        else if (remindSelected.dataset.remind !== 'none') {
          ready = !!document.querySelector('#screen-ob-7 [data-radio-group="ob7-cal"].selected');
        }
      }
      nextBtn.disabled = !ready;
      nextBtn.classList.toggle('ob-disabled', !ready);
    }


/* ============================================================
   SHARED INTERACTIVE HANDLERS
   ============================================================ */
    function selectRadio(el, group) {
      document.querySelectorAll(`[data-radio-group="${group}"]`).forEach(c => {
        c.classList.remove('selected');
        const dot = c.querySelector('.radio-dot');
        if (dot) dot.innerHTML = '';
      });
      el.classList.add('selected');
      const dot = el.querySelector('.radio-dot');
      if (dot) dot.innerHTML = '<div class="radio-dot-inner"></div>';

      if (group === 'ob3-yard') {
        state.noYard = (el.dataset.yard === 'none');
        applyNoYardDim(state.noYard);
      }
      if (group === 'ob7-remind') {
        const calSection = document.getElementById('ob7-cal-section');
        if (calSection) calSection.classList.toggle('ob-cal-dimmed', el.dataset.remind === 'none');
      }
      checkObStepReady();
    }

    function toggleCheckCard(el) {
      el.classList.toggle('selected');
      const box = el.querySelector('.check-box');
      box.innerHTML = el.classList.contains('selected') ? CHECK_SVG : '';
      checkObStepReady();
    }

    function toggleFocusCard(el) {
      el.classList.toggle('selected');
      const box = el.querySelector('.focus-faux-check');
      box.innerHTML = el.classList.contains('selected') ? CHECK_SVG : '';
      checkObStepReady();
    }

    const CHECK_SVG = '<svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"><path d="M2 6l3 3 5-5"/></svg>';

    function applyNoYardDim(isNone) {
      const ob5 = document.getElementById('ob5-outdoor-section');
      const ob6 = document.getElementById('ob6-garden-card');
      [ob5, ob6].forEach(el => { if (el) el.classList.toggle('ob-faded', isNone); });
    }


/* ============================================================
   OB-4 — LEVELS / ROOMS RENDERER
   ============================================================ */
    function renderOb4Levels() {
      // Find the container <div id="ob4-levels"> in the OB-4 screen.
      // This is the empty container we set up in index.html.
      const container = document.getElementById('ob4-levels');

      // Defensive check: if the container doesn't exist (e.g. user is on a
      // different screen and the element isn't in the DOM yet), bail out.
      if (!container) return;

      // Wipe the container clean so we can redraw from scratch.
      // This is a "full re-render" pattern — simpler than diffing what changed.
      // Every time state.levels updates, we just blow away the old DOM and rebuild.
      container.innerHTML = '';

      // Loop through every level in our state (1st floor, 2nd floor, garage, etc.)
      // and build a card for each one.
      state.levels.forEach((level, index) => {

        // ── BUILD THE LEVEL CARD ──────────────────────────────────
        // Create the outer white card that holds one level's worth of info.
        const card = document.createElement('div');
        card.className = 'level-card';
        // Stash the level's ID on the element so click handlers can find it later.
        card.dataset.levelId = level.id;

        // ── HEAD ROW: name on the left, × button on the right ────
        const head = document.createElement('div');
        head.className = 'level-head';

        // The level's display name (e.g. "1st floor")
        const name = document.createElement('div');
        name.className = 'level-name';
        // For garage levels, append the bay count: "Garage · 2 bays"
        // The ternary handles pluralization (1 bay vs 2 bays).
        name.textContent = level.label;
        head.appendChild(name);

        // The × button to remove the whole level.
        const removeBtn = document.createElement('div');
        removeBtn.className = 'level-remove';
        // data-action tells the global click handler what to do when tapped.
        removeBtn.dataset.action = 'remove-level';
        // data-levelId tells it WHICH level to remove.
        removeBtn.dataset.levelId = level.id;
        // innerHTML (not textContent) so the &times; HTML entity renders as ×
        removeBtn.innerHTML = '&times;';
        head.appendChild(removeBtn);

        // Drop the head row into the card.
        card.appendChild(head);

        // ── ROOMS ROW: chips for each room + an "+ Add" chip ─────
        const roomsRow = document.createElement('div');
        roomsRow.className = 'level-rooms';

        // For each room on this level, make a sage-green chip.
        level.rooms.forEach(room => {
          const chip = document.createElement('div');
          // .placed = the styled "already added" variant (vs the dashed add chip).
          chip.className = 'room-chip placed';
          // Tag the chip with both IDs so the click handler knows which room
          // on which level was tapped (needed for rename/move/remove actions).
          chip.dataset.roomId = room.id;
          chip.dataset.levelId = level.id;
          chip.textContent = room.name;
          roomsRow.appendChild(chip);
        });

        // The dashed "+ Add" chip at the end of the rooms row.
        // Tapping this opens the area picker for THIS level.
        const addChip = document.createElement('div');
        addChip.className = 'room-chip add';
        addChip.dataset.action = 'add-room';
        addChip.dataset.levelId = level.id;
        addChip.textContent = '+ Add';
        roomsRow.appendChild(addChip);

        // Drop the rooms row into the card, then drop the card into the page.
        card.appendChild(roomsRow);
        container.appendChild(card);
      });

      // ── "+ Add level" PSEUDO-CARD AT THE BOTTOM ─────────────────
      // After all the real level cards, add one more card-shaped element
      // that opens the level picker. The .level-card-add class gives it the
      // dashed-border look so it reads as an action, not a real card.
      const addLevelBtn = document.createElement('div');
      addLevelBtn.className = 'level-card-add';
      addLevelBtn.dataset.action = 'add-level';
      addLevelBtn.textContent = '+ Add level';
      container.appendChild(addLevelBtn);

      // Re-run OB step validation. Adding/removing a level might toggle
      // whether the "Continue" button should be enabled — for OB-4, that's
      // "at least one level has at least one room." So every render, we check.
      checkObStepReady();
    }


/* ============================================================
   PICKER SHEET — used for: add level, add room, room actions,
   confirm-delete, tag-editor, project create.
   This is one shared sheet shell driven by config.
   ============================================================ */
    function openPicker(config) {
      const modal   = document.getElementById('picker-modal');
      const sheet   = document.getElementById('picker-sheet');
      const titleEl = document.getElementById('picker-title');
      const subEl   = document.getElementById('picker-sub');
      const body    = document.getElementById('picker-body');
      const footer  = document.getElementById('picker-footer');

      titleEl.textContent = config.title || '';
      subEl.textContent   = config.sub || '';
      subEl.style.display = config.sub ? '' : 'none';
      body.innerHTML      = '';
      body.classList.remove('chip-grid', 'action-list');
      footer.innerHTML    = '';

      if (typeof config.renderBody === 'function') config.renderBody(body);
      if (typeof config.renderFooter === 'function') config.renderFooter(footer);

      modal.classList.add('open');
      modal.dataset.pickerKind = config.kind || '';
    }

    function closePicker() {
      document.getElementById('picker-modal').classList.remove('open');
    }

    // Build a chip grid with optional inline-custom chip at the end.
    function buildChipPicker(parent, items, onPick, opts) {
      opts = opts || {};
      parent.classList.add('chip-grid');

      items.forEach(item => {
        const chip = document.createElement('div');
        chip.className = 'picker-chip';
        chip.textContent = (typeof item === 'string') ? item : item.label;
        chip.dataset.value = (typeof item === 'string') ? item : item.key;
        chip.addEventListener('click', () => onPick(item, chip));
        parent.appendChild(chip);
      });

      if (opts.allowCustom !== false) {
        const customChip = makeInlineEditableChip((value) => {
          onPick(value, null);
        });
        parent.appendChild(customChip);
      }
    }

    // Inline-editable chip — looks like a dashed "Custom..." chip;
    // on tap becomes a typeable input. Enter/blur with content commits
    // then a fresh inline chip replaces it.
    function makeInlineEditableChip(onCommit) {
      const wrap = document.createElement('div');
      wrap.className = 'picker-chip custom-inline';
      wrap.textContent = '+ Custom';

      wrap.addEventListener('click', (e) => {
        if (wrap.classList.contains('editing')) return;
        wrap.classList.add('editing');
        wrap.textContent = '';
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'inline-chip-input';
        input.placeholder = 'Type and press enter';
        wrap.appendChild(input);
        input.focus();

        let committed = false;
        const commit = () => {
          if (committed) return;
          const v = input.value.trim();
          if (v) {
            committed = true;
            // Replace this chip with a placed chip of the new value
            const placed = document.createElement('div');
            placed.className = 'picker-chip placed';
            placed.textContent = v;
            wrap.parentNode.replaceChild(placed, wrap);
            // Add a fresh inline-editable chip after
            const fresh = makeInlineEditableChip(onCommit);
            placed.parentNode.insertBefore(fresh, placed.nextSibling);
            onCommit(v);
          } else {
            // Cancel — restore the prompt
            wrap.classList.remove('editing');
            wrap.textContent = '+ Custom';
          }
        };
        input.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter') { ev.preventDefault(); commit(); }
          if (ev.key === 'Escape') { input.value = ''; commit(); }
        });
        input.addEventListener('blur', commit);
        e.stopPropagation();
      });

      return wrap;
    }


/* ============================================================
   OB-4 PICKER FLOWS
   ============================================================ */
    function openLevelPicker() {
      const usedKeys = state.levels.map(l => l.key);
      const available = LEVEL_PRESETS.filter(p => !usedKeys.includes(p.key));

      openPicker({
        kind: 'add-level',
        title: content.ob4_level_picker_title,
        sub:   content.ob4_level_picker_sub,
        renderBody: (body) => {
          buildChipPicker(body, available, (item) => {
            if (typeof item === 'string') {
              // Custom — inline-created level
              addLevel({ key: 'custom-' + uid(''), label: item, type: 'indoor' });
              closePicker();
            } else {
              addLevel(item);
            }
              closePicker();
          });
        },
        renderFooter: (footer) => {
          footer.innerHTML = `<div class="foot-picker" data-action="close-picker">${content.cancel}</div>`;
        },
      });
    }

    function addLevel(preset) {
      const level = {
        id:   uid('lvl'),
        key:  preset.key,
        label: preset.label,
        type:  preset.type || 'indoor',
        bays:  preset.bays || null,
        rooms: [],
      };
      state.levels.push(level);
      renderOb4Levels();
    }

    function removeLevel(levelId) {
      // Confirm if the level has rooms
      const level = state.levels.find(l => l.id === levelId);
      if (!level) return;
      if (level.rooms.length === 0) {
        state.levels = state.levels.filter(l => l.id !== levelId);
        renderOb4Levels();
        return;
      }
      openPicker({
        kind: 'confirm-remove-level',
        title: 'Remove this level?',
        sub:   level.rooms.length + ' area' + (level.rooms.length > 1 ? 's' : '') + ' will also be removed.',
        renderFooter: (footer) => {
          footer.innerHTML = `
            <button class="action-row destructive" data-action="confirm-remove-level" data-level-id="${levelId}">Remove</button>
            <div class="foot-picker" data-action="close-picker">Cancel</div>
          `;
        },
      });
    }

    function openRoomPicker(levelId, singleMode = false) {
      const level = state.levels.find(l => l.id === levelId);
      if (!level) return;
      const presets = ROOM_PRESETS_BY_TYPE[level.type] || ROOM_PRESETS_BY_TYPE.indoor;

      openPicker({
        kind: 'add-room',
        title: content.ob4_room_picker_title,
        sub:   content.ob4_room_picker_sub,
        renderBody: (body) => {
          buildChipPicker(body, presets, (name) => {
            addRoom(levelId, name);
            if (singleMode) closePicker();
          });
        },
        renderFooter: (footer) => {
          const label = singleMode ? 'Cancel' : 'Done';
          footer.innerHTML = `<div class="foot-picker" data-action="close-picker">${label}</div>`;
        },
      });
    }

    // Auto-number duplicates
    function addRoom(levelId, name) {
      const level = state.levels.find(l => l.id === levelId);
      if (!level) return;
      const baseName = name.trim();
      const existingNames = state.levels.flatMap(l => l.rooms.map(r => r.name));
      let finalName = baseName;
      if (existingNames.includes(baseName)) {
        let i = 2;
        while (existingNames.includes(baseName + ' ' + i)) i++;
        finalName = baseName + ' ' + i;
      }
      level.rooms.push({ id: uid('rm'), name: finalName });
      renderOb4Levels();
    }

    function openRoomActions(roomId, levelId) {
      const level = state.levels.find(l => l.id === levelId);
      const room  = level?.rooms.find(r => r.id === roomId);
      if (!room) return;

      openPicker({
        kind: 'room-actions',
        title: room.name,
        sub:   '',
        renderBody: (body) => {
          body.classList.add('action-list');
          const renameBtn = document.createElement('div');
          renameBtn.className = 'action-row';
          renameBtn.textContent = content.ob4_action_rename;
          renameBtn.addEventListener('click', () => openRenameRoom(roomId, levelId));
          body.appendChild(renameBtn);

          if (state.levels.length > 1) {
            const moveBtn = document.createElement('div');
            moveBtn.className = 'action-row';
            moveBtn.textContent = content.ob4_action_move;
            moveBtn.addEventListener('click', () => openMoveRoom(roomId, levelId));
            body.appendChild(moveBtn);
          }

          const removeBtn = document.createElement('div');
          removeBtn.className = 'action-row destructive';
          removeBtn.textContent = content.ob4_action_remove;
          removeBtn.addEventListener('click', () => {
            level.rooms = level.rooms.filter(r => r.id !== roomId);
            renderOb4Levels();
            closePicker();
          });
          body.appendChild(removeBtn);
        },
        renderFooter: (footer) => {
          footer.innerHTML = `<div class="foot-picker" data-action="close-picker">Cancel</div>`;
        },
      });
    }

    function openRenameRoom(roomId, levelId) {
      const level = state.levels.find(l => l.id === levelId);
      const room  = level?.rooms.find(r => r.id === roomId);
      if (!room) return;

      openPicker({
        kind: 'rename-room',
        title: 'Rename area',
        sub: '',
        renderBody: (body) => {
          const input = document.createElement('input');
          input.type = 'text';
          input.className = 'text-input';
          input.value = room.name;
          input.id = 'rename-input';
          body.appendChild(input);
          setTimeout(() => input.focus(), 50);
        },
        renderFooter: (footer) => {
          footer.innerHTML = `
            <button class="save-btn" data-action="confirm-rename-room" data-room-id="${roomId}" data-level-id="${levelId}">Save</button>
            <div class="foot-picker" data-action="close-picker">Cancel</div>
          `;
        },
      });
    }

    function openMoveRoom(roomId, currentLevelId) {
      const otherLevels = state.levels.filter(l => l.id !== currentLevelId);
      openPicker({
        kind: 'move-room',
        title: 'Move to which level?',
        sub: '',
        renderBody: (body) => {
          body.classList.add('action-list');
          otherLevels.forEach(level => {
            const row = document.createElement('div');
            row.className = 'action-row';
            row.textContent = level.label;
            row.addEventListener('click', () => {
              const fromLevel = state.levels.find(l => l.id === currentLevelId);
              const room = fromLevel.rooms.find(r => r.id === roomId);
              fromLevel.rooms = fromLevel.rooms.filter(r => r.id !== roomId);
              level.rooms.push(room);
              renderOb4Levels();
              closePicker();
            });
            body.appendChild(row);
          });
        },
        renderFooter: (footer) => {
          footer.innerHTML = `<div class="foot-picker" data-action="close-picker">Cancel</div>`;
        },
      });
    }

/* ============================================================
   DASHBOARD
   ============================================================ */
    function renderDashboard() {
      // ── Stat numbers ────────────────────────────────────────
      const activeProjects = state.projects.filter(p => p.status === 'progress').length;
      const mappedSpaces   = getAllSpaceNames().length;  // any area that exists
      const calendarCount  = state.tasks.filter(t => t.status === 'upcoming' || t.status === 'overdue').length;

      const pNum = document.getElementById('dash-num-projects');
      const sNum = document.getElementById('dash-num-spaces');
      const cNum = document.getElementById('dash-num-calendar');
      if (pNum) pNum.textContent = activeProjects;
      if (sNum) sNum.textContent = mappedSpaces;
      if (cNum) cNum.textContent = calendarCount;

      // ── "Needs attention" list — fixed mix ──────────────────
      const list = document.getElementById('dash-list');
      if (!list) return;
      list.innerHTML = '';

      const items = [];

      // All overdue tasks
      state.tasks
        .filter(t => t.status === 'overdue')
        .forEach(t => items.push({ kind: 'task', data: t }));

      // Up to 3 active (in-progress) projects
      state.projects
        .filter(p => p.status === 'progress')
        .slice(0, 3)
        .forEach(p => items.push({ kind: 'project', data: p }));

      // Up to 2 upcoming tasks (soonest first)
      state.tasks
        .filter(t => t.status === 'upcoming')
        .sort((a, b) => (a.dateValue || '').localeCompare(b.dateValue || ''))
        .slice(0, 1)
        .forEach(t => items.push({ kind: 'task', data: t }));

      if (items.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-state inline';
        empty.textContent = "You're all caught up.";
        list.appendChild(empty);
        return;
      }

      items.forEach((item, idx) => {
        const row = document.createElement('div');
        row.className = 'task-row';

        if (item.kind === 'project') {
          const p = item.data;
          row.dataset.action = 'open-project';
          row.dataset.projectId = p.id;
          row.innerHTML = `
            <div class="col gap-2">
              <div class="row">
                <div class="list-dot inprogress"></div>
                <div class="task-name">${p.title}</div>
              </div>
              <div class="task-due">Active project</div>
            </div>
            <div class="arrow"></div>
          `;
        } else {
          const t = item.data;
          const dotClass = t.status === 'overdue' ? 'overdue' : 'upcoming';
          const dueLabel = t.status === 'overdue' ? 'Overdue · ' + formatTaskDate(t.dateValue) : formatTaskDate(t.dateValue);
          row.dataset.action = 'open-task';
          row.dataset.taskId = t.id;
          row.innerHTML = `
            <div class="col gap-2">
              <div class="row">
                <div class="list-dot ${dotClass}"></div>
                <div class="task-name">${t.title}</div>
              </div>
              <div class="task-due">${dueLabel}</div>
            </div>
            <div class="arrow"></div>
          `;
        }

        list.appendChild(row);

        if (idx < items.length - 1) {
          const div = document.createElement('div');
          div.className = 'floor-divider';
          list.appendChild(div);
        }
      });
    }

/* ============================================================
   PROJECTS — list + filter chips + create + delete
   ============================================================ */
    function renderProjects() {
      const list = document.getElementById('projects-list');
      if (!list) return;

      // Update filter-chip fade states based on whether any cards match
      const filterRow = document.getElementById('projects-filter-row');
      if (filterRow) {
        filterRow.querySelectorAll('.filter-chip').forEach(chip => {
          const f = chip.dataset.filter;
          chip.classList.toggle('active', state.projectFilter === f);
          const matchCount = (f === 'all')
            ? state.projects.length
            : state.projects.filter(p => p.status === f).length;
          chip.classList.toggle('faded', matchCount === 0 && f !== 'all');
        });
      }

      const filtered = (state.projectFilter === 'all')
        ? state.projects
        : state.projects.filter(p => p.status === state.projectFilter);

      list.innerHTML = '';

      if (filtered.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = (state.projects.length === 0) ? content.empty_proj_all : content.empty_proj_filtered;
        list.appendChild(empty);
        return;
      }

      filtered.forEach((p, idx) => {
        const card = document.createElement('div');
        card.className = 'project-list-card o' + ((idx % 4) + 1)
          + (p.status === 'done' ? ' is-done' : '');
        card.dataset.projectId = p.id;
        card.dataset.action = 'open-project';

        const img = document.createElement('div');
        if (p.img) {
          img.className = 'project-img ' + p.img;
        } else {
          img.className = 'project-img solid';
          img.style.background = p.color || PILLAR_COLORS[p.status] || PILLAR_COLORS.idea;
        }
        card.appendChild(img);

        const content_ = document.createElement('div');
        content_.className = 'project-content col-start gap-6';

        const title = document.createElement('div');
        title.className = 'list-title';
        title.textContent = p.title;
        content_.appendChild(title);

        const statusRow = document.createElement('div');
        statusRow.className = 'row gap-6';
        statusRow.innerHTML = `<div class="list-dot no-margin ${p.status === 'progress' ? 'inprogress' : p.status}"></div>
                               <span class="status">${statusLabel(p.status)}</span>`;
        content_.appendChild(statusRow);

        const progRow = document.createElement('div');
        progRow.className = 'row gap-6';
        const pct = projectPercent(p);
        progRow.innerHTML = `<div class="progress-bar">${pct > 0 ? `<div class="progress-fill" style="width:${pct}%"></div>` : ''}</div>
                             <div class="caption">${pct}%</div>`;
        content_.appendChild(progRow);

        const tagsRow = document.createElement('div');
        tagsRow.className = 'row gap-6';
        const linkedTasks = getProjectTasks(p.id).map(t => t.title);
        renderTagChips(tagsRow, [
          { items: p.spaces || [], kind: 'spaces' },
          { items: linkedTasks,    kind: 'tasks' },
        ]);
        content_.appendChild(tagsRow);

        card.appendChild(content_);

        const arrowWrap = document.createElement('div');
        arrowWrap.className = 'full-height';
        arrowWrap.innerHTML = '<div class="arrow"></div>';
        card.appendChild(arrowWrap);

        list.appendChild(card);
      });
    }

    function statusLabel(status) {
      return content['proj_filter_' + status] || status;
    }

    function projectPercent(p) {
      if (p.status === 'done') return 100;
      if (!p.instructions || p.instructions.length === 0) return 0;
      const doneCount = p.instructions.filter(s => s.done).length;
      return Math.round((doneCount / p.instructions.length) * 100);
    }
    
/* ============================================================
   PROJECT DETAIL — render, edit mode, tag editor, delete, create new
   ============================================================ */
    //create a blank project
    function createBlankProject() {
      const newId = uid('p');
      state.projects.unshift({
        id: newId,
        title: '',
        status: 'idea',
        img: null,
        color: PILLAR_COLORS.idea,
        spaces: [],
        instructions: [],
        materials: [],
        refs: [],
        notes: '',
        _draft: true,
      });
      state.currentProjectId = newId;
      projectEditMode = true;
      navigate('screen-project-detail');
    }

    let projectEditMode = true;

    function openProject(projectId) {

      const project = state.projects.find(p => p.id === projectId); //google analytics
      trackEvent('open_project', { //google analytics
        project_id: projectId,
        project_name: project ? project.title : ''
      });

      state.currentProjectId = projectId;
      projectEditMode = true;
      navigate('screen-project-detail');
    }

    //if project doesn't have anything filled out mark as draft - which deletes it if user goes back
    function unmarkDraft() {
      const p = getCurrentProject();
      if (p) delete p._draft;
    }

    function getCurrentProject() {
      return state.projects.find(p => p.id === state.currentProjectId);
    }

    // layout function
    function renderProjectDetail() {
      const p = getCurrentProject();
      if (!p) return;

      const root = document.getElementById('screen-project-detail');

      // Two-layer setup: content (gets wiped on render), overlay (persists)
      let contentLayer = root.querySelector('.screen-content');
      let overlay = root.querySelector('.screen-overlay');
      if (!contentLayer) {
        contentLayer = document.createElement('div');
        contentLayer.className = 'screen-content';
        root.appendChild(contentLayer);
      }
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'screen-overlay';
        root.appendChild(overlay);
      }
      contentLayer.innerHTML = '';
      // Note: overlay is NOT wiped — its children manage themselves

      // Clean up legacy tag-row and drawer elements from earlier renders
      overlay.querySelector('.pd-tag-chips')?.remove();
      overlay.querySelector('.tag-editor-drawer')?.remove();

      // Apply per-project hero background to the content layer
      const imgPath = PROJECT_IMG_PATHS[p.img];
      if (imgPath) {
        contentLayer.style.backgroundImage = `url(${imgPath})`;
        contentLayer.style.backgroundColor = '';
        contentLayer.style.backgroundPosition = PROJECT_IMG_POSITIONS[p.img] || '50% -10%';
      } else {
        contentLayer.style.backgroundImage = 'none';
        contentLayer.style.backgroundColor = p.color || PILLAR_COLORS[p.status] || PILLAR_COLORS.idea;
        contentLayer.style.backgroundPosition = '';
      }

      // Edit-image (only visible in edit mode)
      let editImg = root.querySelector('.change-img-floating');
      if (!editImg) {
        editImg = document.createElement('div');
        editImg.className = 'icon-btn change-img change-img-floating';
        editImg.dataset.action = 'edit-project-image';
        editImg.innerHTML = '<div class="svg edit"></div>';
        root.insertBefore(editImg, contentLayer);  // ← inserts before content layer so content paints on top
      }
      editImg.style.display = projectEditMode ? '' : 'none';

      // Wrap with scrollable body
      const wrap = document.createElement('div');
      wrap.className = 'screen-wrap';

      // Header — title + status + progress bar
      const header = document.createElement('div');
      header.className = 'screen-header details';

      const titleRow = document.createElement('div');
      titleRow.className = 'row gap-6';
      titleRow.innerHTML = '<div class="arrow back" data-go-back></div>';

      const titleEl = document.createElement('div');
      titleEl.className = 'screen-title pl';
      if (projectEditMode) {
        titleEl.contentEditable = 'true';
        titleEl.spellcheck = false;
        titleEl.dataset.editField = 'title';
        if (!p.title) titleEl.dataset.placeholder = 'Project title';
      }
      titleEl.textContent = p.title;
      titleRow.appendChild(titleEl);
      header.appendChild(titleRow);

      // Status + progress
      const pct = projectPercent(p);
      const statusBlock = document.createElement('div');
      statusBlock.className = 'row-center gap-8 padding-tb';

      if (projectEditMode) {
        // Edit mode → status chip-pick
        statusBlock.innerHTML = `
          <div class="status-chip-row inline">
            <div class="status-chip ${p.status === 'idea' ? 'selected' : ''}" data-action="set-status" data-status="idea"><div class="list-dot no-margin idea"></div>${content.proj_filter_idea}</div>
            <div class="status-chip ${p.status === 'planned' ? 'selected' : ''}" data-action="set-status" data-status="planned"><div class="list-dot no-margin planned"></div>${content.proj_filter_planned}</div>
            <div class="status-chip ${p.status === 'progress' ? 'selected' : ''}" data-action="set-status" data-status="progress"><div class="list-dot no-margin inprogress"></div>${content.proj_filter_progress}</div>
            <div class="status-chip ${p.status === 'done' ? 'selected' : ''}" data-action="set-status" data-status="done"><div class="list-dot no-margin done"></div>${content.proj_filter_done}</div>
          </div>
        `;
      } else {
        statusBlock.innerHTML = `
          <div class="list-dot no-margin ${p.status === 'progress' ? 'inprogress' : p.status}"></div>
          <span class="status">${statusLabel(p.status)}</span>
          <div class="progress-bar pl">${pct > 0 ? `<div class="progress-fill" style="width:${pct}%"></div>` : ''}</div>
          <div class="caption">${pct}%</div>
        `;
      }
      header.appendChild(statusBlock);
      wrap.appendChild(header);

      // Body
      const body = document.createElement('div');
      body.className = 'screen-body project-details';
      
      // ── Instructions ─────────────────────────────────────
      body.appendChild(renderProjectInstructions(p));

      // ── Materials ────────────────────────────────────────
      body.appendChild(renderProjectMaterials(p));

      // ── References ───────────────────────────────────────
      body.appendChild(renderProjectRefs(p));

      // ── Notes      ───────────────────────────────────────
      const notesSection = renderProjectNotes(p);
      if (notesSection) 
        body.appendChild(notesSection);

      // ── Linked Spaces & Tasks tags  ───────────────────────────────────────
      body.appendChild(renderProjectTags(p));        // Linked spaces
      body.appendChild(renderProjectLinkedTasks(p)); // Linked tasks

      // ── Delete button (edit mode only) ───────────────────
      if (projectEditMode) {
        const deleteBlock = document.createElement('div');
        deleteBlock.className = 'project-delete-block';
        deleteBlock.innerHTML = `<button class="action-row destructive" data-action="ask-delete-project">Delete project</button>`;
        body.appendChild(deleteBlock);
      }

      wrap.appendChild(body);
      contentLayer.appendChild(wrap);
    }

    function renderProjectTags(p) {
      return renderLinkingSection({
        ownerId: p.id,
        kind: 'spaces',
        title: 'Linked spaces',
        sectionKey: 'proj-spaces-' + p.id,
        getLinked: () => getProjectSpaces(p.id).map(name => ({ key: name, label: name })),
        getAll:    () => getAllSpaceNames().map(name => ({ key: name, label: name })),
        toggle:    (name) => toggleProjectSpace(p.id, name),
        navigate:  (name) => { openSpace(name); },
      });
    }

    // toggle calls toggleTaskProject(taskId, p.id) — modifying the task's projects array from the project side. Two-way: link a task to this project here, and that task's detail will show the project.
    function renderProjectLinkedTasks(p) {
      return renderLinkingSection({
        ownerId: p.id,
        kind: 'tasks',
        title: 'Linked tasks',
        sectionKey: 'proj-tasks-' + p.id,
        getLinked: () => getProjectTasks(p.id).map(t => ({ key: t.id, label: t.title })),
        getAll:    () => state.tasks.map(t => ({ key: t.id, label: t.title })),  // committed tasks only
        toggle:    (taskId) => toggleTaskProject(taskId, p.id),
        navigate:  (taskId) => { openTask(taskId); },
      });
    }

    function renderProjectInstructions(p) {
      const wrap = document.createElement('div');

      const lblRow = document.createElement('div');
      lblRow.className = 'row gap-6';
      lblRow.innerHTML = `<div class="section-label small">${content.proj_detail_steps}</div>`;
      wrap.appendChild(lblRow);

      const card = document.createElement('div');
      card.className = 'card';

      const list = document.createElement('div');
      list.className = 'step-list';

      p.instructions.forEach((step, idx) => {
        const row = document.createElement('div');
        row.className = 'step-item';
        row.dataset.stepId = step.id;

        const box = document.createElement('div');
        box.className = 'check-box numbered' + (step.done ? ' selected' : '');
        box.dataset.action = 'toggle-step';
        box.dataset.stepId = step.id;
        box.innerHTML = step.done
          ? CHECK_SVG
          : `<span class="step-num-text">${idx + 1}</span>`;
        row.appendChild(box);

        const text = document.createElement('div');
        text.className = 'step-text' + (step.done ? ' done' : '');
        if (projectEditMode) {
          text.contentEditable = 'true';
          text.spellcheck = false;
          text.dataset.editField = 'step-text';
          text.dataset.stepId = step.id;
          text.dataset.placeholder = 'Step description';
        }
        text.textContent = step.text;
        row.appendChild(text);

        if (projectEditMode) {
          const remove = document.createElement('div');
          remove.className = 'edit-remove';
          remove.dataset.action = 'remove-step';
          remove.dataset.stepId = step.id;
          remove.innerHTML = '&times;';
          row.appendChild(remove);
        }

        list.appendChild(row);
      });
      card.appendChild(list);

      if (projectEditMode) {
        const addBtn = document.createElement('div');
        addBtn.className = 'edit-add-row';
        addBtn.dataset.action = 'add-step';
        addBtn.textContent = '+ Add step';
        card.appendChild(addBtn);
      }

      wrap.appendChild(card);
      return wrap;
    }

    function renderProjectMaterials(p) {
      const wrap = document.createElement('div');
      wrap.innerHTML = `<div class="section-label small">${content.proj_detail_materials}</div>`;

      const card = document.createElement('div');
      card.className = 'card list';

      p.materials.forEach((m, idx) => {
        const row = document.createElement('div');
        row.className = 'task-row align-start';
        row.dataset.materialId = m.id;

        const col = document.createElement('div');
        col.className = 'col gap-6';
        col.style.flex = '1';

        // ── Top row: checkbox · name · cost ──────────────────
        const titleRow = document.createElement('div');
        titleRow.className = 'row gap-12';

        const box = document.createElement('div');
        box.className = 'check-box pd' + (m.done ? ' selected' : '');
        box.dataset.action = 'toggle-material';
        box.dataset.materialId = m.id;
        box.innerHTML = m.done ? CHECK_SVG : '';
        titleRow.appendChild(box);

        const name = document.createElement('div');
        name.className = 'task-name' + (m.done ? ' done' : '');
        name.style.flex = '1';
        if (projectEditMode) {
          name.contentEditable = 'true';
          name.spellcheck = false;
          name.dataset.editField = 'mat-name';
          name.dataset.materialId = m.id;
          name.dataset.placeholder = 'New material';
        }
        name.textContent = m.name || '';
        titleRow.appendChild(name);

        // Cost: $ is a separate locked element, only the number is editable
        const costWrap = document.createElement('div');
        costWrap.className = 'cost-wrap';
        const costPrefix = document.createElement('span');
        costPrefix.className = 'cost-prefix';
        costPrefix.textContent = '$';
        const costNum = document.createElement('span');
        costNum.className = 'cost-num';
        if (projectEditMode) {
          costNum.contentEditable = 'true';
          costNum.spellcheck = false;
          costNum.dataset.editField = 'mat-cost';
          costNum.dataset.materialId = m.id;
        }
        costNum.dataset.placeholder = '0';
        costNum.textContent = (m.cost && Number(m.cost) > 0) ? m.cost : '';
        costWrap.appendChild(costPrefix);
        costWrap.appendChild(costNum);
        titleRow.appendChild(costWrap);

        col.appendChild(titleRow);

        // ── Sub-row: link · quantity ─────────────────────────
        const subRow = document.createElement('div');
        subRow.className = 'mat-sub-row';

        // Link (using shared link-field component)
        renderLinkField(subRow, {
          url: m.link || '',
          fieldId: 'mat-link-' + m.id,
          onSave: (newUrl) => {
            const mat = p.materials.find(x => x.id === m.id);
            if (mat) mat.link = newUrl;
          },
        });

        // Bullet separator
        const bullet = document.createElement('span');
        bullet.className = 'mat-bullet';
        bullet.textContent = '•';
        subRow.appendChild(bullet);

        // Quantity
        const qty = document.createElement('span');
        qty.className = 'mat-quantity';
        qty.contentEditable = 'true';
        qty.spellcheck = false;
        qty.dataset.editField = 'mat-quantity';
        qty.dataset.materialId = m.id;
        qty.dataset.placeholder = 'Quantity';
        qty.textContent = m.quantity || '';
        subRow.appendChild(qty);

        col.appendChild(subRow);

        row.appendChild(col);

        if (projectEditMode) {
          const remove = document.createElement('div');
          remove.className = 'edit-remove';
          remove.dataset.action = 'remove-material';
          remove.dataset.materialId = m.id;
          remove.innerHTML = '&times;';
          row.appendChild(remove);
        }

        card.appendChild(row);

        if (idx < p.materials.length - 1) {
          const div = document.createElement('div');
          div.className = 'floor-divider';
          card.appendChild(div);
        }
      });

      if (projectEditMode) {
        const addBtn = document.createElement('div');
        addBtn.className = 'edit-add-row';
        addBtn.dataset.action = 'add-material';
        addBtn.textContent = '+ Add material';
        card.appendChild(addBtn);
      }

      // Total
      const totalRow = document.createElement('div');
      totalRow.className = 'material-total-row row-between';
      const totalSum = p.materials.reduce((s, m) => s + (Number(m.cost) || 0), 0);
      totalRow.innerHTML = `<div class="total">Estimated total</div><div class="cost">$${totalSum}</div>`;
      card.appendChild(totalRow);

      wrap.appendChild(card);
      return wrap;
    }

    function renderProjectRefs(p) {
      const wrap = document.createElement('div');
      wrap.innerHTML = `<div class="section-label small">${content.proj_detail_refs}</div>`;

      const card = document.createElement('div');
      card.className = 'card list';

      p.refs.forEach((r, idx) => {
        const row = document.createElement('div');
        row.className = 'ref-link';
        row.dataset.refId = r.id;

        const col = document.createElement('div');
        col.className = 'col gap-6 flex-1';

        // ── Title ───────────────────────────────────────────
        const titleEl = document.createElement('div');
        titleEl.className = 'ref-title';
        if (projectEditMode) {
          titleEl.contentEditable = 'true';
          titleEl.spellcheck = false;
          titleEl.dataset.editField = 'ref-title';
          titleEl.dataset.refId = r.id;
          titleEl.dataset.placeholder = 'Reference title';
        }
        titleEl.textContent = r.title || '';
        col.appendChild(titleEl);

        // ── Link sub-row (shared link-field component) ──────
        const subRow = document.createElement('div');
        subRow.className = 'ref-sub-row';
        renderLinkField(subRow, {
          url: r.link || '',
          fieldId: 'ref-link-' + r.id,
          onSave: (newUrl) => {
            const ref = p.refs.find(x => x.id === r.id);
            if (ref) ref.link = newUrl;
          },
        });
        col.appendChild(subRow);


        row.appendChild(col);


        if (projectEditMode) {
          const remove = document.createElement('div');
          remove.className = 'edit-remove';
          remove.dataset.action = 'remove-ref';
          remove.dataset.refId = r.id;
          remove.innerHTML = '&times;';
          row.appendChild(remove);
        } 

        card.appendChild(row);

        if (idx < p.refs.length - 1) {
          const div = document.createElement('div');
          div.className = 'floor-divider';
          card.appendChild(div);
        }
      });

      if (projectEditMode) {
        const addBtn = document.createElement('div');
        addBtn.className = 'edit-add-row';
        addBtn.dataset.action = 'add-ref';
        addBtn.textContent = '+ Add reference link';
        card.appendChild(addBtn);
      }

      wrap.appendChild(card);
      return wrap;
    }

    function renderProjectNotes(p) {
     // Hide entirely in view mode when empty
     if (!projectEditMode && !(p.notes && p.notes.trim())) return null;

     const wrap = document.createElement('div');
     wrap.innerHTML = `<div class="section-label small">${content.notes}</div>`;

     const notesEl = document.createElement('textarea');
       notesEl.className = 'notes-textarea';
       notesEl.placeholder = 'Add notes about this project…';
       notesEl.value = p.notes || '';

       if (projectEditMode) {
         notesEl.dataset.editField = 'notes';
       } else {
         notesEl.readOnly = true;
       }

       wrap.appendChild(notesEl);
       return wrap;
    }

    // Capture inline-edit changes (contenteditable) into state on blur
    function captureProjectEdits() {
      const p = getCurrentProject();
      if (!p) return;
      if (p._draft) delete p._draft;   // ← promote on first real edit
      document.querySelectorAll('#screen-project-detail [data-edit-field]').forEach(el => {
        const f = el.dataset.editField;
        const v = (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT')
          ? el.value.trim()
          : el.textContent.trim();
        if (f === 'title') p.title = v || p.title;
        else if (f === 'step-text') {
          const s = p.instructions.find(s => s.id === el.dataset.stepId);
          if (s) s.text = v;
        } else if (f === 'mat-name') {
          const mat = p.materials.find(mt => mt.id === el.dataset.materialId);
          if (mat) mat.name = v;
        } else if (f === 'mat-cost') {
          const mat = p.materials.find(mt => mt.id === el.dataset.materialId);
          if (mat) mat.cost = parseFloat(el.textContent.replace(/[^0-9.]/g, '')) || 0;
          if (mat) mat.cost = parseFloat(v.replace(/[^0-9.]/g, '')) || 0;
        } else if (f === 'mat-quantity') {
          const mat = p.materials.find(mt => mt.id === el.dataset.materialId);
          if (mat) mat.quantity = v;
        } else if (f === 'notes') {
          p.notes = v;
        } else if (f === 'ref-title') {
          const r = p.refs.find(r => r.id === el.dataset.refId);
          if (r) r.title = v;
        }
      });
    }

    function toggleProjectEdit() {
      // Always-editable: capture any in-progress edits, stay in edit mode.
      captureProjectEdits();
      renderProjectDetail();
    }

    function toggleStep(stepId) {
      const p = getCurrentProject();
      if (!p) return;
      captureProjectEdits();
      const step = p.instructions.find(s => s.id === stepId);
      if (!step) return;
      step.done = !step.done;
      // Auto-bump status: if 'planned' and at least one step done → 'progress'
      if (step.done && p.status === 'planned') p.status = 'progress';
      // If all done, set to 'done'
      if (p.instructions.length > 0 && p.instructions.every(s => s.done)) {
        p.status = 'done';
      } else if (p.status === 'done' && p.instructions.some(s => !s.done)) {
        p.status = 'progress';
      }
      renderProjectDetail();
    }

    function toggleMaterial(materialId) {
      const p = getCurrentProject();
      if (!p) return;
      captureProjectEdits();
      const m = p.materials.find(m => m.id === materialId);
      if (!m) return;
      m.done = !m.done;
      renderProjectDetail();
    }

    function setProjectStatus(status) {
      const p = getCurrentProject();
      if (!p) return;
      p.status = status;
      renderProjectDetail();
    }

    function addStep() {
      const p = getCurrentProject();
      if (!p) return;
      captureProjectEdits();
      p.instructions.push({ id: uid('s'), text: '', done: false });
      renderProjectDetail();
    }

    function removeStep(stepId) {
      const p = getCurrentProject();
      if (!p) return;
      captureProjectEdits();
      p.instructions = p.instructions.filter(s => s.id !== stepId);
      renderProjectDetail();
    }

    function addMaterial() {
      const p = getCurrentProject();
      if (!p) return;
      captureProjectEdits();
      p.materials.push({ id: uid('m'), name: '', quantity: '', link: '', cost: 0, done: false });
      renderProjectDetail();
    }

    function removeMaterial(materialId) {
      const p = getCurrentProject();
      if (!p) return;
      captureProjectEdits();
      p.materials = p.materials.filter(m => m.id !== materialId);
      renderProjectDetail();
    }

    function addRef() {
      const p = getCurrentProject();
      if (!p) return;
      captureProjectEdits();
      p.refs.push({ id: uid('r'), title: '', link: '' });
      renderProjectDetail();
    }

    function removeRef(refId) {
      const p = getCurrentProject();
      if (!p) return;
      captureProjectEdits();
      p.refs = p.refs.filter(r => r.id !== refId);
      renderProjectDetail();
    }

    function askDeleteProject() {
      openPicker({
        kind: 'confirm-delete-project',
        title: content.confirm_delete_proj_title,
        sub:   content.confirm_delete_proj_sub,
        renderFooter: (footer) => {
          footer.innerHTML = `
            <button class="action-row destructive" data-action="confirm-delete-project">${content.delete_btn}</button>
            <div class="foot-picker" data-action="close-picker">${content.cancel}</div>
          `;
        },
      });
    }

    function confirmDeleteProject() {
      state.projects = state.projects.filter(p => p.id !== state.currentProjectId);
      state.currentProjectId = null;
      closePicker();
      goBack();
      renderProjects();
    }

    function openProjectImagePicker() {
      const p = getCurrentProject();
      if (!p) return;

      // Preset image options pulled from PROJECT_IMG_PATHS (the seeded cards)
      const presets = Object.keys(PROJECT_IMG_PATHS);

      // Color swatch options — the pillar palette
      const colorSwatches = [
        { key: 'coral',  hex: '#D85A30' },
        { key: 'amber',  hex: '#EF9F27' },
        { key: 'teal',   hex: '#1D9E75' },
        { key: 'sage',   hex: '#6B8B7E' },
        { key: 'slate',  hex: '#9A9890' },
      ];

      openPicker({
        kind: 'edit-project-image',
        title: 'Project image',
        sub: 'Pick an image or color for this project',
        renderBody: (body) => {

          // ── Image presets row ──
          const imgLabel = document.createElement('div');
          imgLabel.className = 'sheet-label';
          imgLabel.textContent = 'Images';
          imgLabel.style.margin = '8px 0';
          body.appendChild(imgLabel);

          const imgGrid = document.createElement('div');
          imgGrid.className = 'img-picker-grid';
          presets.forEach(key => {
            const thumb = document.createElement('div');
            thumb.className = 'img-picker-thumb ' + key;
            if (p.img === key) thumb.classList.add('selected');
            thumb.addEventListener('click', () => {
              p.img = key;
              p.color = null;
              closePicker();
              renderProjectDetail();
              renderProjects(); // keep list card in sync
            });
            imgGrid.appendChild(thumb);
          });
          body.appendChild(imgGrid);

          // ── Color swatches row ──
          const colorLabel = document.createElement('div');
          colorLabel.className = 'sheet-label';
          colorLabel.textContent = 'Or pick a color';
          colorLabel.style.margin = '30px 0 8px';
          body.appendChild(colorLabel);

          const colorGrid = document.createElement('div');
          colorGrid.className = 'color-picker-grid';
          colorSwatches.forEach(c => {
            const sw = document.createElement('div');
            sw.className = 'color-swatch';
            sw.style.background = c.hex;
            if (p.color === c.hex && !p.img) sw.classList.add('selected');
            sw.addEventListener('click', () => {
              p.img = null;
              p.color = c.hex;
              closePicker();
              renderProjectDetail();
              renderProjects();
            });
            colorGrid.appendChild(sw);
          });
          body.appendChild(colorGrid);
        },
        renderFooter: (footer) => {
          footer.innerHTML = `<div class="foot-picker margin-top-20" data-action="close-picker">${content.cancel}</div>`;
        },
      });
    }


/* ============================================================
   SPACES — overview + detail (with annotations drag)
   ============================================================ */
    function getSpaceFromRoom(roomName) {
      // Look up details by room name; auto-create empty shell if missing.
      if (!state.spaceDetails[roomName]) {
        state.spaceDetails[roomName] = {
          measurements: [],
          notes: [],
        };
      }
      return state.spaceDetails[roomName];
    }

    function isSpaceMapped(roomName) {
      const d = state.spaceDetails[roomName];
      return !!(d && d.measurements && d.measurements.length > 0);
    }

    function renderSpaces() {
      const list = document.getElementById('spaces-list');
      if (!list) return;
      list.innerHTML = '';

      // Empty state — no levels at all
      if (state.levels.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = 'No levels yet. Tap + to add one.';
        list.appendChild(empty);
        return;
      }

      // Card counter for cycling o# styles across all cards
      let cardIdx = 0;

      state.levels.forEach(level => {
        const group = document.createElement('div');
        // group.className = 'spaces-level-group';

        // Level label
        const lvlLabel = document.createElement('div');
        lvlLabel.className = 'section-label small';
        lvlLabel.textContent = level.label;
        group.appendChild(lvlLabel);

        // Area cards
        level.rooms.forEach(room => {
          group.appendChild(buildSpaceCard(room, level, cardIdx));
          cardIdx++;
        });

        // Per-level "+ Add area" button
        const addArea = document.createElement('div');
        addArea.className = 'edit-add-row spaces-add-area';
        addArea.dataset.action = 'add-area-to-level';
        addArea.dataset.levelId = level.id;
        addArea.textContent = '+ Add space';
        group.appendChild(addArea);

        list.appendChild(group);
      });
    }

    function buildSpaceCard(room, level, idx) {
      const det = getSpaceFromRoom(room.name);
      const card = document.createElement('div');
      card.className = 'project-list-card spaces o' + ((idx % 4) + 1);
      card.dataset.action = 'open-space';
      card.dataset.roomName = room.name;

      const imgPanel = document.createElement('div');
      imgPanel.className = 'space-img-panel';
      imgPanel.style.backgroundColor = getSplotchColor(room.name);

      const img = document.createElement('div');
      img.className = 'project-img spaces solid';
      img.style.backgroundImage = `url(${getAreaImagePath(room.name)})`;
      imgPanel.appendChild(img);

      card.appendChild(imgPanel);

      // Content — right side, stacked
      const contentCol = document.createElement('div');
      contentCol.className = 'project-content col-start';

      const title = document.createElement('div');
      title.className = 'list-title spaces';
      title.textContent = room.name;
      contentCol.appendChild(title);

      // Dimensions summary — first 2-3 measurements joined, or muted "not added" hint
      const dimsRow = document.createElement('div');
      dimsRow.className = 'row gap-6';
      const hasMeasurements = det.measurements && det.measurements.length > 0;
      if (hasMeasurements) {
        const dims = document.createElement('span');
        dims.className = 'caption';
        dims.textContent = summarizeMeasurements(det.measurements);
        dimsRow.appendChild(dims);
      } else {
        const empty = document.createElement('span');
        empty.className = 'caption muted-empty';
        empty.textContent = 'No measurements added yet';
        dimsRow.appendChild(empty);
      }
      contentCol.appendChild(dimsRow);

      // Linked project tags — one chip per project, with "+N" overflow chip if many
      const linkedProjects = state.projects.filter(p => (p.spaces || []).includes(room.name));
      if (linkedProjects.length > 0) {
        const tagsRow = document.createElement('div');
        tagsRow.className = 'row gap-6 margin-top-15';
        const linkedTaskTitles = getSpaceTasks(room.name).map(t => t.title);
        renderTagChips(tagsRow, [
          { items: linkedProjects.map(p => p.title), kind: 'projects' },
          { items: linkedTaskTitles,                  kind: 'tasks' },
        ]);
        contentCol.appendChild(tagsRow);
      }

      card.appendChild(contentCol);

      // Forward arrow
      const arrowWrap = document.createElement('div');
      arrowWrap.className = 'full-height';
      arrowWrap.innerHTML = '<div class="arrow"></div>';
      card.appendChild(arrowWrap);

      return card;
    }

    function summarizeMeasurements(measurements) {
      // Pull out a clean summary string from the first few measurements.
      // Pattern: "14 ft x 18 ft · 252 sq ft" or just first 2-3 joined.
      const width = measurements.find(m => /width/i.test(m.label));
      const depth = measurements.find(m => /depth/i.test(m.label));
      const wallArea = measurements.find(m => /wall area/i.test(m.label));
      const parts = [];
      if (width && depth) {
        parts.push(`${width.value} ${width.unit} x ${depth.value} ${depth.unit}`);
      }
      if (wallArea) {
        parts.push(`${wallArea.value} ${wallArea.unit}`);
      }
      if (parts.length === 0) {
        // Fallback: first measurement
        const m = measurements[0];
        parts.push(`${m.label}: ${m.value} ${m.unit}`);
      }
      return parts.join(' · ');
    }

/* ============================================================
   SPACE DETAIL
   ============================================================ */
    let spaceEditMode = true;

    function openSpace(roomName, editMode = true) {

      trackEvent('open_space', { //google analytics
        space_name: roomName
      });

      state.currentSpaceName = roomName;
      spaceEditMode = true;
      navigate('screen-space-detail');
    }

    // layout function
    function renderSpaceDetail() {
      const name = state.currentSpaceName;
      if (!name) return;
      const det = getSpaceFromRoom(name);
      const level = findLevelByRoomName(name);

      const root = document.getElementById('screen-space-detail');

      // Two-layer setup
      let contentLayer = root.querySelector('.screen-content');
      let overlay = root.querySelector('.screen-overlay');
      if (!contentLayer) {
        contentLayer = document.createElement('div');
        contentLayer.className = 'screen-content';
        root.appendChild(contentLayer);
      }
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'screen-overlay';
        root.appendChild(overlay);
      }
      contentLayer.innerHTML = '';

      // ── Header (back, title, level label, illustration on the right) ──
      const header = document.createElement('div');
      header.className = 'screen-header details';
      header.innerHTML = `
        <div class="space-header-row">
          <div class="row gap-6 flex-1 align-start">
            <div class="arrow back" data-go-back></div>
            <div class="space-header-text">
              <div class="screen-title" ${spaceEditMode ? 'contenteditable="true" spellcheck="false" data-edit-field="space-name" data-placeholder="Area name"' : ''}>${name}</div>
              <div class="space-level-label">${level ? level.label : ''}</div>
            </div>
          </div>
          <div class="space-header-img" style="background-image:url(${getAreaImagePath(name)})"></div>
        </div>
      `;
      contentLayer.appendChild(header);

      // ── Body ──
      const body = document.createElement('div');
      body.className = 'screen-body gap-md';

      // Measurements section
      body.appendChild(renderSpaceMeasurements(det));

      // Notes section (replaces the old annotations)
      body.appendChild(renderSpaceNotes(det));

      // Linked Projects & Task tags
      body.appendChild(renderSpaceLinkedProjects(name));  // Linked projects
      body.appendChild(renderSpaceLinkedTasks(name));     // Linked tasks

      // Delete-area button (edit mode only)
      if (spaceEditMode) {
        const deleteBlock = document.createElement('div');
        deleteBlock.className = 'project-delete-block';
        deleteBlock.innerHTML = `<button class="action-row destructive" data-action="ask-delete-area">Delete area</button>`;
        body.appendChild(deleteBlock);
      }

      contentLayer.appendChild(body);
    }

    function findLevelByRoomName(roomName) {
      for (const level of state.levels) {
        if (level.rooms.some(r => r.name === roomName)) return level;
      }
      return null;
    }

    const MEASUREMENT_PRESETS = ['Room width', 'Room depth', 'Ceiling height', 'Wall area (paintable)', 'Floor area'];
    const MEASUREMENT_UNITS = ['ft', 'in', 'sq ft', 'm', 'cm', 'sq m', '-'];

    function renderSpaceMeasurements(det) {
      const wrap = document.createElement('div');
      wrap.innerHTML = `<div class="section-label">Measurements</div>`;

      const card = document.createElement('div');
      card.className = 'card';

      if (det.measurements.length === 0 && !spaceEditMode) {
        const empty = document.createElement('div');
        empty.className = 'empty-state inline';
        empty.textContent = 'No measurements yet.';
        card.appendChild(empty);
      }

      det.measurements.forEach((m, idx) => {
        const row = document.createElement('div');
        row.className = 'measurement-item';
        row.dataset.measId = m.id;

        // Label
        const labelEl = document.createElement('div');
        labelEl.className = 'step-text';
        if (spaceEditMode) {
          labelEl.contentEditable = 'true';
          labelEl.spellcheck = false;
          labelEl.dataset.editField = 'meas-label';
          labelEl.dataset.measId = m.id;
          labelEl.dataset.placeholder = 'Label';
        }
        labelEl.textContent = m.label || '';
        row.appendChild(labelEl);

        // Value + unit
        const rightCol = document.createElement('div');
        rightCol.className = 'row gap-6';

        let valEl;
        if (spaceEditMode) {
          valEl = document.createElement('input');
          valEl.type = 'text';
          valEl.inputMode = 'decimal';
          valEl.className = 'cost input';
          valEl.dataset.editField = 'meas-value';
          valEl.dataset.measId = m.id;
          valEl.placeholder = '—';
          valEl.value = m.value || '';
        } else {
          valEl = document.createElement('div');
          valEl.className = 'cost spaces';
          valEl.textContent = m.value || '';
        }
        rightCol.appendChild(valEl);

        if (spaceEditMode) {
          const unitSelect = document.createElement('select');
          unitSelect.className = 'measurement-unit-select';
          unitSelect.dataset.editField = 'meas-unit';
          unitSelect.dataset.measId = m.id;
          MEASUREMENT_UNITS.forEach(u => {
            const opt = document.createElement('option');
            opt.value = u;
            opt.textContent = u;
            if (u === m.unit) opt.selected = true;
            unitSelect.appendChild(opt);
          });
          rightCol.appendChild(unitSelect);

          const remove = document.createElement('div');
          remove.className = 'edit-remove';
          remove.dataset.action = 'remove-measurement';
          remove.dataset.measId = m.id;
          remove.innerHTML = '&times;';
          rightCol.appendChild(remove);
        } else {
          const unitEl = document.createElement('span');
          unitEl.className = 'cost';
          unitEl.textContent = m.unit || '';
          rightCol.appendChild(unitEl);
        }

        row.appendChild(rightCol);
        card.appendChild(row);
      });

      if (spaceEditMode) {
        // Preset chips for quick-add (only show presets the user hasn't already added)
        const usedLabels = det.measurements.map(m => m.label.toLowerCase());
        const availablePresets = MEASUREMENT_PRESETS.filter(p => !usedLabels.includes(p.toLowerCase()));

        if (availablePresets.length > 0) {
          const presetWrap = document.createElement('div');
          presetWrap.className = 'measurement-presets';
          presetWrap.innerHTML = `<div class="measurement-presets-label">+ Quick add</div>`;
          const presetGrid = document.createElement('div');
          presetGrid.className = 'tags-card-grid chip-grid';
          availablePresets.forEach(label => {
            const chip = document.createElement('div');
            chip.className = 'picker-chip spaces';
            chip.textContent = label;
            chip.dataset.action = 'add-measurement-preset';
            chip.dataset.label = label;
            presetGrid.appendChild(chip);
          });
          presetWrap.appendChild(presetGrid);
          card.appendChild(presetWrap);
        }

        // Custom-add row (always shows)
        const addBtn = document.createElement('div');
        addBtn.className = 'edit-add-row';
        addBtn.dataset.action = 'add-measurement-blank';
        addBtn.textContent = '+ Add custom measurement';
        card.appendChild(addBtn);
      }

      wrap.appendChild(card);
      return wrap;
    }

    function renderSpaceNotes(det) {
      const wrap = document.createElement('div');
      wrap.innerHTML = `<div class="section-label small">${content.notes}</div>`;

      const card = document.createElement('div');
      card.className = 'card list';

      if (det.notes.length === 0 && !spaceEditMode) {
        const empty = document.createElement('div');
        empty.className = 'empty-state inline';
        empty.textContent = 'No notes yet.';
        card.appendChild(empty);
      }

      det.notes.forEach((n, idx) => {
        const row = document.createElement('div');
        row.className = 'ref-link';
        row.dataset.noteId = n.id;

        const col = document.createElement('div');
        col.className = 'col gap-4 flex-1';

        const titleEl = document.createElement('div');
        titleEl.className = 'space-note-title';
        if (spaceEditMode) {
          titleEl.contentEditable = 'true';
          titleEl.spellcheck = false;
          titleEl.dataset.editField = 'note-title';
          titleEl.dataset.noteId = n.id;
          titleEl.dataset.placeholder = 'Note title';
        }
        titleEl.textContent = n.title || '';
        col.appendChild(titleEl);

        const bodyEl = document.createElement('div');
        bodyEl.className = 'space-note-body';
        if (spaceEditMode) {
          bodyEl.contentEditable = 'true';
          bodyEl.spellcheck = true;
          bodyEl.dataset.editField = 'note-body';
          bodyEl.dataset.noteId = n.id;
          bodyEl.dataset.placeholder = 'Add details…';
        }
        bodyEl.textContent = n.body || '';
        col.appendChild(bodyEl);

        row.appendChild(col);

        if (spaceEditMode) {
          const remove = document.createElement('div');
          remove.className = 'edit-remove';
          remove.dataset.action = 'remove-space-note';
          remove.dataset.noteId = n.id;
          remove.innerHTML = '&times;';
          row.appendChild(remove);
        }

        card.appendChild(row);

        if (idx < det.notes.length - 1) {
          const div = document.createElement('div');
          div.className = 'floor-divider';
          card.appendChild(div);
        }
      });

      if (spaceEditMode) {
        const addBtn = document.createElement('div');
        addBtn.className = 'edit-add-row';
        addBtn.dataset.action = 'add-space-note';
        addBtn.textContent = '+ Add note';
        card.appendChild(addBtn);
      }

      wrap.appendChild(card);
      return wrap;
    }

    function renderSpaceLinkedProjects(roomName) {
      return renderLinkingSection({
        ownerId: roomName,
        kind: 'projects',
        title: 'Linked projects',
        sectionKey: 'space-projects-' + roomName,
        getLinked: () => getSpaceProjects(roomName).map(p => ({ key: p.id, label: p.title })),
        getAll:    () => getAllProjects().map(p => ({ key: p.id, label: p.title })),
        toggle:    (projectId) => toggleProjectSpace(projectId, roomName),
        navigate:  (projectId) => { openProject(projectId); },
      });
    }

    function renderSpaceLinkedTasks(roomName) {
      return renderLinkingSection({
        ownerId: roomName,
        kind: 'tasks',
        title: 'Linked tasks',
        sectionKey: 'space-tasks-' + roomName,
        getLinked: () => getSpaceTasks(roomName).map(t => ({ key: t.id, label: t.title })),
        getAll:    () => state.tasks.map(t => ({ key: t.id, label: t.title })),
        toggle:    (taskId) => toggleTaskArea(taskId, roomName),
        navigate:  (taskId) => { openTask(taskId); },
      });
    }

    function captureSpaceEdits() {
      const name = state.currentSpaceName;
      if (!name) return;
      const det = getSpaceFromRoom(name);

      document.querySelectorAll('#screen-space-detail [data-edit-field]').forEach(el => {
        const f = el.dataset.editField;
        const isFormField = el.tagName === 'SELECT' || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA';
        const v = isFormField ? el.value : el.textContent.trim();

        if (f === 'space-name') {
          if (v && v !== name) {
            renameRoomEverywhere(name, v);
            state.currentSpaceName = v;
          }
        } else if (f === 'note-title') {
          const n = det.notes.find(n => n.id === el.dataset.noteId);
          if (n) n.title = v;
        } else if (f === 'note-body') {
          const n = det.notes.find(n => n.id === el.dataset.noteId);
          if (n) n.body = v;
        } else if (f === 'meas-label') {
          const m = det.measurements.find(m => m.id === el.dataset.measId);
          if (m) m.label = v;
        } else if (f === 'meas-value') {
          const m = det.measurements.find(m => m.id === el.dataset.measId);
          if (m) m.value = v;
        } else if (f === 'meas-unit') {
          const m = det.measurements.find(m => m.id === el.dataset.measId);
          if (m) m.unit = v;
        }
      });
    }

    function renameRoomEverywhere(oldName, newName) {
      // Update levels
      state.levels.forEach(l => l.rooms.forEach(r => { if (r.name === oldName) r.name = newName; }));
      // Migrate space details
      state.spaceDetails[newName] = state.spaceDetails[oldName];
      delete state.spaceDetails[oldName];
      // Update project → space links
      state.projects.forEach(p => {
        p.spaces = (p.spaces || []).map(s => (s === oldName ? newName : s));
      });
      // Update task → space links
      state.tasks.forEach(t => {
        t.areas = (t.areas || []).map(a => (a === oldName ? newName : a));
      });
      state.suggestions.forEach(s => {
        s.areas = (s.areas || []).map(a => (a === oldName ? newName : a));
      });
    }

    function toggleSpaceEdit() {
      captureSpaceEdits();
      renderSpaceDetail();
    }

    function addMeasurementBlank() {
      captureSpaceEdits();
      const det = getSpaceFromRoom(state.currentSpaceName);
      det.measurements.push({ id: uid('m'), label: '', value: '', unit: 'ft' });
      renderSpaceDetail();
    }

    function addMeasurementPreset(label) {
      captureSpaceEdits();
      const det = getSpaceFromRoom(state.currentSpaceName);
      // Default unit guess based on label
      const unit = /area/i.test(label) ? 'sq ft' : 'ft';
      det.measurements.push({ id: uid('m'), label, value: '', unit });
      renderSpaceDetail();
    }

    function removeMeasurement(measId) {
      captureSpaceEdits();
      const det = getSpaceFromRoom(state.currentSpaceName);
      det.measurements = det.measurements.filter(m => m.id !== measId);
      renderSpaceDetail();
    }

    function addSpaceNote() {
      captureSpaceEdits();
      const det = getSpaceFromRoom(state.currentSpaceName);
      det.notes.push({ id: uid('n'), title: '', body: '' });
      renderSpaceDetail();
    }

    function removeSpaceNote(noteId) {
      captureSpaceEdits();
      const det = getSpaceFromRoom(state.currentSpaceName);
      det.notes = det.notes.filter(n => n.id !== noteId);
      renderSpaceDetail();
    }

    function addAreaToLevelFromSpaces(levelId) {
      // Capture room count before opening so we can detect if one was added
      const level = state.levels.find(l => l.id === levelId);
      if (!level) return;
      const beforeCount = level.rooms.length;

      openRoomPicker(levelId, true); // ← pass true for single mode
      // After the picker closes, find the newest room on this level, open it in edit mode
      const observer = new MutationObserver(() => {
        if (!document.getElementById('picker-modal').classList.contains('open')) {
          observer.disconnect();
          renderSpaces();
          if (level.rooms.length > beforeCount) {
            const newest = level.rooms[level.rooms.length - 1];
            openSpace(newest.name, true);
          }
        }
      });
      observer.observe(document.getElementById('picker-modal'), { attributes: true, attributeFilter: ['class'] });
    }

    function openSpaceFromTag(tagName) {
      // Only navigate if this tag matches a known room
      const matched = state.levels.flatMap(l => l.rooms).find(r => r.name === tagName);
      if (matched) openSpace(tagName);
    }

    function askDeleteArea() {
      openPicker({
        kind: 'confirm-delete-area',
        title: 'Delete this area?',
        sub:   "This can't be undone.",
        renderFooter: (footer) => {
          footer.innerHTML = `
            <button class="action-row destructive" data-action="confirm-delete-area">${content.delete_btn}</button>
            <div class="foot-picker" data-action="close-picker">${content.cancel}</div>
          `;
        },
      });
    }

    function confirmDeleteArea() {
      const name = state.currentSpaceName;
      if (!name) return;

      // Remove the room from its level
      for (const level of state.levels) {
        level.rooms = level.rooms.filter(r => r.name !== name);
      }
      // Remove its details
      delete state.spaceDetails[name];
      // Cascade: remove this space from all link sources
      state.projects.forEach(p => {
        p.spaces = (p.spaces || []).filter(s => s !== name);
      });
      state.tasks.forEach(t => {
        t.areas = (t.areas || []).filter(a => a !== name);
      });
      state.suggestions.forEach(s => {
        s.areas = (s.areas || []).filter(a => a !== name);
      });

      state.currentSpaceName = null;
      closePicker();
      goBack();
      renderSpaces();
    }
  
/* ============================================================
   CALENDAR / TASKS
   ============================================================ */
    function renderCalendar() {
      const root = document.getElementById('screen-calendar');
      if (!root) return;
      root.innerHTML = '';

      // Header (title + filter chips + add button)
      const header = document.createElement('div');
      header.className = 'screen-header';
      header.innerHTML = `
        <div class="row-center">
          <div class="screen-title">${content.calendar}</div>
          <div class="icon-btn" data-action="new-task">
            <div class="svg plus"></div>
          </div>
        </div>
        <div class="filter-row row-between" id="cal-filter-row">
          <div class="filter-chip" data-cal-filter="all">${content.cal_filter_all}</div>
          <div class="filter-chip" data-cal-filter="upcoming"><div class="list-dot no-margin upcoming"></div>${content.cal_filter_upcoming}</div>
          <div class="filter-chip" data-cal-filter="overdue"><div class="list-dot no-margin overdue"></div>${content.cal_filter_overdue}</div>
          <div class="filter-chip" data-cal-filter="suggested"><div class="list-dot no-margin ai_suggested"></div>${content.cal_filter_suggested}</div>
        </div>
      `;
      root.appendChild(header);

      const f = state.calendarFilter;

      // Build a unified, sorted timeline of items (tasks + suggestions)
      let items = [];

      // Tasks — each tagged with its kind
      state.tasks.forEach(t => {
        items.push({ kind: 'task', data: t, dateValue: t.dateValue, status: t.status });
      });
      // Suggestions — only included in "all" and "suggested" views
      state.suggestions.forEach(s => {
        items.push({ kind: 'suggestion', data: s, dateValue: s.dateValue, status: 'suggested' });
      });

      // Apply filter
      if (f !== 'all') {
        items = items.filter(item => item.status === f);
      }

      // Sort chronologically (ISO date strings sort correctly as strings)
      items.sort((a, b) => (a.dateValue || '').localeCompare(b.dateValue || ''));

      // Update filter chip states
      const filterRow = header.querySelector('#cal-filter-row');
      filterRow.querySelectorAll('.filter-chip').forEach(chip => {
        const cf = chip.dataset.calFilter;
        chip.classList.toggle('active', state.calendarFilter === cf);
        let matchCount;
        if (cf === 'all') matchCount = state.tasks.length + state.suggestions.length;
        else if (cf === 'suggested') matchCount = state.suggestions.length;
        else matchCount = state.tasks.filter(t => t.status === cf).length;
        chip.classList.toggle('faded', matchCount === 0 && cf !== 'all');
      });

      const body = document.createElement('div');
      body.className = 'list';

      // Empty state
      if (items.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = (state.tasks.length === 0 && state.suggestions.length === 0)
          ? content.empty_cal_all : content.empty_cal_filtered;
        body.appendChild(empty);
        root.appendChild(body);
        return;
      }

      // Quote at the top (scrolls with content)
      const quoteBox = document.createElement('div');
      quoteBox.className = 'cal-quote';

      const quoteText = document.createElement('div');
      quoteText.className = 'cal-quote-text';
      quoteText.textContent = getCalendarQuote();
      quoteBox.appendChild(quoteText);

      const quoteImg = document.createElement('div');
      quoteImg.className = 'cal-quote-img';
      quoteBox.appendChild(quoteImg);

      body.appendChild(quoteBox);

      // Group items by month
      let lastMonth = null;
      let listCard = null;

      items.forEach(item => {
        const monthKey = (item.dateValue || '').slice(0, 7);  // "2026-04"
        if (monthKey !== lastMonth) {
          const monthLabel = document.createElement('div');
          monthLabel.className = 'section-label task';
          monthLabel.textContent = formatMonthLabel(item.dateValue);
          body.appendChild(monthLabel);

          listCard = document.createElement('div');
          listCard.className = 'card list cal-month-list';
          body.appendChild(listCard);

          lastMonth = monthKey;
        }

        // Divider between siblings inside the same month
        if (listCard.children.length > 0) {
          const divider = document.createElement('div');
          divider.className = 'floor-divider';
          listCard.appendChild(divider);
        }
        listCard.appendChild(buildCalendarRow(item));
      });

      root.appendChild(body);
    }

    function formatTaskDate(isoDate) {
      if (!isoDate) return '';
      // Parse as local date (avoid timezone shift from new Date("YYYY-MM-DD") treating it as UTC)
      const [y, m, d] = isoDate.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      return `${months[dt.getMonth()]} ${dt.getDate()}`;
    }

    function formatMonthLabel(isoDate) {
      if (!isoDate) return '';
      const [y, m] = isoDate.split('-').map(Number);
      const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      const now = new Date();
      return months[m - 1] + (y !== now.getFullYear() ? ' ' + y : '');
    }

    function getCalendarQuote() {
      const quotes = (window.QUOTES && window.QUOTES.length) ? window.QUOTES : ['A home is a work in progress.'];
      return quotes[Math.floor(Math.random() * quotes.length)];
    }

    function toggleTaskDone(taskId) {
      const t = state.tasks.find(x => x.id === taskId);
      if (!t) return;
      if (t.status === 'done') {
        // Coming out of done — re-derive from date
        const today = new Date().toISOString().slice(0, 10);
        t.status = (t.dateValue && t.dateValue < today) ? 'overdue' : 'upcoming';
      } else {
        t.status = 'done';
      }
      renderCalendar();
    }

    // builds the calendar cards
    function buildCalendarRow(item) {
      const isSuggestion = item.kind === 'suggestion';
      const t = item.data;

      const row = document.createElement('div');
      row.className = 'cal-row'
        + (isSuggestion ? ' suggestion' : '')
        + (!isSuggestion && t.status === 'done' ? ' is-done' : '');
      row.dataset.action = isSuggestion ? 'open-suggestion' : 'open-task';
      if (isSuggestion) row.dataset.suggId = t.id;
      else row.dataset.taskId = t.id;

      // Left: status circle (real tasks tappable, suggestions show AI dot)
      if (isSuggestion) {
        const dot = document.createElement('div');
        dot.className = 'list-dot no-margin ai_suggested';
        row.appendChild(dot);
      } else {
        const circle = document.createElement('div');
        circle.className = 'check-box numbered' + (t.status === 'done' ? ' selected' : '');
        circle.dataset.action = 'toggle-task-done';
        circle.dataset.taskId = t.id;
        if (t.status === 'done') {
          circle.innerHTML = CHECK_SVG;
        } else {
          const dotClass =
            t.status === 'overdue' ? 'overdue' : 'upcoming';
          circle.innerHTML = `<div class="list-dot no-margin ${dotClass}"></div>`;
        }
        row.appendChild(circle);
      }

      // Day number
      const day = document.createElement('div');
      day.className = 'cal-row-day';
      day.textContent = t.dateValue ? Number(t.dateValue.slice(8, 10)) : '';
      row.appendChild(day);

      // Title + tags
      const contentCol = document.createElement('div');
      contentCol.className = 'cal-row-content';

      const title = document.createElement('div');
      title.className = 'task-name no-margin' + (t.status === 'done' ? ' done' : '');
      title.textContent = t.title;
      contentCol.appendChild(title);

      const tagsRow = document.createElement('div');
      tagsRow.className = 'row gap-6 cal-row-tags';
      const linkedProjTitles = (t.projects || [])
        .map(pid => state.projects.find(p => p.id === pid))
        .filter(Boolean)
        .map(p => p.title);
      renderTagChips(tagsRow, [
        { items: linkedProjTitles, kind: 'projects' },
        { items: t.areas || [],    kind: 'spaces' },
      ]);
      if (tagsRow.children.length) contentCol.appendChild(tagsRow);

      row.appendChild(contentCol);

      // Arrow
      const arrow = document.createElement('div');
      arrow.className = 'arrow';
      row.appendChild(arrow);

      return row;
    }

/* ============================================================
   TASK DETAIL — sub-screen used for both edit and create
   ============================================================ */
    function openTask(taskId) {

      const task = state.tasks.find(t => t.id === taskId); //google analytics
      trackEvent('open_task', { //google analytics
        task_id: taskId,
        task_name: task ? task.title : ''
      });

      state.currentTaskId = taskId;
      state.taskDetailMode = 'edit';
      navigate('screen-task-detail');
    }

    function openSuggestion(suggId) {
      
      const suggestion = state.suggestions.find(s => s.id === suggId); //google analytics
      trackEvent('open_suggestion', { //google analytics
        suggestion_id: suggId,
        suggestion_name: suggestion ? suggestion.title : ''
      });

      state.currentSuggestionId = suggId;
      state.taskDetailMode = 'suggestion';
      navigate('screen-task-detail');
    }

    function openNewTask() {
      // Create empty draft task; navigate; user fills in and saves
      const draft = {
        id: uid('t'),
        title: '',
        dateValue: new Date().toISOString().slice(0, 10),
        projects: [],
        recurrence: 'oneoff',
        notes: '',
        status: 'upcoming',
        areas: [],
        _draft: true,
      };
      state.tasks.unshift(draft);
      state.currentTaskId = draft.id;
      state.taskDetailMode = 'create';
      navigate('screen-task-detail');
    }

    function getCurrentTask() {
      if (state.taskDetailMode === 'suggestion') {
        return state.suggestions.find(s => s.id === state.currentSuggestionId);
      }
      return state.tasks.find(t => t.id === state.currentTaskId);
    }

    // layout
    function renderTaskDetail() {
      const t = getCurrentTask();
      if (!t) return;
      const root = document.getElementById('screen-task-detail');

      // Two-layer setup
      let contentLayer = root.querySelector('.screen-content');
      let overlay = root.querySelector('.screen-overlay');
      if (!contentLayer) {
        contentLayer = document.createElement('div');
        contentLayer.className = 'screen-content';
        root.appendChild(contentLayer);
      }
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'screen-overlay';
        root.appendChild(overlay);
      }
      contentLayer.innerHTML = '';

      // Save button in overlay (find-or-create)
      const isSuggestion = state.taskDetailMode === 'suggestion';
      let saveBtn = overlay.querySelector('[data-action="add-suggestion"]');
      if (isSuggestion) {
        if (!saveBtn) {
          saveBtn = document.createElement('div');
          saveBtn.className = 'icon-btn edit-btn is-done cal';
          saveBtn.dataset.action = 'add-suggestion';
          overlay.appendChild(saveBtn);
        }
        saveBtn.innerHTML = `<span class="icon-btn-text">Add</span>`;
        saveBtn.style.display = '';
      } else if (saveBtn) {
        saveBtn.style.display = 'none';
      }

      // Header (back arrow + editable title)
      const header = document.createElement('div');
      header.className = 'screen-header';
      const titleText = t.title || '';
      header.innerHTML = `
        <div class="row gap-6 align-start">
          <div class="arrow back" data-go-back></div>
          <div class="screen-title" id="task-title-editable" contenteditable="true" spellcheck="false" data-placeholder="${isSuggestion ? 'Suggestion title' : 'Task title'}">${escHtml(titleText)}</div>
        </div>
      `;
      contentLayer.appendChild(header);

      const body = document.createElement('div');
      body.className = 'screen-body gap-md';

      body.innerHTML = `
        <div>
          <div class="section-label">${content.task_detail_date_lbl}</div>     
          <div class="date-field${datePickerOpen ? ' open' : ''}" id="task-date-trigger" data-action="toggle-date-picker">
            <span class="date-field-value${t.dateValue ? '' : ' placeholder'}">${t.dateValue ? formatTaskDate(t.dateValue) : 'Set a date'}</span>
            <div class="calendar-picker-icn"></div>
          </div>
          <div id="date-picker-mount"></div>
        </div>
        <div>
          <div class="section-label small">${content.task_detail_recur_lbl}</div>
          <div class="tags-card-grid start chip-grid" id="task-recur-row">
            <div class="picker-chip" data-recur="oneoff">${content.recur_oneoff}</div>
            <div class="picker-chip" data-recur="daily">${content.recur_daily}</div>
            <div class="picker-chip" data-recur="weekly">${content.recur_weekly}</div>
            <div class="picker-chip" data-recur="bi-weekly">${content.recur_biweekly}</div>
            <div class="picker-chip" data-recur="monthly">${content.recur_monthly}</div>
            <div class="picker-chip" data-recur="seasonal">${content.recur_seasonal}</div>
            <div class="picker-chip" data-recur="annual">${content.recur_annual}</div>
          </div>
        </div>
        <div>
          <div class="section-label small">${content.description}</div>
          <textarea class="notes-textarea" id="task-notes" placeholder="...">${escHtml(t.notes)}</textarea>
        </div>
      `;

      contentLayer.appendChild(body);

      // Linked projects + spaces (multi-select, shared component)
      body.appendChild(renderTaskLinkedProjects(t));
      body.appendChild(renderTaskLinkedSpaces(t));

      // Set initial chip selections
      const recurRow = body.querySelector('#task-recur-row');

      recurRow.querySelectorAll('.picker-chip').forEach(c =>
        c.classList.toggle('selected', c.dataset.recur === t.recurrence));
      recurRow.querySelectorAll('.picker-chip').forEach(c =>
        c.addEventListener('click', () => {
          recurRow.querySelectorAll('.picker-chip').forEach(x => x.classList.remove('selected'));
          c.classList.add('selected');
        }));

      // Delete / dismiss at the bottom
      if (state.taskDetailMode === 'edit') {
        const delWrap = document.createElement('div');
        delWrap.className = 'project-delete-block';
        delWrap.innerHTML = `<button class="action-row destructive" data-action="ask-delete-task">${content.delete_btn}</button>`;
        body.appendChild(delWrap);
      }
      if (state.taskDetailMode === 'suggestion') {
        const disWrap = document.createElement('div');
        disWrap.className = 'project-delete-block';
        disWrap.innerHTML = `<button class="action-row destructive" data-action="dismiss-suggestion">${getDismissLabel()}</button>`;
        body.appendChild(disWrap);
      }

      renderDatePicker();
    }

    // track which month the picker is showing, and whether it's open
    let datePickerOpen = false;
    let datePickerMonth = null; // {year, month} being viewed; null = derive from task date

    // builds the month view into the mount point
    function renderDatePicker() {
      const mount = document.getElementById('date-picker-mount');
      if (!mount) return;
      if (!datePickerOpen) { mount.innerHTML = ''; return; }

      const t = getCurrentTask();
      // Determine which month to show
      let viewYear, viewMonth;
      if (datePickerMonth) {
        viewYear = datePickerMonth.year;
        viewMonth = datePickerMonth.month;
      } else if (t && t.dateValue) {
        const [y, m] = t.dateValue.split('-').map(Number);
        viewYear = y; viewMonth = m - 1;
      } else {
        const now = new Date();
        viewYear = now.getFullYear(); viewMonth = now.getMonth();
      }

      const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
      const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
      const selectedDate = t && t.dateValue ? t.dateValue : null;

      let cells = '';
      // Empty cells before the 1st
      for (let i = 0; i < firstDay; i++) cells += '<div class="cal-day empty"></div>';
      // Day cells
      for (let d = 1; d <= daysInMonth; d++) {
        const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const isSelected = iso === selectedDate;
        cells += `<div class="cal-day${isSelected ? ' selected' : ''}" data-action="pick-date" data-date="${iso}">${d}</div>`;
      }

      mount.innerHTML = `
        <div class="date-picker">
          <div class="cal-month-nav">
            <div class="cal-nav-btn" data-action="cal-prev-month"><div class="arrow back cal"></div></div>
            <div class="cal-month-name">${months[viewMonth]} ${viewYear}</div>
            <div class="cal-nav-btn" data-action="cal-next-month"><div class="arrow cal"></div></div>
          </div>
          <div class="cal-weekdays">
            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
          </div>
          <div class="cal-grid">${cells}</div>
        </div>
      `;
    }

    function toggleDatePicker() {
      datePickerOpen = !datePickerOpen;
      datePickerMonth = null;
      document.getElementById('task-date-trigger')?.classList.toggle('open', datePickerOpen);
      renderDatePicker();
    }

    // does a full renderTaskDetail so the trigger label updates to the new date
    function pickDate(iso) {
      captureTaskEdits(false);
      const t = getCurrentTask();
      if (t) t.dateValue = iso;
      datePickerOpen = false;
      renderTaskDetail(); // full re-render so the trigger label updates
    }

    // re-renders the picker (the trigger doesn't change)
    function calShiftMonth(delta) {
      const t = getCurrentTask();
      // Establish current view month
      let y, m;
      if (datePickerMonth) {
        y = datePickerMonth.year; m = datePickerMonth.month;
      } else if (t && t.dateValue) {
        const [yy, mm] = t.dateValue.split('-').map(Number);
        y = yy; m = mm - 1;
      } else {
        const now = new Date(); y = now.getFullYear(); m = now.getMonth();
      }
      m += delta;
      if (m < 0) { m = 11; y--; }
      if (m > 11) { m = 0; y++; }
      datePickerMonth = { year: y, month: m };
      renderDatePicker();
    }

    function getAllAreaNames() {
      const names = [];
      state.levels.forEach(level => {
        level.rooms.forEach(room => {
          if (!names.includes(room.name)) names.push(room.name);
        });
      });
      return names;
    }

    function renderTaskLinkedProjects(t) {
      return renderLinkingSection({
        ownerId: t.id,
        kind: 'projects',
        title: 'Linked projects',
        sectionKey: 'task-projects-' + t.id,
        getLinked: () => getTaskProjects(t.id).map(id => {
          const p = state.projects.find(x => x.id === id);
          return { key: id, label: p ? p.title : '(deleted)' };
        }),
        getAll:    () => state.projects.map(p => ({ key: p.id, label: p.title })),
        toggle:    (projectId) => toggleTaskProject(t.id, projectId),
        navigate:  (projectId) => { openProject(projectId); },
      });
    }

    function renderTaskLinkedSpaces(t) {
      return renderLinkingSection({
        ownerId: t.id,
        kind: 'spaces',
        title: 'Linked spaces',
        sectionKey: 'task-spaces-' + t.id,
        getLinked: () => getTaskAreas(t.id).map(name => ({ key: name, label: name })),
        getAll:    () => getAllSpaceNames().map(name => ({ key: name, label: name })),
        toggle:    (spaceName) => toggleTaskArea(t.id, spaceName),
        navigate:  (spaceName) => { openSpace(spaceName); },
      });
    }

    function getDismissLabel() {
      const s = getCurrentTask();  // in suggestion mode this returns the suggestion
      if (s && s.recurrence && s.recurrence !== 'none') {
        return 'Skip this time';
      }
      return 'Dismiss';
    }

    function addSuggestion() {
      const s = state.suggestions.find(x => x.id === state.currentSuggestionId);
      if (!s) return;

      // Read any edits the user made in the form before adding
      const title = document.getElementById('task-title-editable')?.textContent.trim() || s.title;
      const notes = document.getElementById('task-notes')?.value.trim() || s.desc;
      const recurrence = document.querySelector('#task-recur-row .picker-chip.selected')?.dataset.recur || s.recurrence;

      if (!title) {
        document.getElementById('task-title-editable')?.focus();
        return;
      }

      // Convert suggestion → real task
      state.tasks.unshift({
        id: uid('t'),
        title,
        dateValue: s.dateValue,
        projects: s.projects ? [...s.projects] : [],
        recurrence,
        notes,
        status: 'upcoming',
        areas: s.areas ? [...s.areas] : [],
      });

      // Remove from suggestions
      state.suggestions = state.suggestions.filter(x => x.id !== s.id);
      state.currentSuggestionId = null;
      state.taskDetailMode = 'edit';
      goBack();
      renderCalendar();
    }

    function dismissSuggestion() {
      const s = state.suggestions.find(x => x.id === state.currentSuggestionId);
      if (!s) return;
      // In V1, both "skip" and "dismiss" remove it from state.
      // (V2 would persist skip-vs-permanent differently.)
      state.suggestions = state.suggestions.filter(x => x.id !== s.id);
      state.currentSuggestionId = null;
      state.taskDetailMode = 'edit';
      goBack();
      renderCalendar();
    }

    function escAttr(s) { return (s || '').replace(/"/g, '&quot;'); }
    function escHtml(s) { return (s || '').replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c])); }

    function captureTaskEdits(allowPrune = true) {
      if (state.taskDetailMode === 'suggestion') return;
      const t = getCurrentTask();
      if (!t) return;
      const titleEl = document.getElementById('task-title-editable');
      const title = titleEl ? titleEl.textContent.trim() : t.title;

      // Only prune empty drafts when exiting (not during in-screen re-renders)
      if (allowPrune && t._draft && !title) {
        state.tasks = state.tasks.filter(x => x.id !== t.id);
        return;
      }

      t.title = title;
      const notesEl = document.getElementById('task-notes');
      if (notesEl) t.notes = notesEl.value.trim();
      t.recurrence = document.querySelector('#task-recur-row .picker-chip.selected')?.dataset.recur || t.recurrence;
      // Don't delete _draft flag during in-screen captures; only on exit
      if (allowPrune) delete t._draft;
    }

    function askDeleteTask() {
      openPicker({
        kind: 'confirm-delete-task',
        title: content.confirm_delete_task_title,
        sub:   content.confirm_delete_task_sub,
        renderFooter: (footer) => {
          footer.innerHTML = `
            <button class="action-row destructive" data-action="confirm-delete-task">${content.delete_btn}</button>
            <div class="foot-picker" data-action="close-picker">${content.cancel}</div>
          `;
        },
      });
    }

    function confirmDeleteTask() {
      state.tasks = state.tasks.filter(t => t.id !== state.currentTaskId);
      state.currentTaskId = null;
      closePicker();
      goBack();
      renderCalendar();
    }

    // If a draft task is abandoned (user clicks back without saving), drop it.
    function pruneDraftTasks() {
      state.tasks = state.tasks.filter(t => !t._draft);
    }

    function pruneDraftProjects() {
      state.projects = state.projects.filter(p => !p._draft);
    }


/* ============================================================
   GLOBAL EVENT DELEGATION / LISTENERS / HANDLERS
   ============================================================ */
    document.addEventListener('click', (ev) => {
      const t = ev.target;
      let el;

    // Close any open link popover when tapping outside it
      if (openLinkFieldId) {
        const insidePopover = t.closest('.link-field[data-link-field="' + openLinkFieldId + '"]');
        if (!insidePopover) {
          closeLinkPopover();
          // don't return — let the tap also do whatever else it was going to do
        }
      }

    // -- URL link component - shared by all sections
      if ((el = t.closest('[data-action="open-link-popover"]'))) { openLinkPopover(el.dataset.fieldId); return; }
      if ((el = t.closest('[data-action="link-open"]'))) {
        const inp = document.getElementById('link-input-' + el.dataset.fieldId);
        const u = inp ? inp.value.trim() : '';
        if (u) window.open(u.startsWith('http') ? u : 'https://' + u, '_blank', 'noopener');
        return;
      }
      if ((el = t.closest('[data-action="link-copy"]'))) {
        const inp = document.getElementById('link-input-' + el.dataset.fieldId);
        if (inp && inp.value.trim()) {
          navigator.clipboard?.writeText(inp.value.trim());
          showToast('Copied to clipboard');
        }
        return;
      }
      if ((el = t.closest('[data-action="link-delete"]'))) {
        const fid = el.dataset.fieldId;
        if (linkFieldCallbacks[fid]) linkFieldCallbacks[fid]('');  // save empty = remove
        openLinkFieldId = null;
        rerenderCurrentDetailScreen();
        return;
      }  

    // -- Tag components - shared by all sections
      if ((el = t.closest('[data-action="toggle-linking-section"]'))) { toggleLinkingSection(el.dataset.sectionKey); return; }
      if ((el = t.closest('[data-action="toggle-linked-item"]')))     { toggleLinkedItem(el.dataset.sectionKey, el.dataset.itemKey); return; }
      if ((el = t.closest('[data-action="navigate-linked-item"]')))   { navigateLinkedItem(el.dataset.sectionKey, el.dataset.itemKey); return; }

    // ── Picker close (tap outside sheet, or tap explicit close trigger) ──
      if (t.closest('[data-action="close-picker"]')) { closePicker(); return; }
      if (t.id === 'picker-modal' || t === document.getElementById('picker-modal')) {
        closePicker(); return;
      }

    // ── Sign-in modal ──
      if (t === document.getElementById('signin-modal')) { closeSignIn(); return; }
      if (t.closest('#signin-submit-btn')) { doSignIn();    return; }
      if (t.closest('#signin-cancel-btn')) { closeSignIn(); return; }

    // ── OB-4 actions ──
      if (t.closest('[data-action="add-level"]')) { openLevelPicker(); return; }
      if ((el = t.closest('[data-action="add-room"]'))) {
        openRoomPicker(el.dataset.levelId); return;
      }
      if ((el = t.closest('[data-action="remove-level"]'))) {
        ev.stopPropagation();
        removeLevel(el.dataset.levelId); return;
      }
      if ((el = t.closest('.room-chip.placed'))) {
        openRoomActions(el.dataset.roomId, el.dataset.levelId); return;
      }
      if (t.closest('[data-action="confirm-remove-level"]')) {
        const lvlId = t.closest('[data-action="confirm-remove-level"]').dataset.levelId;
        state.levels = state.levels.filter(l => l.id !== lvlId);
        closePicker(); renderOb4Levels(); return;
      }
      if (t.closest('[data-action="confirm-rename-room"]')) {
        const btn   = t.closest('[data-action="confirm-rename-room"]');
        const input = document.getElementById('rename-input');
        const v = (input?.value || '').trim();
        if (v) {
          const level = state.levels.find(l => l.id === btn.dataset.levelId);
          const room  = level?.rooms.find(r => r.id === btn.dataset.roomId);
          if (room) {
            const oldName = room.name;
            room.name = v;
            renameRoomEverywhere(oldName, v);
          }
        }
        closePicker(); renderOb4Levels(); return;
      }

    // ── Sign-in modal in OB-1 ──
      if (t.closest('#ob-back-btn')) { obGoBack(); return; }
      if (t.closest('#ob-next-btn')) { obNext();   return; }
      if ((el = t.closest('#ob-secondary-link'))) {
        const action = el.dataset.action;
        if      (action === 'open-signin') openSignIn();
        else if (action === 'ob-skip')     navigateOB(currentObStep + 1);
        else if (action === 'finish-ob')   finishOnboarding();
        return;
      }

    // ── Project list / filter ──
      if ((el = t.closest('#projects-filter-row .filter-chip'))) {
        state.projectFilter = el.dataset.filter;
        renderProjects();
        return;
      }
      if ((el = t.closest('[data-action="open-project"]'))) {
        openProject(el.dataset.projectId); return;
      }
      if (t.closest('[data-action="new-project"]')) { createBlankProject(); return; }

      // ── Project detail ──
      if (t.closest('[data-action="toggle-project-edit"]'))  { toggleProjectEdit(); return; }
      if ((el = t.closest('[data-action="toggle-step"]')))   { toggleStep(el.dataset.stepId); return; }
      if ((el = t.closest('[data-action="toggle-material"]'))) { toggleMaterial(el.dataset.materialId); return; }
      if (t.closest('[data-action="bump-to-planned"]'))      { bumpToPlanned(); return; }
      if ((el = t.closest('[data-action="set-status"]')))    { setProjectStatus(el.dataset.status); return; }
      if (t.closest('[data-action="add-step"]'))             { addStep(); return; }
      if ((el = t.closest('[data-action="remove-step"]')))   { removeStep(el.dataset.stepId); return; }
      if (t.closest('[data-action="add-material"]'))         { addMaterial(); return; }
      if ((el = t.closest('[data-action="remove-material"]'))) { removeMaterial(el.dataset.materialId); return; }
      if (t.closest('[data-action="add-ref"]'))              { addRef(); return; }
      if ((el = t.closest('[data-action="remove-ref"]')))    { removeRef(el.dataset.refId); return; }
      if (t.closest('[data-action="edit-project-image"]')) { openProjectImagePicker(); return; }
      if (t.closest('[data-action="ask-delete-project"]'))   { askDeleteProject(); return; }
      if (t.closest('[data-action="confirm-delete-project"]')){ confirmDeleteProject(); return; }
      if ((el = t.closest('[data-action="open-space-from-tag"]'))) {
        openSpaceFromTag(el.dataset.tagName); return;
      }

    // ── Spaces ──
      if ((el = t.closest('[data-action="open-space"]'))) { openSpace(el.dataset.roomName); return; }
      if (t.closest('[data-action="add-level-from-spaces"]')) {
        openLevelPicker();
        const observer = new MutationObserver(() => {
          if (!document.getElementById('picker-modal').classList.contains('open')) {
            observer.disconnect();
            renderSpaces();
          }
        });
        observer.observe(document.getElementById('picker-modal'), { attributes: true, attributeFilter: ['class'] });
        return;
      }
      if (t.closest('[data-action="add-level-from-spaces"]')) { openLevelPicker(); renderSpaces(); return; }
      if ((el = t.closest('[data-action="add-area-to-level"]'))) {
        addAreaToLevelFromSpaces(el.dataset.levelId); return;
      }
      if (t.closest('[data-action="toggle-space-edit"]'))    { toggleSpaceEdit(); return; }
      if (t.closest('[data-action="add-measurement-blank"]')) { addMeasurementBlank(); return; }
      if ((el = t.closest('[data-action="add-measurement-preset"]'))) { addMeasurementPreset(el.dataset.label); return; }
      if ((el = t.closest('[data-action="remove-measurement"]'))) { removeMeasurement(el.dataset.measId); return; }
      if (t.closest('[data-action="add-space-note"]'))       { addSpaceNote(); return; }
      if ((el = t.closest('[data-action="remove-space-note"]'))) { removeSpaceNote(el.dataset.noteId); return; }
      if (t.closest('[data-action="ask-delete-area"]'))     { askDeleteArea(); return; }
      if (t.closest('[data-action="confirm-delete-area"]')) { confirmDeleteArea(); return; }

    // ── Calendar ──
      if ((el = t.closest('#cal-filter-row .filter-chip'))) {
        state.calendarFilter = el.dataset.calFilter;
        renderCalendar();
        return;
      }
      if ((el = t.closest('[data-action="toggle-task-done"]'))) {
        toggleTaskDone(el.dataset.taskId);
        return;
      }
      if (t.closest('[data-action="new-task"]'))             { openNewTask(); return; }
      if ((el = t.closest('[data-action="open-task"]')))     { openTask(el.dataset.taskId); return; }
      if (t.closest('[data-action="ask-delete-task"]'))      { askDeleteTask(); return; }
      if (t.closest('[data-action="confirm-delete-task"]'))  { confirmDeleteTask(); return; }
      if ((el = t.closest('[data-action="open-suggestion"]'))) { openSuggestion(el.dataset.suggId); return; }
      if (t.closest('[data-action="add-suggestion"]'))         { addSuggestion(); return; }
      if (t.closest('[data-action="dismiss-suggestion"]'))     { dismissSuggestion(); return; }
      if (t.closest('[data-action="toggle-date-picker"]')) { toggleDatePicker(); return; }
      if ((el = t.closest('[data-action="pick-date"]')))     { pickDate(el.dataset.date); return; }
      if (t.closest('[data-action="cal-prev-month"]'))       { calShiftMonth(-1); return; }
      if (t.closest('[data-action="cal-next-month"]'))       { calShiftMonth(1); return; }

    // ── Generic radio cards (still used in OB) ──
      if ((el = t.closest('[data-radio-group]')))            { selectRadio(el, el.dataset.radioGroup); return; }
      if ((el = t.closest('#screen-ob-5 .check-card')))      { toggleCheckCard(el); return; }
      if ((el = t.closest('#screen-ob-6 .focus-card')))      { toggleFocusCard(el); return; }

    // ── Generic navigation (data-navigate / data-go-back) ──
      if ((el = t.closest('[data-navigate]'))) {
        if (currentScreen === 'screen-task-detail') captureTaskEdits();
        if (currentScreen === 'screen-project-detail') captureProjectEdits();
        if (currentScreen === 'screen-space-detail') captureSpaceEdits();
        openLinkSectionKey = null;
        openLinkFieldId = null;
        pruneDraftProjects();
        navigate(el.dataset.navigate);
        return;
      }
      if (t.closest('[data-go-back]')) {
        if (currentScreen === 'screen-task-detail') captureTaskEdits();
        if (currentScreen === 'screen-project-detail') captureProjectEdits();
        if (currentScreen === 'screen-space-detail') captureSpaceEdits();
        openLinkSectionKey = null;
        openLinkFieldId = null;
        pruneDraftProjects();
        goBack();
        return;
      }
    });


/* ============================================================
   SIGN-IN MODAL
   ============================================================ */
    function openSignIn() {
      const modal = document.getElementById('signin-modal');
      if (modal) modal.classList.add('open');
    }

    function closeSignIn() {
      const modal = document.getElementById('signin-modal');
      if (modal) modal.classList.remove('open');
    }

    function doSignIn() {
      closeSignIn();
      finishOnboarding();
    }


/* ============================================================
   CONTENTEDITABLE — capture on blur listener
   ============================================================ */
    document.addEventListener('blur', (ev) => {
      if (ev.target.matches('#screen-project-detail [data-edit-field]')) {
        captureProjectEdits();
      }
      if (ev.target.matches('#screen-space-detail [data-edit-field]')) {
        captureSpaceEdits();
      }
      if (ev.target.matches('#screen-task-detail #task-title-editable')) {
        captureTaskEdits(false);
      }
    }, true);

    // Enter to commit on contenteditable (no newlines in single-line fields)
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' && ev.target.classList.contains('link-popover-input')) {
        ev.preventDefault();
        closeLinkPopover();
        return;
      }
      if (ev.key === 'Enter' && ev.target.isContentEditable) {
        ev.preventDefault();
        ev.target.blur();
      }
    });

    document.addEventListener('change', (ev) => {
      if (ev.target.matches('#screen-space-detail [data-edit-field]')) {
        captureSpaceEdits();
      }
    });

    document.addEventListener('input', (ev) => {
      if (ev.target.matches('.measurement-value-input')) {
        // Allow digits and one decimal point
        const cleaned = ev.target.value.replace(/[^0-9.]/g, '');
        // Collapse multiple dots to one
        const parts = cleaned.split('.');
        ev.target.value = parts.length > 2
          ? parts[0] + '.' + parts.slice(1).join('')
          : cleaned;
      }
    });
    // turn on icons when link has some content - proeject details link popup
    document.addEventListener('input', (ev) => {
      if (ev.target.classList.contains('link-popover-input')) {
        const pop = ev.target.closest('.link-popover');
        if (pop) pop.classList.toggle('has-content', ev.target.value.trim().length > 0);
      }
    });


/* ============================================================
   BOOT
   ============================================================ */
    (function boot() {
      // Replace seed levels with a clean slate? No — keep them as the seed for the
      // already-onboarded user shown on dashboard. OB-4 starts with the same seed
      // so user sees existing example levels and can edit them.

      initOB();

      // Live validation for OB-2 inputs
      ['ob2-name', 'ob2-location'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('input', () => {
          if (currentObStep === 2) checkObStepReady(2);
        });
      });

      // Numeric-only enforcement on the zip field
      const locationInput = document.getElementById('ob2-location');
      if (locationInput) {
        locationInput.addEventListener('keypress', (e) => {
          if (!/[0-9]/.test(e.key)) {
            e.preventDefault();
            document.getElementById('ob2-location-error').classList.remove('is-hidden');
          }
        });
        locationInput.addEventListener('input', function() {
          this.value = this.value.replace(/\D/g, '');
          const errorEl = document.getElementById('ob2-location-error');
          const hasError = this.value.length > 0 && !/^\d+$/.test(this.value);
          errorEl.classList.toggle('is-hidden', !hasError);
          if (currentObStep === 2) checkObStepReady(2);
        });
      }

      // Initial OB-4 render
      renderOb4Levels();
    })();
