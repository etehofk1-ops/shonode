(function initShonodeGuidedTemplateEngine() {
  const DEFAULT_TEMPLATE_ID = "fashion_editorial";
  const DURATION_OPTIONS = [6, 8, 10, 12, 15, 20];

  const TEMPLATE_LIBRARY = {
    fashion_editorial: {
      label: "Fashion Editorial",
      summary: "Use this when silhouette, styling continuity, inserts, and atmosphere matter more than action-heavy choreography.",
      defaults: {
        subject: "fashion model in a hero collection look",
        goal: "create a premium editorial collection teaser",
        look: "premium fashion editorial, polished gallery light, restrained luxury"
      },
      continuityRules: [
        "keep face, silhouette, and collar or shoulder line stable",
        "preserve fabric texture, accessory placement, and premium light family",
        "avoid retail catalog stiffness and avoid cheap lighting drift"
      ],
      step3Label: "Expression",
      step3Lines: [
        "Use the Step 1 master concept image as the identity anchor for {subject}.",
        "Generate a 3x3 expression and attitude sheet with 9 readable variations of the same subject.",
        "Expressions or tones: neutral, poised, soft smile, confident, distant, playful, serious, intimate, intense.",
        "Keep face identity, styling, accessories, hair silhouette, and lighting family consistent in every tile.",
        "Treat this as editorial casting continuity, not a meme expression sheet.",
        "Clean 3x3 grid, no text, no watermark, no extra props unless they are core styling anchors."
      ],
      sheetPacks: [
        {
          name: "{subject} base sheet",
          entityType: "character",
          componentType: "base",
          notes: "Lock face, hair silhouette, body proportion, and overall presence for {subject}."
        },
        {
          name: "main look sheet",
          entityType: "character",
          componentType: "outfit",
          notes: "Preserve hero silhouette, collar line, layering, and garment balance for {subject}."
        },
        {
          name: "accessory insert sheet",
          entityType: "character",
          componentType: "accessory",
          notes: "Track jewelry, bag, glove, prop, or styling inserts that cannot drift between shots."
        },
        {
          name: "environment mood sheet",
          entityType: "space",
          componentType: "base",
          notes: "Lock palette, background texture, and light direction for the editorial set."
        }
      ],
      beats: [
        {
          title: "Mood open",
          action: "Introduce {subject} with one strong silhouette-first hero frame.",
          camera: "slow push-in or measured track",
          purpose: "Set tone, styling hierarchy, and campaign confidence immediately."
        },
        {
          title: "Look reveal",
          action: "Show the full look with readable posture and controlled movement.",
          camera: "medium framing with elegant tracking",
          purpose: "Make the main silhouette memorable and approval-friendly."
        },
        {
          title: "Insert cluster",
          action: "Cut into fabric, accessory, hand, and neckline inserts without losing continuity.",
          camera: "macro inserts and editorial close crops",
          purpose: "Capture tactile value and premium detail."
        },
        {
          title: "Portrait tension",
          action: "Return to face and attitude with a slightly stronger emotional beat.",
          camera: "portrait close-up with subtle motion",
          purpose: "Anchor identity and emotional tone."
        },
        {
          title: "Closing tableau",
          action: "Resolve the sequence in a composed hero frame that feels campaign-ready.",
          camera: "static or gently settling wide",
          purpose: "Leave a final branded image that could become the campaign key visual."
        }
      ]
    },
    sports_performance: {
      label: "Sports Performance",
      summary: "Use this when mechanics, energy, velocity, and performance credibility are the main selling points.",
      defaults: {
        subject: "athlete or rider in performance gear",
        goal: "create a high-performance launch film",
        look: "bold premium sports commercial, crisp contrast, controlled speed"
      },
      continuityRules: [
        "keep biomechanics, posture logic, and gear fit believable",
        "preserve sponsor marks, equipment silhouette, and environment direction",
        "avoid warped anatomy, random motion blur, and unstable background perspective"
      ],
      step3Label: "Pose",
      step3Lines: [
        "Use the Step 1 master concept image as the anchor for {subject}.",
        "Generate a 3x3 pose and energy sheet instead of a facial-only expression sheet.",
        "Cover preparation, launch, mid-action, peak extension, recovery, and controlled power variations.",
        "Keep anatomy, gear fit, limb direction, and momentum believable in every tile.",
        "Preserve the same lighting family, equipment detail, and campaign tone across all nine frames.",
        "Clean 3x3 grid, no text, no watermark, no broken limbs, no extra athletes."
      ],
      sheetPacks: [
        {
          name: "{subject} identity base",
          entityType: "character",
          componentType: "base",
          notes: "Lock face, body build, stance, and performance presence for {subject}."
        },
        {
          name: "performance look sheet",
          entityType: "character",
          componentType: "outfit",
          notes: "Preserve suit, uniform, or gear fit, logo placement, and material behavior."
        },
        {
          name: "action mechanics sheet",
          entityType: "character",
          componentType: "pose",
          notes: "Capture preparation, mid-action, peak extension, and finish with believable mechanics."
        },
        {
          name: "equipment detail sheet",
          entityType: "prop",
          componentType: "accessory",
          notes: "Track helmet, saddle, tool, or hero equipment details that must stay stable."
        },
        {
          name: "environment continuity sheet",
          entityType: "space",
          componentType: "base",
          notes: "Lock track, arena, court, or field depth, light direction, and ground texture."
        }
      ],
      beats: [
        {
          title: "Hard launch",
          action: "Open on {subject} entering the motion with immediate intent.",
          camera: "tracking side move or low-angle push",
          purpose: "Communicate power and credibility in the first beat."
        },
        {
          title: "Mechanics build",
          action: "Show the movement developing with clean readable body mechanics.",
          camera: "controlled lateral track",
          purpose: "Make the movement feel real, not synthetic."
        },
        {
          title: "Peak moment",
          action: "Hit the strongest extension or performance moment for {subject}.",
          camera: "3/4 hero angle with selective slow-motion feel",
          purpose: "Create the memorable payoff shot."
        },
        {
          title: "Detail emphasis",
          action: "Cut into gear, material stress, grip, and equipment inserts.",
          camera: "macro detail coverage",
          purpose: "Support premium craftsmanship and product proof."
        },
        {
          title: "Finish resolve",
          action: "Land on a composed hero finish that still carries motion energy.",
          camera: "settling medium-wide or frontal hero",
          purpose: "Close with a campaign-grade end frame."
        }
      ]
    },
    product_detail: {
      label: "Product Detail",
      summary: "Use this when proportion, material finish, macro detail, and use-context clarity are more important than character emotion.",
      defaults: {
        subject: "hero product",
        goal: "create a premium product detail film",
        look: "clean commercial product film, precise macro detail, premium material clarity"
      },
      continuityRules: [
        "keep product proportions, logo placement, and material finish identical",
        "preserve hardware, seam logic, and tactile highlights between shots",
        "avoid warped geometry, texture drift, and arbitrary background changes"
      ],
      step3Label: "Macro",
      step3Lines: [
        "Use the Step 1 master concept image as the identity anchor for {subject}.",
        "Generate a 3x3 macro and usage variation sheet instead of a human expression sheet.",
        "Cover hero front, 3/4 angle, logo close-up, material macro, hardware detail, use-context, rear detail, top detail, and finish detail.",
        "Keep product proportions, materials, logo placement, and finish identical in every tile.",
        "Use a clean studio or approved use-context background, with no extra objects unless they support product scale or handling.",
        "Clean 3x3 grid, no text, no watermark, no warped geometry."
      ],
      sheetPacks: [
        {
          name: "{subject} hero proportions",
          entityType: "product",
          componentType: "base",
          notes: "Lock silhouette, proportions, front-back logic, and primary brand shape."
        },
        {
          name: "macro material sheet",
          entityType: "product",
          componentType: "material",
          notes: "Track texture, stitching, finish, reflections, and tactile highlights."
        },
        {
          name: "hardware and logo sheet",
          entityType: "product",
          componentType: "accessory",
          notes: "Preserve logo placement, button or zipper logic, hardware finish, and small branded details."
        },
        {
          name: "use-context sheet",
          entityType: "prop",
          componentType: "pose",
          notes: "Show how the product is held, worn, or used without changing scale or hero dominance."
        },
        {
          name: "set lighting sheet",
          entityType: "space",
          componentType: "base",
          notes: "Lock surface, gradient, background tone, and reflection family for the product stage."
        }
      ],
      beats: [
        {
          title: "Hero introduction",
          action: "Reveal {subject} with exact proportions and one clear hero angle.",
          camera: "slow tabletop push or restrained orbit",
          purpose: "Establish product authority and shape clarity."
        },
        {
          title: "Form explanation",
          action: "Rotate or reframe the product to explain its silhouette and major surfaces.",
          camera: "controlled profile transition",
          purpose: "Make the object easy to understand in motion."
        },
        {
          title: "Macro proof",
          action: "Cut into material, logo, and hardware inserts with tactile emphasis.",
          camera: "macro coverage and detail linger",
          purpose: "Sell craftsmanship and premium finish."
        },
        {
          title: "Use context",
          action: "Show how {subject} lives in the hand, on-body, or in real use.",
          camera: "medium insert with simple human interaction",
          purpose: "Translate detail into desirability and function."
        },
        {
          title: "Hero close",
          action: "Return to the clean hero frame with stronger brand clarity.",
          camera: "settling 3/4 hero frame",
          purpose: "Finish on a frame that could work as a product key visual."
        }
      ]
    },
    brand_story: {
      label: "Brand Story",
      summary: "Use this when emotional arc, ritual, and world-building are more important than a purely mechanical product demo.",
      defaults: {
        subject: "hero subject or product with human context",
        goal: "create a brand story short film",
        look: "warm cinematic brand film, human-scale detail, controlled emotional build"
      },
      continuityRules: [
        "keep the emotional tone and lighting family coherent from beat to beat",
        "preserve the hero identity, ritual props, and world texture",
        "avoid disconnected scenes that feel like separate ads"
      ],
      step3Label: "Emotion",
      step3Lines: [
        "Use the Step 1 master concept image as the anchor for {subject}.",
        "Generate a 3x3 emotion and ritual sheet with variations that support the same brand world.",
        "Cover calm, anticipation, connection, focus, warmth, confidence, reflection, release, and resolve.",
        "Keep identity, props, environment cues, and lighting family coherent across all tiles.",
        "This is a story-mood sheet, so preserve emotional continuity rather than forcing exaggerated expressions.",
        "Clean 3x3 grid, no text, no watermark, no unrelated props."
      ],
      sheetPacks: [
        {
          name: "hero identity anchor",
          entityType: "character",
          componentType: "base",
          notes: "Lock the main face, posture language, and emotional baseline for {subject}."
        },
        {
          name: "ritual prop sheet",
          entityType: "prop",
          componentType: "accessory",
          notes: "Track the object or ritual details that carry brand meaning between cuts."
        },
        {
          name: "emotion range sheet",
          entityType: "character",
          componentType: "expression",
          notes: "Define the emotional bandwidth so the same person can travel across beats without drifting."
        },
        {
          name: "world continuity sheet",
          entityType: "space",
          componentType: "base",
          notes: "Preserve room tone, environment depth, and key light direction for the brand world."
        }
      ],
      beats: [
        {
          title: "Quiet invitation",
          action: "Open with a calm, readable frame that sets the emotional temperature.",
          camera: "gentle push-in or still life open",
          purpose: "Create trust and attention without over-explaining."
        },
        {
          title: "Ritual detail",
          action: "Introduce the key touchpoint, ritual, or brand gesture.",
          camera: "close-up inserts with human pacing",
          purpose: "Turn brand values into something tangible."
        },
        {
          title: "Emotional turn",
          action: "Let {subject} shift into the central feeling of the piece.",
          camera: "portrait-driven medium coverage",
          purpose: "Give the film a memorable emotional center."
        },
        {
          title: "World proof",
          action: "Show how the surrounding environment supports the same story.",
          camera: "wider environmental coverage",
          purpose: "Make the brand world feel intentional and complete."
        },
        {
          title: "Soft resolve",
          action: "End on a hero frame that feels like emotional closure, not just product exposure.",
          camera: "composed final tableau",
          purpose: "Leave a resonant brand memory."
        }
      ]
    },
    space_mood: {
      label: "Space Mood",
      summary: "Use this when environment, lighting transitions, and spatial continuity are the main experience.",
      defaults: {
        subject: "hero space or environment",
        goal: "create an atmospheric space mood film",
        look: "cinematic environmental study, depth, texture, and controlled light transitions"
      },
      continuityRules: [
        "keep layout, horizon logic, and light direction coherent between beats",
        "preserve material palette, haze depth, and atmospheric texture",
        "avoid random prop swaps and disconnected time-of-day changes"
      ],
      step3Label: "Lighting",
      step3Lines: [
        "Use the Step 1 master concept image as the anchor for {subject}.",
        "Generate a 3x3 lighting and atmosphere variation sheet instead of a character expression sheet.",
        "Cover wide, medium, close texture, doorway or threshold, key light pool, backlit depth, surface detail, hero mood frame, and ending atmosphere.",
        "Keep layout logic, material palette, and environmental identity stable across all tiles.",
        "Use the sheet to test mood range without changing the actual place.",
        "Clean 3x3 grid, no text, no watermark, no random furniture or object swaps."
      ],
      sheetPacks: [
        {
          name: "space layout anchor",
          entityType: "space",
          componentType: "base",
          notes: "Lock the architecture, horizon, major shapes, and compositional anchor points for {subject}."
        },
        {
          name: "material palette sheet",
          entityType: "space",
          componentType: "material",
          notes: "Track wall, floor, surface, haze, and texture cues that define the place."
        },
        {
          name: "light pool sheet",
          entityType: "space",
          componentType: "accessory",
          notes: "Preserve practical lights, window falloff, and key light pools that guide the eye."
        },
        {
          name: "prop anchor sheet",
          entityType: "prop",
          componentType: "base",
          notes: "If one object repeats in the environment, keep it stable as a spatial anchor."
        }
      ],
      beats: [
        {
          title: "Threshold open",
          action: "Introduce {subject} with one wide atmospheric establishing frame.",
          camera: "slow drift or static reveal",
          purpose: "Make the world readable before adding detail."
        },
        {
          title: "Depth walk",
          action: "Move through or across the space to reveal spatial layering.",
          camera: "measured tracking move",
          purpose: "Sell depth and navigation."
        },
        {
          title: "Texture linger",
          action: "Pause on materials, surfaces, and light pools that define the mood.",
          camera: "detail inserts and medium coverage",
          purpose: "Make the environment tactile, not generic."
        },
        {
          title: "Mood shift",
          action: "Let lighting or atmosphere intensify without changing the place itself.",
          camera: "controlled reframing or slow push",
          purpose: "Add emotional progression while preserving continuity."
        },
        {
          title: "Hero environment close",
          action: "Resolve on a frame that captures the full spatial identity in one image.",
          camera: "wide hero composition",
          purpose: "End with a memorable environmental signature."
        }
      ]
    }
  };

  function trimText(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function sanitizeTemplateId(value) {
    return Object.prototype.hasOwnProperty.call(TEMPLATE_LIBRARY, value) ? value : DEFAULT_TEMPLATE_ID;
  }

  function sanitizeDuration(value) {
    const numeric = Number.parseInt(value, 10);
    return DURATION_OPTIONS.includes(numeric) ? numeric : 15;
  }

  function getTemplate(templateId) {
    return TEMPLATE_LIBRARY[sanitizeTemplateId(templateId)];
  }

  function fillPlaceholders(value, context) {
    return String(value || "").replace(/\{(\w+)\}/g, (_, key) => {
      return key in context ? context[key] : "";
    });
  }

  function splitDuration(totalSeconds, beatCount) {
    const safeBeatCount = Math.max(1, Number.parseInt(beatCount, 10) || 1);
    const safeTotalSeconds = Math.max(safeBeatCount, sanitizeDuration(totalSeconds));
    const base = Math.floor(safeTotalSeconds / safeBeatCount);
    const remainder = safeTotalSeconds % safeBeatCount;
    return Array.from({ length: safeBeatCount }, (_, index) => base + (index < remainder ? 1 : 0));
  }

  function buildTimeLabel(startSecond, duration) {
    return `${startSecond}-${startSecond + duration}s`;
  }

  function buildBlueprint(options = {}) {
    const template = getTemplate(options.templateId);
    const durationSec = sanitizeDuration(options.durationSec);
    const context = {
      subject: trimText(options.subject) || template.defaults.subject,
      goal: trimText(options.goal) || template.defaults.goal,
      look: trimText(options.look) || template.defaults.look,
      brief: trimText(options.brief),
      referenceGuide: trimText(options.referenceGuide) || "No attached references yet",
      identityPackGuide: trimText(options.identityPackGuide) || "No structured identity packs yet",
      durationSec: String(durationSec),
      templateLabel: template.label
    };

    const sheetPacks = template.sheetPacks.map((pack) => ({
      name: fillPlaceholders(pack.name, context),
      entityType: pack.entityType,
      componentType: pack.componentType,
      notes: fillPlaceholders(pack.notes, context)
    }));

    const beatDurations = splitDuration(durationSec, template.beats.length);
    let currentSecond = 0;
    const beats = template.beats.map((beat, index) => {
      const segmentDuration = beatDurations[index];
      const beatResult = {
        time: buildTimeLabel(currentSecond, segmentDuration),
        title: fillPlaceholders(beat.title, context),
        action: fillPlaceholders(beat.action, context),
        camera: fillPlaceholders(beat.camera, context),
        purpose: fillPlaceholders(beat.purpose, context)
      };
      currentSecond += segmentDuration;
      return beatResult;
    });

    const continuityRules = template.continuityRules.map((rule) => fillPlaceholders(rule, context));
    const sheetSummary = sheetPacks.map((pack) => pack.name).join(" | ");
    const beatSummary = beats.map((beat) => `${beat.time} ${beat.title}`).join(" | ");
    const continuitySummary = continuityRules.join(" | ");
    const step3PromptLines = template.step3Lines.map((line) => fillPlaceholders(line, context));

    const sheetOutputLines = [
      `Template: ${template.label} (${durationSec}s)`,
      template.summary,
      "",
      "Recommended sheet packs:"
    ];
    sheetPacks.forEach((pack, index) => {
      sheetOutputLines.push(`${index + 1}. ${pack.name} [${pack.entityType} / ${pack.componentType}]`);
      sheetOutputLines.push(`   - ${pack.notes}`);
    });
    sheetOutputLines.push("", "Continuity priorities:");
    continuityRules.forEach((rule) => {
      sheetOutputLines.push(`- ${rule}`);
    });
    sheetOutputLines.push(
      "",
      `Current subject anchor: ${context.subject}`,
      `Current goal: ${context.goal}`,
      `Current look: ${context.look}`,
      `Current reference guide: ${context.referenceGuide}`,
      `Current identity anchor: ${context.identityPackGuide}`
    );

    const beatOutputLines = [`Template: ${template.label} beat blueprint`, ""];
    beats.forEach((beat, index) => {
      beatOutputLines.push(`${index + 1}. ${beat.time} | ${beat.title}`);
      beatOutputLines.push(`Action: ${beat.action}`);
      beatOutputLines.push(`Camera: ${beat.camera}`);
      beatOutputLines.push(`Purpose: ${beat.purpose}`);
      beatOutputLines.push("");
    });
    beatOutputLines.push("Continuity priorities:");
    continuityRules.forEach((rule) => {
      beatOutputLines.push(`- ${rule}`);
    });

    return {
      templateId: sanitizeTemplateId(options.templateId),
      templateLabel: template.label,
      templateSummary: template.summary,
      durationSec,
      defaultSubject: template.defaults.subject,
      defaultGoal: template.defaults.goal,
      defaultLook: template.defaults.look,
      step3Label: template.step3Label,
      step3PromptLines,
      sheetPacks,
      beats,
      sheetSummary,
      beatSummary,
      continuitySummary,
      sheetOutput: sheetOutputLines.join("\n"),
      beatOutput: beatOutputLines.join("\n")
    };
  }

  window.ShonodeGuidedTemplateEngine = {
    DEFAULT_TEMPLATE_ID,
    DURATION_OPTIONS,
    TEMPLATE_OPTIONS: Object.entries(TEMPLATE_LIBRARY).map(([id, template]) => ({
      id,
      label: template.label,
      summary: template.summary
    })),
    sanitizeTemplateId,
    sanitizeDuration,
    getTemplate,
    buildBlueprint
  };
})();
