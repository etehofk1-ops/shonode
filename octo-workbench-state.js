(function initShonodeOctoState() {
  const STORAGE_KEY = "shonode-octo-workbench-v1";
  const ENTITY_TYPES = ["character", "object", "environment", "style"];

  function createId(prefix) {
    if (window.crypto?.randomUUID) {
      return `${prefix}-${window.crypto.randomUUID().slice(0, 8)}`;
    }
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  }

  function asText(value) {
    return typeof value === "string" ? value : "";
  }

  function defaultState() {
    return {
      story: {
        title: "Untitled Shonode Story",
        logline: "",
        structure: "Seven-act commercial arc",
        synopsis: "",
        visualStyle: "premium cinematic, controlled lighting, clear continuity"
      },
      entities: [
        {
          id: createId("entity"),
          type: "character",
          name: "Hero Subject",
          tag: "@HeroSubject",
          description: "Main subject or product identity anchor.",
          arc: "From first reveal to final brand memory."
        },
        {
          id: createId("entity"),
          type: "style",
          name: "Signature Look",
          tag: "@SignatureLook",
          description: "Lighting, palette, camera language, and material tone.",
          arc: "Holds continuity across every shot."
        }
      ],
      scenes: [
        {
          id: createId("scene"),
          title: "Opening Signal",
          setting: "INT/EXT | Brand world | Day",
          duration: "3s",
          description: "Introduce the world and the hero subject with one readable image.",
          beat: "Attention and context.",
          keyframes: [
            {
              id: createId("keyframe"),
              label: "Keyframe 1",
              prompt: "Wide hero frame, clear subject silhouette, premium composition, no text, no watermark."
            }
          ]
        },
        {
          id: createId("scene"),
          title: "Detail Turn",
          setting: "INT/EXT | Detail zone | Continuous",
          duration: "3s",
          description: "Move into the tactile or emotional detail that makes the story specific.",
          beat: "Desire and proof.",
          keyframes: [
            {
              id: createId("keyframe"),
              label: "Keyframe 1",
              prompt: "Close detail insert, controlled camera motion, consistent lighting family, no text, no watermark."
            }
          ]
        },
        {
          id: createId("scene"),
          title: "Final Memory",
          setting: "INT/EXT | Hero frame | Resolve",
          duration: "3s",
          description: "Resolve the sequence with a memorable final image.",
          beat: "Closure and brand recall.",
          keyframes: [
            {
              id: createId("keyframe"),
              label: "Keyframe 1",
              prompt: "Final tableau, emotional closure, polished campaign-ready frame, no text, no watermark."
            }
          ]
        }
      ],
      updatedAt: new Date().toISOString()
    };
  }

  function normalizeEntity(entity) {
    const type = ENTITY_TYPES.includes(entity?.type) ? entity.type : "character";
    const name = asText(entity?.name).trim() || "Untitled entity";
    return {
      id: asText(entity?.id) || createId("entity"),
      type,
      name,
      tag: asText(entity?.tag).trim() || `@${name.replace(/[^A-Za-z0-9]+/g, "") || "Entity"}`,
      description: asText(entity?.description),
      arc: asText(entity?.arc)
    };
  }

  function normalizeKeyframe(keyframe, index) {
    return {
      id: asText(keyframe?.id) || createId("keyframe"),
      label: asText(keyframe?.label).trim() || `Keyframe ${index + 1}`,
      prompt: asText(keyframe?.prompt)
    };
  }

  function normalizeScene(scene, index) {
    const keyframes = Array.isArray(scene?.keyframes) ? scene.keyframes : [];
    return {
      id: asText(scene?.id) || createId("scene"),
      title: asText(scene?.title).trim() || `Scene ${String(index + 1).padStart(2, "0")}`,
      setting: asText(scene?.setting),
      duration: asText(scene?.duration).trim() || "3s",
      description: asText(scene?.description),
      beat: asText(scene?.beat),
      keyframes: (keyframes.length ? keyframes : [{ prompt: "" }]).map(normalizeKeyframe)
    };
  }

  function normalizeState(raw) {
    const fallback = defaultState();
    const story = raw?.story && typeof raw.story === "object" ? raw.story : {};
    const entities = Array.isArray(raw?.entities) ? raw.entities.map(normalizeEntity) : fallback.entities;
    const scenes = Array.isArray(raw?.scenes) ? raw.scenes.map(normalizeScene) : fallback.scenes;
    return {
      story: {
        title: asText(story.title).trim() || fallback.story.title,
        logline: asText(story.logline),
        structure: asText(story.structure).trim() || fallback.story.structure,
        synopsis: asText(story.synopsis),
        visualStyle: asText(story.visualStyle).trim() || fallback.story.visualStyle
      },
      entities,
      scenes,
      updatedAt: asText(raw?.updatedAt) || new Date().toISOString()
    };
  }

  function loadState() {
    try {
      const raw = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
      return normalizeState(raw);
    } catch {
      return defaultState();
    }
  }

  function saveState(state) {
    const normalized = normalizeState({ ...state, updatedAt: new Date().toISOString() });
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function buildStateFromSnapshot(snapshot, currentState) {
    const panels = Array.isArray(snapshot?.panels) ? snapshot.panels : [];
    const project = snapshot?.project && typeof snapshot.project === "object" ? snapshot.project : {};
    const next = normalizeState(currentState || defaultState());
    next.story = {
      title: asText(project.title).trim() || next.story.title,
      logline: asText(project.logline) || asText(project.aiSummary) || next.story.logline,
      structure: asText(project.sequence) || next.story.structure,
      synopsis: asText(project.notes) || next.story.synopsis,
      visualStyle: asText(project.tone) || next.story.visualStyle
    };
    if (panels.length > 0) {
      next.scenes = panels.map((panel, index) => normalizeScene({
        title: panel.sceneTitle || `Scene ${String(index + 1).padStart(2, "0")}`,
        setting: panel.durationLabel || "",
        duration: panel.durationLabel || "3s",
        description: panel.caption || "",
        beat: panel.i2vMotionPrompt || "",
        keyframes: [{ label: "Keyframe 1", prompt: panel.t2iPrompt || panel.i2iPrompt || panel.i2vStartPrompt || "" }]
      }, index));
    }
    return saveState(next);
  }

  function firstPrompt(scene) {
    return scene.keyframes.map((frame) => frame.prompt).find((prompt) => prompt.trim()) || scene.description;
  }

  function buildPanelsFromState(state, snapshot) {
    const source = normalizeState(state);
    const panels = source.scenes.map((scene, index) => ({
      id: createId("panel"),
      caption: scene.description,
      image: "",
      fileName: "",
      x: 180 + index * 420,
      y: 180 + (index % 2) * 120,
      z: index + 1,
      sceneTitle: `Scene ${String(index + 1).padStart(2, "0")} - ${scene.title}`,
      durationLabel: scene.duration,
      viewMode: "t2i",
      t2iPrompt: [firstPrompt(scene), source.story.visualStyle].filter(Boolean).join(", "),
      i2vStartPrompt: firstPrompt(scene),
      i2vMotionPrompt: scene.beat || "controlled cinematic motion, preserve continuity",
      i2vEndPrompt: `Resolve ${scene.title} and prepare the next cut.`,
      nextPanelIds: []
    }));
    panels.forEach((panel, index) => {
      panel.nextPanelIds = panels[index + 1] ? [panels[index + 1].id] : [];
    });
    return {
      ...(snapshot || {}),
      project: {
        ...(snapshot?.project || {}),
        title: source.story.title,
        sequence: source.story.structure,
        runtime: `${source.scenes.length} scenes`,
        tone: source.story.visualStyle,
        logline: source.story.logline,
        notes: source.story.synopsis,
        aiSummary: buildBrief(source)
      },
      panels,
      storyWorkbench: source,
      selection: { panelIds: panels[0] ? [panels[0].id] : [] }
    };
  }

  function buildBrief(state) {
    const source = normalizeState(state);
    const entityLines = source.entities.map((entity) =>
      `- ${entity.tag} [${entity.type}] ${entity.name}: ${entity.description} ${entity.arc}`.trim()
    );
    const sceneLines = source.scenes.map((scene, index) =>
      `${index + 1}. ${scene.title} (${scene.duration})\n   ${scene.setting}\n   ${scene.description}\n   Motion: ${scene.beat}\n   Prompt: ${firstPrompt(scene)}`
    );
    return [
      `Title: ${source.story.title}`,
      `Structure: ${source.story.structure}`,
      `Logline: ${source.story.logline}`,
      `Synopsis: ${source.story.synopsis}`,
      `Visual Style: ${source.story.visualStyle}`,
      "",
      "Entities:",
      ...entityLines,
      "",
      "Scenes:",
      ...sceneLines
    ].join("\n");
  }

  window.ShonodeOctoState = {
    ENTITY_TYPES,
    defaultState,
    normalizeState,
    loadState,
    saveState,
    buildStateFromSnapshot,
    buildPanelsFromState,
    buildBrief
  };
})();
