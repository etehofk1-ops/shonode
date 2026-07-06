(function initShonodeOctoWorkbench() {
  const api = window.ShonodeOctoState;
  if (!api) return;

  const railButtons = document.querySelector("#leftSidebarRail .sidebar-rail-buttons");
  const sidebarContent = document.querySelector("#projectSidebar .sidebar-content");
  const mobileDrawer = document.getElementById("mobileDrawer");
  const appShell = document.querySelector(".app-shell");

  function iconSvg() {
    return [
      '<svg viewBox="0 0 24 24" aria-hidden="true">',
      '<path d="M5 5.75A1.75 1.75 0 0 1 6.75 4h10.5A1.75 1.75 0 0 1 19 5.75v12.5A1.75 1.75 0 0 1 17.25 20H6.75A1.75 1.75 0 0 1 5 18.25Z"></path>',
      '<path d="M8 8h8M8 11.5h5M8 15h8"></path>',
      '<path d="M16.5 3.5v4"></path>',
      "</svg>"
    ].join("");
  }

  function injectShell() {
    if (railButtons && !document.querySelector('[data-sidebar-target="story-workbench"]')) {
      const button = document.createElement("button");
      button.className = "sidebar-rail-button story-workbench-rail";
      button.type = "button";
      button.dataset.sidebarSide = "left";
      button.dataset.sidebarTarget = "story-workbench";
      button.dataset.sidebarLabel = "Story Workbench";
      button.setAttribute("aria-label", "Story Workbench panel open");
      button.title = "Story Workbench";
      button.innerHTML = `${iconSvg()}<span class="sr-only">Story Workbench</span>`;
      railButtons.prepend(button);
    }

    if (mobileDrawer && appShell && mobileDrawer.parentElement !== appShell) {
      appShell.appendChild(mobileDrawer);
    }

    if (mobileDrawer && !document.getElementById("mobileStoryWorkbenchButton")) {
      const groups = Array.from(mobileDrawer.querySelectorAll(".mobile-drawer-group"));
      const targetGroup = groups[groups.length - 1];
      const button = document.createElement("button");
      button.id = "mobileStoryWorkbenchButton";
      button.className = "mobile-drawer-item";
      button.type = "button";
      button.setAttribute("aria-label", "Story Workbench");
      button.innerHTML = `${iconSvg()}Story Workbench`;
      targetGroup?.insertBefore(button, document.getElementById("mobileOnboardingButton"));
    }

    if (sidebarContent && !document.getElementById("storyWorkbenchSection")) {
      const section = document.createElement("section");
      section.id = "storyWorkbenchSection";
      section.className = "sidebar-card story-workbench-section";
      section.dataset.sidebarSection = "story-workbench";
      section.hidden = true;
      section.innerHTML = workbenchTemplate();
      sidebarContent.insertBefore(section, sidebarContent.firstElementChild?.nextSibling || sidebarContent.firstChild);
    }
  }

  function workbenchTemplate() {
    return [
      '<div class="sidebar-card-header story-workbench-header">',
      '<p class="sidebar-eyebrow">Story Workbench</p>',
      '<h2>Octo-style structure</h2>',
      '<p class="story-workbench-lede">Build the story bible, reusable entities, scenes, and generation prompts before sending the sequence to the canvas.</p>',
      "</div>",
      '<div class="story-workbench-status" data-workbench-status>Saved locally</div>',
      '<div class="story-workbench-tabs" role="tablist" aria-label="Story Workbench sections">',
      '<button class="story-workbench-tab is-active" type="button" data-tab="story">Story</button>',
      '<button class="story-workbench-tab" type="button" data-tab="entities">Entities</button>',
      '<button class="story-workbench-tab" type="button" data-tab="scenes">Scenes</button>',
      '<button class="story-workbench-tab" type="button" data-tab="handoff">Handoff</button>',
      "</div>",
      '<div class="story-workbench-pane is-active" data-pane="story"></div>',
      '<div class="story-workbench-pane" data-pane="entities" hidden></div>',
      '<div class="story-workbench-pane" data-pane="scenes" hidden></div>',
      '<div class="story-workbench-pane" data-pane="handoff" hidden></div>'
    ].join("");
  }

  let state = api.loadState();
  let bridgePatched = false;

  function setStatus(text) {
    const el = document.querySelector("[data-workbench-status]");
    if (el) el.textContent = text;
  }

  function commit(nextState, message) {
    state = api.saveState(nextState);
    render();
    setStatus(message || `Saved ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
  }

  function field(label, key, value, options = {}) {
    const placeholder = escapeAttr(options.placeholder || "");
    const escapedKey = escapeAttr(key);
    if (options.multiline) {
      return [
        '<label class="story-workbench-field">',
        `<span>${label}</span>`,
        `<textarea rows="${options.rows || 4}" data-story-field="${escapedKey}" placeholder="${placeholder}">${escapeHtml(value)}</textarea>`,
        "</label>"
      ].join("");
    }
    return [
      '<label class="story-workbench-field">',
      `<span>${label}</span>`,
      `<input type="text" data-story-field="${escapedKey}" value="${escapeAttr(value)}" placeholder="${placeholder}">`,
      "</label>"
    ].join("");
  }

  function renderStory() {
    return [
      '<div class="story-workbench-actions">',
      '<button class="secondary-button" type="button" data-action="pull-board">Build from board</button>',
      '<button class="primary-button" type="button" data-action="push-board">Create canvas scenes</button>',
      "</div>",
      field("Title", "title", state.story.title),
      field("Logline", "logline", state.story.logline, { multiline: true, rows: 3 }),
      field("Structure", "structure", state.story.structure),
      field("Synopsis", "synopsis", state.story.synopsis, { multiline: true, rows: 5 }),
      field("Visual style", "visualStyle", state.story.visualStyle, { multiline: true, rows: 3 })
    ].join("");
  }

  function entityRow(entity) {
    const options = api.ENTITY_TYPES.map((type) =>
      `<option value="${type}" ${entity.type === type ? "selected" : ""}>${type}</option>`
    ).join("");
    return [
      `<article class="story-workbench-item" data-entity-id="${entity.id}">`,
      '<div class="story-workbench-item-top">',
      `<select data-entity-field="type">${options}</select>`,
      `<input type="text" data-entity-field="name" value="${escapeAttr(entity.name)}" placeholder="Name">`,
      `<button class="ghost-button" type="button" data-action="remove-entity">Remove</button>`,
      "</div>",
      `<input type="text" data-entity-field="tag" value="${escapeAttr(entity.tag)}" placeholder="@Tag">`,
      `<textarea data-entity-field="description" rows="3" placeholder="Appearance, role, material, or world rule">${escapeHtml(entity.description)}</textarea>`,
      `<textarea data-entity-field="arc" rows="2" placeholder="Arc or continuity note">${escapeHtml(entity.arc)}</textarea>`,
      "</article>"
    ].join("");
  }

  function renderEntities() {
    return [
      '<div class="story-workbench-actions">',
      '<button class="primary-button" type="button" data-action="add-entity">Add entity</button>',
      "</div>",
      '<div class="story-workbench-item-list">',
      state.entities.map(entityRow).join(""),
      "</div>"
    ].join("");
  }

  function keyframeRow(scene, keyframe, index) {
    return [
      `<div class="story-workbench-keyframe" data-keyframe-id="${keyframe.id}">`,
      `<input type="text" data-keyframe-field="label" value="${escapeAttr(keyframe.label)}" placeholder="Keyframe ${index + 1}">`,
      `<button class="ghost-button" type="button" data-action="remove-keyframe">Remove</button>`,
      `<textarea data-keyframe-field="prompt" rows="3" placeholder="Generation prompt">${escapeHtml(keyframe.prompt)}</textarea>`,
      "</div>"
    ].join("");
  }

  function sceneRow(scene, index) {
    return [
      `<article class="story-workbench-item story-workbench-scene" data-scene-id="${scene.id}">`,
      '<div class="story-workbench-item-top">',
      `<span class="story-workbench-scene-number">Scene ${String(index + 1).padStart(2, "0")}</span>`,
      `<button class="ghost-button" type="button" data-action="remove-scene">Remove</button>`,
      "</div>",
      `<input type="text" data-scene-field="title" value="${escapeAttr(scene.title)}" placeholder="Scene title">`,
      `<input type="text" data-scene-field="setting" value="${escapeAttr(scene.setting)}" placeholder="INT/EXT | Location | Time">`,
      `<input type="text" data-scene-field="duration" value="${escapeAttr(scene.duration)}" placeholder="3s">`,
      `<textarea data-scene-field="description" rows="3" placeholder="Scene description">${escapeHtml(scene.description)}</textarea>`,
      `<textarea data-scene-field="beat" rows="2" placeholder="Motion, emotional beat, or transition role">${escapeHtml(scene.beat)}</textarea>`,
      '<div class="story-workbench-keyframes">',
      scene.keyframes.map((keyframe, keyframeIndex) => keyframeRow(scene, keyframe, keyframeIndex)).join(""),
      "</div>",
      '<button class="secondary-button story-workbench-add-keyframe" type="button" data-action="add-keyframe">Add keyframe</button>',
      "</article>"
    ].join("");
  }

  function renderScenes() {
    return [
      '<div class="story-workbench-actions">',
      '<button class="primary-button" type="button" data-action="add-scene">Add scene</button>',
      '<button class="secondary-button" type="button" data-action="push-board">Create canvas scenes</button>',
      "</div>",
      '<div class="story-workbench-item-list">',
      state.scenes.map(sceneRow).join(""),
      "</div>"
    ].join("");
  }

  function renderHandoff() {
    return [
      '<div class="story-workbench-actions">',
      '<button class="secondary-button" type="button" data-action="copy-brief">Copy brief</button>',
      '<button class="primary-button" type="button" data-action="push-board">Create canvas scenes</button>',
      "</div>",
      `<textarea class="story-workbench-brief" rows="18" readonly>${escapeHtml(api.buildBrief(state))}</textarea>`
    ].join("");
  }

  function render() {
    const section = document.getElementById("storyWorkbenchSection");
    if (!section) return;
    section.querySelector('[data-pane="story"]').innerHTML = renderStory();
    section.querySelector('[data-pane="entities"]').innerHTML = renderEntities();
    section.querySelector('[data-pane="scenes"]').innerHTML = renderScenes();
    section.querySelector('[data-pane="handoff"]').innerHTML = renderHandoff();
  }

  function bindEvents() {
    const section = document.getElementById("storyWorkbenchSection");
    if (!section) return;
    section.addEventListener("click", handleClick);
    section.addEventListener("input", handleInput);
    section.addEventListener("change", handleInput);
    document.addEventListener("click", handleStartWorkflowClick);
    document.querySelector(".story-workbench-rail")?.addEventListener("click", openWorkbenchPanel);
    document.getElementById("mobileStoryWorkbenchButton")?.addEventListener("click", () => {
      if (typeof window.closeMobileDrawer === "function") {
        window.closeMobileDrawer();
      } else if (mobileDrawer) {
        mobileDrawer.hidden = true;
      }
      openWorkbenchPanel();
    });
  }

  function openWorkbenchPanel() {
    openSidebarSection("left", "story-workbench");
  }

  function openSidebarSection(side, target) {
    const isLeft = side === "left";
    const sidebar = document.getElementById(isLeft ? "projectSidebar" : "previewSidebar");
    const rail = document.getElementById(isLeft ? "leftSidebarRail" : "rightSidebarRail");
    const section = sidebar?.querySelector(`[data-sidebar-section="${target}"]`);
    if (!sidebar || !section) return false;

    sidebar.querySelectorAll("[data-sidebar-section]").forEach((sidebarSection) => {
      const isActive = sidebarSection === section;
      sidebarSection.hidden = !isActive;
      sidebarSection.classList.toggle("is-active", isActive);
    });

    sidebar.classList.add("is-open");
    sidebar.dataset.activeSections = target;
    sidebar.setAttribute("aria-hidden", "false");
    rail?.classList.remove("is-collapsed");
    rail?.classList.add("is-panel-open");
    rail?.setAttribute("data-collapsed", "false");
    rail?.setAttribute("data-panel-open", "true");
    document.querySelector(".workspace-main")?.classList.add("has-active-panel");
    document.querySelectorAll(`.sidebar-rail-button[data-sidebar-side="${side}"]`).forEach((button) => {
      const isActive = button.dataset.sidebarTarget === target;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    const eyebrow = document.getElementById(isLeft ? "projectSidebarPanelEyebrow" : "previewSidebarPanelEyebrow");
    const title = document.getElementById(isLeft ? "projectSidebarPanelTitle" : "previewSidebarPanelTitle");
    if (eyebrow) eyebrow.textContent = section.querySelector(".sidebar-eyebrow")?.textContent?.trim() || (isLeft ? "Project" : "Preview");
    if (title) title.textContent = section.querySelector("h2")?.textContent?.trim() || target;
    return true;
  }

  function handleStartWorkflowClick(event) {
    const trigger = event.target.closest?.("[data-start-workflow]");
    if (!trigger) return;
    const flow = trigger.dataset.startWorkflow;
    document.querySelectorAll("[data-start-workflow]").forEach((button) => {
      button.classList.toggle("is-primary", button === trigger);
    });

    if (flow === "canvas") {
      window.ShonodeWorkspaceBridge?.closePanels?.({ announce: false });
      document.querySelector(".workspace-main")?.scrollIntoView({ block: "start", behavior: "smooth" });
      setStatus("Canvas focused");
      return;
    }

    const targetMap = {
      story: ["left", "story-workbench"],
      ai: ["left", "ai"],
      review: ["right", "output"]
    };
    const [side, target] = targetMap[flow] || [];
    if (!side || !target) return;

    openSidebarSection(side, target);
    if (flow === "story") switchTab("story");
    setStatus(flow === "review" ? "Review panel opened" : "Workflow panel opened");
  }

  function handleClick(event) {
    const tab = event.target.closest("[data-tab]");
    if (tab) return switchTab(tab.dataset.tab);
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (!action) return;
    if (action === "add-entity") addEntity();
    if (action === "remove-entity") removeEntity(event.target.closest("[data-entity-id]")?.dataset.entityId);
    if (action === "add-scene") addScene();
    if (action === "remove-scene") removeScene(event.target.closest("[data-scene-id]")?.dataset.sceneId);
    if (action === "add-keyframe") addKeyframe(event.target.closest("[data-scene-id]")?.dataset.sceneId);
    if (action === "remove-keyframe") removeKeyframe(event.target.closest("[data-scene-id]")?.dataset.sceneId, event.target.closest("[data-keyframe-id]")?.dataset.keyframeId);
    if (action === "copy-brief") copyBrief();
    if (action === "pull-board") pullBoard();
    if (action === "push-board") pushBoard();
  }

  function handleInput(event) {
    const target = event.target;
    const next = api.normalizeState(state);
    if (target.dataset.storyField) next.story[target.dataset.storyField] = target.value;
    const entity = next.entities.find((item) => item.id === target.closest("[data-entity-id]")?.dataset.entityId);
    if (entity && target.dataset.entityField) entity[target.dataset.entityField] = target.value;
    const scene = next.scenes.find((item) => item.id === target.closest("[data-scene-id]")?.dataset.sceneId);
    if (scene && target.dataset.sceneField) scene[target.dataset.sceneField] = target.value;
    const keyframe = scene?.keyframes.find((item) => item.id === target.closest("[data-keyframe-id]")?.dataset.keyframeId);
    if (keyframe && target.dataset.keyframeField) keyframe[target.dataset.keyframeField] = target.value;
    state = api.saveState(next);
    setStatus("Saved locally");
    updateHandoffPane();
  }

  function switchTab(tabId) {
    document.querySelectorAll(".story-workbench-tab").forEach((button) => button.classList.toggle("is-active", button.dataset.tab === tabId));
    document.querySelectorAll(".story-workbench-pane").forEach((pane) => {
      const active = pane.dataset.pane === tabId;
      pane.hidden = !active;
      pane.classList.toggle("is-active", active);
    });
  }

  function updateHandoffPane() {
    const brief = document.querySelector(".story-workbench-brief");
    if (brief) brief.value = api.buildBrief(state);
  }

  function addEntity() {
    const next = api.normalizeState(state);
    next.entities.push({ type: "character", name: "New Entity", tag: "@NewEntity", description: "", arc: "" });
    commit(next, "Entity added");
  }

  function removeEntity(id) {
    const next = api.normalizeState(state);
    next.entities = next.entities.filter((entity) => entity.id !== id);
    commit(next, "Entity removed");
  }

  function addScene() {
    const next = api.normalizeState(state);
    next.scenes.push({ title: "New Scene", setting: "", duration: "3s", description: "", beat: "", keyframes: [{ prompt: "" }] });
    commit(next, "Scene added");
  }

  function removeScene(id) {
    const next = api.normalizeState(state);
    next.scenes = next.scenes.filter((scene) => scene.id !== id);
    commit(next, "Scene removed");
  }

  function addKeyframe(sceneId) {
    const next = api.normalizeState(state);
    next.scenes.find((scene) => scene.id === sceneId)?.keyframes.push({ label: "Keyframe", prompt: "" });
    commit(next, "Keyframe added");
  }

  function removeKeyframe(sceneId, keyframeId) {
    const next = api.normalizeState(state);
    const scene = next.scenes.find((item) => item.id === sceneId);
    if (scene) scene.keyframes = scene.keyframes.filter((frame) => frame.id !== keyframeId);
    commit(next, "Keyframe removed");
  }

  async function copyBrief() {
    const text = api.buildBrief(state);
    try {
      await navigator.clipboard.writeText(text);
      setStatus("Brief copied");
    } catch {
      window.prompt("Copy this brief", text);
    }
  }

  function getSnapshot() {
    const snapshot = window.ShonodeWorkspaceBridge?.createSnapshot?.();
    if (!snapshot) setStatus("Board bridge is still loading");
    return snapshot || null;
  }

  function pullBoard() {
    const snapshot = getSnapshot();
    if (!snapshot) return;
    state = api.buildStateFromSnapshot(snapshot, state);
    render();
    setStatus("Built from current board");
  }

  async function pushBoard() {
    const currentSnapshot = getSnapshot();
    if (!currentSnapshot || !window.ShonodeWorkspaceBridge?.importWorkspace) return;
    const snapshot = api.buildPanelsFromState(state, currentSnapshot);
    await window.ShonodeWorkspaceBridge.importWorkspace(snapshot);
    setStatus("Canvas scenes created");
  }

  function patchBridge() {
    const bridge = window.ShonodeWorkspaceBridge;
    if (!bridge || bridgePatched) return Boolean(bridge);
    bridgePatched = true;
    const originalCreate = bridge.createSnapshot?.bind(bridge);
    const originalImport = bridge.importWorkspace?.bind(bridge);
    bridge.createSnapshot = () => ({ ...(originalCreate?.() || {}), storyWorkbench: api.normalizeState(state) });
    bridge.importWorkspace = async (snapshot) => {
      const result = await originalImport?.(snapshot);
      if (snapshot?.storyWorkbench) {
        state = api.saveState(snapshot.storyWorkbench);
        render();
      }
      return result;
    };
    bridge.exportWorkspace = async () => {
      const snapshot = bridge.createSnapshot();
      const title = snapshot.project?.title || "shonode-story-workbench";
      const safeTitle = title.replace(/[\\/:*?"<>|]/g, " ").replace(/\s+/g, " ").trim() || "shonode-story-workbench";
      const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/x-shonode+json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${safeTitle}-${new Date().toISOString().slice(0, 10)}.shonode`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 500);
      setStatus("Workspace exported with Story Workbench");
    };
    return true;
  }

  function waitForBridge() {
    if (patchBridge()) return;
    window.setTimeout(waitForBridge, 80);
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
  }

  injectShell();
  render();
  bindEvents();
  waitForBridge();
})();
