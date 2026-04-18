(function enhanceShotBoard() {
  const LEFT_SIDEBAR_SECTION_STORAGE_KEY = "shotboard-left-sidebar-sections-v3";
  const RIGHT_SIDEBAR_SECTION_STORAGE_KEY = "shotboard-right-sidebar-sections-v3";
  const LEFT_RAIL_COLLAPSED_STORAGE_KEY = "shotboard-left-rail-collapsed-v1";
  const RIGHT_RAIL_COLLAPSED_STORAGE_KEY = "shotboard-right-rail-collapsed-v1";
  const AI_REFERENCE_IMAGES_STORAGE_KEY = "shotboard-ai-reference-images-v1";
  const AI_REFERENCE_DB_NAME = "shotboard-ai-reference-db-v1";
  const AI_REFERENCE_DB_STORE_NAME = "reference-images";
  const AI_REFERENCE_DB_RECORD_KEY = "active-project";
  const WORKSPACE_LIBRARY_STORAGE_KEY = "shonode-workspace-library-v1";
  const ACTIVE_WORKSPACE_STORAGE_KEY = "shonode-active-workspace-v1";
  const WORKSPACE_LIBRARY_DB_NAME = "shonode-workspace-library-db-v1";
  const WORKSPACE_LIBRARY_DB_STORE_NAME = "workspace-snapshots";
  const AI_REFERENCE_IMAGE_LIMIT = 10;
  const IDENTITY_ENTITY_TYPES = ["character", "product", "prop", "space"];
  const IDENTITY_COMPONENT_TYPES = ["base", "outfit", "accessory", "expression", "pose", "material"];

  const aiBriefInputEl = document.getElementById("aiBriefInput");
  const aiModelInputEl = document.getElementById("aiModelInput");
  const aiCutCountOutputEl = document.getElementById("aiCutCountOutput");
  const aiPlanMetaEl = document.getElementById("aiPlanMeta");
  const aiGenerationIndicatorEl = document.getElementById("aiGenerationIndicator");
  const aiGenerationStageEl = document.getElementById("aiGenerationStage");
  const aiGenerationHintEl = document.getElementById("aiGenerationHint");
  const aiReferenceDropzoneEl = document.getElementById("aiReferenceDropzone");
  const aiReferenceInputEl = document.getElementById("aiReferenceInput");
  const aiReferenceInlineGridEl = document.getElementById("aiReferenceInlineGrid");
  const aiReferenceListEl = document.getElementById("aiReferenceList");
  const aiReferenceCountEl = document.getElementById("aiReferenceCount");
  const createIdentityPackButtonEl = document.getElementById("createIdentityPackButton");
  const identityPackListEl = document.getElementById("identityPackList");
  const referenceLightboxEl = document.getElementById("referenceLightbox");
  const referenceLightboxBackdropEl = document.getElementById("referenceLightboxBackdrop");
  const referenceLightboxCloseEl = document.getElementById("referenceLightboxClose");
  const referenceLightboxImageEl = document.getElementById("referenceLightboxImage");
  const referenceLightboxMetaEl = document.getElementById("referenceLightboxMeta");
  const referenceLightboxTitleEl = document.getElementById("referenceLightboxTitle");
  const aiReferenceWeightInputEl = document.getElementById("aiReferenceWeightInput");
  const aiSummaryOutputEl = document.getElementById("aiSummaryOutput");
  const aiSequenceOutputEl = document.getElementById("aiSequenceOutput");
  const selectionDetailOutputEl = document.getElementById("selectionDetailOutput");
  const pipelinePromptLabEl = document.getElementById("pipelinePromptLab");
  const pipelineTargetMetaEl = document.getElementById("pipelineTargetMeta");
  const pipelineSubjectInputEl = document.getElementById("pipelineSubjectInput");
  const pipelineLookInputEl = document.getElementById("pipelineLookInput");
  const pipelineGoalInputEl = document.getElementById("pipelineGoalInput");
  const pipelineIdeationModeInputEl = document.getElementById("pipelineIdeationModeInput");
  const pipelineVideoModeInputEl = document.getElementById("pipelineVideoModeInput");
  const pipelineTemplateInputEl = document.getElementById("pipelineTemplateInput");
  const pipelineDurationInputEl = document.getElementById("pipelineDurationInput");
  const pipelineTemplateSummaryEl = document.getElementById("pipelineTemplateSummary");
  const pipelineGuidedSheetOutputEl = document.getElementById("pipelineGuidedSheetOutput");
  const pipelineGuidedBeatOutputEl = document.getElementById("pipelineGuidedBeatOutput");
  const pipelineStep4ModeLabelEl = document.getElementById("pipelineStep4ModeLabel");
  const pipelineStep5ModeLabelEl = document.getElementById("pipelineStep5ModeLabel");
  const pipelineStep3ModeLabelEl = document.getElementById("pipelineStep3ModeLabel");
  const pipelineStep1OutputEl = document.getElementById("pipelineStep1Output");
  const pipelineStep2OutputEl = document.getElementById("pipelineStep2Output");
  const pipelineStep3OutputEl = document.getElementById("pipelineStep3Output");
  const pipelineStep4OutputEl = document.getElementById("pipelineStep4Output");
  const pipelineStep5OutputEl = document.getElementById("pipelineStep5Output");
  const generatePlanButtonEl = document.getElementById("generatePlanButton");
  const generatePlanButtonLabelEl = document.getElementById("generatePlanButtonLabel");
  const regenerateSelectionButtonEl = document.getElementById("regenerateSelectionButton");
  const importWorkspaceInputEl = document.getElementById("importWorkspaceInput");
  const exportWorkspaceButtonEl = document.getElementById("exportWorkspaceButton");
  const workspaceMainEl = document.querySelector(".workspace-main");
  const workspaceStageEl = document.querySelector(".workspace-stage");
  const workspaceOverlayEl = document.getElementById("workspaceOverlay");
  const leftRailEl = document.getElementById("leftSidebarRail");
  const rightRailEl = document.getElementById("rightSidebarRail");
  const leftRailToggleButtonEl = document.getElementById("leftRailToggleButton");
  const rightRailToggleButtonEl = document.getElementById("rightRailToggleButton");
  const closeProjectSidebarButtonEl = document.getElementById("closeProjectSidebarButton");
  const closePreviewSidebarButtonEl = document.getElementById("closePreviewSidebarButton");
  const projectSidebarPanelEyebrowEl = document.getElementById("projectSidebarPanelEyebrow");
  const projectSidebarPanelTitleEl = document.getElementById("projectSidebarPanelTitle");
  const previewSidebarPanelEyebrowEl = document.getElementById("previewSidebarPanelEyebrow");
  const previewSidebarPanelTitleEl = document.getElementById("previewSidebarPanelTitle");
  const projectSidebarEl = document.getElementById("projectSidebar");
  const previewSidebarEl = document.getElementById("previewSidebar");
  const leftRailButtons = Array.from(document.querySelectorAll('.sidebar-rail-button[data-sidebar-side="left"]'));
  const rightRailButtons = Array.from(document.querySelectorAll('.sidebar-rail-button[data-sidebar-side="right"]'));
  const togglePreviewButtonEl = document.getElementById("togglePreviewButton");
  const togglePreviewLabelEl = document.getElementById("togglePreviewLabel");
  const previewVideoUrlInputEl = document.getElementById("previewVideoUrlInput");
  const previewPosterUrlInputEl = document.getElementById("previewPosterUrlInput");
  const createWorkspaceButtonEl = document.getElementById("createWorkspaceButton");
  const duplicateWorkspaceButtonEl = document.getElementById("duplicateWorkspaceButton");
  const workspaceLibraryMetaEl = document.getElementById("workspaceLibraryMeta");
  const workspaceLibraryListEl = document.getElementById("workspaceLibraryList");
  const previewVideoEl = document.getElementById("previewVideo");
  const previewVideoEmptyEl = document.getElementById("previewVideoEmpty");
  const connectionLayerEl = document.getElementById("connectionLayer");
  const openOnboardingButtonEl = document.getElementById("openOnboardingButton");
  const mobileOnboardingButtonEl = document.getElementById("mobileOnboardingButton");
  const onboardingDialogEl = document.getElementById("onboardingDialog");
  const onboardingDialogPanelEl = document.getElementById("onboardingDialogPanel");
  const onboardingDialogBackdropEl = document.getElementById("onboardingDialogBackdrop");
  const onboardingDialogCloseEl = document.getElementById("onboardingDialogClose");
  const onboardingDismissButtonEl = document.getElementById("onboardingDismissButton");
  const onboardingStartButtonEl = document.getElementById("onboardingStartButton");
  const aiSidebarCardEl = projectSidebarEl?.querySelector('[data-sidebar-section="ai"]');
  const leftSidebarSections = Array.from(projectSidebarEl?.querySelectorAll("[data-sidebar-section]") ?? []);
  const rightSidebarSections = Array.from(previewSidebarEl?.querySelectorAll("[data-sidebar-section]") ?? []);

  if (!aiBriefInputEl || !projectSidebarEl || !previewSidebarEl || !connectionLayerEl) {
    return;
  }

  const originalGetDefaultProject = getDefaultProject;
  const originalNormalizeProject = normalizeProject;
  const originalCloneProject = cloneProject;
  const originalCreateEmptyPanel = createEmptyPanel;
  const originalNormalizePanel = normalizePanel;
  const originalRenderProjectSidebar = renderProjectSidebar;
  const originalCreatePanelElement = createPanelElement;
  const originalRenderPanels = renderPanels;
  const originalUpdateCanvasMetrics = updateCanvasMetrics;
  const originalUpdatePanel = updatePanel;
  const originalCreateHistorySnapshot = createHistorySnapshot;
  const originalRestoreHistorySnapshot = restoreHistorySnapshot;
  const originalPersistProject = persistProject;
  const originalPersistPanels = persistPanels;
  const originalPersistViewState = persistViewState;
  const originalSyncSelectionUI = syncSelectionUI;

  let aiGenerating = false;
  let aiGenerationStageIndex = 0;
  let aiGenerationIntervalId = null;
  let aiReferenceImages = loadAiReferenceImages();
  let aiReferenceStoragePromise = null;
  let linkState = null;
  let activeLeftSidebarSections = loadSidebarSections("left");
  let activeRightSidebarSections = loadSidebarSections("right");
  let leftRailCollapsed = loadRailCollapsed("left");
  let rightRailCollapsed = loadRailCollapsed("right");
  let draggedReferenceImageId = "";
  let workspaceLibraryItems = loadWorkspaceLibraryItems();
  let activeWorkspaceId = loadActiveWorkspaceId() || "";
  let workspaceLibraryInitialized = false;
  let workspaceLibrarySyncTimeoutId = null;
  let workspaceLibrarySyncPromise = Promise.resolve();
  let workspaceImportInFlight = false;
  let onboardingLastActiveElement = null;
  let latestGuidedTemplateBlueprint = null;

  getDefaultProject = function overrideDefaultProject() {
    return {
      ...originalGetDefaultProject(),
      aiBrief: "",
      aiModel: "Gemini 2.5 Flash",
      referenceWeight: "2.0",
      aiSummary: "",
      previewVideoUrl: "",
      previewPosterUrl: "",
      pipelineSubject: "",
      pipelineLook: "",
      pipelineGoal: "",
      pipelineIdeationMode: "i2t",
      pipelineVideoMode: "start-end",
      pipelineTemplateId: getDefaultPipelineTemplateId(),
      pipelineDurationSec: 15,
      identityPacks: []
    };
  };

  normalizeProject = function overrideNormalizeProject(candidate) {
    const base = originalNormalizeProject(candidate);
    return {
      ...base,
      aiBrief: typeof candidate?.aiBrief === "string" ? candidate.aiBrief : "",
      aiModel: typeof candidate?.aiModel === "string" && candidate.aiModel ? candidate.aiModel : "Gemini 2.5 Flash",
      referenceWeight: sanitizeReferenceWeight(candidate?.referenceWeight),
      aiSummary: typeof candidate?.aiSummary === "string" ? candidate.aiSummary : "",
      previewVideoUrl: typeof candidate?.previewVideoUrl === "string" ? candidate.previewVideoUrl : "",
      previewPosterUrl: typeof candidate?.previewPosterUrl === "string" ? candidate.previewPosterUrl : "",
      pipelineSubject: typeof candidate?.pipelineSubject === "string" ? candidate.pipelineSubject : "",
      pipelineLook: typeof candidate?.pipelineLook === "string" ? candidate.pipelineLook : "",
      pipelineGoal: typeof candidate?.pipelineGoal === "string" ? candidate.pipelineGoal : "",
      pipelineIdeationMode: sanitizePipelineIdeationMode(candidate?.pipelineIdeationMode),
      pipelineVideoMode: sanitizePipelineVideoMode(candidate?.pipelineVideoMode),
      pipelineTemplateId: sanitizePipelineTemplateId(candidate?.pipelineTemplateId),
      pipelineDurationSec: sanitizePipelineDurationSec(candidate?.pipelineDurationSec),
      identityPacks: normalizeIdentityPacks(candidate?.identityPacks)
    };
  };

  cloneProject = function overrideCloneProject(projectValue = project) {
    return {
      ...originalCloneProject(projectValue),
      aiBrief: projectValue.aiBrief ?? "",
      aiModel: projectValue.aiModel ?? "Gemini 2.5 Flash",
      referenceWeight: sanitizeReferenceWeight(projectValue.referenceWeight),
      aiSummary: projectValue.aiSummary ?? "",
      previewVideoUrl: projectValue.previewVideoUrl ?? "",
      previewPosterUrl: projectValue.previewPosterUrl ?? "",
      pipelineSubject: projectValue.pipelineSubject ?? "",
      pipelineLook: projectValue.pipelineLook ?? "",
      pipelineGoal: projectValue.pipelineGoal ?? "",
      pipelineIdeationMode: sanitizePipelineIdeationMode(projectValue.pipelineIdeationMode),
      pipelineVideoMode: sanitizePipelineVideoMode(projectValue.pipelineVideoMode),
      pipelineTemplateId: sanitizePipelineTemplateId(projectValue.pipelineTemplateId),
      pipelineDurationSec: sanitizePipelineDurationSec(projectValue.pipelineDurationSec),
      identityPacks: normalizeIdentityPacks(projectValue.identityPacks).map((pack) => ({
        ...pack,
        referenceImageIds: [...pack.referenceImageIds]
      }))
    };
  };

  createEmptyPanel = function overrideCreateEmptyPanel(overrides = {}) {
    return originalCreateEmptyPanel({
      sceneTitle: "",
      durationLabel: "",
      viewMode: "image",
      imagePromptMode: "i2i",
      t2iCollapsed: false,
      i2vCollapsed: false,
      referenceImageIds: [],
      referenceImageNames: [],
      referenceImageId: "",
      referenceImageName: "",
      t2iPrompt: "",
      i2vStartPrompt: "",
      i2vMotionPrompt: "",
      i2vEndPrompt: "",
      i2vOmniPrompt: "",
      identityPackIds: [],
      nextPanelIds: [],
      videoFileName: "",
      ...overrides
    });
  };

  normalizePanel = function overrideNormalizePanel(panel, index) {
    const base = originalNormalizePanel(panel, index);
    const referenceImageIds = normalizeReferenceImageIds(panel?.referenceImageIds, panel?.referenceImageId);
    const referenceImageNames = normalizeReferenceImageNames(panel?.referenceImageNames, panel?.referenceImageName);
    const imagePromptMode = panel?.imagePromptMode === "i2i" || panel?.imagePromptMode === "t2i"
      ? panel.imagePromptMode
      : referenceImageIds.length > 0
        ? "i2i"
        : typeof panel?.t2iPrompt === "string" && panel.t2iPrompt.trim()
          ? "t2i"
          : "i2i";

    return {
      ...base,
      sceneTitle: typeof panel?.sceneTitle === "string" ? panel.sceneTitle : "",
      durationLabel: typeof panel?.durationLabel === "string" ? panel.durationLabel : "",
      viewMode: ["image", "t2i", "i2v", "vid"].includes(panel?.viewMode)
        ? panel.viewMode
        : panel?.viewMode === "i2t"
          ? "t2i"
          : "image",
      t2iCollapsed: Boolean(panel?.t2iCollapsed),
      i2vCollapsed: Boolean(panel?.i2vCollapsed),
      imagePromptMode,
      referenceImageIds,
      referenceImageNames,
      identityPackIds: normalizeIdentityPackIds(panel?.identityPackIds),
      referenceImageId: referenceImageIds[0] || "",
      referenceImageName: referenceImageNames[0] || "",
      t2iPrompt: typeof panel?.t2iPrompt === "string" ? panel.t2iPrompt : "",
      i2vStartPrompt: typeof panel?.i2vStartPrompt === "string" ? panel.i2vStartPrompt : "",
      i2vMotionPrompt: typeof panel?.i2vMotionPrompt === "string" ? panel.i2vMotionPrompt : "",
      i2vEndPrompt: typeof panel?.i2vEndPrompt === "string" ? panel.i2vEndPrompt : "",
      i2vOmniPrompt: typeof panel?.i2vOmniPrompt === "string" ? panel.i2vOmniPrompt : "",
      nextPanelIds: Array.isArray(panel?.nextPanelIds) ? panel.nextPanelIds.filter((value) => typeof value === "string") : [],
      videoFileName: typeof panel?.videoFileName === "string" ? panel.videoFileName : ""
    };
  };

  createHistorySnapshot = function overrideCreateHistorySnapshot() {
    return {
      ...originalCreateHistorySnapshot(),
      aiReferenceImages: aiReferenceImages.map((image) => ({ ...image }))
    };
  };

  restoreHistorySnapshot = function overrideRestoreHistorySnapshot(snapshot) {
    aiReferenceImages = Array.isArray(snapshot?.aiReferenceImages)
      ? snapshot.aiReferenceImages.filter((image) => typeof image?.dataUrl === "string").slice(0, AI_REFERENCE_IMAGE_LIMIT)
      : [];

    originalRestoreHistorySnapshot(snapshot);
    persistAiReferenceImages();
    renderAiReferenceImages();
  };

  renderProjectSidebar = function overrideRenderProjectSidebar() {
    originalRenderProjectSidebar();
    aiBriefInputEl.value = project.aiBrief ?? "";
    aiModelInputEl.value = project.aiModel ?? "Gemini 2.5 Flash";
    if (aiReferenceWeightInputEl) {
      aiReferenceWeightInputEl.value = sanitizeReferenceWeight(project.referenceWeight);
    }
    if (pipelineSubjectInputEl) {
      pipelineSubjectInputEl.value = project.pipelineSubject ?? "";
    }
    if (pipelineLookInputEl) {
      pipelineLookInputEl.value = project.pipelineLook ?? "";
    }
    if (pipelineGoalInputEl) {
      pipelineGoalInputEl.value = project.pipelineGoal ?? "";
    }
    if (pipelineIdeationModeInputEl) {
      pipelineIdeationModeInputEl.value = sanitizePipelineIdeationMode(project.pipelineIdeationMode);
    }
    if (pipelineVideoModeInputEl) {
      pipelineVideoModeInputEl.value = sanitizePipelineVideoMode(project.pipelineVideoMode);
    }
    renderGuidedTemplateControls(buildPipelineContext());
    renderWorkspaceLibrary();
    renderAiReferenceImages();
    renderIdentityPackList();
    renderAiOutputs();
    renderPreviewSidebar();
  };

  persistProject = function overridePersistProject(...args) {
    const didPersist = originalPersistProject(...args);
    if (didPersist) {
      scheduleWorkspaceLibrarySync();
    }
    return didPersist;
  };

  persistPanels = function overridePersistPanels(...args) {
    const didPersist = originalPersistPanels(...args);
    if (didPersist) {
      scheduleWorkspaceLibrarySync();
    }
    return didPersist;
  };

  persistViewState = function overridePersistViewState(...args) {
    originalPersistViewState(...args);
    scheduleWorkspaceLibrarySync();
  };

  syncSelectionUI = function overrideSyncSelectionUI(...args) {
    originalSyncSelectionUI(...args);
    renderSelectionDetail();
    renderPromptPipeline();
  };

  updatePanel = function overrideUpdatePanel(panelId, updates, options = {}) {
    originalUpdatePanel(panelId, updates, options);
    if (options.rerender === false) {
      renderAiOutputs();
      renderSelectionDetail();
    }
  };

  duplicatePanels = function overrideDuplicatePanels(panelIds) {
    const ids = panelIds.filter(Boolean);
    if (ids.length === 0) {
      return;
    }

    const sourcePanels = panels.filter((panel) => ids.includes(panel.id));
    if (sourcePanels.length === 0) {
      return;
    }

    pushHistoryState();
    const zBase = getNextZIndex();
    const idMap = new Map(sourcePanels.map((panel) => [panel.id, createId()]));
    const baseLength = panels.length;
    const clones = sourcePanels.map((panel, index) =>
      normalizePanel(
        {
          ...panel,
          id: idMap.get(panel.id),
          x: panel.x + NEW_PANEL_OFFSET,
          y: panel.y + NEW_PANEL_OFFSET,
          z: zBase + index,
          nextPanelIds: (panel.nextPanelIds ?? []).map((nextId) => idMap.get(nextId)).filter(Boolean),
          videoFileName: ""
        },
        baseLength + index
      )
    );

    panels = [...panels, ...clones];
    setSelection(clones.map((panel) => panel.id));
    persistPanels();
    updateHistoryUI();
    renderPanels();
    focusPanel(clones[0].id);
    setStatus(clones.length > 1 ? "선택한 카드를 복제했습니다." : "카드를 복제했습니다.");
  };

  deletePanels = function overrideDeletePanels(panelIds) {
    const ids = panelIds.filter(Boolean);
    if (ids.length === 0) {
      return;
    }

    const deleteSet = new Set(ids);
    if (linkState && (deleteSet.has(linkState.sourceId) || deleteSet.has(linkState.targetId))) {
      cleanupLinkDrag(false);
    }

    // Revoke video blob URLs and purge from IDB
    ids.forEach((id) => {
      const url = panelVideoBlobUrls.get(id);
      if (url) {
        URL.revokeObjectURL(url);
        panelVideoBlobUrls.delete(id);
        deletePanelVideoFromIndexedDb(id);
      }
    });

    pushHistoryState();
    const nextPanels = panels
      .filter((panel) => !deleteSet.has(panel.id))
      .map((panel, index) =>
        normalizePanel(
          {
            ...panel,
            nextPanelIds: (panel.nextPanelIds ?? []).filter((nextId) => !deleteSet.has(nextId))
          },
          index
        )
      );

    panels = nextPanels.length > 0 ? nextPanels : [createEmptyPanel({ ...getSpawnPosition(), z: 1 })];
    selectedPanelIds.clear();
    persistPanels();
    updateHistoryUI();
    renderPanels();
    setStatus(ids.length > 1 ? "선택한 카드를 삭제했습니다." : "카드를 삭제했습니다.");
  };

  createPanelElement = function overrideCreatePanelElement(panel, index) {
    const fragment = originalCreatePanelElement(panel, index);
    const card = fragment.querySelector(".story-card");
    const sceneLabelEl = fragment.querySelector(".panel-scene-label");
    const titleEl = fragment.querySelector(".panel-title");
    const durationEl = fragment.querySelector(".panel-duration");
    const nextCountEl = fragment.querySelector(".panel-next-count");
    const viewButtons = fragment.querySelectorAll(".media-view-button");
    const mediaPanels = fragment.querySelectorAll(".media-panel");
    const vidUploadArea = fragment.querySelector(".vid-upload-area");
    const vidFileInput = fragment.querySelector(".vid-file-input");
    const vidPreviewWrap = fragment.querySelector(".vid-preview-wrap");
    const vidPreview = fragment.querySelector(".vid-preview");
    const vidNameEl = fragment.querySelector(".vid-name");
    const vidClearButton = fragment.querySelector(".vid-clear-button");
    const t2iInput = fragment.querySelector(".t2i-prompt-input");
    const i2vStartInput = fragment.querySelector(".i2v-start-input");
    const i2vMotionInput = fragment.querySelector(".i2v-motion-input");
    const i2vEndInput = fragment.querySelector(".i2v-end-input");
    const i2vOmniInput = fragment.querySelector(".i2v-omni-input");
    const i2vSplitFields = fragment.querySelectorAll(".i2v-split-field");
    const i2vOmniField = fragment.querySelector(".i2v-omni-field");
    const t2iTitleEl = fragment.querySelector("[data-prompt-title]") || fragment.querySelector(".prompt-panel-title");
    const t2iTitleTextEl = fragment.querySelector('[data-prompt-title-kind="t2i"]');
    const i2iTitleTextEl = fragment.querySelector('[data-prompt-title-kind="i2i"]');
    const t2iViewLabelEl = fragment.querySelector('[data-view-label="t2i"]');
    const referenceBookmarkListEl = fragment.querySelector(".reference-bookmark-list");
    const identityPackChipListEl = fragment.querySelector("[data-identity-pack-chip-list]");
    const referenceBookmarkEl = fragment.querySelector(".reference-bookmark");
    const referenceBookmarkThumbEl = fragment.querySelector(".reference-bookmark-thumb");
    const referenceBookmarkNameEl = fragment.querySelector(".reference-bookmark-name");
    const inputPort = fragment.querySelector(".node-port--in");
    const outputPort = fragment.querySelector(".node-port--out");
    const clearLinksButton = fragment.querySelector(".clear-links-button");
    const promptToggleButtons = fragment.querySelectorAll(".prompt-toggle-button");
    const promptPanels = fragment.querySelectorAll(".prompt-panel");

    sceneLabelEl.textContent = `씬 ${String(index + 1).padStart(2, "0")}`;
    titleEl.textContent = panel.sceneTitle || `컷 ${index + 1}`;
    durationEl.textContent = panel.durationLabel || "";
    durationEl.hidden = !panel.durationLabel;
    nextCountEl.textContent = String(panel.nextPanelIds.length);
    t2iInput.value = panel.t2iPrompt;
    i2vStartInput.value = panel.i2vStartPrompt;
    i2vMotionInput.value = panel.i2vMotionPrompt;
    i2vEndInput.value = panel.i2vEndPrompt;
    if (i2vOmniInput) {
      i2vOmniInput.value = panel.i2vOmniPrompt || "";
    }
    const useOmniPrompt = sanitizePipelineVideoMode(project.pipelineVideoMode) === "omni";
    i2vSplitFields.forEach((field) => {
      field.hidden = useOmniPrompt;
    });
    if (i2vOmniField) {
      i2vOmniField.hidden = !useOmniPrompt;
    }
    if (t2iTitleTextEl && i2iTitleTextEl) {
      const isI2I = getPromptMode(panel) === "i2i";
      t2iTitleTextEl.hidden = isI2I;
      i2iTitleTextEl.hidden = !isI2I;
    } else if (t2iTitleEl) {
      t2iTitleEl.textContent = getPromptDisplayTitle(panel);
    }
    if (t2iViewLabelEl) {
      t2iViewLabelEl.textContent = getPromptDisplayLabel(panel);
    }
    syncMediaView(panel, viewButtons, mediaPanels);
    syncPromptPanels(panel, promptPanels);
    card.classList.toggle("is-link-source", linkState?.sourceId === panel.id);
    card.classList.toggle("is-link-target", linkState?.targetId === panel.id);

    const referenceImages = getPanelReferenceImages(panel);
    const identityPacks = getPanelIdentityPacks(panel);
    renderIdentityPackChipList(identityPackChipListEl, identityPacks);
    if (referenceBookmarkListEl) {
      referenceBookmarkListEl.innerHTML = "";
      referenceBookmarkListEl.hidden = referenceImages.length === 0;

      referenceImages.forEach((referenceItem, referenceIndex) => {
        const bookmarkEl = document.createElement("button");
        bookmarkEl.className = "reference-bookmark";
        bookmarkEl.type = "button";
        bookmarkEl.innerHTML = `
          <div class="reference-bookmark-thumb-wrap">
            <img class="reference-bookmark-thumb" alt="">
          </div>
          <div class="reference-bookmark-copy">
            <span class="reference-bookmark-label">Reference ${referenceIndex + 1}</span>
            <strong class="reference-bookmark-name"></strong>
          </div>
        `;

        const bookmarkThumbEl = bookmarkEl.querySelector(".reference-bookmark-thumb");
        const bookmarkNameEl = bookmarkEl.querySelector(".reference-bookmark-name");
        bookmarkNameEl.textContent = referenceItem.name || `reference-${referenceIndex + 1}`;

        if (referenceItem.image?.dataUrl && bookmarkThumbEl) {
          bookmarkEl.classList.add("is-clickable");
          bookmarkThumbEl.hidden = false;
          bookmarkThumbEl.src = referenceItem.image.dataUrl;
          bookmarkThumbEl.alt = `${titleEl.textContent} reference ${referenceIndex + 1}`;
          bookmarkEl.setAttribute("aria-label", `${titleEl.textContent} 레퍼런스 ${referenceIndex + 1} 확대 보기`);
          bookmarkEl.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            openReferenceLightbox(referenceItem.image, referenceItem.image.name || titleEl.textContent);
          });
        } else {
          bookmarkEl.classList.add("is-placeholder");
          bookmarkEl.disabled = true;
          if (bookmarkThumbEl) {
            bookmarkThumbEl.hidden = true;
            bookmarkThumbEl.removeAttribute("src");
            bookmarkThumbEl.alt = "";
          }
        }

        referenceBookmarkListEl.appendChild(bookmarkEl);
      });
    } else if (referenceBookmarkEl && referenceBookmarkNameEl) {
      const primaryReference = referenceImages[0];
      const referenceImage = primaryReference?.image || null;
      referenceBookmarkEl.classList.remove("is-clickable");
      referenceBookmarkEl.removeAttribute("role");
      referenceBookmarkEl.removeAttribute("tabindex");
      referenceBookmarkEl.removeAttribute("aria-label");
      if (referenceImage) {
        referenceBookmarkEl.hidden = false;
        referenceBookmarkEl.classList.add("is-clickable");
        referenceBookmarkEl.setAttribute("role", "button");
        referenceBookmarkEl.setAttribute("tabindex", "0");
        referenceBookmarkEl.setAttribute("aria-label", `${titleEl.textContent} 첨부 이미지 확대 보기`);
        referenceBookmarkNameEl.textContent = referenceImage.name || panel.referenceImageName || "연결된 레퍼런스";
        if (referenceBookmarkThumbEl) {
          referenceBookmarkThumbEl.hidden = false;
          referenceBookmarkThumbEl.src = referenceImage.dataUrl;
          referenceBookmarkThumbEl.alt = `${titleEl.textContent} 첨부 이미지`;
        }
        const openBookmarkPreview = (event) => {
          event.preventDefault();
          event.stopPropagation();
          openReferenceLightbox(referenceImage, referenceImage.name || titleEl.textContent);
        };
        referenceBookmarkEl.addEventListener("click", openBookmarkPreview);
        referenceBookmarkEl.addEventListener("keydown", (event) => {
          if (event.key !== "Enter" && event.key !== " ") {
            return;
          }
          openBookmarkPreview(event);
        });
      } else if (primaryReference?.name) {
        referenceBookmarkEl.hidden = false;
        referenceBookmarkNameEl.textContent = primaryReference.name;
        if (referenceBookmarkThumbEl) {
          referenceBookmarkThumbEl.hidden = true;
          referenceBookmarkThumbEl.removeAttribute("src");
          referenceBookmarkThumbEl.alt = "";
        }
      } else {
        referenceBookmarkEl.hidden = true;
        if (referenceBookmarkThumbEl) {
          referenceBookmarkThumbEl.hidden = true;
          referenceBookmarkThumbEl.removeAttribute("src");
          referenceBookmarkThumbEl.alt = "";
        }
      }
    }

    if (inputPort) {
      inputPort.dataset.panelId = panel.id;
      inputPort.classList.toggle("is-active", linkState?.targetId === panel.id);
      inputPort.setAttribute("aria-label", `${titleEl.textContent}로 연결 받기`);
      inputPort.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        event.stopPropagation();
      });
    }

    if (outputPort) {
      outputPort.dataset.panelId = panel.id;
      outputPort.classList.toggle("is-active", linkState?.sourceId === panel.id);
      outputPort.setAttribute("aria-label", `${titleEl.textContent}에서 다음 컷 연결 시작`);
      outputPort.addEventListener("pointerdown", (event) => {
        if (spacePressed || event.button !== 0) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        startLinkDrag(event, panel.id);
      });
    }

    if (clearLinksButton) {
      clearLinksButton.hidden = panel.nextPanelIds.length === 0;
      clearLinksButton.addEventListener("click", () => {
        clearPanelConnections(panel.id);
      });
    }

    promptToggleButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const kind = button.dataset.promptKind;
        const fieldName = getPromptCollapsedField(kind);
        const promptLabel = kind === "t2i" ? getPromptDisplayLabel(panel) : kind.toUpperCase();
        if (!fieldName) {
          return;
        }

        updatePanel(panel.id, { [fieldName]: !panel[fieldName] }, { announce: false });
        setStatus(`${titleEl.textContent} ${promptLabel} 패널을 ${panel[fieldName] ? "펼쳤습니다" : "접었습니다"}.`);
      });
    });

    viewButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (panel.viewMode === button.dataset.view) {
          return;
        }

        pushHistoryState();
        updatePanel(panel.id, { viewMode: button.dataset.view }, { announce: false });
        setStatus(`${titleEl.textContent} 보기 모드를 전환했습니다.`);
      });
    });

    bindPanelPromptInput(t2iInput, panel.id, "t2iPrompt", `panel-t2i:${panel.id}`);
    bindPanelPromptInput(i2vStartInput, panel.id, "i2vStartPrompt", `panel-i2v-start:${panel.id}`);
    bindPanelPromptInput(i2vMotionInput, panel.id, "i2vMotionPrompt", `panel-i2v-motion:${panel.id}`);
    bindPanelPromptInput(i2vEndInput, panel.id, "i2vEndPrompt", `panel-i2v-end:${panel.id}`);
    bindPanelPromptInput(i2vOmniInput, panel.id, "i2vOmniPrompt", `panel-i2v-omni:${panel.id}`);

    // Vid panel: hydrate state
    const blobUrl = panelVideoBlobUrls.get(panel.id);
    if (blobUrl && vidPreview && vidPreviewWrap && vidUploadArea) {
      vidPreview.src = blobUrl;
      if (vidNameEl) {
        vidNameEl.textContent = panel.videoFileName || "";
      }
      vidPreviewWrap.hidden = false;
      vidUploadArea.hidden = true;
      if (vidClearButton) vidClearButton.hidden = false;
    }

    // Vid file input
    if (vidFileInput) {
      vidFileInput.addEventListener("change", async () => {
        await attachVideoToPanel(panel.id, vidFileInput.files);
        vidFileInput.value = "";
      });
    }

    // Vid upload area click (label handles it) + drag-drop
    if (vidUploadArea) {
      vidUploadArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        vidUploadArea.classList.add("is-dragover");
      });
      vidUploadArea.addEventListener("dragleave", (e) => {
        if (e.currentTarget === e.target) vidUploadArea.classList.remove("is-dragover");
      });
      vidUploadArea.addEventListener("drop", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        vidUploadArea.classList.remove("is-dragover");
        await attachVideoToPanel(panel.id, e.dataTransfer?.files);
      });
    }

    // Vid clear button
    if (vidClearButton) {
      vidClearButton.addEventListener("click", async () => {
        await clearVideoFromPanel(panel.id);
      });
    }

    return fragment;
  };

  renderPanels = function overrideRenderPanels(options = {}) {
    originalRenderPanels(options);
    renderConnections();
    renderAiReferenceImages();
    renderAiOutputs();
    renderSelectionDetail();
  };

  updateCanvasMetrics = function overrideUpdateCanvasMetrics() {
    originalUpdateCanvasMetrics();
    syncConnectionLayer();
    renderConnections();
  };

  bindProjectField(aiBriefInputEl, "aiBrief");
  bindProjectField(aiModelInputEl, "aiModel");
  bindProjectField(aiReferenceWeightInputEl, "referenceWeight");
  bindProjectField(previewVideoUrlInputEl, "previewVideoUrl");
  bindProjectField(previewPosterUrlInputEl, "previewPosterUrl");
  bindProjectField(pipelineSubjectInputEl, "pipelineSubject");
  bindProjectField(pipelineLookInputEl, "pipelineLook");
  bindProjectField(pipelineGoalInputEl, "pipelineGoal");
  bindProjectField(pipelineIdeationModeInputEl, "pipelineIdeationMode");
  bindProjectField(pipelineVideoModeInputEl, "pipelineVideoMode");
  bindProjectField(pipelineTemplateInputEl, "pipelineTemplateId");
  bindProjectField(pipelineDurationInputEl, "pipelineDurationSec");

  generatePlanButtonEl.addEventListener("click", handleGeneratePlan);
  regenerateSelectionButtonEl?.addEventListener("click", handleRegenerateSelectedPanels);
  createIdentityPackButtonEl?.addEventListener("click", handleCreateIdentityPack);
  identityPackListEl?.addEventListener("click", handleIdentityPackListClick);
  identityPackListEl?.addEventListener("change", handleIdentityPackListChange);
  identityPackListEl?.addEventListener("input", handleIdentityPackListInput);
  identityPackListEl?.addEventListener("blur", handleIdentityPackListBlur, true);
  selectionDetailOutputEl?.addEventListener("change", handleSelectionDetailChange);
  importWorkspaceInputEl?.addEventListener("change", handleImportWorkspaceInputChange);
  createWorkspaceButtonEl?.addEventListener("click", handleCreateWorkspace);
  duplicateWorkspaceButtonEl?.addEventListener("click", handleDuplicateWorkspace);
  workspaceLibraryListEl?.addEventListener("click", handleWorkspaceLibraryClick);
  pipelinePromptLabEl?.addEventListener("click", async (event) => {
    const copyButton = event.target.closest("[data-copy-target]");
    if (copyButton) {
      await copyPipelinePrompt(copyButton.dataset.copyTarget, copyButton.dataset.copyLabel);
      return;
    }

    const applyButton = event.target.closest("[data-pipeline-apply]");
    if (applyButton) {
      applyPipelineStepToSelected(applyButton.dataset.pipelineApply);
      return;
    }

    const guidedButton = event.target.closest("[data-guided-apply]");
    if (guidedButton) {
      handleGuidedPipelineAction(guidedButton.dataset.guidedApply);
    }
  });
  togglePreviewButtonEl?.addEventListener("click", () => {
    setSidebarSections("right", activeRightSidebarSections.length > 0 ? [] : ["video"], false);
  });
  window.addEventListener("keydown", handleLinkKeyDown);
  window.addEventListener("keydown", handleOnboardingKeyDown, true);
  openOnboardingButtonEl?.addEventListener("click", () => {
    openOnboardingDialog({ announce: true });
  });
  mobileOnboardingButtonEl?.addEventListener("click", () => {
    if (typeof closeMobileDrawer === "function") {
      closeMobileDrawer();
    }
    openOnboardingDialog({ announce: true });
  });
  onboardingDialogBackdropEl?.addEventListener("click", () => closeOnboardingDialog());
  onboardingDialogCloseEl?.addEventListener("click", () => closeOnboardingDialog());
  onboardingDismissButtonEl?.addEventListener("click", () => closeOnboardingDialog());
  onboardingStartButtonEl?.addEventListener("click", startOnboardingFlow);
  initializeSidebarRails();
  initializeReferenceImages();

  window.ShonodeWorkspaceBridge = {
    ...(window.ShonodeWorkspaceBridge || {}),
    createSnapshot: createWorkspaceExportSnapshot,
    closePanels: closeSidebarPanels,
    closeProjectSidebar: () => closeSidebarSide("left"),
    closePreviewSidebar: () => closeSidebarSide("right"),
    exportWorkspace: handleExportWorkspace,
    importWorkspace: importWorkspaceSnapshot,
    regenerateSelected: handleRegenerateSelectedPanels
  };

  document.body.classList.remove("is-sidebar-collapsed", "is-preview-collapsed");
  project = normalizeProject(project);
  panels = panels.map((panel, index) => normalizePanel(panel, index));
  renderProjectSidebar();
  applySidebarRailState(false);
  syncConnectionLayer();
  renderPanels({ restoreView: true });
  initializeWorkspaceLibrary();
  maybeOpenOnboarding();

  function bindProjectField(element, fieldName) {
    if (!element) {
      return;
    }

    const historyKey = `project:${fieldName}`;
    const handleValueChange = () => {
      captureHistoryGroup(historyKey);
      const nextValue =
        fieldName === "referenceWeight"
          ? sanitizeReferenceWeight(element.value)
          : fieldName === "pipelineIdeationMode"
            ? sanitizePipelineIdeationMode(element.value)
            : fieldName === "pipelineVideoMode"
              ? sanitizePipelineVideoMode(element.value)
              : fieldName === "pipelineTemplateId"
                ? sanitizePipelineTemplateId(element.value)
                : fieldName === "pipelineDurationSec"
                  ? sanitizePipelineDurationSec(element.value)
                  : element.value;
      updateProject({ [fieldName]: nextValue }, { announce: false });
      if (fieldName === "previewVideoUrl" || fieldName === "previewPosterUrl") {
        renderPreviewVideo();
      } else if (fieldName === "pipelineVideoMode") {
        renderAiOutputs();
        renderPanels();
      } else {
        renderAiOutputs();
      }
    };

    element.addEventListener("input", handleValueChange);
    if (element.tagName === "SELECT") {
      element.addEventListener("change", handleValueChange);
    }

    element.addEventListener("blur", () => {
      releaseHistoryGroup(historyKey);
    });
  }

  function handleOnboardingKeyDown(event) {
    if (!isOnboardingOpen()) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeOnboardingDialog();
      return;
    }

    if (event.key === "Tab") {
      trapOnboardingFocus(event);
    }
  }

  function isOnboardingOpen() {
    return Boolean(onboardingDialogEl && !onboardingDialogEl.hidden);
  }

  function hasSeenOnboarding() {
    return window.localStorage.getItem("shonode-onboarding-seen-v1") === "true";
  }

  function markOnboardingSeen() {
    window.localStorage.setItem("shonode-onboarding-seen-v1", "true");
  }

  function hasSavedWorkspaceState() {
    return Boolean(
      window.localStorage.getItem(STORAGE_KEY) ||
      window.localStorage.getItem(PROJECT_STORAGE_KEY) ||
      window.localStorage.getItem(VIEW_STORAGE_KEY)
    );
  }

  function maybeOpenOnboarding() {
    if (!onboardingDialogEl || hasSeenOnboarding() || hasSavedWorkspaceState()) {
      return;
    }

    window.setTimeout(() => {
      openOnboardingDialog({ announce: false, restoreFocus: false });
    }, 360);
  }

  function openOnboardingDialog(options = {}) {
    if (!onboardingDialogEl || !onboardingDialogPanelEl) {
      return;
    }

    if (isOnboardingOpen()) {
      return;
    }

    if (options.restoreFocus !== false) {
      onboardingLastActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    } else {
      onboardingLastActiveElement = null;
    }

    onboardingDialogEl.hidden = false;
    onboardingDialogEl.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-onboarding-open");

    window.setTimeout(() => {
      (onboardingStartButtonEl || onboardingDialogCloseEl || onboardingDialogPanelEl).focus();
    }, 0);

    if (options.announce) {
      setStatus("슈노드 워크플로 가이드를 열었습니다.");
    }
  }

  function closeOnboardingDialog(options = {}) {
    if (!isOnboardingOpen()) {
      return;
    }

    onboardingDialogEl.hidden = true;
    onboardingDialogEl.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-onboarding-open");
    markOnboardingSeen();

    const returnFocusTarget = options.restoreFocus === false ? null : onboardingLastActiveElement;
    onboardingLastActiveElement = null;

    if (returnFocusTarget instanceof HTMLElement) {
      returnFocusTarget.focus();
    }
  }

  function trapOnboardingFocus(event) {
    if (!onboardingDialogPanelEl) {
      return;
    }

    const focusableElements = Array.from(
      onboardingDialogPanelEl.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => element.offsetParent !== null);

    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstFocusable) {
      event.preventDefault();
      lastFocusable.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === lastFocusable) {
      event.preventDefault();
      firstFocusable.focus();
    }
  }

  function startOnboardingFlow() {
    closeOnboardingDialog({ restoreFocus: false });
    setSidebarSections("left", Array.from(new Set([...activeLeftSidebarSections, "ai"])), false);
    applySidebarRailState(false);
    if (typeof closeMobileDrawer === "function") {
      closeMobileDrawer();
    }

    window.setTimeout(() => {
      aiBriefInputEl?.focus();
      aiBriefInputEl?.select?.();
    }, 80);

    setStatus("브리프부터 시작해 장면 목적, 컷 구조, 레퍼런스를 차례대로 정리해보세요.");
  }

  function sanitizePipelineIdeationMode(value) {
    return value === "i2i" ? "i2i" : "i2t";
  }

  function sanitizePipelineVideoMode(value) {
    return value === "omni" ? "omni" : "start-end";
  }
  function getGuidedTemplateEngine() {
    return window.ShonodeGuidedTemplateEngine || null;
  }

  function getDefaultPipelineTemplateId() {
    const engine = getGuidedTemplateEngine();
    return typeof engine?.DEFAULT_TEMPLATE_ID === "string" ? engine.DEFAULT_TEMPLATE_ID : "fashion_editorial";
  }

  function sanitizePipelineTemplateId(value) {
    const engine = getGuidedTemplateEngine();
    return engine && typeof engine.sanitizeTemplateId === "function"
      ? engine.sanitizeTemplateId(value)
      : getDefaultPipelineTemplateId();
  }

  function sanitizePipelineDurationSec(value) {
    const engine = getGuidedTemplateEngine();
    return engine && typeof engine.sanitizeDuration === "function"
      ? engine.sanitizeDuration(value)
      : 15;
  }

  function buildGuidedTemplateBlueprint(context = buildPipelineContext()) {
    const engine = getGuidedTemplateEngine();
    if (!engine || typeof engine.buildBlueprint !== "function") {
      return null;
    }

    return engine.buildBlueprint({
      templateId: sanitizePipelineTemplateId(project.pipelineTemplateId),
      durationSec: sanitizePipelineDurationSec(project.pipelineDurationSec),
      subject: context?.subject || trimPipelineText(project.pipelineSubject),
      goal: context?.goal || trimPipelineText(project.pipelineGoal),
      look: context?.look || trimPipelineText(project.pipelineLook),
      brief: context?.brief || trimPipelineText(project.aiBrief),
      referenceGuide: context?.referenceGuide || "",
      identityPackGuide: context?.identityPackGuide || ""
    });
  }

  function renderGuidedTemplateControls(context = buildPipelineContext(), blueprint = null) {
    const engine = getGuidedTemplateEngine();
    if (!engine) {
      if (pipelineTemplateSummaryEl) {
        pipelineTemplateSummaryEl.textContent = "Guided template engine is not available.";
      }
      return null;
    }

    if (pipelineTemplateInputEl) {
      const options = Array.isArray(engine.TEMPLATE_OPTIONS) ? engine.TEMPLATE_OPTIONS : [];
      if (pipelineTemplateInputEl.options.length !== options.length) {
        pipelineTemplateInputEl.innerHTML = options
          .map((option) => `<option value="${escapeHtml(option.id)}">${escapeHtml(option.label)}</option>`)
          .join("");
      }
      pipelineTemplateInputEl.value = sanitizePipelineTemplateId(project.pipelineTemplateId);
    }

    if (pipelineDurationInputEl) {
      const durations = Array.isArray(engine.DURATION_OPTIONS) ? engine.DURATION_OPTIONS : [15];
      if (pipelineDurationInputEl.options.length !== durations.length) {
        pipelineDurationInputEl.innerHTML = durations
          .map((duration) => `<option value="${duration}">${duration}?</option>`)
          .join("");
      }
      pipelineDurationInputEl.value = String(sanitizePipelineDurationSec(project.pipelineDurationSec));
    }

    const resolvedBlueprint = blueprint || buildGuidedTemplateBlueprint(context);
    if (pipelineTemplateSummaryEl) {
      pipelineTemplateSummaryEl.textContent = resolvedBlueprint
        ? `${resolvedBlueprint.templateSummary} ${resolvedBlueprint.durationSec}? ???? ?? ? ${resolvedBlueprint.sheetPacks.length}?? ?? ${resolvedBlueprint.beats.length}?? ?????.`
        : "???? ??? ?? ??? ?? ??? ?? ??? ????? ?? ? ????.";
    }

    return resolvedBlueprint;
  }

  function renderGuidedTemplateLab(context = buildPipelineContext()) {
    const blueprint = renderGuidedTemplateControls(context, buildGuidedTemplateBlueprint(context));
    latestGuidedTemplateBlueprint = blueprint;
    if (pipelineGuidedSheetOutputEl) {
      pipelineGuidedSheetOutputEl.value = blueprint?.sheetOutput || "";
    }
    if (pipelineGuidedBeatOutputEl) {
      pipelineGuidedBeatOutputEl.value = blueprint?.beatOutput || "";
    }
    return blueprint;
  }

  function createGuidedIdentityPacksFromTemplate(context = buildPipelineContext()) {
    const blueprint = buildGuidedTemplateBlueprint(context);
    const draftPacks = Array.isArray(blueprint?.sheetPacks) ? blueprint.sheetPacks : [];
    if (draftPacks.length === 0) {
      setStatus("??? ?? ?? ?? ? ????.", "warning");
      return;
    }

    const existingPacks = getIdentityPacks();
    const existingKeys = new Set(
      existingPacks.map((pack) => `${pack.name.toLowerCase()}::${pack.entityType}::${pack.componentType}`)
    );
    const nextIdentityPacks = [...existingPacks];
    let createdCount = 0;

    draftPacks.forEach((draft, index) => {
      const normalizedPack = normalizeIdentityPack({
        id: createId(),
        name: draft.name,
        entityType: draft.entityType,
        componentType: draft.componentType,
        notes: draft.notes,
        referenceImageIds: []
      }, nextIdentityPacks.length + index);

      const packKey = `${normalizedPack.name.toLowerCase()}::${normalizedPack.entityType}::${normalizedPack.componentType}`;
      if (existingKeys.has(packKey)) {
        return;
      }

      existingKeys.add(packKey);
      nextIdentityPacks.push(normalizedPack);
      createdCount += 1;
    });

    if (createdCount === 0) {
      setStatus("? ???? ?? Identity Pack? ?? ?? ????.", "warning");
      return;
    }

    pushHistoryState();
    updateIdentityPacks(nextIdentityPacks, {
      announceText: `${blueprint.templateLabel} ??? ???? Identity Pack ${createdCount}?? ??????.`
    });
    updateHistoryUI();
  }

  function handleGuidedPipelineAction(action) {
    if (action === "packs") {
      createGuidedIdentityPacksFromTemplate();
    }
  }

  function getPipelineIdeationModeLabel(value) {
    return sanitizePipelineIdeationMode(value) === "i2i" ? "I2I" : "I2T";
  }

  function getPipelineVideoModeLabel(value) {
    return sanitizePipelineVideoMode(value) === "omni" ? "Omni" : "Start / End";
  }

  function trimPipelineText(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function compactPipelineText(value, maxLength = 180) {
    const normalized = trimPipelineText(value).replace(/\s+/g, " ");
    if (!normalized) {
      return "";
    }

    return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 1)}…` : normalized;
  }

  function getPipelineSelectedPanels() {
    return panels.filter((panel) => selectedPanelIds.has(panel.id));
  }

  function buildPipelineContext(selectedPanels = getPipelineSelectedPanels()) {
    const primaryPanel = selectedPanels.length === 1 ? selectedPanels[0] : null;
    const primaryIdentityPacks = primaryPanel ? getPanelIdentityPacks(primaryPanel) : [];
    const projectIdentityPacks = getIdentityPacks();
    const brief = trimPipelineText(project.aiBrief);
    const goal = trimPipelineText(project.pipelineGoal)
      || trimPipelineText(primaryPanel?.caption)
      || trimPipelineText(project.logline)
      || brief
      || "Create a short premium commercial video with strong identity continuity.";
    const subject = trimPipelineText(project.pipelineSubject)
      || trimPipelineText(primaryPanel?.sceneTitle)
      || compactPipelineText(brief.split(/[.!?]/)[0] || "", 96)
      || "hero subject";
    const look = trimPipelineText(project.pipelineLook)
      || trimPipelineText(project.tone)
      || "premium commercial, cinematic, identity-consistent";
    const ideationMode = sanitizePipelineIdeationMode(project.pipelineIdeationMode);
    const videoMode = sanitizePipelineVideoMode(project.pipelineVideoMode);
    const promptSeed = trimPipelineText(primaryPanel?.t2iPrompt)
      || trimPipelineText(primaryPanel?.i2tPrompt)
      || trimPipelineText(primaryPanel?.caption);
    const referenceNames = aiReferenceImages
      .slice(0, 4)
      .map((image) => trimPipelineText(image?.name))
      .filter(Boolean);
    const referenceGuide = referenceNames.length > 0
      ? `${referenceNames.join(", ")}${aiReferenceImages.length > referenceNames.length ? ` + ${aiReferenceImages.length - referenceNames.length} more` : ""}`
      : "No attached project references yet";
    const identityPackGuideSource = primaryIdentityPacks.length > 0 ? primaryIdentityPacks : projectIdentityPacks;
    const identityPackGuide = identityPackGuideSource.length > 0
      ? identityPackGuideSource
        .slice(0, 4)
        .map((pack) => buildIdentityPackPromptSummary(pack))
        .filter(Boolean)
        .join(" || ")
      : "No structured identity packs yet";
    const targetSummary = primaryPanel
      ? compactPipelineText([primaryPanel.sceneTitle, primaryPanel.caption].filter(Boolean).join(" - "), 180)
      : selectedPanels.length > 1
        ? `${selectedPanels.length} selected storyboard cuts`
        : compactPipelineText(goal, 180);
    const targetMeta = primaryPanel
      ? `현재 타깃: 선택 컷 - ${primaryPanel.sceneTitle || "Untitled cut"}`
      : selectedPanels.length > 1
        ? `현재 타깃: 선택 컷 ${selectedPanels.length}개`
        : "현재 타깃: 프로젝트 전체 브리프";

    return {
      primaryPanel,
      selectedPanels,
      brief,
      goal,
      subject,
      look,
      ideationMode,
      videoMode,
      promptSeed,
      referenceGuide,
      referenceCount: aiReferenceImages.length,
      identityPackGuide,
      identityPackCount: identityPackGuideSource.length,
      targetSummary,
      targetMeta,
      aspectRatio: trimPipelineText(project.aspectRatio) || "16:9"
    };
  }

  function buildStep1Prompt(context) {
    return [
      `Create a single master concept still for ${context.subject}.`,
      `Visual direction: ${context.look}.`,
      `This image will become the identity seed for a multi-angle sheet, a 9-expression sheet, storyboard planning, and final I2V generation.`,
      `Keep the subject clean, readable, and stable: consistent face or product identity, strong silhouette, precise costume or material details, premium lighting, and a polished commercial finish.`,
      `Compose it as one hero image in ${context.aspectRatio} with no collage, no split panels, no text, and no watermark.`,
      context.identityPackCount > 0
        ? `Respect these structured identity packs as hard continuity anchors: ${context.identityPackGuide}.`
        : "No structured identity pack is attached yet, so make the hero image easy to break into future sheet packs.",
      context.referenceCount > 0
        ? `Use attached references only as mood or identity anchors: ${context.referenceGuide}.`
        : "Design the first hero image from text only, but keep the identity easy to reuse in later image-to-image steps.",
      `Video intent to preserve later: ${context.goal}.`
    ].join("\n");
  }

  function buildStep2Prompt(context) {
    return [
      `Use the Step 1 master concept image as the only identity anchor for ${context.subject}.`,
      `Generate a clean multi-angle turnaround grid for the same subject.`,
      "Include 8 views in one sheet: full front, left three-quarter, left profile, rear three-quarter, full back, right three-quarter, right profile, and a close portrait.",
      "Lock identity, proportions, outfit or product detail, materials, hair, accessories, and lighting family across every tile.",
      context.identityPackCount > 0
        ? `Preserve the structured sheet cues from these packs: ${context.identityPackGuide}.`
        : "Preserve the master concept identity exactly and avoid redesign.",
      "Use a neutral studio background, evenly spaced grid, clear separation between views, no extra characters, no text labels, and no watermark.",
      `Keep the same commercial tone: ${context.look}.`
    ].join("\n");
  }

  function buildStep3Prompt(context) {
    const guidedBlueprint = latestGuidedTemplateBlueprint || buildGuidedTemplateBlueprint(context);
    if (guidedBlueprint?.step3PromptLines?.length) {
      return guidedBlueprint.step3PromptLines.join("\n");
    }

    return [
      `Use the Step 1 master concept image as the identity anchor for ${context.subject}.`,
      "Generate a 3x3 expression sheet with 9 readable variations of the same subject.",
      "Expressions or moods: neutral, soft smile, bright smile, confident, focused, surprised, serious, playful, intense.",
      "Keep identity, costume, materials, camera distance, lighting family, and background consistency locked across all nine tiles.",
      context.identityPackCount > 0
        ? `Carry over the same identity-pack details into the expressions: ${context.identityPackGuide}.`
        : "Keep the same styling anchors from the master concept across all nine tiles.",
      "Make facial muscles, eye direction, and mouth shape clearly readable while preserving the same person or product styling.",
      "Clean 3x3 grid, no text, no watermark, no extra props unless they are core identity anchors."
    ].join("\n");
  }

  function buildStep4Prompt(context) {
    const ideationLabel = getPipelineIdeationModeLabel(context.ideationMode);
    const shotOutputLine = ideationLabel === "I2I"
      ? "- For each shot, write an English I2I storyboard frame prompt that uses the attached sheets as identity anchors."
      : "- For each shot, write an English I2T ideation prompt plus one keyframe direction sentence.";

    return [
      "I am attaching these development assets for the same subject:",
      "1. the Step 1 master concept image",
      "2. the Step 2 multi-angle turnaround grid",
      "3. the Step 3 nine-expression sheet",
      "",
      `I want to make this video: ${context.goal}`,
      `Current planning target: ${context.targetSummary}`,
      context.identityPackCount > 0 ? `Structured identity packs: ${context.identityPackGuide}` : "",
      `Please help me develop this with an ${ideationLabel} storyboard-planning workflow.`,
      "",
      "Deliverables:",
      "- Suggest 3 distinct concept directions with different emotional arcs.",
      "- Pick the strongest direction and expand it into a practical 6-8 shot storyboard.",
      "- For each shot, explain the purpose in Korean, camera framing, lens feel, movement, and which angle or expression from the attached sheets should drive the shot.",
      shotOutputLine,
      "- Recommend one strong opening frame and one strong ending frame.",
      "- Add continuity notes so the same identity survives into final I2V generation.",
      "",
      "Important rules:",
      "- Do not redesign the hero into a different person or product.",
      "- Preserve identity, materials, costume, silhouette, and premium mood from the attached sheets.",
      "- Keep every idea visually producible as a short commercial board."
    ].join("\n");
  }

  function buildStep5Prompt(context) {
    const videoLabel = getPipelineVideoModeLabel(context.videoMode);
    const outputLines = context.videoMode === "omni"
      ? [
          "- For each approved shot, return one production-ready Omni prompt in English.",
          "- After each prompt, list the continuity anchors that must stay stable from shot to shot.",
          "- Add one short guardrail line about what must not drift."
        ]
      : [
          "- For each approved shot, return Start Frame Prompt, Motion Prompt, and End Frame Prompt in English.",
          "- Add one short continuity note between the current shot and the next shot.",
          "- Add one short guardrail line about what must not drift."
        ];

    return [
      "I am attaching the approved assets for final video generation:",
      "1. the Step 1 master concept image",
      "2. the Step 2 multi-angle turnaround grid",
      "3. the Step 3 nine-expression sheet",
      "4. the approved storyboard frames and shot notes from Step 4",
      "",
      `Final video goal: ${context.goal}`,
      `Current shot target: ${context.targetSummary}`,
      context.identityPackCount > 0 ? `Structured identity packs: ${context.identityPackGuide}` : "",
      `Please convert these assets into ${videoLabel} I2V prompts for Kling, Seedance 2.0, or a similar high-end video model.`,
      "",
      "Output requirements:",
      ...outputLines,
      "",
      "Global rules:",
      `- Keep this subject stable across the whole sequence: ${context.subject}.`,
      `- Preserve this visual direction: ${context.look}.`,
      context.identityPackCount > 0 ? `- Treat these identity packs as non-negotiable continuity anchors: ${context.identityPackGuide}.` : "",
      "- Avoid face drift, costume drift, anatomy drift, and background continuity breaks.",
      "- Motion should feel intentional, premium, and physically plausible.",
      context.promptSeed
        ? `- Use this approved prompt seed as a continuity anchor where helpful: ${context.promptSeed}`
        : "- Use the approved storyboard frames as the main continuity anchor.",
      "- Bridge shots smoothly so the end of one shot can set up the start of the next shot."
    ].join("\n");
  }

  function renderPromptPipeline(selectedPanels = getPipelineSelectedPanels()) {
    if (
      !pipelineStep1OutputEl
      || !pipelineStep2OutputEl
      || !pipelineStep3OutputEl
      || !pipelineStep4OutputEl
      || !pipelineStep5OutputEl
    ) {
      return;
    }

    const context = buildPipelineContext(selectedPanels);
    const guidedBlueprint = renderGuidedTemplateLab(context);
    if (pipelineTargetMetaEl) {
      pipelineTargetMetaEl.textContent = context.targetMeta;
    }
    if (pipelineStep3ModeLabelEl) {
      pipelineStep3ModeLabelEl.textContent = guidedBlueprint?.step3Label || "Expression";
    }
    if (pipelineStep4ModeLabelEl) {
      pipelineStep4ModeLabelEl.textContent = getPipelineIdeationModeLabel(context.ideationMode);
    }
    if (pipelineStep5ModeLabelEl) {
      pipelineStep5ModeLabelEl.textContent = getPipelineVideoModeLabel(context.videoMode);
    }
    pipelinePromptLabEl?.querySelectorAll("[data-pipeline-apply]").forEach((button) => {
      const enabled = selectedPanels.length === 1;
      button.disabled = !enabled;
      button.title = enabled ? "선택 컷에 바로 반영" : "선택 컷 1개일 때만 적용할 수 있습니다.";
    });

    pipelineStep1OutputEl.value = buildStep1Prompt(context);
    pipelineStep2OutputEl.value = buildStep2Prompt(context);
    pipelineStep3OutputEl.value = buildStep3Prompt(context);
    pipelineStep4OutputEl.value = buildStep4Prompt(context);
    pipelineStep5OutputEl.value = buildStep5Prompt(context);
  }

  async function copyPipelinePrompt(targetId, label) {
    const target = document.getElementById(targetId);
    if (!target) {
      return;
    }

    const text = typeof target.value === "string" ? target.value : target.textContent || "";
    if (!text.trim()) {
      setStatus("복사할 프롬프트가 아직 없습니다.", "warning");
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        target.focus();
        target.select?.();
        document.execCommand?.("copy");
      }
      setStatus(`${label || "프롬프트"}를 복사했습니다.`);
    } catch (error) {
      console.warn("Failed to copy pipeline prompt.", error);
      setStatus("프롬프트 복사에 실패했습니다.", "warning");
    }
  }

  function getSingleSelectedPanel() {
    const selectedPanels = getPipelineSelectedPanels();
    return selectedPanels.length === 1 ? selectedPanels[0] : null;
  }

  function getNextPanelForContinuity(panel) {
    if (!panel) {
      return null;
    }

    if (Array.isArray(panel.nextPanelIds) && panel.nextPanelIds.length > 0) {
      const linkedPanel = getPanelById(panel.nextPanelIds[0]);
      if (linkedPanel) {
        return linkedPanel;
      }
    }

    const panelIndex = panels.findIndex((item) => item.id === panel.id);
    if (panelIndex >= 0 && panelIndex < panels.length - 1) {
      return panels[panelIndex + 1];
    }

    return null;
  }

  function buildDirectI2VDraft(context) {
    const panel = context.primaryPanel;
    const nextPanel = getNextPanelForContinuity(panel);
    const sceneTitle = trimPipelineText(panel?.sceneTitle) || context.subject;
    const caption = trimPipelineText(panel?.caption) || context.goal;
    const nextSceneTitle = trimPipelineText(nextPanel?.sceneTitle) || "the next storyboard beat";
    const referenceSummary = getPanelReferenceImages(panel)
      .map((item) => trimPipelineText(item?.name))
      .filter(Boolean)
      .join(", ");
    const referenceLine = referenceSummary
      ? `Reference anchors: ${referenceSummary}.`
      : context.referenceCount > 0
        ? `Reference anchors: ${context.referenceGuide}.`
        : "Reference anchors: preserve the approved master concept identity exactly.";
    const identityPackLine = context.identityPackCount > 0
      ? `Structured identity packs: ${context.identityPackGuide}.`
      : "Structured identity packs: preserve the approved hero identity and sheet hierarchy.";

    if (context.videoMode === "omni") {
      return {
        omniPrompt: [
          `Use the approved hero image, multi-angle sheet, and expression sheet for ${context.subject} as locked identity anchors.`,
          `Create one premium commercial video shot for "${sceneTitle}".`,
          `Shot intent: ${caption}.`,
          `Overall video goal: ${context.goal}.`,
          `Visual direction: ${context.look}.`,
          `Camera and motion: refined cinematic movement, premium pacing, physically plausible motion, and clean continuity into ${nextSceneTitle}.`,
          identityPackLine,
          referenceLine,
          "Preserve face or product identity, silhouette, materials, costume details, lighting family, and anatomy stability.",
          "Avoid morphing, drift, extra limbs, broken hands, warped costume detail, random props, random text, or watermark."
        ].join(" ")
      };
    }

    return {
      startPrompt: [
        `${context.subject}, ${sceneTitle}`,
        context.look,
        `opening frame for ${caption}`,
        "derived from the approved identity sheets",
        "premium cinematic commercial still",
        identityPackLine,
        referenceLine
      ].join(", "),
      motionPrompt: [
        `Refined camera move for ${sceneTitle}`,
        "preserve identity and costume consistency",
        `translate the shot intention "${caption}" into clean, premium motion`,
        `bridge naturally toward ${nextSceneTitle}`,
        "avoid face drift and anatomy drift"
      ].join(", "),
      endPrompt: [
        `${context.subject}, ${sceneTitle}`,
        `closing frame that resolves the shot and sets up ${nextSceneTitle}`,
        context.look,
        "premium ad finish",
        "stable identity, stable materials, stable lighting"
      ].join(", ")
    };
  }

  function applyPipelineStepToSelected(step) {
    const panel = getSingleSelectedPanel();
    if (!panel) {
      setStatus("선택 컷 1개를 먼저 고른 뒤 적용해 주세요.", "warning");
      return;
    }

    const context = buildPipelineContext([panel]);
    pushHistoryState();

    if (step === "step1") {
      updatePanel(panel.id, {
        viewMode: "t2i",
        imagePromptMode: "t2i",
        t2iCollapsed: false,
        t2iPrompt: pipelineStep1OutputEl?.value || buildStep1Prompt(context)
      }, { announce: false });
      updateHistoryUI();
      setStatus(`${panel.sceneTitle || "선택 컷"}에 Step 1 T2I 프롬프트를 반영했습니다.`);
      return;
    }

    if (step === "step5") {
      const draft = buildDirectI2VDraft(context);
      const isOmni = context.videoMode === "omni";
      updatePanel(panel.id, {
        viewMode: "i2v",
        i2vCollapsed: false,
        i2vStartPrompt: isOmni ? panel.i2vStartPrompt : draft.startPrompt,
        i2vMotionPrompt: isOmni ? panel.i2vMotionPrompt : draft.motionPrompt,
        i2vEndPrompt: isOmni ? panel.i2vEndPrompt : draft.endPrompt,
        i2vOmniPrompt: isOmni ? draft.omniPrompt : ""
      }, { announce: false });
      updateHistoryUI();
      setStatus(`${panel.sceneTitle || "선택 컷"}에 Step 5 I2V 프롬프트 초안을 반영했습니다.`);
    }
  }

  function loadWorkspaceLibraryItems() {
    const raw = window.localStorage.getItem(WORKSPACE_LIBRARY_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return sortWorkspaceLibraryItems(
        parsed
          .map(normalizeWorkspaceLibraryItem)
          .filter(Boolean)
      );
    } catch {
      return [];
    }
  }

  function normalizeWorkspaceLibraryItem(item) {
    if (!item || typeof item !== "object" || typeof item.id !== "string" || !item.id.trim()) {
      return null;
    }

    const createdAt = normalizeWorkspaceTimestamp(item.createdAt);
    const updatedAt = normalizeWorkspaceTimestamp(item.updatedAt, createdAt);

    return {
      id: item.id,
      title: typeof item.title === "string" && item.title.trim() ? item.title.trim() : "새 프로젝트",
      sequence: typeof item.sequence === "string" ? item.sequence : "",
      aspectRatio: typeof item.aspectRatio === "string" ? item.aspectRatio : "",
      panelCount: Number.isFinite(item.panelCount) ? Math.max(0, Math.round(item.panelCount)) : 0,
      createdAt,
      updatedAt
    };
  }

  function normalizeWorkspaceTimestamp(value, fallback = "") {
    const timestamp = typeof value === "string" ? value : "";
    const parsed = Date.parse(timestamp);
    if (Number.isNaN(parsed)) {
      return fallback || new Date().toISOString();
    }

    return new Date(parsed).toISOString();
  }

  function sortWorkspaceLibraryItems(items) {
    return [...items].sort((left, right) => {
      return Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
    });
  }

  function persistWorkspaceLibraryItems() {
    workspaceLibraryItems = sortWorkspaceLibraryItems(workspaceLibraryItems);
    window.localStorage.setItem(WORKSPACE_LIBRARY_STORAGE_KEY, JSON.stringify(workspaceLibraryItems));
  }

  function loadActiveWorkspaceId() {
    const raw = window.localStorage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY);
    return typeof raw === "string" ? raw.trim() : "";
  }

  function persistActiveWorkspaceId() {
    if (!activeWorkspaceId) {
      window.localStorage.removeItem(ACTIVE_WORKSPACE_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, activeWorkspaceId);
  }

  function openWorkspaceLibraryDb() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error("IndexedDB is not available."));
        return;
      }

      const request = window.indexedDB.open(WORKSPACE_LIBRARY_DB_NAME, 1);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(WORKSPACE_LIBRARY_DB_STORE_NAME)) {
          database.createObjectStore(WORKSPACE_LIBRARY_DB_STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Failed to open workspace library IndexedDB."));
    });
  }

  async function loadWorkspaceSnapshotFromDb(workspaceId) {
    if (!workspaceId) {
      return null;
    }

    try {
      const database = await openWorkspaceLibraryDb();
      const result = await new Promise((resolve, reject) => {
        const transaction = database.transaction(WORKSPACE_LIBRARY_DB_STORE_NAME, "readonly");
        const store = transaction.objectStore(WORKSPACE_LIBRARY_DB_STORE_NAME);
        const request = store.get(workspaceId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error("Failed to read workspace snapshot."));
      });
      database.close();

      return result && typeof result === "object" ? result : null;
    } catch (error) {
      console.warn("Failed to load workspace snapshot.", error);
      return null;
    }
  }

  async function saveWorkspaceSnapshotToDb(workspaceId, snapshot) {
    const database = await openWorkspaceLibraryDb();
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(WORKSPACE_LIBRARY_DB_STORE_NAME, "readwrite");
      const store = transaction.objectStore(WORKSPACE_LIBRARY_DB_STORE_NAME);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error("Failed to save workspace snapshot."));
      store.put(snapshot, workspaceId);
    });
    database.close();
  }

  async function deleteWorkspaceSnapshotFromDb(workspaceId) {
    const database = await openWorkspaceLibraryDb();
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(WORKSPACE_LIBRARY_DB_STORE_NAME, "readwrite");
      const store = transaction.objectStore(WORKSPACE_LIBRARY_DB_STORE_NAME);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error("Failed to delete workspace snapshot."));
      store.delete(workspaceId);
    });
    database.close();
  }

  function buildWorkspaceLibraryItem(workspaceId, snapshot, existingItem = null) {
    return normalizeWorkspaceLibraryItem({
      id: workspaceId,
      title: snapshot?.project?.title,
      sequence: snapshot?.project?.sequence,
      aspectRatio: snapshot?.project?.aspectRatio,
      panelCount: Array.isArray(snapshot?.panels) ? snapshot.panels.length : 0,
      createdAt: existingItem?.createdAt,
      updatedAt: new Date().toISOString()
    });
  }

  function upsertWorkspaceLibraryItem(nextItem) {
    workspaceLibraryItems = sortWorkspaceLibraryItems([
      ...workspaceLibraryItems.filter((item) => item.id !== nextItem.id),
      nextItem
    ]);
    persistWorkspaceLibraryItems();
  }

  function buildEmptyWorkspaceSnapshot() {
    return {
      version: "shonode-workspace-v1",
      exportedAt: new Date().toISOString(),
      project: normalizeProject({
        ...getDefaultProject(),
        title: "새 프로젝트"
      }),
      panels: createDefaultPanels().map((panel, index) => normalizePanel(panel, index)),
      referenceImages: [],
      selection: {
        panelIds: []
      },
      view: {
        zoom: 1,
        scrollLeft: 0,
        scrollTop: 0
      },
      sidebar: {
        leftSections: ["project"],
        rightSections: [],
        leftRailCollapsed: false,
        rightRailCollapsed: false
      }
    };
  }

  function buildDuplicatedWorkspaceTitle(title) {
    const baseTitle = typeof title === "string" && title.trim() ? title.trim() : "새 프로젝트";
    return /복사본$/.test(baseTitle) ? `${baseTitle} 2` : `${baseTitle} 복사본`;
  }

  function formatWorkspaceUpdatedAt(value) {
    const parsed = Date.parse(value);
    if (Number.isNaN(parsed)) {
      return "방금 전";
    }

    return new Intl.DateTimeFormat("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(parsed));
  }

  function renderWorkspaceLibrary() {
    if (!workspaceLibraryListEl || !workspaceLibraryMetaEl) {
      return;
    }

    const itemCount = workspaceLibraryItems.length;
    workspaceLibraryMetaEl.textContent = itemCount > 0
      ? `총 ${itemCount}개 프로젝트 · 현재 작업은 브라우저에 자동 저장됩니다.`
      : "현재 작업은 브라우저에 자동 저장됩니다.";

    if (itemCount === 0) {
      workspaceLibraryListEl.innerHTML = '<div class="workspace-library-empty">아직 저장된 프로젝트가 없습니다. 새 프로젝트를 만들거나 현재 작업을 복제해 시작해 보세요.</div>';
      return;
    }

    workspaceLibraryListEl.innerHTML = workspaceLibraryItems.map((item) => {
      const isActive = item.id === activeWorkspaceId;
      const subtitleParts = [
        item.sequence || "시퀀스 미정",
        `${Math.max(1, item.panelCount)}컷`
      ];

      if (item.aspectRatio) {
        subtitleParts.push(item.aspectRatio);
      }

      return `
        <article class="workspace-library-item${isActive ? " is-active" : ""}">
          <button class="workspace-library-open" type="button" data-workspace-open="${escapeHtml(item.id)}" aria-label="${escapeHtml(item.title)} 프로젝트 열기">
            <span class="workspace-library-title-row">
              <strong class="workspace-library-title">${escapeHtml(item.title)}</strong>
              ${isActive ? '<span class="workspace-library-badge">현재</span>' : ""}
            </span>
            <p class="workspace-library-subtitle">${escapeHtml(subtitleParts.join(" · "))}</p>
            <p class="workspace-library-time">최근 저장 ${escapeHtml(formatWorkspaceUpdatedAt(item.updatedAt))}</p>
          </button>
          <button class="ghost-button workspace-library-delete" type="button" data-workspace-delete="${escapeHtml(item.id)}">삭제</button>
        </article>
      `;
    }).join("");
  }

  function scheduleWorkspaceLibrarySync(options = {}) {
    if (!workspaceLibraryInitialized || workspaceImportInFlight || !activeWorkspaceId) {
      return;
    }

    const delay = Number.isFinite(options.delay) ? options.delay : 480;
    window.clearTimeout(workspaceLibrarySyncTimeoutId);
    workspaceLibrarySyncTimeoutId = window.setTimeout(() => {
      void syncActiveWorkspaceRecord(options);
    }, Math.max(0, delay));
  }

  async function syncActiveWorkspaceRecord(options = {}) {
    if (!activeWorkspaceId) {
      return false;
    }

    window.clearTimeout(workspaceLibrarySyncTimeoutId);
    if (workspaceImportInFlight) {
      return false;
    }

    const snapshot = createWorkspaceExportSnapshot();
    const existingItem = workspaceLibraryItems.find((item) => item.id === activeWorkspaceId) ?? null;
    const nextItem = buildWorkspaceLibraryItem(
      activeWorkspaceId,
      snapshot,
      existingItem
        ? {
            ...existingItem,
            createdAt: options.createdAt || existingItem.createdAt
          }
        : {
            createdAt: options.createdAt || new Date().toISOString()
          }
    );

    workspaceLibrarySyncPromise = workspaceLibrarySyncPromise
      .catch(() => undefined)
      .then(async () => {
        await saveWorkspaceSnapshotToDb(activeWorkspaceId, snapshot);
        upsertWorkspaceLibraryItem(nextItem);
        persistActiveWorkspaceId();
        renderWorkspaceLibrary();
      })
      .catch((error) => {
        console.warn("Failed to sync workspace library.", error);
        setStatus("프로젝트 라이브러리를 저장하지 못했습니다.", "warning");
      });

    await workspaceLibrarySyncPromise;
    return true;
  }

  async function initializeWorkspaceLibrary() {
    if (workspaceLibraryInitialized) {
      return;
    }

    workspaceLibraryInitialized = true;
    if (!activeWorkspaceId) {
      activeWorkspaceId = createId();
      persistActiveWorkspaceId();
    }

    renderWorkspaceLibrary();

    const existingSnapshot = await loadWorkspaceSnapshotFromDb(activeWorkspaceId);
    if (!existingSnapshot && !workspaceLibraryItems.some((item) => item.id === activeWorkspaceId)) {
      await syncActiveWorkspaceRecord({ createdAt: new Date().toISOString() });
      return;
    }

    await syncActiveWorkspaceRecord({
      createdAt: workspaceLibraryItems.find((item) => item.id === activeWorkspaceId)?.createdAt
    });
  }

  async function activateWorkspaceSnapshot(workspaceId, snapshot, options = {}) {
    workspaceImportInFlight = true;
    activeWorkspaceId = workspaceId;
    persistActiveWorkspaceId();

    try {
      await importWorkspaceSnapshot(snapshot);
    } finally {
      workspaceImportInFlight = false;
    }

    await syncActiveWorkspaceRecord({ createdAt: options.createdAt });
    renderWorkspaceLibrary();

    if (options.statusMessage) {
      setStatus(options.statusMessage);
    }
  }

  async function activateWorkspaceById(workspaceId, options = {}) {
    const targetItem = workspaceLibraryItems.find((item) => item.id === workspaceId);
    if (!targetItem) {
      setStatus("프로젝트 목록에서 대상을 찾지 못했습니다.", "warning");
      return;
    }

    if (workspaceId === activeWorkspaceId && !options.forceReload) {
      setStatus("이미 열려 있는 프로젝트입니다.");
      return;
    }

    const snapshot = await loadWorkspaceSnapshotFromDb(workspaceId);
    if (!snapshot) {
      setStatus("프로젝트를 불러오지 못했습니다.", "warning");
      return;
    }

    await activateWorkspaceSnapshot(workspaceId, snapshot, {
      createdAt: targetItem.createdAt,
      statusMessage: options.statusMessage || `${targetItem.title} 프로젝트를 불러왔습니다.`
    });
  }

  async function handleCreateWorkspace() {
    await syncActiveWorkspaceRecord();
    const workspaceId = createId();
    await activateWorkspaceSnapshot(workspaceId, buildEmptyWorkspaceSnapshot(), {
      createdAt: new Date().toISOString(),
      statusMessage: "새 프로젝트를 만들었습니다."
    });
  }

  async function handleDuplicateWorkspace() {
    await syncActiveWorkspaceRecord();
    const snapshot = createWorkspaceExportSnapshot();
    snapshot.project = normalizeProject({
      ...snapshot.project,
      title: buildDuplicatedWorkspaceTitle(snapshot.project?.title)
    });

    await activateWorkspaceSnapshot(createId(), snapshot, {
      createdAt: new Date().toISOString(),
      statusMessage: "현재 작업을 새 프로젝트로 복제했습니다."
    });
  }

  async function handleWorkspaceLibraryClick(event) {
    const deleteTarget = event.target.closest("[data-workspace-delete]");
    if (deleteTarget) {
      event.preventDefault();
      await handleDeleteWorkspace(deleteTarget.dataset.workspaceDelete);
      return;
    }

    const openTarget = event.target.closest("[data-workspace-open]");
    if (!openTarget) {
      return;
    }

    event.preventDefault();
    await activateWorkspaceById(openTarget.dataset.workspaceOpen);
  }

  async function handleDeleteWorkspace(workspaceId) {
    const targetItem = workspaceLibraryItems.find((item) => item.id === workspaceId);
    if (!targetItem) {
      return;
    }

    const shouldDelete = await openConfirmDialog({
      tone: "danger",
      eyebrow: "프로젝트 삭제",
      title: `${targetItem.title} 프로젝트를 삭제할까요?`,
      description: "라이브러리 목록과 저장된 스냅샷에서 함께 제거됩니다.",
      confirmLabel: "프로젝트 삭제"
    });

    if (!shouldDelete) {
      return;
    }

    await deleteWorkspaceSnapshotFromDb(workspaceId);
    workspaceLibraryItems = workspaceLibraryItems.filter((item) => item.id !== workspaceId);
    persistWorkspaceLibraryItems();

    if (workspaceId !== activeWorkspaceId) {
      renderWorkspaceLibrary();
      setStatus(`${targetItem.title} 프로젝트를 삭제했습니다.`);
      return;
    }

    if (workspaceLibraryItems.length === 0) {
      await activateWorkspaceSnapshot(createId(), buildEmptyWorkspaceSnapshot(), {
        createdAt: new Date().toISOString(),
        statusMessage: "마지막 프로젝트를 삭제하고 새 프로젝트를 만들었습니다."
      });
      return;
    }

    renderWorkspaceLibrary();
    await activateWorkspaceById(workspaceLibraryItems[0].id, {
      forceReload: true,
      statusMessage: `${targetItem.title} 프로젝트를 삭제하고 다른 프로젝트를 열었습니다.`
    });
  }

  function bindPanelPromptInput(element, panelId, fieldName, historyKey) {
    element.addEventListener("input", () => {
      captureHistoryGroup(historyKey);
      updatePanel(panelId, { [fieldName]: element.value }, { announce: false, rerender: false });
    });

    element.addEventListener("blur", () => {
      releaseHistoryGroup(historyKey);
    });
  }

  function initializeSidebarRails() {
    [...leftRailButtons, ...rightRailButtons].forEach((button) => {
      button.addEventListener("click", () => {
        toggleSidebarSection(button.dataset.sidebarSide, button.dataset.sidebarTarget);
      });
    });

    leftRailToggleButtonEl?.addEventListener("click", () => {
      toggleRailCollapsed("left");
    });

    rightRailToggleButtonEl?.addEventListener("click", () => {
      toggleRailCollapsed("right");
    });

    closeProjectSidebarButtonEl?.addEventListener("click", () => {
      closeSidebarSide("left");
    });

    closePreviewSidebarButtonEl?.addEventListener("click", () => {
      closeSidebarSide("right");
    });

    workspaceOverlayEl?.addEventListener("click", () => {
      closeSidebarPanels();
    });
  }

  function initializeReferenceImages() {
    aiReferenceDropzoneEl?.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-reference-remove]");
      if (removeButton) {
        event.preventDefault();
        event.stopPropagation();
        removeAiReferenceImage(removeButton.dataset.referenceRemove);
        return;
      }
      const previewTarget = event.target.closest("[data-reference-preview]");
      if (previewTarget) {
        event.preventDefault();
        event.stopPropagation();
        const referenceImage = getReferenceImageById(previewTarget.dataset.referencePreview);
        if (referenceImage) {
          openReferenceLightbox(referenceImage);
        }
        return;
      }
    });

    aiReferenceDropzoneEl?.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      const removeButton = event.target.closest("[data-reference-remove]");
      if (removeButton) {
        return;
      }

      event.preventDefault();
      const previewTarget = event.target.closest("[data-reference-preview]");
      if (previewTarget) {
        const referenceImage = getReferenceImageById(previewTarget.dataset.referencePreview);
        if (referenceImage) {
          openReferenceLightbox(referenceImage);
        }
        return;
      }
      aiReferenceInputEl?.click();
    });

    aiReferenceDropzoneEl?.addEventListener("dragenter", (event) => {
      event.preventDefault();
      aiReferenceDropzoneEl.classList.add("is-dragover");
    });

    aiReferenceDropzoneEl?.addEventListener("dragover", (event) => {
      event.preventDefault();
      aiReferenceDropzoneEl.classList.add("is-dragover");
    });

    aiReferenceDropzoneEl?.addEventListener("dragleave", (event) => {
      if (event.currentTarget !== event.target) {
        return;
      }
      aiReferenceDropzoneEl.classList.remove("is-dragover");
    });

    aiReferenceDropzoneEl?.addEventListener("drop", async (event) => {
      event.preventDefault();
      aiReferenceDropzoneEl.classList.remove("is-dragover");
      const files = Array.from(event.dataTransfer?.files ?? []);
      await addAiReferenceFiles(files);
    });

    aiReferenceInputEl?.addEventListener("change", async () => {
      const files = Array.from(aiReferenceInputEl.files ?? []);
      await addAiReferenceFiles(files);
      aiReferenceInputEl.value = "";
    });

    aiReferenceListEl?.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-reference-remove]");
      if (!removeButton) {
        return;
      }

      removeAiReferenceImage(removeButton.dataset.referenceRemove);
    });

    referenceLightboxBackdropEl?.addEventListener("click", closeReferenceLightbox);
    referenceLightboxCloseEl?.addEventListener("click", closeReferenceLightbox);

    renderAiReferenceImages();
    initializeReferenceImageStorage();
  }

  function loadAiReferenceImages() {
    const raw = window.sessionStorage.getItem(AI_REFERENCE_IMAGES_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter((image) => typeof image?.dataUrl === "string").slice(0, AI_REFERENCE_IMAGE_LIMIT);
    } catch {
      return [];
    }
  }

  function initializeReferenceImageStorage() {
    if (aiReferenceStoragePromise) {
      return aiReferenceStoragePromise;
    }

    aiReferenceStoragePromise = (async () => {
      const storedImages = await loadAiReferenceImagesFromIndexedDb();
      const { images: hydratedImages, changed } = await ensureReferenceImageAccentColors(storedImages);
      if (storedImages.length > 0 && storedImages.length >= aiReferenceImages.length) {
        aiReferenceImages = hydratedImages.slice(0, AI_REFERENCE_IMAGE_LIMIT);
        if (changed) {
          await saveAiReferenceImagesToIndexedDb(aiReferenceImages);
        }
      } else if (aiReferenceImages.length > 0) {
        await saveAiReferenceImagesToIndexedDb(aiReferenceImages);
      }

      try {
        window.sessionStorage.removeItem(AI_REFERENCE_IMAGES_STORAGE_KEY);
      } catch {}

      renderAiReferenceImages();
      renderAiOutputs();
      renderPanels({ restoreView: true });
    })().catch((error) => {
      console.warn("Failed to initialize AI reference storage.", error);
    });

    return aiReferenceStoragePromise;
  }

  function openAiReferenceImageDb() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error("IndexedDB is not available."));
        return;
      }

      const request = window.indexedDB.open(AI_REFERENCE_DB_NAME, 1);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(AI_REFERENCE_DB_STORE_NAME)) {
          database.createObjectStore(AI_REFERENCE_DB_STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Failed to open IndexedDB."));
    });
  }

  async function loadAiReferenceImagesFromIndexedDb() {
    try {
      const database = await openAiReferenceImageDb();
      const result = await new Promise((resolve, reject) => {
        const transaction = database.transaction(AI_REFERENCE_DB_STORE_NAME, "readonly");
        const store = transaction.objectStore(AI_REFERENCE_DB_STORE_NAME);
        const request = store.get(AI_REFERENCE_DB_RECORD_KEY);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error("Failed to read AI references from IndexedDB."));
      });
      database.close();

      if (!Array.isArray(result)) {
        return [];
      }

      return result.filter((image) => typeof image?.dataUrl === "string").slice(0, AI_REFERENCE_IMAGE_LIMIT);
    } catch (error) {
      console.warn("Failed to load AI references from IndexedDB.", error);
      return [];
    }
  }

  async function saveAiReferenceImagesToIndexedDb(images) {
    const database = await openAiReferenceImageDb();
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(AI_REFERENCE_DB_STORE_NAME, "readwrite");
      const store = transaction.objectStore(AI_REFERENCE_DB_STORE_NAME);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error("Failed to save AI references to IndexedDB."));
      store.put(images, AI_REFERENCE_DB_RECORD_KEY);
    });
    database.close();
  }

  function sanitizeReferenceWeight(value) {
    const numericValue = Number.parseFloat(value);
    if (!Number.isFinite(numericValue)) {
      return "2.0";
    }

    return Math.min(3, Math.max(0.5, numericValue)).toFixed(1);
  }

  function getReferenceImageById(referenceImageId) {
    if (!referenceImageId) {
      return [];
    }

    return aiReferenceImages.find((image) => image.id === referenceImageId) || null;
  }

  function normalizeReferenceImageIds(referenceImageIds, fallbackId = "") {
    const ids = Array.isArray(referenceImageIds)
      ? referenceImageIds.filter((value) => typeof value === "string" && value)
      : [];

    if (ids.length > 0) {
      return Array.from(new Set(ids));
    }

    return typeof fallbackId === "string" && fallbackId ? [fallbackId] : [];
  }

  function normalizeReferenceImageNames(referenceImageNames, fallbackName = "") {
    const names = Array.isArray(referenceImageNames)
      ? referenceImageNames
        .filter((value) => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
      : [];

    if (names.length > 0) {
      return names;
    }

    return typeof fallbackName === "string" && fallbackName.trim() ? [fallbackName.trim()] : [];
  }

  function sanitizeIdentityEntityType(value) {
    return IDENTITY_ENTITY_TYPES.includes(value) ? value : "character";
  }

  function sanitizeIdentityComponentType(value) {
    return IDENTITY_COMPONENT_TYPES.includes(value) ? value : "base";
  }

  function getIdentityEntityLabel(value) {
    switch (sanitizeIdentityEntityType(value)) {
      case "product":
        return "Product";
      case "prop":
        return "Prop";
      case "space":
        return "Space";
      default:
        return "Character";
    }
  }

  function getIdentityComponentLabel(value) {
    switch (sanitizeIdentityComponentType(value)) {
      case "outfit":
        return "Outfit";
      case "accessory":
        return "Accessory";
      case "expression":
        return "Expression";
      case "pose":
        return "Pose";
      case "material":
        return "Material";
      default:
        return "Base";
    }
  }

  function normalizeIdentityPackIds(identityPackIds) {
    return Array.isArray(identityPackIds)
      ? Array.from(
        new Set(
          identityPackIds
            .filter((value) => typeof value === "string")
            .map((value) => value.trim())
            .filter(Boolean)
        )
      )
      : [];
  }

  function normalizeIdentityPack(pack, index = 0) {
    if (!pack || typeof pack !== "object") {
      return null;
    }

    const name = typeof pack.name === "string" && pack.name.trim()
      ? pack.name.trim()
      : `Identity Pack ${index + 1}`;

    return {
      id: typeof pack.id === "string" && pack.id.trim() ? pack.id : createId(),
      name,
      entityType: sanitizeIdentityEntityType(pack.entityType),
      componentType: sanitizeIdentityComponentType(pack.componentType),
      notes: typeof pack.notes === "string" ? pack.notes : "",
      referenceImageIds: normalizeReferenceImageIds(pack.referenceImageIds)
    };
  }

  function normalizeIdentityPacks(identityPacks) {
    if (!Array.isArray(identityPacks)) {
      return [];
    }

    const usedIds = new Set();
    const normalized = [];
    identityPacks.forEach((pack, index) => {
      const nextPack = normalizeIdentityPack(pack, index);
      if (!nextPack) {
        return;
      }

      if (usedIds.has(nextPack.id)) {
        nextPack.id = createId();
      }

      usedIds.add(nextPack.id);
      normalized.push(nextPack);
    });

    return normalized;
  }

  function getIdentityPacks() {
    return normalizeIdentityPacks(project.identityPacks);
  }

  function getIdentityPackById(identityPackId) {
    return getIdentityPacks().find((pack) => pack.id === identityPackId) || null;
  }

  function getPanelIdentityPackIds(panel) {
    return normalizeIdentityPackIds(panel?.identityPackIds)
      .filter((identityPackId) => Boolean(getIdentityPackById(identityPackId)));
  }

  function getPanelIdentityPacks(panel) {
    return getPanelIdentityPackIds(panel)
      .map((identityPackId) => getIdentityPackById(identityPackId))
      .filter(Boolean);
  }

  function buildIdentityPackBadgeLabel(pack) {
    if (!pack) {
      return "";
    }

    return `${getIdentityEntityLabel(pack.entityType)} / ${getIdentityComponentLabel(pack.componentType)}`;
  }

  function getIdentityPackUsageCount(identityPackId) {
    return panels.reduce((count, panel) => {
      return count + (getPanelIdentityPackIds(panel).includes(identityPackId) ? 1 : 0);
    }, 0);
  }

  function getIdentityPackReferenceImages(pack) {
    return normalizeReferenceImageIds(pack?.referenceImageIds)
      .map((referenceImageId) => getReferenceImageById(referenceImageId))
      .filter(Boolean);
  }

  function buildIdentityPackPromptSummary(pack) {
    if (!pack) {
      return "";
    }

    const referenceNames = getIdentityPackReferenceImages(pack)
      .map((image) => trimPipelineText(image?.name))
      .filter(Boolean);
    const summaryParts = [
      pack.name,
      buildIdentityPackBadgeLabel(pack),
      pack.notes ? compactPipelineText(pack.notes, 96) : "",
      referenceNames.length > 0 ? referenceNames.join(", ") : ""
    ].filter(Boolean);

    return summaryParts.join(" | ");
  }

  function getPanelReferenceImageIds(panel) {
    return normalizeReferenceImageIds(panel?.referenceImageIds, panel?.referenceImageId);
  }

  function getPanelReferenceImageNames(panel) {
    return normalizeReferenceImageNames(panel?.referenceImageNames, panel?.referenceImageName);
  }

  function getPanelReferenceImages(panel) {
    const ids = getPanelReferenceImageIds(panel);
    const names = getPanelReferenceImageNames(panel);
    const items = ids.map((id, index) => {
      const image = getReferenceImageById(id);
      return {
        id,
        name: image?.name || names[index] || `reference-${index + 1}`,
        image
      };
    });

    if (items.length > 0) {
      return items;
    }

    return names.map((name, index) => ({
      id: "",
      name: name || `reference-${index + 1}`,
      image: null
    }));
  }

  function getPromptMode(panel) {
    if (panel?.imagePromptMode === "i2i" || panel?.imagePromptMode === "t2i") {
      return panel.imagePromptMode;
    }

    if (getPanelReferenceImageIds(panel).length > 0) {
      return "i2i";
    }

    return typeof panel?.t2iPrompt === "string" && panel.t2iPrompt.trim() ? "t2i" : "i2i";
  }

  function getPromptDisplayLabel(panel) {
    return getPromptMode(panel).toUpperCase();
  }

  function getPromptDisplayTitle(panel) {
    return `${getPromptDisplayLabel(panel)} Prompt`;
  }

  function getReferenceSummaryText(panel) {
    const names = getPanelReferenceImages(panel)
      .map((item) => item.name)
      .filter(Boolean);

    if (names.length === 0) {
      return "레퍼런스 없음";
    }

    if (names.length === 1) {
      return `레퍼런스 ${names[0]}`;
    }

    return `레퍼런스 ${names.length}장`;
  }

  function normalizeReferenceIndexes(referenceImageIndexes, fallbackIndex = -1) {
    const indexes = Array.isArray(referenceImageIndexes)
      ? referenceImageIndexes.filter((value) => Number.isInteger(value) && value >= 0)
      : [];

    if (indexes.length > 0) {
      return Array.from(new Set(indexes));
    }

    return Number.isInteger(fallbackIndex) && fallbackIndex >= 0 ? [fallbackIndex] : [];
  }

  function normalizeImagePromptMode(mode, referenceImageIndexes, i2iPrompt = "", t2iPrompt = "") {
    const normalizedMode = typeof mode === "string" ? mode.trim().toLowerCase() : "";

    if (normalizedMode === "i2i" || normalizedMode === "t2i") {
      return normalizedMode;
    }

    if (referenceImageIndexes.length > 0 || (typeof i2iPrompt === "string" && i2iPrompt.trim())) {
      return "i2i";
    }

    return "t2i";
  }

  function ensureReferenceGuidedPrompt(prompt) {
    const normalizedPrompt = typeof prompt === "string" ? prompt.trim() : "";
    if (!normalizedPrompt) {
      return "";
    }

    const lowerPrompt = normalizedPrompt.toLowerCase();
    if (
      lowerPrompt.includes("reference image") ||
      lowerPrompt.includes("reference images") ||
      lowerPrompt.includes("source image") ||
      lowerPrompt.includes("source images") ||
      lowerPrompt.includes("transform the assigned") ||
      lowerPrompt.includes("reinterpret") ||
      lowerPrompt.includes("reimagine")
    ) {
      return normalizedPrompt;
    }

    return `Use the assigned reference images as source anchors. Recompose and redesign the scene into a fresh commercial still instead of recreating the uploaded frame literally. ${normalizedPrompt}`;
  }

  function resolveCutImagePrompt(cut) {
    const referenceImageIndexes = normalizeReferenceIndexes(cut?.referenceImageIndexes, cut?.referenceImageIndex);
    const i2iPrompt = typeof cut?.i2iPrompt === "string" ? cut.i2iPrompt.trim() : "";
    const t2iPrompt = typeof cut?.t2iPrompt === "string" ? cut.t2iPrompt.trim() : "";
    const imagePromptMode = normalizeImagePromptMode(cut?.imagePromptMode, referenceImageIndexes, i2iPrompt, t2iPrompt);
    const resolvedI2IPrompt = ensureReferenceGuidedPrompt(i2iPrompt || t2iPrompt);
    const resolvedT2IPrompt = t2iPrompt || i2iPrompt;

    return {
      imagePromptMode,
      referenceImageIndexes,
      i2iPrompt: resolvedI2IPrompt,
      t2iPrompt: resolvedT2IPrompt,
      imagePrompt: imagePromptMode === "i2i"
        ? resolvedI2IPrompt
        : resolvedT2IPrompt
    };
  }

  function resolveCutReferenceIndexes(cut, referenceImageCount = 0, fallbackIndex = 0) {
    const normalizedIndexes = normalizeReferenceIndexes(cut?.referenceImageIndexes, cut?.referenceImageIndex);
    if (normalizedIndexes.length > 0) {
      return normalizedIndexes;
    }

    if (referenceImageCount > 0) {
      return buildReferenceIndexList(referenceImageCount, fallbackIndex, referenceImageCount > 2 ? 3 : 2);
    }

    return [];
  }

  function buildReferenceIndexList(referenceCount, cutIndex, preferredCount = 2) {
    if (referenceCount <= 0) {
      return [];
    }

    const count = Math.max(1, Math.min(referenceCount, preferredCount));
    const indexes = [];

    for (let offset = 0; offset < count; offset += 1) {
      indexes.push((cutIndex + offset) % referenceCount);
    }

    return Array.from(new Set(indexes));
  }

  function getReferenceUsageMap() {
    const usageMap = new Map();

    panels.forEach((panel, index) => {
      if (!panel.referenceImageId) {
        return;
      }

      const usageList = usageMap.get(panel.referenceImageId) ?? [];
      usageList.push(`S${String(index + 1).padStart(2, "0")}`);
      usageMap.set(panel.referenceImageId, usageList);
    });

    return usageMap;
  }

  function persistAiReferenceImages() {
    try {
      window.sessionStorage.setItem(AI_REFERENCE_IMAGES_STORAGE_KEY, JSON.stringify(aiReferenceImages));
      scheduleWorkspaceLibrarySync();
      return true;
    } catch {
      setStatus("첨부 이미지가 많아서 모두 저장하지 못했습니다. 장수를 줄여주세요.", "warning");
      return false;
    }
  }

  async function addAiReferenceFiles(files) {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      return;
    }

    const remainingSlots = AI_REFERENCE_IMAGE_LIMIT - aiReferenceImages.length;
    if (remainingSlots <= 0) {
      setStatus(`첨부 이미지는 최대 ${AI_REFERENCE_IMAGE_LIMIT}장까지 추가할 수 있습니다.`, "warning");
      return;
    }

    const acceptedFiles = imageFiles.slice(0, remainingSlots);
    const processedImages = [];

    for (const file of acceptedFiles) {
      try {
        const processed = await processAiReferenceFile(file);
        if (processed) {
          processedImages.push(processed);
        }
      } catch (error) {
        console.warn("Failed to process ai reference image.", error);
      }
    }

    if (processedImages.length === 0) {
      setStatus("이미지를 읽지 못했습니다. 다른 파일로 다시 시도해 주세요.", "warning");
      return;
    }

    aiReferenceImages = [...aiReferenceImages, ...processedImages];
    await persistAiReferenceImages();
    renderAiReferenceImages();
    setStatus(`${processedImages.length}개의 첨부 이미지를 추가했습니다.`);
  }

  async function removeAiReferenceImage(referenceId) {
    const nextImages = aiReferenceImages.filter((image) => image.id !== referenceId);
    if (nextImages.length === aiReferenceImages.length) {
      return;
    }

    const nextIdentityPacks = getIdentityPacks().map((pack) => ({
      ...pack,
      referenceImageIds: normalizeReferenceImageIds(pack.referenceImageIds).filter((value) => value !== referenceId)
    }));
    panels = panels.map((panel, index) => {
      const nextReferenceItems = getPanelReferenceImages(panel).filter((item) => item.id !== referenceId);
      return normalizePanel({
        ...panel,
        referenceImageIds: nextReferenceItems.map((item) => item.id).filter(Boolean),
        referenceImageNames: nextReferenceItems.map((item) => item.name).filter(Boolean),
        referenceImageId: nextReferenceItems[0]?.id || "",
        referenceImageName: nextReferenceItems[0]?.name || ""
      }, index);
    });
    aiReferenceImages = nextImages;
    updateProject({ identityPacks: nextIdentityPacks }, { announce: false });
    persistPanels();
    await persistAiReferenceImages();
    renderPanels();
    setStatus("첨부 이미지를 제거했습니다.");
  }

  /* function renderAiReferenceImages() {
    if (!aiReferenceListEl || !aiReferenceCountEl) {
      return;
    }

    aiReferenceCountEl.textContent = `${aiReferenceImages.length}장`;
    aiReferenceListEl.innerHTML = "";
    aiReferenceListEl.hidden = aiReferenceImages.length === 0;

    aiReferenceImages.forEach((image, imageIndex) => {
      const orderLabel = String(imageIndex + 1).padStart(2, "0");
      const usageLabels = usageMap.get(image.id) ?? [];
      const visibleUsageLabels = usageLabels.slice(0, 2);
      const extraUsageCount = Math.max(0, usageLabels.length - visibleUsageLabels.length);
      const orderLabel = String(imageIndex + 1).padStart(2, "0");
      const usageLabels = usageMap.get(image.id) ?? [];
      const visibleUsageLabels = usageLabels.slice(0, 2);
      const extraUsageCount = Math.max(0, usageLabels.length - visibleUsageLabels.length);
      const item = document.createElement("article");
      item.className = "ai-reference-item";
      item.innerHTML = `
        <img class="ai-reference-thumb" src="${escapeHtml(image.dataUrl)}" alt="${escapeHtml(image.name || "첨부 이미지")}">
        <button class="ai-reference-remove" type="button" data-reference-remove="${escapeHtml(image.id)}" aria-label="첨부 이미지 삭제" title="첨부 이미지 삭제">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6L18 18M18 6L6 18"></path>
          </svg>
        </button>
        <div class="ai-reference-meta">
          <strong class="ai-reference-name">${escapeHtml(image.name || "reference.jpg")}</strong>
          <span class="ai-reference-size">${escapeHtml(`${image.width}×${image.height}`)}</span>
        </div>
      `;
      aiReferenceListEl.appendChild(item);
    });
  }

  } */

  async function processAiReferenceFile(file) {
    const dataUrl = await readFileAsDataUrl(file);
    const image = await loadImageElement(dataUrl);
    const maxSize = 720;
    const ratio = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * ratio));
    const height = Math.max(1, Math.round(image.naturalHeight * ratio));
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      return null;
    }

    canvas.width = width;
    canvas.height = height;
    context.drawImage(image, 0, 0, width, height);

    return {
      id: createId(),
      name: file.name,
      mimeType: "image/jpeg",
      width,
      height,
      dataUrl: canvas.toDataURL("image/jpeg", 0.78)
    };
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error || new Error("Failed to read file."));
      reader.readAsDataURL(file);
    });
  }

  function loadImageElement(dataUrl) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Failed to decode image."));
      image.src = dataUrl;
    });
  }

  async function deriveReferenceAccentRgb(dataUrl) {
    const image = await loadImageElement(dataUrl);
    const sampleSize = 18;
    const sampleCanvas = document.createElement("canvas");
    const sampleContext = sampleCanvas.getContext("2d");

    if (!sampleContext) {
      return "37 99 235";
    }

    sampleCanvas.width = sampleSize;
    sampleCanvas.height = sampleSize;
    sampleContext.drawImage(image, 0, 0, sampleSize, sampleSize);

    const pixelData = sampleContext.getImageData(0, 0, sampleSize, sampleSize).data;
    let redTotal = 0;
    let greenTotal = 0;
    let blueTotal = 0;
    let visiblePixels = 0;

    for (let index = 0; index < pixelData.length; index += 4) {
      const alpha = pixelData[index + 3];
      if (alpha < 12) {
        continue;
      }

      redTotal += pixelData[index];
      greenTotal += pixelData[index + 1];
      blueTotal += pixelData[index + 2];
      visiblePixels += 1;
    }

    if (visiblePixels === 0) {
      return "37 99 235";
    }

    return `${Math.round(redTotal / visiblePixels)} ${Math.round(greenTotal / visiblePixels)} ${Math.round(blueTotal / visiblePixels)}`;
  }

  async function ensureReferenceImageAccentColors(images) {
    let changed = false;
    const nextImages = await Promise.all(
      images.map(async (image) => {
        if (image?.accentRgb || typeof image?.dataUrl !== "string") {
          return image;
        }

        changed = true;
        return {
          ...image,
          accentRgb: await deriveReferenceAccentRgb(image.dataUrl)
        };
      })
    );

    return { images: nextImages, changed };
  }

  function loadSidebarSections(side) {
    const key = side === "left" ? LEFT_SIDEBAR_SECTION_STORAGE_KEY : RIGHT_SIDEBAR_SECTION_STORAGE_KEY;
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return [];
    }

    const validSectionIds = new Set(getSidebarSectionIds(side));

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return getSidebarSectionIds(side).filter((sectionId) => parsed.includes(sectionId));
    } catch {
      return validSectionIds.has(raw) ? [raw] : [];
    }
  }

  function persistSidebarSections(side, values) {
    const key = side === "left" ? LEFT_SIDEBAR_SECTION_STORAGE_KEY : RIGHT_SIDEBAR_SECTION_STORAGE_KEY;
    window.localStorage.setItem(key, JSON.stringify(values));
    scheduleWorkspaceLibrarySync();
  }

  function loadRailCollapsed(side) {
    const key = side === "left" ? LEFT_RAIL_COLLAPSED_STORAGE_KEY : RIGHT_RAIL_COLLAPSED_STORAGE_KEY;
    return window.localStorage.getItem(key) === "true";
  }

  function persistRailCollapsed(side, value) {
    const key = side === "left" ? LEFT_RAIL_COLLAPSED_STORAGE_KEY : RIGHT_RAIL_COLLAPSED_STORAGE_KEY;
    window.localStorage.setItem(key, String(value));
    scheduleWorkspaceLibrarySync();
  }

  function getRailElement(side) {
    return side === "left" ? leftRailEl : rightRailEl;
  }

  function getRailButtons(side) {
    return side === "left" ? leftRailButtons : rightRailButtons;
  }

  function getSidebarSections(side) {
    return side === "left" ? leftSidebarSections : rightSidebarSections;
  }

  function getSidebarSectionIds(side) {
    return getSidebarSections(side).map((section) => section.dataset.sidebarSection);
  }

  function getSidebarElement(side) {
    return side === "left" ? projectSidebarEl : previewSidebarEl;
  }

  function getActiveSidebarSections(side) {
    return side === "left" ? activeLeftSidebarSections : activeRightSidebarSections;
  }

  function isRailCollapsed(side) {
    return side === "left" ? leftRailCollapsed : rightRailCollapsed;
  }

  function toggleRailCollapsed(side) {
    const nextValue = !isRailCollapsed(side);

    if (side === "left") {
      leftRailCollapsed = nextValue;
      if (nextValue) {
        activeLeftSidebarSections = [];
        persistSidebarSections("left", []);
      }
    } else {
      rightRailCollapsed = nextValue;
      if (nextValue) {
        activeRightSidebarSections = [];
        persistSidebarSections("right", []);
      }
    }

    persistRailCollapsed(side, nextValue);
    applySidebarRailState(false);
    setStatus(`${side === "left" ? "왼쪽" : "오른쪽"} 레일을 ${nextValue ? "접었습니다" : "펼쳤습니다"}.`);
  }

  function toggleSidebarSection(side, sectionId) {
    if (isRailCollapsed(side)) {
      if (side === "left") {
        leftRailCollapsed = false;
      } else {
        rightRailCollapsed = false;
      }
      persistRailCollapsed(side, false);
    }

    const currentSections = new Set(getActiveSidebarSections(side));
    const willActivate = !currentSections.has(sectionId);

    if (willActivate) {
      currentSections.add(sectionId);
    } else {
      currentSections.delete(sectionId);
    }

    setSidebarSections(side, Array.from(currentSections), false);
    const label = getSidebarSectionLabel(side, sectionId);
    if (label) {
      setStatus(`${label} 섹션을 ${willActivate ? "열었습니다" : "닫았습니다"}.`);
    }
  }

  function setSidebarSections(side, sectionIds, announce = true) {
    const nextSections = getSidebarSectionIds(side).filter((sectionId) => sectionIds.includes(sectionId));
    if (side === "left") {
      activeLeftSidebarSections = nextSections;
      if (nextSections.length > 0) {
        leftRailCollapsed = false;
        persistRailCollapsed("left", false);
      }
    } else {
      activeRightSidebarSections = nextSections;
      if (nextSections.length > 0) {
        rightRailCollapsed = false;
        persistRailCollapsed("right", false);
      }
    }

    persistSidebarSections(side, nextSections);
    applySidebarRailState(false);

    if (!announce) {
      return;
    }
  }

  function closeSidebarPanels(options = {}) {
    const { announce = true } = options;
    const hadOpenPanel = activeLeftSidebarSections.length > 0 || activeRightSidebarSections.length > 0;
    activeLeftSidebarSections = [];
    activeRightSidebarSections = [];
    persistSidebarSections("left", []);
    persistSidebarSections("right", []);
    applySidebarRailState(false);

    if (announce && hadOpenPanel) {
      setStatus("열린 사이드 패널을 닫았습니다.");
    }
  }

  function closeSidebarSide(side, announce = true) {
    const activeSections = side === "left" ? activeLeftSidebarSections : activeRightSidebarSections;
    const hadOpenPanel = activeSections.length > 0;
    setSidebarSections(side, [], false);

    if (!announce || !hadOpenPanel) {
      return;
    }

    setStatus(`${side === "left" ? "프로젝트" : "프리뷰"} 패널을 닫았습니다.`);
  }

  function getSidebarSectionLabel(side, sectionId) {
    const button = getRailButtons(side).find((item) => item.dataset.sidebarTarget === sectionId);
    return button?.dataset.sidebarLabel ?? "";
  }

  function syncSidebarPanelToolbar(side, activeSectionIds) {
    const eyebrowEl = side === "left" ? projectSidebarPanelEyebrowEl : previewSidebarPanelEyebrowEl;
    const titleEl = side === "left" ? projectSidebarPanelTitleEl : previewSidebarPanelTitleEl;
    const fallbackEyebrow = side === "left" ? "Project" : "Preview";
    const fallbackTitle = side === "left" ? "프로젝트 개요" : "프리뷰";

    if (!eyebrowEl || !titleEl) {
      return;
    }

    const activeSectionId = activeSectionIds[0];
    if (!activeSectionId) {
      eyebrowEl.textContent = fallbackEyebrow;
      titleEl.textContent = fallbackTitle;
      return;
    }

    const sectionEl = getSidebarSections(side).find((section) => section.dataset.sidebarSection === activeSectionId);
    const nextEyebrow = sectionEl?.querySelector(".sidebar-eyebrow")?.textContent?.trim() || fallbackEyebrow;
    const nextTitle = sectionEl?.querySelector("h2")?.textContent?.trim() || getSidebarSectionLabel(side, activeSectionId) || fallbackTitle;

    eyebrowEl.textContent = nextEyebrow;
    titleEl.textContent = nextTitle;
  }

  function applySidebarRailState() {
    applySidebarRailStateForSide("left", activeLeftSidebarSections);
    applySidebarRailStateForSide("right", activeRightSidebarSections);
    document.body.classList.remove("is-sidebar-collapsed", "is-preview-collapsed");
    workspaceMainEl?.classList.toggle("has-active-panel", activeLeftSidebarSections.length > 0 || activeRightSidebarSections.length > 0);
    applyPreviewSidebarState(false);
  }

  function applySidebarRailStateForSide(side, activeSectionIds) {
    const railEl = getRailElement(side);
    const railButtons = getRailButtons(side);
    const sections = getSidebarSections(side);
    const sidebarEl = getSidebarElement(side);
    const railCollapsed = isRailCollapsed(side);
    const toggleButton = side === "left" ? leftRailToggleButtonEl : rightRailToggleButtonEl;
    const toggleLabel = `${side === "left" ? "왼쪽" : "오른쪽"} 레일 ${railCollapsed ? "펼치기" : "접기"}`;
    const activeSectionSet = new Set(activeSectionIds);
    const isPanelOpen = activeSectionIds.length > 0;

    railEl?.classList.toggle("is-collapsed", railCollapsed);
    railEl?.classList.toggle("is-panel-open", isPanelOpen);
    railEl?.setAttribute("data-collapsed", String(railCollapsed));
    railEl?.setAttribute("data-panel-open", String(isPanelOpen));
    toggleButton?.setAttribute("aria-expanded", String(!railCollapsed));
    toggleButton?.setAttribute("aria-label", toggleLabel);

    sidebarEl.classList.toggle("is-open", isPanelOpen);
    sidebarEl.dataset.activeSections = activeSectionIds.join(",");
    sidebarEl.setAttribute("aria-hidden", isPanelOpen ? "false" : "true");

    railButtons.forEach((button) => {
      const isActive = activeSectionSet.has(button.dataset.sidebarTarget);
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
      button.setAttribute("aria-label", `${button.dataset.sidebarLabel} 패널 ${isActive ? "닫기" : "열기"}`);
    });

    sections.forEach((section) => {
      const isActive = activeSectionSet.has(section.dataset.sidebarSection);
      section.hidden = !isActive;
      section.classList.toggle("is-active", isActive);
    });

    syncSidebarPanelToolbar(side, activeSectionIds);
  }

  function startLinkDrag(event, sourceId) {
    if (linkState?.sourceId === sourceId) {
      cleanupLinkDrag(false);
      renderConnections();
      setStatus("연결 모드를 취소했습니다.");
      return;
    }

    cleanupLinkDrag(false);

    const startPoint = getPortPoint(sourceId, "out");
    if (!startPoint) {
      return;
    }

    if (!selectedPanelIds.has(sourceId)) {
      setSelection([sourceId]);
    }

    linkState = {
      pointerId: event.pointerId,
      sourceId,
      targetId: null,
      historySnapshot: createHistorySnapshot(),
      currentPoint: startPoint
    };

    document.body.classList.add("is-linking");
    updateLinkTargetStates();
    renderConnections();
    window.addEventListener("pointermove", handleLinkDragMove);
    window.addEventListener("pointerup", handleLinkDragEnd);
    window.addEventListener("pointercancel", handleLinkDragEnd);
    setStatus("다음 컷으로 연결할 카드를 선택하세요.");
  }

  function handleLinkDragMove(event) {
    if (!linkState || event.pointerId !== linkState.pointerId) {
      return;
    }

    linkState.currentPoint = clientToBoardPoint(event.clientX, event.clientY);
    linkState.targetId = getDropTargetId(event.clientX, event.clientY, linkState.sourceId);
    updateLinkTargetStates();
    renderConnections();
  }

  function handleLinkDragEnd(event) {
    if (!linkState || event.pointerId !== linkState.pointerId) {
      return;
    }

    const targetId = getDropTargetId(event.clientX, event.clientY, linkState.sourceId);
    finishLinkDrag(targetId);
  }

  function finishLinkDrag(targetId) {
    if (!linkState) {
      return;
    }

    const { sourceId, historySnapshot } = linkState;
    cleanupLinkDrag(false);

    if (!targetId || targetId === sourceId) {
      renderConnections();
      setStatus("연결을 취소했습니다.");
      return;
    }

    const sourcePanel = getPanelById(sourceId);
    if (!sourcePanel) {
      renderConnections();
      return;
    }

    const nextPanelIds = [targetId];
    const isSameLink =
      Array.isArray(sourcePanel.nextPanelIds) &&
      sourcePanel.nextPanelIds.length === nextPanelIds.length &&
      sourcePanel.nextPanelIds.every((value, index) => value === nextPanelIds[index]);

    if (isSameLink) {
      renderConnections();
      setStatus("이미 같은 컷과 연결되어 있습니다.");
      return;
    }

    pushHistoryState(historySnapshot);
    updatePanel(sourceId, { nextPanelIds }, { announce: false });
    updateHistoryUI();
    setStatus("컷 연결을 저장했습니다.");
  }

  function cleanupLinkDrag(render = true) {
    if (!linkState) {
      return;
    }

    linkState = null;
    document.body.classList.remove("is-linking");
    window.removeEventListener("pointermove", handleLinkDragMove);
    window.removeEventListener("pointerup", handleLinkDragEnd);
    window.removeEventListener("pointercancel", handleLinkDragEnd);
    updateLinkTargetStates();

    if (render) {
      renderConnections();
    }
  }

  function clearPanelConnections(panelId) {
    const panel = getPanelById(panelId);
    if (!panel || !Array.isArray(panel.nextPanelIds) || panel.nextPanelIds.length === 0) {
      return;
    }

    pushHistoryState();
    updatePanel(panelId, { nextPanelIds: [] }, { announce: false });
    updateHistoryUI();
    setStatus("컷 연결을 지웠습니다.");
  }

  function updateLinkTargetStates() {
    board.querySelectorAll(".story-card").forEach((cardEl) => {
      const panelId = cardEl.dataset.panelId;
      cardEl.classList.toggle("is-link-source", linkState?.sourceId === panelId);
      cardEl.classList.toggle("is-link-target", Boolean(linkState?.targetId) && linkState?.targetId === panelId);

      const inputPort = cardEl.querySelector(".node-port--in");
      const outputPort = cardEl.querySelector(".node-port--out");
      inputPort?.classList.toggle("is-active", linkState?.targetId === panelId);
      outputPort?.classList.toggle("is-active", linkState?.sourceId === panelId);
    });
  }

  function handleLinkKeyDown(event) {
    if (event.key !== "Escape") {
      return;
    }

    if (!referenceLightboxEl?.hidden) {
      event.preventDefault();
      closeReferenceLightbox();
      return;
    }

    if (!linkState) {
      return;
    }

    event.preventDefault();
    cleanupLinkDrag();
    setStatus("연결 모드를 취소했습니다.");
  }

  function getDropTargetId(clientX, clientY, sourceId) {
    const element = document.elementFromPoint(clientX, clientY);
    const portTargetId = element?.closest?.(".node-port--in")?.dataset?.panelId;
    if (portTargetId && portTargetId !== sourceId) {
      return portTargetId;
    }

    const cardTargetId = element?.closest?.(".story-card")?.dataset?.panelId;
    if (cardTargetId && cardTargetId !== sourceId) {
      return cardTargetId;
    }

    return null;
  }

  function getPortPoint(panelId, portType) {
    const portEl = board.querySelector(`[data-panel-id="${panelId}"] .node-port--${portType} .node-port-core`);
    if (!portEl) {
      return null;
    }

    const rect = portEl.getBoundingClientRect();
    return clientToBoardPoint(rect.left + rect.width * 0.5, rect.top + rect.height * 0.5);
  }

  function clientToBoardPoint(clientX, clientY) {
    const viewportRect = canvasViewport.getBoundingClientRect();
    return {
      x: (canvasViewport.scrollLeft + clientX - viewportRect.left) / zoom,
      y: (canvasViewport.scrollTop + clientY - viewportRect.top) / zoom
    };
  }

  function syncMediaView(panel, buttons, stagePanels) {
    buttons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.view === panel.viewMode);
    });

    stagePanels.forEach((section) => {
      section.hidden = section.dataset.panelView !== panel.viewMode;
    });
  }

  function getPromptCollapsedField(kind) {
    if (kind === "t2i") {
      return "t2iCollapsed";
    }

    if (kind === "i2v") {
      return "i2vCollapsed";
    }

    return "";
  }

  function syncPromptPanels(panel, sections) {
    sections.forEach((section) => {
      const kind = section.dataset.panelView;
      const fieldName = getPromptCollapsedField(kind);
      const promptLabel = kind === "t2i" ? getPromptDisplayLabel(panel) : kind.toUpperCase();
      if (!fieldName) {
        return;
      }

      const collapsed = Boolean(panel[fieldName]);
      const body = section.querySelector(".prompt-panel-body");
      const preview = section.querySelector(".prompt-collapsed-preview");
      const button = section.querySelector(".prompt-toggle-button");

      section.classList.toggle("is-collapsed", collapsed);
      if (body) {
        body.hidden = collapsed;
      }

      if (preview) {
        preview.hidden = true;
        preview.textContent = "";
      }

      if (button) {
        button.setAttribute("aria-expanded", String(!collapsed));
        button.setAttribute("aria-label", `${promptLabel} 프롬프트 ${collapsed ? "펼치기" : "접기"}`);
        button.title = collapsed ? "프롬프트 펼치기" : "프롬프트 접기";
      }
    });
  }

  function applyPreviewSidebarState(announce = true) {
    const isOpen = activeRightSidebarSections.length > 0;
    togglePreviewButtonEl?.setAttribute("aria-expanded", String(isOpen));
    togglePreviewButtonEl?.setAttribute("aria-label", isOpen ? "프리뷰 닫기" : "프리뷰 열기");
    if (togglePreviewLabelEl) {
      togglePreviewLabelEl.textContent = isOpen ? "프리뷰 닫기" : "프리뷰 열기";
    }

    if (announce) {
      setStatus(isOpen ? "프리뷰를 펼쳤습니다." : "프리뷰를 접었습니다.");
    }
  }

  function renderPreviewSidebar() {
    previewVideoUrlInputEl.value = project.previewVideoUrl ?? "";
    previewPosterUrlInputEl.value = project.previewPosterUrl ?? "";
    renderPreviewVideo();
  }

  function renderPreviewVideo() {
    const videoUrl = (project.previewVideoUrl ?? "").trim();
    const posterUrl = (project.previewPosterUrl ?? "").trim();

    if (!videoUrl) {
      previewVideoEl.removeAttribute("src");
      previewVideoEl.removeAttribute("poster");
      previewVideoEl.classList.remove("is-visible");
      previewVideoEl.load();
      previewVideoEmptyEl.classList.remove("is-hidden");
      return;
    }

    previewVideoEl.src = videoUrl;
    if (posterUrl) {
      previewVideoEl.poster = posterUrl;
    } else {
      previewVideoEl.removeAttribute("poster");
    }
    previewVideoEl.classList.add("is-visible");
    previewVideoEmptyEl.classList.add("is-hidden");
  }

  function renderAiOutputs() {
    aiCutCountOutputEl.textContent = panels.length > 0 ? String(panels.length) : "-";
    if (project.aiBrief?.trim()) {
      const referenceMeta = aiReferenceImages.length > 0 ? ` · 레퍼런스 ${aiReferenceImages.length}장` : "";
      aiPlanMetaEl.textContent = `${project.aiModel || "Gemini 2.5 Flash"} 기준 연출 초안 준비 완료${referenceMeta}`;
    } else {
      aiPlanMetaEl.textContent = "브리프와 첨부 이미지를 넣으면 장면 흐름, 컷 구조, 프롬프트 베이스가 카드로 펼쳐집니다.";
    }

    aiSummaryOutputEl.textContent = project.aiSummary?.trim()
      ? project.aiSummary
      : "브리프를 넣고 구조를 만들면 전체 연출 방향이 여기에 정리됩니다.";

    aiSequenceOutputEl.innerHTML = "";
    panels.forEach((panel, index) => {
      const item = document.createElement("article");
      item.className = "sequence-item";
      item.innerHTML = `
        <span class="sequence-index">${index + 1}</span>
        <div>
          <strong>${escapeHtml(panel.sceneTitle || `컷 ${index + 1}`)}</strong>
          <p>${escapeHtml(composeSequenceText(panel))}</p>
        </div>
      `;
      aiSequenceOutputEl.appendChild(item);
    });
  }

  function composeSequenceText(panel) {
    const duration = panel.durationLabel ? `${panel.durationLabel} · ` : "";
    const caption = panel.caption || "설명이 아직 없습니다.";
    return `${duration}${caption.length > 88 ? `${caption.slice(0, 87)}…` : caption}`;
  }

  function renderSelectionDetail() {
    const selectedPanels = panels.filter((panel) => selectedPanelIds.has(panel.id));
    selectionDetailOutputEl.innerHTML = "";

    if (selectedPanels.length === 0) {
      selectionDetailOutputEl.textContent = "카드를 선택하면 이곳에 컷 설명과 프롬프트 요약이 표시됩니다.";
      return;
    }

    if (selectedPanels.length > 1) {
      selectionDetailOutputEl.textContent = `${selectedPanels.length}개의 컷이 선택되어 있습니다. 여러 컷의 흐름을 비교하거나 복제/삭제를 진행할 수 있습니다.`;
      return;
    }

    const panel = selectedPanels[0];
    const detail = document.createElement("article");
    detail.className = "selection-detail-card";
    detail.innerHTML = `
      <strong>${escapeHtml(panel.sceneTitle || "선택한 컷")}</strong>
      <p>${escapeHtml(panel.caption || "설명 없음")}</p>
      <p>${escapeHtml([
        panel.i2tPrompt ? `I2T ${panel.i2tPrompt.length}자` : "I2T 비어 있음",
        panel.t2iPrompt ? `T2I ${panel.t2iPrompt.length}자` : "T2I 비어 있음",
        panel.i2vStartPrompt || panel.i2vMotionPrompt || panel.i2vEndPrompt ? "I2V 준비됨" : "I2V 비어 있음"
      ].join(" · "))}</p>
    `;
    selectionDetailOutputEl.appendChild(detail);
  }

  function renderConnections() {
    connectionLayerEl.innerHTML = "";
    const links = collectLinks();

    links.forEach(({ fromId, toId, type }) => {
      const fromPoint = getPortPoint(fromId, "out");
      const toPoint = getPortPoint(toId, "in");
      if (!fromPoint || !toPoint) {
        return;
      }

      appendConnectionPath(fromPoint, toPoint, type);
    });

    if (linkState) {
      const fromPoint = getPortPoint(linkState.sourceId, "out");
      const toPoint =
        linkState.targetId
          ? getPortPoint(linkState.targetId, "in")
          : linkState.currentPoint;

      if (fromPoint && toPoint) {
        appendConnectionPath(fromPoint, toPoint, linkState.targetId ? "preview-target" : "preview");
      }
    }
  }

  function collectLinks() {
    const explicitLinks = panels.flatMap((panel) =>
      panel.nextPanelIds.map((nextId) => ({ fromId: panel.id, toId: nextId, type: "manual" }))
    );
    if (explicitLinks.length > 0) {
      return explicitLinks;
    }

    return panels.slice(0, -1).map((panel, index) => ({
      fromId: panel.id,
      toId: panels[index + 1].id,
      type: "suggested"
    }));
  }

  function appendConnectionPath(fromPoint, toPoint, type) {
    const curve = Math.max(60, Math.abs(toPoint.x - fromPoint.x) * 0.35);
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      `M ${fromPoint.x} ${fromPoint.y} C ${fromPoint.x + curve} ${fromPoint.y}, ${toPoint.x - curve} ${toPoint.y}, ${toPoint.x} ${toPoint.y}`
    );
    path.setAttribute("class", `connection-line connection-line--${type}`);
    connectionLayerEl.appendChild(path);

    const startDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    startDot.setAttribute("cx", String(fromPoint.x));
    startDot.setAttribute("cy", String(fromPoint.y));
    startDot.setAttribute("r", type.startsWith("preview") ? "4.4" : "3.8");
    startDot.setAttribute("class", `connection-dot connection-dot--${type.startsWith("preview") ? "preview" : type}`);
    connectionLayerEl.appendChild(startDot);

    const endDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    endDot.setAttribute("cx", String(toPoint.x));
    endDot.setAttribute("cy", String(toPoint.y));
    endDot.setAttribute("r", type === "preview-target" ? "5.2" : "4");
    endDot.setAttribute("class", `connection-dot connection-dot--${type.startsWith("preview") ? "preview" : type}`);
    connectionLayerEl.appendChild(endDot);
  }

  function syncConnectionLayer() {
    connectionLayerEl.style.width = board.style.width;
    connectionLayerEl.style.height = board.style.height;
    connectionLayerEl.style.transform = board.style.transform;
    connectionLayerEl.setAttribute("viewBox", `0 0 ${canvasWidth} ${canvasHeight}`);
  }

  async function handleGeneratePlan() {
    const brief = project.aiBrief?.trim();
    if (!brief) {
      aiBriefInputEl.focus();
      setStatus("브리프를 먼저 입력해 주세요.", "warning");
      return;
    }

    setGeneratingState(true);
    pushHistoryState();
    setStatus("브리프를 분석해 컷 구조 초안을 설계하고 있습니다.");

    try {
      const payload = {
        brief,
        project: cloneProject(),
        existingPanelCount: panels.length,
        referenceWeight: Number.parseFloat(sanitizeReferenceWeight(project.referenceWeight)),
        referenceImageCount: aiReferenceImages.length,
        referenceImages: aiReferenceImages.map((image) => ({
          name: image.name,
          mimeType: image.mimeType,
          dataUrl: image.dataUrl,
          width: image.width,
          height: image.height
        }))
      };
      let plan = null;
      let source = "local";

      const aiClient = window.ShonodeAI || window.ShotBoardAI;
      if (aiClient && typeof aiClient.generateStoryboard === "function") {
        try {
          plan = await aiClient.generateStoryboard(payload);
          if (plan) {
            source = "api";
          }
        } catch (error) {
          console.warn("ShonodeAI.generateStoryboard failed, using local fallback.", error);
        }
      }

      if (!plan) {
        plan = buildLocalStoryboardPlan(payload);
        setStatus("모델 연결에 실패해 로컬 연출 초안으로 대체했습니다.", "warning");
      }

      applyStoryboardPlan(normalizePlan(plan, payload), source);
    } finally {
      setGeneratingState(false);
    }
  }

  function getGeneratingStages() {
    if (aiReferenceImages.length > 0) {
      return [
        {
          title: "레퍼런스 해석 중",
          hint: "업로드한 이미지에서 유지할 정체성과 변주 가능한 요소를 구분하고 있습니다."
        },
        {
          title: "장면 구조 정리 중",
          hint: "레퍼런스를 바탕으로 컷 역할과 시각 기준을 정리하고 있습니다."
        },
        {
          title: "실행 프롬프트 연결 중",
          hint: "키비주얼과 콘티가 이미지 생성, 영상 생성으로 자연스럽게 이어지도록 맞추고 있습니다."
        },
        {
          title: "보드 반영 준비 중",
          hint: "생성된 컷과 프롬프트를 카드에 정리하고 있습니다."
        }
      ];
    }

    return [
      {
        title: "브리프 해석 중",
        hint: "러닝타임과 장면 분위기를 읽어 핵심 컷 수를 계산하고 있습니다."
      },
      {
        title: "컷 구조 설계 중",
        hint: "훅부터 엔드 프레임까지 이어지는 장면 순서를 정리하고 있습니다."
      },
      {
        title: "실행 프롬프트 정리 중",
        hint: "I2T, T2I, I2V에 들어갈 프롬프트를 제작 흐름에 맞게 정리하고 있습니다."
      },
      {
        title: "보드 반영 준비 중",
        hint: "생성된 카드 위치와 우측 아웃풋 패널을 함께 정리하고 있습니다."
      }
    ];
  }

  function renderGeneratingStage(index = 0) {
    const stages = getGeneratingStages();
    const safeStage = stages[index % stages.length];
    if (aiGenerationStageEl) {
      aiGenerationStageEl.textContent = safeStage.title;
    }
    if (aiGenerationHintEl) {
      aiGenerationHintEl.textContent = safeStage.hint;
    }
    if (aiPlanMetaEl) {
      aiPlanMetaEl.textContent = `${safeStage.title}...`;
    }
  }

  function setGeneratingState(nextState) {
    aiGenerating = nextState;
    generatePlanButtonEl.disabled = nextState;
    generatePlanButtonLabelEl.textContent = nextState ? "구조 설계 중..." : "연출 보드 초안 생성";
    generatePlanButtonEl.classList.toggle("is-generating", nextState);
    generatePlanButtonEl.setAttribute("aria-busy", String(nextState));
    if (aiGenerationIndicatorEl) {
      aiGenerationIndicatorEl.hidden = !nextState;
    }
    aiPlanMetaEl.classList.toggle("is-generating", nextState);
    aiSidebarCardEl?.classList.toggle("is-generating", nextState);
    workspaceStageEl?.classList.toggle("is-generating", nextState);

    if (nextState) {
      aiGenerationStageIndex = 0;
      renderGeneratingStage(aiGenerationStageIndex);
      window.clearInterval(aiGenerationIntervalId);
      aiGenerationIntervalId = window.setInterval(() => {
        aiGenerationStageIndex = (aiGenerationStageIndex + 1) % getGeneratingStages().length;
        renderGeneratingStage(aiGenerationStageIndex);
      }, 1150);
      return;
    }

    window.clearInterval(aiGenerationIntervalId);
    aiGenerationIntervalId = null;
    renderAiOutputs();
  }

  function normalizePlan(rawPlan, payload) {
    const rawCuts = Array.isArray(rawPlan?.cuts) ? rawPlan.cuts : [];
    const cuts = rawCuts.length > 0 ? rawCuts : buildLocalStoryboardPlan(payload).cuts;
    const projectDraft = normalizeProjectDraft(rawPlan?.projectDraft, payload, cuts);
    return {
      summary: typeof rawPlan?.summary === "string" && rawPlan.summary.trim()
        ? rawPlan.summary.trim()
        : "브리프를 기반으로 컷 흐름과 실행 프롬프트 초안을 정리했습니다.",
      previewVideoUrl: typeof rawPlan?.previewVideoUrl === "string" ? rawPlan.previewVideoUrl : "",
      previewPosterUrl: typeof rawPlan?.previewPosterUrl === "string" ? rawPlan.previewPosterUrl : "",
      projectDraft,
      cuts: cuts.map((cut, index) => {
        const promptState = resolveCutImagePrompt(cut);
        return {
          sceneTitle: typeof cut.sceneTitle === "string" ? cut.sceneTitle : `${index + 1}. 컷`,
          durationLabel: typeof cut.durationLabel === "string" ? cut.durationLabel : "",
          caption: withDurationInCaption(
            typeof cut.caption === "string" ? cut.caption : "",
            typeof cut.durationLabel === "string" ? cut.durationLabel : ""
          ),
          i2tPrompt: typeof cut.i2tPrompt === "string"
            ? cut.i2tPrompt
            : buildI2TPrompt(
              typeof cut.sceneTitle === "string" ? cut.sceneTitle : `${index + 1}. 컷`,
              typeof cut.caption === "string" ? cut.caption : ""
            ),
          referenceImageIndexes: promptState.referenceImageIndexes,
          referenceImageIndex: promptState.referenceImageIndexes[0] ?? -1,
          imagePromptMode: promptState.imagePromptMode,
          i2iPrompt: promptState.i2iPrompt,
          t2iPrompt: promptState.t2iPrompt,
          i2vStartPrompt: typeof cut.i2vStartPrompt === "string" ? cut.i2vStartPrompt : "",
          i2vMotionPrompt: typeof cut.i2vMotionPrompt === "string" ? cut.i2vMotionPrompt : "",
          i2vEndPrompt: typeof cut.i2vEndPrompt === "string" ? cut.i2vEndPrompt : ""
        };
      })
    };
  }

  function normalizeProjectDraft(rawProjectDraft, payload, cuts) {
    const fallback = buildProjectDraft(payload, extractDuration(payload?.brief || ""), cuts);
    const source = rawProjectDraft && typeof rawProjectDraft === "object" ? rawProjectDraft : {};

    return {
      title: typeof source.title === "string" && source.title.trim() ? source.title.trim() : fallback.title,
      sequence: typeof source.sequence === "string" && source.sequence.trim() ? source.sequence.trim() : fallback.sequence,
      runtime: typeof source.runtime === "string" && source.runtime.trim() ? source.runtime.trim() : fallback.runtime,
      tone: typeof source.tone === "string" && source.tone.trim() ? source.tone.trim() : fallback.tone,
      logline: typeof source.logline === "string" && source.logline.trim() ? source.logline.trim() : fallback.logline,
      notes: typeof source.notes === "string" && source.notes.trim() ? source.notes.trim() : fallback.notes
    };
  }

  function buildProjectDraft(payload, duration, cuts = []) {
    const brief = payload?.brief?.trim() || "";
    const title = deriveProjectTitle(brief);
    const runtimeText = duration.min === duration.max ? `${duration.min}초` : `${duration.min}~${duration.max}초`;
    const tone = brief.includes("차갑")
      ? "고급스럽고 차가운 패션 광고 톤"
      : brief.includes("따뜻")
        ? "따뜻하고 서정적인 영상 톤"
        : "브랜드 무드가 또렷한 시네마틱 광고 톤";
    const cutCount = cuts.length > 0 ? cuts.length : Number(payload?.existingPanelCount) || 6;

    return {
      title,
      sequence: "Scene 01",
      runtime: runtimeText,
      tone,
      logline: `${runtimeText} 안에 브랜드의 태도와 감도를 또렷하게 보여주는 ${cutCount}컷 연출 보드.`,
      notes: `${cutCount}컷 기준으로 훅, 디테일, 움직임, 엔드 프레임 순서로 구성합니다. 각 컷의 목적이 분명하게 보이도록 장면 전환을 설계하고, 카메라는 절제된 이동을 유지하며, 색감은 브랜드 무드에 맞춰 정리합니다.`
    };
  }

  function deriveProjectTitle(brief) {
    if (!brief) {
      return "콘티 설계 프로젝트";
    }

    if (brief.includes("승마") && brief.includes("패션")) {
      return "승마 패션 브랜드 광고";
    }

    if (brief.includes("브랜드") && brief.includes("광고")) {
      return "브랜드 광고 콘티";
    }

    return brief.length > 20 ? `${brief.slice(0, 20)}…` : brief;
  }

  function withDurationInCaption(caption, durationLabel) {
    const safeCaption = typeof caption === "string" ? caption.trim() : "";
    const safeDuration = typeof durationLabel === "string" ? durationLabel.trim() : "";

    if (!safeDuration) {
      return safeCaption;
    }

    if (safeCaption.includes(safeDuration) || safeCaption.includes("분량")) {
      return safeCaption;
    }

    return `${safeDuration} 분량. ${safeCaption}`.trim();
  }

  function applyStoryboardPlan(plan, source) {
    const nextPanels = plan.cuts.map((cut, index) => {
      const position = getGeneratedPosition(index);
      const existing = panels[index];
      return createEmptyPanel({
        id: existing?.id || createId(),
        x: position.x,
        y: position.y,
        z: index + 1,
        image: existing?.image || "",
        fileName: existing?.fileName || "",
        viewMode: existing?.image ? "i2t" : "t2i",
        i2tCollapsed: true,
        t2iCollapsed: true,
        i2vCollapsed: true,
        sceneTitle: cut.sceneTitle,
        durationLabel: cut.durationLabel,
        caption: cut.caption,
        i2tPrompt: cut.i2tPrompt,
        t2iPrompt: cut.t2iPrompt,
        i2vStartPrompt: cut.i2vStartPrompt,
        i2vMotionPrompt: cut.i2vMotionPrompt,
        i2vEndPrompt: cut.i2vEndPrompt,
        nextPanelIds: []
      });
    });

    for (let index = 0; index < nextPanels.length - 1; index += 1) {
      nextPanels[index].nextPanelIds = [nextPanels[index + 1].id];
    }

    panels = nextPanels.map((panel, index) => normalizePanel(panel, index));
    project = normalizeProject({
      ...project,
      title: plan.projectDraft.title || project.title,
      sequence: plan.projectDraft.sequence || project.sequence,
      runtime: plan.projectDraft.runtime || project.runtime,
      tone: plan.projectDraft.tone || project.tone,
      logline: plan.projectDraft.logline || project.logline,
      notes: plan.projectDraft.notes || project.notes,
      aiSummary: plan.summary,
      previewVideoUrl: plan.previewVideoUrl || project.previewVideoUrl,
      previewPosterUrl: plan.previewPosterUrl || project.previewPosterUrl
    });
    selectedPanelIds = new Set(nextPanels.length > 0 ? [nextPanels[0].id] : []);
    persistPanels();
    persistProject();
    renderProjectSidebar();
    setSidebarSections("right", plan.previewVideoUrl ? ["video", "output"] : ["output"], false);
    renderPanels({ restoreView: true });
    setStatus(source === "api" ? "모델 응답으로 연출 보드 초안을 반영했습니다." : "로컬 초안으로 연출 보드를 구성했습니다.");
  }

  function getGeneratedPosition(index) {
    return {
      x: PANEL_MARGIN + index * 392,
      y: PANEL_SAFE_TOP + 20
    };
  }

  function buildLocalStoryboardPlan(payload) {
    const duration = extractDuration(payload.brief);
    const average = Math.round((duration.min + duration.max) / 2);
    const cutCount = average <= 20 ? 5 : average <= 30 ? 6 : 8;
    const subject = payload.brief.split(/[.!?]/)[0].trim() || "premium equestrian fashion commercial";
    const mood = payload.brief.includes("차갑") ? "cool toned, refined, controlled" : "premium, elegant, cinematic";
    const secondsPerCut = Math.max(2, (average / cutCount).toFixed(1));
    const names = ["브랜드 훅", "룩 디테일", "주인공 등장", "움직임 강조", "브랜드 아이콘", "엔드 프레임", "보조 컷", "보조 엔드"];

    return {
      summary: `총 ${cutCount}컷 구성이 적당합니다. ${duration.min}초~${duration.max}초 안에서 컷당 약 ${secondsPerCut}초로 운영하면 훅, 디테일, 움직임, 엔드 프레임까지 자연스럽게 이어집니다.`,
      projectDraft: buildProjectDraft(payload, duration),
      cuts: Array.from({ length: cutCount }, (_, index) => ({
        sceneTitle: `${index + 1}. ${names[index] || `컷 ${index + 1}`}`,
        durationLabel: `약 ${secondsPerCut}초`,
        caption: `약 ${secondsPerCut}초 분량. ${names[index] || `컷 ${index + 1}`}의 역할을 맡는 장면으로 ${subject}의 무드와 브랜드 태도를 또렷하게 보여준다.`,
        i2tPrompt: buildI2TPrompt(`${index + 1}. ${names[index] || `컷 ${index + 1}`}`, `${subject}, ${names[index] || `shot ${index + 1}`}, ${mood}`),
        t2iPrompt: `${subject}, ${names[index] || `shot ${index + 1}`}, premium Korean equestrian fashion commercial still, ${mood}, editorial luxury campaign image, detailed fabric texture, cinematic composition, no text, no watermark`,
        i2vStartPrompt: `${subject}, ${names[index] || `shot ${index + 1}`}, start frame, ${mood}, polished fashion-commercial frame`,
        i2vMotionPrompt: `controlled camera motion, elegant pacing, preserve anatomy and costume detail, premium commercial rhythm`,
        i2vEndPrompt: `${subject}, ${names[index] || `shot ${index + 1}`}, end frame, refined premium ad finish`
      }))
    };
  }

  function extractDuration(brief) {
    const rangeMatch = brief.match(/(\d{1,3})\s*초\s*[~\-]\s*(\d{1,3})\s*초/);
    if (rangeMatch) {
      return { min: Number(rangeMatch[1]), max: Number(rangeMatch[2]) };
    }

    const exactMatch = brief.match(/(\d{1,3})\s*초/);
    if (exactMatch) {
      const seconds = Number(exactMatch[1]);
      return { min: seconds, max: seconds };
    }

    return { min: 15, max: 30 };
  }

  function buildI2TPrompt(sceneTitle, contextText) {
    const scene = typeof sceneTitle === "string" && sceneTitle.trim() ? sceneTitle.trim() : "shot";
    const context = typeof contextText === "string" && contextText.trim()
      ? contextText.trim()
      : "premium commercial redesign";

    return `Analyze the provided reference image for ${scene}. Extract the core subject, silhouette, styling anchors, composition, emotional tone, and brand-signature details. Keep what should remain recognizable, clearly note what should be redesigned, and rewrite the frame as a premium commercial still direction. Output should support a redesign flow from existing image to T2I and then I2V. Context: ${context}`;
  }

  function renderSelectionDetail() {
    selectionDetailOutputEl.innerHTML = "";
    const selectedPanels = panels.filter((panel) => selectedPanelIds.has(panel.id));
    renderPromptPipeline(selectedPanels);

    if (selectedPanels.length === 0) {
      selectionDetailOutputEl.textContent = "카드를 선택하면 연결 정보와 프롬프트 요약이 표시됩니다.";
      return;
    }

    if (selectedPanels.length > 1) {
      selectionDetailOutputEl.textContent = `${selectedPanels.length}개의 컷이 선택되었습니다. 여러 컷의 흐름을 비교하거나 복제/삭제를 진행할 수 있습니다.`;
      return;
    }

    const panel = selectedPanels[0];
    const linkedIdentityPacks = getPanelIdentityPacks(panel);
    const availableIdentityPacks = getIdentityPacks();
    const detail = document.createElement("article");
    detail.className = "selection-detail-card";
    detail.innerHTML = `
      <strong>${escapeHtml(panel.sceneTitle || "선택된 컷")}</strong>
      <p class="selection-detail-copy">${escapeHtml(panel.caption || "설명 없음")}</p>
      <p class="selection-detail-copy">${escapeHtml([
        getReferenceSummaryText(panel),
        panel.t2iPrompt ? `${getPromptDisplayLabel(panel)} ${panel.t2iPrompt.length}자` : `${getPromptDisplayLabel(panel)} 비어 있음`,
        panel.i2vStartPrompt || panel.i2vMotionPrompt || panel.i2vEndPrompt ? "I2V 준비됨" : "I2V 비어 있음"
      ].join(" · "))}</p>
    `;

    const identitySection = document.createElement("section");
    identitySection.className = "selection-identity-section";
    identitySection.innerHTML = `
      <h3 class="selection-identity-heading">연결된 Identity Pack</h3>
      <p class="selection-identity-copy">이 컷에서 꼭 유지되어야 하는 인물, 제품, 의상, 소재 시트를 연결하세요.</p>
    `;

    const linkedChipList = document.createElement("div");
    linkedChipList.className = "selection-identity-chip-list";
    renderIdentityPackChipList(linkedChipList, linkedIdentityPacks);
    if (linkedIdentityPacks.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "selection-identity-empty";
      emptyState.textContent = "아직 연결된 팩이 없습니다. 아래 체크박스로 이 컷에 필요한 시트를 붙여주세요.";
      identitySection.appendChild(emptyState);
    } else {
      identitySection.appendChild(linkedChipList);
    }

    if (availableIdentityPacks.length > 0) {
      const toggleList = document.createElement("div");
      toggleList.className = "selection-pack-toggle-list";
      availableIdentityPacks.forEach((pack) => {
        const option = document.createElement("label");
        option.className = "selection-pack-toggle";
        const referenceImages = getIdentityPackReferenceImages(pack);
        const noteParts = [
          pack.notes ? compactPipelineText(pack.notes, 120) : "",
          referenceImages.length > 0
            ? referenceImages
              .map((image) => trimPipelineText(image?.name))
              .filter(Boolean)
              .slice(0, 3)
              .join(", ")
            : ""
        ].filter(Boolean);
        option.innerHTML = `
          <input
            type="checkbox"
            data-selection-pack-toggle="${escapeHtml(pack.id)}"
            ${linkedIdentityPacks.some((item) => item.id === pack.id) ? "checked" : ""}
          >
          <span class="selection-pack-toggle-copy">
            <span class="selection-pack-toggle-label">
              ${escapeHtml(pack.name)}
              <span class="identity-pack-chip__meta">${escapeHtml(buildIdentityPackBadgeLabel(pack))}</span>
            </span>
            ${noteParts.length > 0 ? `<span class="selection-pack-toggle-note">${escapeHtml(noteParts.join(" · "))}</span>` : ""}
          </span>
        `;
        toggleList.appendChild(option);
      });
      identitySection.appendChild(toggleList);
    }

    selectionDetailOutputEl.appendChild(detail);
    selectionDetailOutputEl.appendChild(identitySection);
  }

  function getGeneratingStages() {
    if (aiReferenceImages.length > 0) {
      return [
        {
          title: "레퍼런스 해석 중",
          hint: "업로드한 이미지에서 유지할 핵심 피사체와 무드를 정리하고 있습니다."
        },
        {
          title: "컷 기준 배치 중",
          hint: "어떤 컷에 어떤 레퍼런스를 묶어야 흐름이 선명한지 정리하고 있습니다."
        },
        {
          title: "실행 프롬프트 연결 중",
          hint: "레퍼런스를 바탕으로 이미지 생성과 영상 생성 문장을 정리하고 있습니다."
        },
        {
          title: "보드 반영 준비 중",
          hint: "생성된 컷과 프롬프트를 카드 형태로 정리하고 있습니다."
        }
      ];
    }

    return [
      {
        title: "브리프 해석 중",
        hint: "브랜드 무드와 장면 흐름을 읽고 적절한 컷 수를 계산하고 있습니다."
      },
      {
        title: "컷 구조 설계 중",
        hint: "도입부터 엔드 프레임까지 이어지는 장면 순서를 정리하고 있습니다."
      },
      {
        title: "실행 프롬프트 정리 중",
        hint: "컷별 프롬프트를 제작 흐름에 맞게 정리하고 있습니다."
      },
      {
        title: "보드 반영 준비 중",
        hint: "생성된 카드 위치와 프롬프트 요약을 정리하고 있습니다."
      }
    ];
  }

  function normalizePlan(rawPlan, payload) {
    const rawCuts = Array.isArray(rawPlan?.cuts) ? rawPlan.cuts : [];
    const cuts = rawCuts.length > 0 ? rawCuts : buildLocalStoryboardPlan(payload).cuts;
    const projectDraft = normalizeProjectDraft(rawPlan?.projectDraft, payload, cuts);

    return {
      summary: typeof rawPlan?.summary === "string" && rawPlan.summary.trim()
        ? rawPlan.summary.trim()
        : "브리프를 기반으로 컷 흐름과 실행 프롬프트 초안을 정리했습니다.",
      previewVideoUrl: typeof rawPlan?.previewVideoUrl === "string" ? rawPlan.previewVideoUrl : "",
      previewPosterUrl: typeof rawPlan?.previewPosterUrl === "string" ? rawPlan.previewPosterUrl : "",
      projectDraft,
      cuts: cuts.map((cut, index) => {
        const referenceImageIndexes = resolveCutReferenceIndexes(cut, Number(payload?.referenceImageCount) || 0, index);
        const promptState = resolveCutImagePrompt({
          ...cut,
          referenceImageIndexes,
          referenceImageIndex: referenceImageIndexes[0] ?? -1
        });

        return {
          sceneTitle: typeof cut.sceneTitle === "string" ? cut.sceneTitle : `${index + 1}. 컷`,
          durationLabel: typeof cut.durationLabel === "string" ? cut.durationLabel : "",
          caption: withDurationInCaption(
            typeof cut.caption === "string" ? cut.caption : "",
            typeof cut.durationLabel === "string" ? cut.durationLabel : ""
          ),
          referenceImageIndexes,
          referenceImageIndex: referenceImageIndexes[0] ?? -1,
          imagePromptMode: promptState.imagePromptMode,
          i2iPrompt: promptState.i2iPrompt,
          t2iPrompt: promptState.t2iPrompt,
          i2vStartPrompt: typeof cut.i2vStartPrompt === "string" ? cut.i2vStartPrompt : "",
          i2vMotionPrompt: typeof cut.i2vMotionPrompt === "string" ? cut.i2vMotionPrompt : "",
          i2vEndPrompt: typeof cut.i2vEndPrompt === "string" ? cut.i2vEndPrompt : ""
        };
      })
    };
  }

  function resolveReferenceAssignment(rawIndex, fallbackIndex = 0) {
    if (aiReferenceImages.length === 0) {
      return [];
    }

    const normalizedIndexes = normalizeReferenceIndexes(rawIndex)
      .filter((value) => value < aiReferenceImages.length);
    const referenceIndexes = normalizedIndexes.length > 0
      ? normalizedIndexes
      : buildReferenceIndexList(aiReferenceImages.length, fallbackIndex, aiReferenceImages.length > 1 ? 2 : 1);

    return referenceIndexes
      .map((referenceIndex) => {
        const image = aiReferenceImages[referenceIndex];
        return image
          ? {
              id: image.id,
              name: image.name || `reference-${referenceIndex + 1}`,
              index: referenceIndex
            }
          : null;
      })
      .filter(Boolean);

  }

  function applyStoryboardPlan(plan, source) {
    const nextPanels = plan.cuts.map((cut, index) => {
      const position = getGeneratedPosition(index);
      const existing = panels[index];
      const promptState = resolveCutImagePrompt(cut);
      const referenceAssignment = resolveReferenceAssignment(
        cut.referenceImageIndexes ?? cut.referenceImageIndex,
        index
      );

      return createEmptyPanel({
        id: existing?.id || createId(),
        x: position.x,
        y: position.y,
        z: index + 1,
        image: existing?.image || "",
        fileName: existing?.fileName || "",
        viewMode: "t2i",
        imagePromptMode: promptState.imagePromptMode,
        t2iCollapsed: false,
        i2vCollapsed: true,
        sceneTitle: cut.sceneTitle,
        durationLabel: cut.durationLabel,
        caption: cut.caption,
        referenceImageIds: referenceAssignment.map((item) => item.id),
        referenceImageNames: referenceAssignment.map((item) => item.name),
        referenceImageId: referenceAssignment[0]?.id || "",
        referenceImageName: referenceAssignment[0]?.name || "",
        t2iPrompt: promptState.imagePrompt,
        i2vStartPrompt: cut.i2vStartPrompt,
        i2vMotionPrompt: cut.i2vMotionPrompt,
        i2vEndPrompt: cut.i2vEndPrompt,
        nextPanelIds: []
      });
    });

    for (let index = 0; index < nextPanels.length - 1; index += 1) {
      nextPanels[index].nextPanelIds = [nextPanels[index + 1].id];
    }

    panels = nextPanels.map((panel, index) => normalizePanel(panel, index));
    project = normalizeProject({
      ...project,
      title: plan.projectDraft.title || project.title,
      sequence: plan.projectDraft.sequence || project.sequence,
      runtime: plan.projectDraft.runtime || project.runtime,
      tone: plan.projectDraft.tone || project.tone,
      logline: plan.projectDraft.logline || project.logline,
      notes: plan.projectDraft.notes || project.notes,
      aiSummary: plan.summary,
      previewVideoUrl: plan.previewVideoUrl || project.previewVideoUrl,
      previewPosterUrl: plan.previewPosterUrl || project.previewPosterUrl
    });
    selectedPanelIds = new Set(nextPanels.length > 0 ? [nextPanels[0].id] : []);
    persistPanels();
    persistProject();
    renderProjectSidebar();
    setSidebarSections("right", plan.previewVideoUrl ? ["video", "output"] : ["output"], false);
    renderPanels({ restoreView: true });
    setStatus(source === "api" ? "모델 응답으로 연출 보드 초안을 반영했습니다." : "로컬 초안으로 연출 보드를 구성했습니다.");
  }

  function buildLocalStoryboardPlan(payload) {
    const duration = extractDuration(payload.brief);
    const average = Math.round((duration.min + duration.max) / 2);
    const cutCount = average <= 20 ? 5 : average <= 30 ? 6 : 8;
    const subject = payload.brief.split(/[.!?]/)[0].trim() || "premium equestrian fashion commercial";
    const mood = payload.brief.includes("차갑")
      ? "cool toned, refined, controlled"
      : "premium, elegant, cinematic";
    const secondsPerCut = Math.max(2, (average / cutCount).toFixed(1));
    const names = ["브랜드 훅", "루트 샷", "주인공 등장", "디테일 강조", "브랜드 아이콘", "엔드 프레임", "보조 컷", "보조 무드"];
    const referenceCount = Number(payload?.referenceImageCount) || 0;

    return {
      summary: `총 ${cutCount}컷 구성이 적당합니다. ${duration.min}초~${duration.max}초 안에서 컷당 약 ${secondsPerCut}초로 운영하면 브랜드 무드와 엔드 프레임까지 자연스럽게 이어집니다.`,
      projectDraft: buildProjectDraft(payload, duration),
      cuts: Array.from({ length: cutCount }, (_, index) => {
        const referenceImageIndexes = buildReferenceIndexList(referenceCount, index, referenceCount > 2 ? 3 : 2);
        const imagePromptMode = referenceImageIndexes.length > 0 ? "i2i" : "t2i";
        const basePrompt = `${subject}, ${names[index] || `shot ${index + 1}`}, premium Korean commercial still, ${mood}`;

        return {
          sceneTitle: `${index + 1}. ${names[index] || `컷 ${index + 1}`}`,
          durationLabel: `약 ${secondsPerCut}초`,
          caption: `약 ${secondsPerCut}초 분량. ${names[index] || `컷 ${index + 1}`}에서 ${subject}의 무드와 브랜드 톤을 또렷하게 보여줍니다.`,
          referenceImageIndexes,
          referenceImageIndex: referenceImageIndexes[0] ?? -1,
          imagePromptMode,
          i2iPrompt: imagePromptMode === "i2i"
            ? `${basePrompt}, transform and combine the assigned reference images into a newly designed advertising frame, preserve the strongest subject, styling, and mood anchors without recreating the source frame literally, premium art direction, no text, no watermark`
            : "",
          t2iPrompt: imagePromptMode === "t2i"
            ? `${basePrompt}, original text-to-image concept, premium advertising photography, elegant composition, no text, no watermark`
            : "",
          i2vStartPrompt: `${basePrompt}, start frame, derived from the redesigned still, continuity-ready commercial opening frame`,
          i2vMotionPrompt: `controlled camera motion, premium editorial pacing, preserve continuity from the redesigned still while smoothly bridging into the next shot`,
          i2vEndPrompt: `${basePrompt}, end frame, refined brand-commercial finish`
        };
      })
    };
  }

  function renderAiReferenceImages() {
    if (!aiReferenceListEl || !aiReferenceCountEl) {
      return;
    }

    aiReferenceCountEl.textContent = `${aiReferenceImages.length} / ${AI_REFERENCE_IMAGE_LIMIT}`;
    aiReferenceListEl.innerHTML = "";
    aiReferenceListEl.hidden = aiReferenceImages.length === 0;

    aiReferenceImages.forEach((image, imageIndex) => {
      const item = document.createElement("article");
      item.className = "ai-reference-item";
      item.innerHTML = `
        <img class="ai-reference-thumb" src="${escapeHtml(image.dataUrl)}" alt="${escapeHtml(image.name || "첨부 이미지")}">
        <button class="ai-reference-remove" type="button" data-reference-remove="${escapeHtml(image.id)}" aria-label="첨부 이미지 삭제" title="첨부 이미지 삭제">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6L18 18M18 6L6 18"></path>
          </svg>
        </button>
        <div class="ai-reference-meta">
          <strong class="ai-reference-name">${escapeHtml(image.name || "reference.jpg")}</strong>
          <span class="ai-reference-size">${escapeHtml(`${image.width}×${image.height}`)}</span>
        </div>
      `;
      aiReferenceListEl.appendChild(item);
    });
  }

  async function processAiReferenceFile(file) {
    const dataUrl = await readFileAsDataUrl(file);
    const image = await loadImageElement(dataUrl);
    const maxSize = 640;
    const ratio = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * ratio));
    const height = Math.max(1, Math.round(image.naturalHeight * ratio));
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      return null;
    }

    canvas.width = width;
    canvas.height = height;
    context.drawImage(image, 0, 0, width, height);

    const sampleSize = 18;
    const sampleCanvas = document.createElement("canvas");
    const sampleContext = sampleCanvas.getContext("2d");
    let accentRgb = "37 99 235";

    if (sampleContext) {
      sampleCanvas.width = sampleSize;
      sampleCanvas.height = sampleSize;
      sampleContext.drawImage(image, 0, 0, sampleSize, sampleSize);
      const pixelData = sampleContext.getImageData(0, 0, sampleSize, sampleSize).data;
      let redTotal = 0;
      let greenTotal = 0;
      let blueTotal = 0;
      let visiblePixels = 0;

      for (let index = 0; index < pixelData.length; index += 4) {
        const alpha = pixelData[index + 3];
        if (alpha < 12) {
          continue;
        }
        redTotal += pixelData[index];
        greenTotal += pixelData[index + 1];
        blueTotal += pixelData[index + 2];
        visiblePixels += 1;
      }

      if (visiblePixels > 0) {
        accentRgb = `${Math.round(redTotal / visiblePixels)} ${Math.round(greenTotal / visiblePixels)} ${Math.round(blueTotal / visiblePixels)}`;
      }
    }

    return {
      id: createId(),
      name: file.name,
      mimeType: "image/jpeg",
      width,
      height,
      accentRgb,
      dataUrl: canvas.toDataURL("image/jpeg", 0.74)
    };
  }

  async function persistAiReferenceImages() {
    try {
      await saveAiReferenceImagesToIndexedDb(aiReferenceImages);
      try {
        window.sessionStorage.removeItem(AI_REFERENCE_IMAGES_STORAGE_KEY);
      } catch {}
      return true;
    } catch {
      setStatus("첨부 이미지를 저장하지 못했습니다. 브라우저 저장 공간을 확인해주세요.", "warning");
      return false;
    }
  }

  function getAiReferenceThumbSize(count) {
    if (count <= 1) {
      return 116;
    }
    if (count <= 2) {
      return 98;
    }
    if (count <= 4) {
      return 78;
    }
    if (count <= 6) {
      return 64;
    }
    return 46;
  }

  function openReferenceLightbox(referenceImage, title = "") {
    if (!referenceLightboxEl || !referenceLightboxImageEl) {
      return;
    }

    const imageTitle = title || referenceImage?.name || "첨부 이미지";
    referenceLightboxTitleEl.textContent = imageTitle;
    referenceLightboxImageEl.src = referenceImage?.dataUrl || "";
    referenceLightboxImageEl.alt = imageTitle;
    if (referenceLightboxMetaEl) {
      referenceLightboxMetaEl.textContent = referenceImage
        ? [referenceImage.name, `${referenceImage.width} x ${referenceImage.height}`].filter(Boolean).join(" · ")
        : "";
    }
    referenceLightboxEl.hidden = false;
    referenceLightboxEl.setAttribute("aria-hidden", "false");
    window.setTimeout(() => {
      referenceLightboxCloseEl?.focus();
    }, 0);
  }

  function closeReferenceLightbox() {
    if (!referenceLightboxEl) {
      return;
    }

    referenceLightboxEl.hidden = true;
    referenceLightboxEl.setAttribute("aria-hidden", "true");
    if (referenceLightboxImageEl) {
      referenceLightboxImageEl.removeAttribute("src");
      referenceLightboxImageEl.alt = "";
    }
    if (referenceLightboxMetaEl) {
      referenceLightboxMetaEl.textContent = "";
    }
  }

  function renderAiReferenceImages() {
    if (!aiReferenceCountEl || !aiReferenceDropzoneEl) {
      return;
    }

    const count = aiReferenceImages.length;
    const usageMap = getReferenceUsageMap();
    aiReferenceCountEl.textContent = `${count} / ${AI_REFERENCE_IMAGE_LIMIT}`;

    if (aiReferenceListEl) {
      aiReferenceListEl.innerHTML = "";
      aiReferenceListEl.hidden = true;
    }

    if (!aiReferenceInlineGridEl) {
      aiReferenceDropzoneEl.classList.toggle("has-images", false);
      return;
    }

    aiReferenceInlineGridEl.innerHTML = "";
    aiReferenceInlineGridEl.hidden = count === 0;
    aiReferenceDropzoneEl.classList.toggle("has-images", count > 0);
    aiReferenceDropzoneEl.style.setProperty("--reference-thumb-size", `${getAiReferenceThumbSize(count)}px`);

    aiReferenceImages.forEach((image) => {
      const item = document.createElement("article");
      item.className = "ai-reference-inline-item";
      item.title = image.name || "reference image";
      item.dataset.referencePreview = image.id;
      item.setAttribute("role", "button");
      item.setAttribute("tabindex", "0");
      item.setAttribute("aria-label", `${image.name || "첨부 이미지"} 확대 보기`);
      item.innerHTML = `
        <img class="ai-reference-inline-thumb" src="${escapeHtml(image.dataUrl)}" alt="${escapeHtml(image.name || "첨부 이미지")}">
        <button class="ai-reference-inline-remove" type="button" data-reference-remove="${escapeHtml(image.id)}" aria-label="첨부 이미지 삭제" title="첨부 이미지 삭제">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6L18 18M18 6L6 18"></path>
          </svg>
        </button>
      `;
      aiReferenceInlineGridEl.appendChild(item);
    });

    renderIdentityPackList();
  }

  function renderAiReferenceImages() {
    if (!aiReferenceCountEl || !aiReferenceDropzoneEl) {
      return;
    }

    const count = aiReferenceImages.length;
    const usageMap = getReferenceUsageMap();
    aiReferenceCountEl.textContent = `${count} / ${AI_REFERENCE_IMAGE_LIMIT}`;

    if (aiReferenceListEl) {
      aiReferenceListEl.innerHTML = "";
      aiReferenceListEl.hidden = true;
    }

    if (!aiReferenceInlineGridEl) {
      aiReferenceDropzoneEl.classList.toggle("has-images", false);
      return;
    }

    aiReferenceInlineGridEl.innerHTML = "";
    aiReferenceInlineGridEl.hidden = count === 0;
    aiReferenceDropzoneEl.classList.toggle("has-images", count > 0);
    aiReferenceDropzoneEl.style.setProperty("--reference-thumb-size", `${getAiReferenceThumbSize(count)}px`);

    aiReferenceImages.forEach((image, imageIndex) => {
      const orderLabel = String(imageIndex + 1).padStart(2, "0");
      const usageLabels = usageMap.get(image.id) ?? [];
      const visibleUsageLabels = usageLabels.slice(0, 2);
      const extraUsageCount = Math.max(0, usageLabels.length - visibleUsageLabels.length);
      const item = document.createElement("article");
      item.className = "ai-reference-inline-item";
      item.title = image.name || "reference image";
      item.dataset.referencePreview = image.id;
      item.setAttribute("role", "button");
      item.setAttribute("tabindex", "0");
      item.setAttribute("aria-label", `${image.name || "첨부 이미지"} 확대 보기`);
      item.style.setProperty("--reference-accent-rgb", image.accentRgb || "37 99 235");
      item.innerHTML = `
        <span class="ai-reference-inline-order">${orderLabel}</span>
        <div class="ai-reference-inline-photo">
          <img class="ai-reference-inline-thumb" src="${escapeHtml(image.dataUrl)}" alt="${escapeHtml(image.name || "첨부 이미지")}">
        </div>
        <button class="ai-reference-inline-remove" type="button" data-reference-remove="${escapeHtml(image.id)}" aria-label="첨부 이미지 삭제" title="첨부 이미지 삭제">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6L18 18M18 6L6 18"></path>
          </svg>
        </button>
        <div class="ai-reference-inline-footer">
          <span class="ai-reference-inline-ref">REF ${orderLabel}</span>
          <div class="ai-reference-inline-scenes">
            ${visibleUsageLabels.map((label) => `<span class="ai-reference-inline-scene-tag">${escapeHtml(label)}</span>`).join("")}
            ${extraUsageCount > 0 ? `<span class="ai-reference-inline-scene-tag">+${extraUsageCount}</span>` : ""}
          </div>
        </div>
      `;
      aiReferenceInlineGridEl.appendChild(item);
    });
  }

  function renderAiOutputs() {
    aiCutCountOutputEl.textContent = panels.length > 0 ? String(panels.length) : "-";

    if (project.aiBrief?.trim()) {
      const referenceMeta = aiReferenceImages.length > 0
        ? ` · 첨부 이미지 ${aiReferenceImages.length}장 · iw ${sanitizeReferenceWeight(project.referenceWeight)}`
        : "";
      aiPlanMetaEl.textContent = `${project.aiModel || "Gemini 2.5 Flash"} 기준 연출 초안 준비 완료${referenceMeta}`;
    } else {
      aiPlanMetaEl.textContent = "브리프와 첨부 이미지를 넣으면 장면 흐름, 컷 구조, 프롬프트 베이스가 카드로 펼쳐집니다.";
    }

    aiSummaryOutputEl.textContent = project.aiSummary?.trim()
      ? project.aiSummary
      : "브리프를 넣고 구조를 만들면 전체 연출 방향과 컷 흐름이 여기에 정리됩니다.";

    aiSequenceOutputEl.innerHTML = "";
    panels.forEach((panel, index) => {
      const item = document.createElement("article");
      item.className = "sequence-item";
      item.innerHTML = `
        <span class="sequence-index">${index + 1}</span>
        <div>
          <strong>${escapeHtml(panel.sceneTitle || `컷 ${index + 1}`)}</strong>
          <p>${escapeHtml(composeSequenceText(panel))}</p>
        </div>
      `;
      aiSequenceOutputEl.appendChild(item);
    });

    if (panels.length === 0) {
      const emptyItem = document.createElement("article");
      emptyItem.className = "sequence-item sequence-item--empty";
      emptyItem.innerHTML = `
        <span class="sequence-index">+</span>
        <div>
          <strong>아직 설계된 컷이 없습니다</strong>
          <p>브리프와 첨부 이미지를 넣고 연출 보드 초안 생성을 눌러주세요.</p>
        </div>
      `;
      aiSequenceOutputEl.appendChild(emptyItem);
    }

    renderPromptPipeline();
  }

  function renderIdentityPackChipList(container, identityPacks) {
    if (!container) {
      return;
    }

    const packs = Array.isArray(identityPacks) ? identityPacks.filter(Boolean) : [];
    container.innerHTML = "";
    container.hidden = packs.length === 0;

    packs.forEach((pack) => {
      const chip = document.createElement("span");
      chip.className = "identity-pack-chip";
      chip.innerHTML = `
        <span>${escapeHtml(pack.name || "Identity Pack")}</span>
        <span class="identity-pack-chip__meta">${escapeHtml(buildIdentityPackBadgeLabel(pack))}</span>
      `;
      container.appendChild(chip);
    });
  }

  function updateIdentityPacks(identityPacks, options = {}) {
    const {
      renderList = true,
      renderPanels: shouldRenderPanels = true,
      announceText = ""
    } = options;
    const nextIdentityPacks = normalizeIdentityPacks(identityPacks);
    updateProject({ identityPacks: nextIdentityPacks }, { announce: false });

    if (renderList) {
      renderIdentityPackList();
    }
    if (shouldRenderPanels) {
      renderPanels();
    } else {
      renderAiOutputs();
    }
    if (announceText) {
      setStatus(announceText);
    }
  }

  function createIdentityPackDraft() {
    const packs = getIdentityPacks();
    const nextIndex = packs.length + 1;
    const firstUnusedReference = aiReferenceImages.find((image) => {
      return !packs.some((pack) => normalizeReferenceImageIds(pack.referenceImageIds).includes(image.id));
    });

    return normalizeIdentityPack({
      name: firstUnusedReference?.name?.replace(/\.[a-z0-9]+$/i, "") || `Identity Pack ${nextIndex}`,
      entityType: "character",
      componentType: "base",
      notes: "",
      referenceImageIds: firstUnusedReference ? [firstUnusedReference.id] : []
    }, packs.length);
  }

  function renderIdentityPackList() {
    if (!identityPackListEl) {
      return;
    }

    const identityPacks = getIdentityPacks();
    const selectedPanels = getPipelineSelectedPanels();

    if (identityPacks.length === 0) {
      identityPackListEl.innerHTML = `
        <div class="identity-pack-empty">
          아직 Identity Pack이 없습니다. 먼저 레퍼런스를 올리고, 인물 기본 시트나 제품 디테일 시트처럼 의미 단위로 팩을 만들어보세요.
        </div>
      `;
      return;
    }

    identityPackListEl.innerHTML = "";
    identityPacks.forEach((pack) => {
      const usageCount = getIdentityPackUsageCount(pack.id);
      const selectedPanelsConnected = selectedPanels.length > 0
        && selectedPanels.every((panel) => getPanelIdentityPackIds(panel).includes(pack.id));
      const article = document.createElement("article");
      article.className = "identity-pack-card";
      article.dataset.packId = pack.id;
      article.innerHTML = `
        <div class="identity-pack-card-header">
          <div>
            <span class="identity-pack-badge">${escapeHtml(buildIdentityPackBadgeLabel(pack))}</span>
            <span class="identity-pack-usage">${usageCount}컷 연결</span>
          </div>
          <div class="identity-pack-action-row">
            <button
              class="ghost-button identity-pack-select-button"
              type="button"
              data-pack-action="toggle-selection"
              data-pack-id="${escapeHtml(pack.id)}"
              ${selectedPanels.length === 0 ? "disabled" : ""}
            >${selectedPanelsConnected ? "선택 컷 해제" : "선택 컷 연결"}</button>
            <button
              class="ghost-button identity-pack-delete-button"
              type="button"
              data-pack-action="delete"
              data-pack-id="${escapeHtml(pack.id)}"
            >삭제</button>
          </div>
        </div>
        <label class="sidebar-field">
          <span class="sidebar-label">팩 이름</span>
          <input class="sidebar-input" type="text" data-pack-field="name" data-pack-id="${escapeHtml(pack.id)}">
        </label>
        <div class="identity-pack-field-grid">
          <label class="sidebar-field">
            <span class="sidebar-label">주체</span>
            <select class="sidebar-input" data-pack-field="entityType" data-pack-id="${escapeHtml(pack.id)}">
              <option value="character">Character</option>
              <option value="product">Product</option>
              <option value="prop">Prop</option>
              <option value="space">Space</option>
            </select>
          </label>
          <label class="sidebar-field">
            <span class="sidebar-label">구성요소</span>
            <select class="sidebar-input" data-pack-field="componentType" data-pack-id="${escapeHtml(pack.id)}">
              <option value="base">Base</option>
              <option value="outfit">Outfit</option>
              <option value="accessory">Accessory</option>
              <option value="expression">Expression</option>
              <option value="pose">Pose</option>
              <option value="material">Material</option>
            </select>
          </label>
        </div>
        <label class="sidebar-field">
          <span class="sidebar-label">연출 메모</span>
          <textarea
            class="sidebar-input sidebar-textarea identity-pack-note-input"
            rows="3"
            data-pack-field="notes"
            data-pack-id="${escapeHtml(pack.id)}"
            placeholder="예: 얼굴 실루엣은 유지, 네이비 자켓 금속 디테일 강조, 가죽 질감 흔들리면 안 됨"
          ></textarea>
        </label>
        <div class="identity-pack-ref-group">
          <div class="identity-pack-ref-header">
            <span class="sidebar-label">연결된 시트 이미지</span>
            <span class="identity-pack-ref-meta">${normalizeReferenceImageIds(pack.referenceImageIds).length}장 선택</span>
          </div>
          ${aiReferenceImages.length > 0 ? `
            <div class="identity-pack-ref-grid">
              ${aiReferenceImages.map((image, imageIndex) => `
                <label class="identity-pack-ref-option">
                  <input
                    type="checkbox"
                    data-pack-reference-id="${escapeHtml(image.id)}"
                    data-pack-id="${escapeHtml(pack.id)}"
                    ${normalizeReferenceImageIds(pack.referenceImageIds).includes(image.id) ? "checked" : ""}
                  >
                  <img class="identity-pack-ref-thumb" src="${escapeHtml(image.dataUrl)}" alt="${escapeHtml(image.name || `reference-${imageIndex + 1}`)}">
                  <span class="identity-pack-ref-copy">
                    <span class="identity-pack-ref-label">REF ${String(imageIndex + 1).padStart(2, "0")}</span>
                    <span class="identity-pack-ref-name">${escapeHtml(image.name || `reference-${imageIndex + 1}`)}</span>
                  </span>
                </label>
              `).join("")}
            </div>
          ` : `
            <div class="identity-pack-empty">먼저 첨부 이미지를 올리면 여기서 바로 시트 기준 이미지를 고를 수 있습니다.</div>
          `}
        </div>
      `;

      const nameInput = article.querySelector('[data-pack-field="name"]');
      const entityTypeSelect = article.querySelector('[data-pack-field="entityType"]');
      const componentTypeSelect = article.querySelector('[data-pack-field="componentType"]');
      const notesInput = article.querySelector('[data-pack-field="notes"]');
      if (nameInput) {
        nameInput.value = pack.name;
      }
      if (entityTypeSelect) {
        entityTypeSelect.value = sanitizeIdentityEntityType(pack.entityType);
      }
      if (componentTypeSelect) {
        componentTypeSelect.value = sanitizeIdentityComponentType(pack.componentType);
      }
      if (notesInput) {
        notesInput.value = pack.notes || "";
      }

      identityPackListEl.appendChild(article);
    });
  }

  function handleCreateIdentityPack() {
    pushHistoryState();
    const nextIdentityPacks = [...getIdentityPacks(), createIdentityPackDraft()];
    updateIdentityPacks(nextIdentityPacks, {
      announceText: "새 Identity Pack을 만들었습니다."
    });
    updateHistoryUI();
  }

  function handleIdentityPackListClick(event) {
    const actionButton = event.target.closest("[data-pack-action]");
    if (!actionButton) {
      return;
    }

    const packId = actionButton.dataset.packId;
    if (!packId) {
      return;
    }

    if (actionButton.dataset.packAction === "delete") {
      pushHistoryState();
      const nextIdentityPacks = getIdentityPacks().filter((pack) => pack.id !== packId);
      panels = panels.map((panel, index) => normalizePanel({
        ...panel,
        identityPackIds: getPanelIdentityPackIds(panel).filter((identityPackId) => identityPackId !== packId)
      }, index));
      persistPanels();
      updateIdentityPacks(nextIdentityPacks, {
        announceText: "Identity Pack을 삭제했습니다."
      });
      updateHistoryUI();
      return;
    }

    if (actionButton.dataset.packAction === "toggle-selection") {
      const selectedPanels = getPipelineSelectedPanels();
      if (selectedPanels.length === 0) {
        setStatus("먼저 연결할 컷을 선택해주세요.", "warning");
        return;
      }

      const detach = selectedPanels.every((panel) => getPanelIdentityPackIds(panel).includes(packId));
      pushHistoryState();
      panels = panels.map((panel, index) => {
        if (!selectedPanelIds.has(panel.id)) {
          return panel;
        }

        const nextPackIds = detach
          ? getPanelIdentityPackIds(panel).filter((identityPackId) => identityPackId !== packId)
          : Array.from(new Set([...getPanelIdentityPackIds(panel), packId]));

        return normalizePanel({
          ...panel,
          identityPackIds: nextPackIds
        }, index);
      });
      persistPanels();
      renderIdentityPackList();
      renderPanels();
      updateHistoryUI();
      setStatus(detach ? "선택 컷에서 Identity Pack 연결을 해제했습니다." : "선택 컷에 Identity Pack을 연결했습니다.");
    }
  }

  function handleIdentityPackListInput(event) {
    const field = event.target?.dataset?.packField;
    const packId = event.target?.dataset?.packId;
    if (!field || !packId || !["name", "notes"].includes(field)) {
      return;
    }

    captureHistoryGroup(`identity-pack:${packId}:${field}`);
    const nextIdentityPacks = getIdentityPacks().map((pack) => {
      if (pack.id !== packId) {
        return pack;
      }

      return {
        ...pack,
        [field]: event.target.value
      };
    });
    updateIdentityPacks(nextIdentityPacks, {
      renderList: false,
      renderPanels: false
    });
  }

  function handleIdentityPackListChange(event) {
    const packId = event.target?.dataset?.packId;
    if (!packId) {
      return;
    }

    if (event.target.matches("[data-pack-field='entityType'], [data-pack-field='componentType']")) {
      pushHistoryState();
      const field = event.target.dataset.packField;
      const nextValue = field === "entityType"
        ? sanitizeIdentityEntityType(event.target.value)
        : sanitizeIdentityComponentType(event.target.value);
      const nextIdentityPacks = getIdentityPacks().map((pack) => {
        if (pack.id !== packId) {
          return pack;
        }

        return {
          ...pack,
          [field]: nextValue
        };
      });
      updateIdentityPacks(nextIdentityPacks, {
        announceText: "Identity Pack 구성을 업데이트했습니다."
      });
      updateHistoryUI();
      return;
    }

    if (event.target.matches("[data-pack-reference-id]")) {
      const referenceImageId = event.target.dataset.packReferenceId;
      pushHistoryState();
      const nextIdentityPacks = getIdentityPacks().map((pack) => {
        if (pack.id !== packId) {
          return pack;
        }

        const nextReferenceImageIds = event.target.checked
          ? Array.from(new Set([...normalizeReferenceImageIds(pack.referenceImageIds), referenceImageId]))
          : normalizeReferenceImageIds(pack.referenceImageIds).filter((value) => value !== referenceImageId);

        return {
          ...pack,
          referenceImageIds: nextReferenceImageIds
        };
      });
      updateIdentityPacks(nextIdentityPacks, {
        announceText: "Identity Pack 시트를 업데이트했습니다."
      });
      updateHistoryUI();
    }
  }

  function handleIdentityPackListBlur(event) {
    const field = event.target?.dataset?.packField;
    const packId = event.target?.dataset?.packId;
    if (!field || !packId || !["name", "notes"].includes(field)) {
      return;
    }

    releaseHistoryGroup(`identity-pack:${packId}:${field}`);
    renderIdentityPackList();
    renderPanels();
  }

  function handleSelectionDetailChange(event) {
    const packId = event.target?.dataset?.selectionPackToggle;
    if (!packId) {
      return;
    }

    const selectedPanel = getSingleSelectedPanel();
    if (!selectedPanel) {
      return;
    }

    const nextIdentityPackIds = event.target.checked
      ? Array.from(new Set([...getPanelIdentityPackIds(selectedPanel), packId]))
      : getPanelIdentityPackIds(selectedPanel).filter((identityPackId) => identityPackId !== packId);

    pushHistoryState();
    updatePanel(selectedPanel.id, {
      identityPackIds: nextIdentityPackIds
    }, { announce: false });
    renderIdentityPackList();
    updateHistoryUI();
    setStatus(event.target.checked ? "선택 컷에 Identity Pack을 연결했습니다." : "선택 컷에서 Identity Pack 연결을 해제했습니다.");
  }

  function getReferenceUsageMap() {
    const usageMap = new Map();

    panels.forEach((panel, index) => {
      getPanelReferenceImageIds(panel).forEach((referenceImageId) => {
        const usageList = usageMap.get(referenceImageId) ?? [];
        usageList.push({
          label: `S${String(index + 1).padStart(2, "0")}`,
          panelId: panel.id
        });
        usageMap.set(referenceImageId, usageList);
      });
    });

    return usageMap;
  }

  function renderAiReferenceImages() {
    if (!aiReferenceCountEl || !aiReferenceDropzoneEl) {
      return;
    }

    const count = aiReferenceImages.length;
    const usageMap = getReferenceUsageMap();
    aiReferenceCountEl.textContent = `${count} / ${AI_REFERENCE_IMAGE_LIMIT}`;

    if (aiReferenceListEl) {
      aiReferenceListEl.innerHTML = "";
      aiReferenceListEl.hidden = true;
    }

    if (!aiReferenceInlineGridEl) {
      aiReferenceDropzoneEl.classList.toggle("has-images", false);
      return;
    }

    aiReferenceInlineGridEl.innerHTML = "";
    aiReferenceInlineGridEl.hidden = count === 0;
    aiReferenceDropzoneEl.classList.toggle("has-images", count > 0);
    aiReferenceDropzoneEl.style.setProperty("--reference-thumb-size", `${getAiReferenceThumbSize(count)}px`);

    aiReferenceImages.forEach((image, imageIndex) => {
      const orderLabel = String(imageIndex + 1).padStart(2, "0");
      const usageEntries = usageMap.get(image.id) ?? [];
      const visibleUsageEntries = usageEntries.slice(0, 2);
      const extraUsageCount = Math.max(0, usageEntries.length - visibleUsageEntries.length);
      const item = document.createElement("article");
      item.className = "ai-reference-inline-item";
      item.title = image.name || "reference image";
      item.dataset.referencePreview = image.id;
      item.draggable = true;
      item.setAttribute("role", "button");
      item.setAttribute("tabindex", "0");
      item.setAttribute("aria-label", `${image.name || "첨부 이미지"} 크게 보기`);
      item.style.setProperty("--reference-accent-rgb", image.accentRgb || "37 99 235");
      item.innerHTML = `
        <span class="ai-reference-inline-order">${orderLabel}</span>
        <div class="ai-reference-inline-photo">
          <img class="ai-reference-inline-thumb" src="${escapeHtml(image.dataUrl)}" alt="${escapeHtml(image.name || "첨부 이미지")}">
        </div>
        <button class="ai-reference-inline-remove" type="button" data-reference-remove="${escapeHtml(image.id)}" aria-label="첨부 이미지 삭제" title="첨부 이미지 삭제">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6L18 18M18 6L6 18"></path>
          </svg>
        </button>
        <div class="ai-reference-inline-footer">
          <span class="ai-reference-inline-ref">REF ${orderLabel}</span>
          <div class="ai-reference-inline-scenes">
            ${visibleUsageEntries.map((entry) => `
              <span
                class="ai-reference-inline-scene-tag"
                role="button"
                tabindex="0"
                data-focus-panel-id="${escapeHtml(entry.panelId)}"
                aria-label="${escapeHtml(entry.label)} 컷으로 이동"
              >${escapeHtml(entry.label)}</span>
            `).join("")}
            ${extraUsageCount > 0 ? `<span class="ai-reference-inline-scene-tag">+${extraUsageCount}</span>` : ""}
          </div>
        </div>
      `;
      aiReferenceInlineGridEl.appendChild(item);
    });
  }

  function initializeReferenceInlineInteractions() {
    if (!aiReferenceDropzoneEl || aiReferenceDropzoneEl.dataset.inlineInteractionsReady === "true") {
      return;
    }

    aiReferenceDropzoneEl.dataset.inlineInteractionsReady = "true";

    aiReferenceDropzoneEl.addEventListener("click", (event) => {
      const sceneTag = event.target.closest("[data-focus-panel-id]");
      if (!sceneTag) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      focusPanelFromReferenceTag(sceneTag.dataset.focusPanelId);
    }, true);

    aiReferenceDropzoneEl.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      const sceneTag = event.target.closest("[data-focus-panel-id]");
      if (!sceneTag) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      focusPanelFromReferenceTag(sceneTag.dataset.focusPanelId);
    }, true);

    aiReferenceInlineGridEl?.addEventListener("dragstart", (event) => {
      const item = event.target.closest(".ai-reference-inline-item[data-reference-preview]");
      if (!item) {
        return;
      }

      draggedReferenceImageId = item.dataset.referencePreview || "";
      item.classList.add("is-dragging");
      event.dataTransfer?.setData("text/plain", draggedReferenceImageId);
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
      }
    });

    aiReferenceInlineGridEl?.addEventListener("dragover", (event) => {
      if (!draggedReferenceImageId) {
        return;
      }

      const targetItem = event.target.closest(".ai-reference-inline-item[data-reference-preview]");
      if (!targetItem || targetItem.dataset.referencePreview === draggedReferenceImageId) {
        return;
      }

      event.preventDefault();
      syncReferenceDropTarget(targetItem.dataset.referencePreview);
    });

    aiReferenceInlineGridEl?.addEventListener("drop", async (event) => {
      if (!draggedReferenceImageId) {
        return;
      }

      const targetItem = event.target.closest(".ai-reference-inline-item[data-reference-preview]");
      if (!targetItem) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      const targetId = targetItem.dataset.referencePreview || "";
      clearReferenceDropTarget();
      const sourceId = draggedReferenceImageId;
      draggedReferenceImageId = "";
      await reorderAiReferenceImages(sourceId, targetId);
    });

    aiReferenceInlineGridEl?.addEventListener("dragend", () => {
      draggedReferenceImageId = "";
      clearReferenceDropTarget();
    });

    aiReferenceInlineGridEl?.addEventListener("dragleave", (event) => {
      const relatedTarget = event.relatedTarget;
      if (relatedTarget instanceof Node && aiReferenceInlineGridEl.contains(relatedTarget)) {
        return;
      }
      clearReferenceDropTarget();
    });
  }

  function syncReferenceDropTarget(targetId) {
    aiReferenceInlineGridEl?.querySelectorAll(".ai-reference-inline-item").forEach((item) => {
      const isDragging = item.dataset.referencePreview === draggedReferenceImageId;
      const isDropTarget = item.dataset.referencePreview === targetId;
      item.classList.toggle("is-dragging", isDragging);
      item.classList.toggle("is-drop-target", isDropTarget);
    });
  }

  function clearReferenceDropTarget() {
    aiReferenceInlineGridEl?.querySelectorAll(".ai-reference-inline-item").forEach((item) => {
      item.classList.remove("is-dragging", "is-drop-target");
    });
  }

  async function reorderAiReferenceImages(sourceId, targetId) {
    if (!sourceId || !targetId || sourceId === targetId) {
      return;
    }

    const sourceIndex = aiReferenceImages.findIndex((image) => image.id === sourceId);
    const targetIndex = aiReferenceImages.findIndex((image) => image.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) {
      return;
    }

    pushHistoryState();
    const nextImages = [...aiReferenceImages];
    const [movedImage] = nextImages.splice(sourceIndex, 1);
    nextImages.splice(targetIndex, 0, movedImage);
    aiReferenceImages = nextImages;
    await persistAiReferenceImages();
    renderAiReferenceImages();
    updateHistoryUI();
    setStatus("첨부 이미지 순서를 변경했습니다.");
  }

  function focusPanelFromReferenceTag(panelId) {
    if (!panelId || !getPanelById(panelId)) {
      return;
    }

    setSelection([panelId]);
    renderSelectionDetail();
    setSidebarSections("right", Array.from(new Set([...activeRightSidebarSections, "selection"])), false);
    focusPanel(panelId);
    setStatus("해당 씬으로 이동했습니다.");
  }

  function createWorkspaceExportSnapshot() {
    return {
      version: "shonode-workspace-v1",
      exportedAt: new Date().toISOString(),
      project: cloneProject(),
      panels: panels.map((panel, index) => normalizePanel(panel, index)),
      referenceImages: aiReferenceImages.map((image) => ({ ...image })),
      selection: {
        panelIds: Array.from(selectedPanelIds)
      },
      view: {
        zoom,
        scrollLeft: canvasViewport.scrollLeft,
        scrollTop: canvasViewport.scrollTop
      },
      sidebar: {
        leftSections: [...activeLeftSidebarSections],
        rightSections: [...activeRightSidebarSections],
        leftRailCollapsed,
        rightRailCollapsed
      }
    };
  }

  function sanitizeWorkspaceFileName(name) {
    const base = (name || "shonode-workspace")
      .replace(/[\\/:*?"<>|]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return base || "shonode-workspace";
  }

  async function handleExportWorkspace() {
    await window.ShonodePanelImageStorage?.ready?.();
    await window.ShonodePanelImageStorage?.flush?.();
    const snapshot = createWorkspaceExportSnapshot();
    const fileName = `${sanitizeWorkspaceFileName(project.title)}-${new Date().toISOString().slice(0, 10)}.shonode`;
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/x-shonode+json" });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    setStatus("프로젝트를 내보냈습니다.");
  }

  async function handleImportWorkspaceInputChange(event) {
    const file = event.target?.files?.[0];
    if (!file) {
      return;
    }

    try {
      const shouldImport = await openConfirmDialog({
        tone: "danger",
        eyebrow: "프로젝트 가져오기",
        title: "현재 작업 위에 불러올까요?",
        description: "현재 워크스페이스를 새 프로젝트 내용으로 덮어씁니다. 불러오기 전에 내보내기로 백업할 수 있습니다.",
        confirmLabel: "불러오기"
      });

      if (!shouldImport) {
        return;
      }

      const text = await file.text();
      const snapshot = JSON.parse(text);
      await importWorkspaceSnapshot(snapshot);
    } catch (error) {
      console.warn("Failed to import workspace snapshot.", error);
      setStatus("프로젝트 파일을 불러오지 못했습니다.", "warning");
    } finally {
      if (event.target) {
        event.target.value = "";
      }
    }
  }

  async function importWorkspaceSnapshot(snapshot) {
    const snapshotPanels = Array.isArray(snapshot?.panels) && snapshot.panels.length > 0
      ? snapshot.panels
      : createDefaultPanels();
    const snapshotProject = snapshot?.project && typeof snapshot.project === "object"
      ? snapshot.project
      : getDefaultProject();
    const snapshotReferenceImages = Array.isArray(snapshot?.referenceImages)
      ? snapshot.referenceImages
      : Array.isArray(snapshot?.aiReferenceImages)
        ? snapshot.aiReferenceImages
        : [];
    const safeReferenceImages = snapshotReferenceImages
      .filter((image) => typeof image?.dataUrl === "string")
      .slice(0, AI_REFERENCE_IMAGE_LIMIT)
      .map((image, index) => ({
        id: typeof image.id === "string" ? image.id : createId(),
        name: typeof image.name === "string" ? image.name : `reference-${index + 1}.jpg`,
        mimeType: typeof image.mimeType === "string" ? image.mimeType : "image/jpeg",
        width: Number.isFinite(image.width) ? image.width : 0,
        height: Number.isFinite(image.height) ? image.height : 0,
        dataUrl: image.dataUrl,
        accentRgb: typeof image.accentRgb === "string" ? image.accentRgb : ""
      }));
    const hydratedReferenceImages = await ensureReferenceImageAccentColors(safeReferenceImages);
    const sidebarSnapshot = snapshot?.sidebar && typeof snapshot.sidebar === "object" ? snapshot.sidebar : {};
    const viewSnapshot = snapshot?.view && typeof snapshot.view === "object" ? snapshot.view : {};
    const selectionIds = Array.isArray(snapshot?.selection?.panelIds)
      ? snapshot.selection.panelIds
      : Array.isArray(snapshot?.selectedPanelIds)
        ? snapshot.selectedPanelIds
        : [];

    panels = snapshotPanels.map((panel, index) => normalizePanel(panel, index));
    project = normalizeProject(snapshotProject);
    aiReferenceImages = hydratedReferenceImages.images;
    selectedPanelIds = new Set(selectionIds.filter((panelId) => panels.some((panel) => panel.id === panelId)));
    activeLeftSidebarSections = getSidebarSectionIds("left").filter((sectionId) => (sidebarSnapshot.leftSections ?? []).includes(sectionId));
    activeRightSidebarSections = getSidebarSectionIds("right").filter((sectionId) => (sidebarSnapshot.rightSections ?? []).includes(sectionId));
    leftRailCollapsed = Boolean(sidebarSnapshot.leftRailCollapsed) && activeLeftSidebarSections.length === 0;
    rightRailCollapsed = Boolean(sidebarSnapshot.rightRailCollapsed) && activeRightSidebarSections.length === 0;
    zoom = clamp(Number.isFinite(viewSnapshot.zoom) ? viewSnapshot.zoom : 1, MIN_ZOOM, MAX_ZOOM);
    pendingInitialScroll = {
      left: Number.isFinite(viewSnapshot.scrollLeft) ? viewSnapshot.scrollLeft : 0,
      top: Number.isFinite(viewSnapshot.scrollTop) ? viewSnapshot.scrollTop : 0
    };
    undoStack = [];
    redoStack = [];
    activeHistoryGroups.clear();

    persistSidebarSections("left", activeLeftSidebarSections);
    persistSidebarSections("right", activeRightSidebarSections);
    persistRailCollapsed("left", leftRailCollapsed);
    persistRailCollapsed("right", rightRailCollapsed);
    await persistAiReferenceImages();
    persistPanels();
    persistProject();
    await window.ShonodePanelImageStorage?.flush?.();
    updateZoomUI();
    renderProjectSidebar();
    applySidebarRailState(false);
    updateHistoryUI();
    renderPanels({ restoreView: true });
    window.setTimeout(() => {
      persistViewState();
    }, 120);
    setStatus("프로젝트를 불러왔습니다.");
  }

  function buildSelectedPanelsPayload(selectedPanels) {
    return selectedPanels.map((panel) => ({
      imagePromptMode: getPromptMode(panel),
      i2iPrompt: getPromptMode(panel) === "i2i" ? (panel.t2iPrompt || "") : "",
      identityPackIds: getPanelIdentityPackIds(panel),
      identityPacks: getPanelIdentityPacks(panel).map((pack) => ({
        id: pack.id,
        name: pack.name,
        entityType: pack.entityType,
        componentType: pack.componentType,
        notes: pack.notes,
        referenceImageIds: [...pack.referenceImageIds]
      })),
      referenceImageIds: getPanelReferenceImageIds(panel),
      referenceImageNames: getPanelReferenceImageNames(panel),
      panelId: panel.id,
      sceneTitle: panel.sceneTitle || "",
      durationLabel: panel.durationLabel || "",
      caption: panel.caption || "",
      referenceImageId: panel.referenceImageId || "",
      referenceImageName: panel.referenceImageName || "",
      referenceImageIndexes: getPanelReferenceImageIds(panel)
        .map((referenceId) => aiReferenceImages.findIndex((image) => image.id === referenceId))
        .filter((referenceIndex) => referenceIndex >= 0),
      referenceImageIndex: panel.referenceImageId
        ? aiReferenceImages.findIndex((image) => image.id === panel.referenceImageId)
        : -1,
      t2iPrompt: getPromptMode(panel) === "t2i" ? (panel.t2iPrompt || "") : "",
      i2vStartPrompt: panel.i2vStartPrompt || "",
      i2vMotionPrompt: panel.i2vMotionPrompt || "",
      i2vEndPrompt: panel.i2vEndPrompt || "",
      hasImage: Boolean(panel.image),
      fileName: panel.fileName || ""
    }));
  }

  function createSelectedFallbackCut(panel, index) {
    const sceneTitle = panel?.sceneTitle || `${index + 1}. 컷`;
    const durationLabel = panel?.durationLabel || "약 3초";
    const caption = withDurationInCaption(
      panel?.caption || `${sceneTitle}을 더 광고적으로 다듬은 컷입니다.`,
      durationLabel
    );

    return {
      sceneTitle,
      durationLabel,
      caption,
      referenceImageIndexes: normalizeReferenceIndexes(panel?.referenceImageIndexes, panel?.referenceImageIndex),
      referenceImageIndex: Number.isInteger(panel?.referenceImageIndex) ? panel.referenceImageIndex : -1,
      imagePromptMode: getPromptMode(panel || {}),
      i2iPrompt: getPromptMode(panel || {}) === "i2i" ? (panel?.t2iPrompt || "") : "",
      t2iPrompt: getPromptMode(panel || {}) === "t2i" ? (panel?.t2iPrompt || "") : "",
      i2vStartPrompt: panel?.i2vStartPrompt || "",
      i2vMotionPrompt: panel?.i2vMotionPrompt || "",
      i2vEndPrompt: panel?.i2vEndPrompt || ""
    };
  }

  function buildLocalSelectedStoryboardPlan(payload) {
    const selectedPanels = Array.isArray(payload?.selectedPanels) ? payload.selectedPanels : [];
    const duration = extractDuration(payload?.brief || "");
    const averageDuration = Math.round((duration.min + duration.max) / 2) || 18;
    const secondsPerCut = Math.max(2, Math.round(averageDuration / Math.max(selectedPanels.length, 1)));

    return {
      summary: "선택한 컷을 기준으로 프롬프트를 다시 정제했습니다.",
      projectDraft: cloneProject(),
      cuts: selectedPanels.map((panel, index) => {
        const sceneTitle = panel.sceneTitle || `${index + 1}. 컷`;
        const durationLabel = panel.durationLabel || `약 ${secondsPerCut}초`;
        const caption = withDurationInCaption(
          panel.caption || `${sceneTitle}의 핵심 이미지를 유지하면서 더 정교한 광고 컷으로 리디자인합니다.`,
          durationLabel
        );
        const promptSeed = [
          sceneTitle,
          caption,
          ...getPanelIdentityPacks(panel).map((pack) => `identity pack ${buildIdentityPackPromptSummary(pack)}`),
          ...getPanelReferenceImageNames(panel).map((referenceName) => `reference ${referenceName}`),
          payload?.brief || ""
        ].filter(Boolean).join(", ");
        const referenceImageIndexes = normalizeReferenceIndexes(panel.referenceImageIndexes, panel.referenceImageIndex);
        const imagePromptMode = referenceImageIndexes.length > 0 ? "i2i" : "t2i";

        return {
          sceneTitle,
          durationLabel,
          caption,
          referenceImageIndexes,
          referenceImageIndex: referenceImageIndexes[0] ?? -1,
          imagePromptMode,
          i2iPrompt: imagePromptMode === "i2i"
            ? (panel.t2iPrompt?.trim()
              ? `${panel.t2iPrompt.trim()}, transform the assigned reference images into a fresh commercial still, keep continuity anchors but redesign the composition and advertising intent, polished premium composition, no text, no watermark`
              : `${promptSeed}, premium commercial still, transform and combine the assigned reference images into a redesigned advertising frame, elegant lighting, polished composition, no text, no watermark`)
            : "",
          t2iPrompt: imagePromptMode === "t2i"
            ? (panel.t2iPrompt?.trim()
              ? `${panel.t2iPrompt.trim()}, strengthen the composition and advertising clarity, polished premium composition, no text, no watermark`
              : `${promptSeed}, premium commercial still, original text-to-image concept, elegant lighting, polished composition, no text, no watermark`)
            : "",
          i2vStartPrompt: panel.i2vStartPrompt?.trim()
            ? `${panel.i2vStartPrompt.trim()}, refined opening frame derived from the redesigned still`
            : `${promptSeed}, opening frame derived from the redesigned still, premium commercial look`,
          i2vMotionPrompt: panel.i2vMotionPrompt?.trim()
            ? `${panel.i2vMotionPrompt.trim()}, cleaner camera rhythm, smoother motion arc, bridge naturally into the next scene`
            : "subtle cinematic camera move, controlled subject motion, refined pacing, premium commercial polish, bridge naturally into the next scene",
          i2vEndPrompt: panel.i2vEndPrompt?.trim()
            ? `${panel.i2vEndPrompt.trim()}, refined closing frame`
            : `${promptSeed}, closing frame, polished brand finish`
        };
      })
    };
  }

  function normalizeSelectedPlan(rawPlan, payload) {
    const normalized = normalizePlan(rawPlan, payload);
    const fallback = normalizePlan(buildLocalSelectedStoryboardPlan(payload), payload);
    const targetCount = Number(payload?.selectedPanelCount) || payload?.selectedPanels?.length || 0;
    const cuts = [];

    for (let index = 0; index < targetCount; index += 1) {
      cuts.push(
        normalized.cuts[index] ||
        fallback.cuts[index] ||
        createSelectedFallbackCut(payload?.selectedPanels?.[index], index)
      );
    }

    return {
      ...normalized,
      cuts
    };
  }

  function applySelectedStoryboardPlan(plan, selectedPanels, source) {
    const selectedPanelMap = new Map(selectedPanels.map((panel, index) => [panel.id, { panel, index }]));
    const nextPanels = panels.map((panel, panelIndex) => {
      const match = selectedPanelMap.get(panel.id);
      if (!match) {
        return panel;
      }

      const cut = plan.cuts[match.index] || createSelectedFallbackCut(match.panel, match.index);
      const promptState = resolveCutImagePrompt(cut);
      const referenceAssignment = resolveReferenceAssignment(
        cut.referenceImageIndexes ?? cut.referenceImageIndex,
        match.index
      );

      return normalizePanel({
        ...panel,
        viewMode: "t2i",
        imagePromptMode: promptState.imagePromptMode,
        t2iCollapsed: false,
        i2vCollapsed: true,
        sceneTitle: cut.sceneTitle,
        durationLabel: cut.durationLabel,
        caption: cut.caption,
        referenceImageIds: referenceAssignment.map((item) => item.id),
        referenceImageNames: referenceAssignment.map((item) => item.name),
        referenceImageId: referenceAssignment[0]?.id || panel.referenceImageId || "",
        referenceImageName: referenceAssignment[0]?.name || panel.referenceImageName || "",
        t2iPrompt: promptState.imagePrompt,
        i2vStartPrompt: cut.i2vStartPrompt,
        i2vMotionPrompt: cut.i2vMotionPrompt,
        i2vEndPrompt: cut.i2vEndPrompt
      }, panelIndex);
    });

    panels = nextPanels;
    project = normalizeProject({
      ...project,
      aiSummary: plan.summary || project.aiSummary,
      previewVideoUrl: plan.previewVideoUrl || project.previewVideoUrl,
      previewPosterUrl: plan.previewPosterUrl || project.previewPosterUrl
    });
    selectedPanelIds = new Set(selectedPanels.map((panel) => panel.id).filter((panelId) => nextPanels.some((panel) => panel.id === panelId)));
    persistPanels();
    persistProject();
    renderProjectSidebar();
    setSidebarSections(
      "right",
      Array.from(new Set([
        ...(plan.previewVideoUrl ? ["video"] : []),
        "output",
        "selection",
        ...activeRightSidebarSections
      ])),
      false
    );
    renderPanels({ restoreView: true });

    if (selectedPanels[0]) {
      focusPanel(selectedPanels[0].id);
    }

    setStatus(
      source === "api"
        ? "선택한 컷 구조를 다시 정리했습니다."
        : "선택한 컷을 로컬 연출 초안으로 다시 정리했습니다."
    );
  }

  async function handleRegenerateSelectedPanels() {
    const orderedSelectedPanels = panels.filter((panel) => selectedPanelIds.has(panel.id));
    if (orderedSelectedPanels.length === 0) {
      setStatus("먼저 다시 만들 컷을 선택해주세요.", "warning");
      return;
    }

    const brief = project.aiBrief?.trim();
    if (!brief) {
      setSidebarSections("left", Array.from(new Set([...activeLeftSidebarSections, "ai"])), false);
      aiBriefInputEl.focus();
      setStatus("브리프를 먼저 입력해주세요.", "warning");
      return;
    }

    const shouldRegenerate = await openConfirmDialog({
      eyebrow: "선택 컷 다시 정리",
      title: `${orderedSelectedPanels.length}개의 선택 컷 구조만 다시 정리할까요?`,
      description: "선택한 컷의 제목, 설명, T2I/I2V 프롬프트만 새로 정리합니다. 카드 위치와 연결은 그대로 유지됩니다.",
      confirmLabel: "선택 컷 다시 정리"
    });

    if (!shouldRegenerate) {
      return;
    }

    setGeneratingState(true);
    setStatus("선택한 컷만 다시 정리하고 있습니다.");

    try {
      const payload = {
        generationMode: "selected-panels",
        brief,
        project: cloneProject(),
        selectedPanelCount: orderedSelectedPanels.length,
        selectedPanels: buildSelectedPanelsPayload(orderedSelectedPanels),
        referenceWeight: Number.parseFloat(sanitizeReferenceWeight(project.referenceWeight)),
        referenceImageCount: aiReferenceImages.length,
        referenceImages: aiReferenceImages.map((image) => ({
          name: image.name,
          mimeType: image.mimeType,
          dataUrl: image.dataUrl,
          width: image.width,
          height: image.height
        }))
      };

      let plan = null;
      let source = "local";

      const aiClient = window.ShonodeAI || window.ShotBoardAI;
      if (aiClient && typeof aiClient.generateStoryboard === "function") {
        try {
          plan = await aiClient.generateStoryboard(payload);
          if (plan) {
            source = "api";
          }
        } catch (error) {
          console.warn("ShonodeAI.generateStoryboard failed for selected panels, using local fallback.", error);
        }
      }

      if (!plan) {
        plan = buildLocalSelectedStoryboardPlan(payload);
        setStatus("모델 연결에 실패해 선택 컷을 로컬 연출 초안으로 다시 만들었습니다.", "warning");
      }

      pushHistoryState();
      applySelectedStoryboardPlan(normalizeSelectedPlan(plan, payload), orderedSelectedPanels, source);
      updateHistoryUI();
    } finally {
      setGeneratingState(false);
    }
  }

  initializeReferenceInlineInteractions();
  renderAiReferenceImages();

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }
})();
