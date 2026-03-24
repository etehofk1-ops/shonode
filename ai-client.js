window.ShotBoardAI = {
  model: "gemini-2.5-flash",
  headers: {},

  get endpoint() {
    const baseOrigin = window.location.protocol === "file:"
      ? "http://127.0.0.1:4173"
      : window.location.origin;
    return `${baseOrigin}/api/storyboard`;
  },

  async generateStoryboard(payload) {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.headers
      },
      body: JSON.stringify({
        model: this.model,
        request: this.buildRequest(payload)
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Shonode AI proxy failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    return this.mapResponse(result);
  },

  buildRequest(payload) {
    const parts = [
      {
        text: this.buildPrompt(payload)
      }
    ];

    (payload?.referenceImages || []).forEach((image) => {
      const inlineData = this.toInlineData(image);
      if (inlineData) {
        parts.push({ inlineData });
      }
    });

    return {
      contents: [
        {
          role: "user",
          parts
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseJsonSchema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            previewVideoUrl: { type: "string" },
            previewPosterUrl: { type: "string" },
            projectDraft: {
              type: "object",
              properties: {
                title: { type: "string" },
                sequence: { type: "string" },
                runtime: { type: "string" },
                tone: { type: "string" },
                logline: { type: "string" },
                notes: { type: "string" }
              },
              required: ["title", "sequence", "runtime", "tone", "logline", "notes"]
            },
            cuts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  sceneTitle: { type: "string" },
                  durationLabel: { type: "string" },
                  caption: { type: "string" },
                  referenceImageIndex: { type: "integer" },
                  t2iPrompt: { type: "string" },
                  i2vStartPrompt: { type: "string" },
                  i2vMotionPrompt: { type: "string" },
                  i2vEndPrompt: { type: "string" }
                },
                required: [
                  "sceneTitle",
                  "durationLabel",
                  "caption",
                  "t2iPrompt",
                  "i2vStartPrompt",
                  "i2vMotionPrompt",
                  "i2vEndPrompt"
                ]
              }
            }
          },
          required: ["summary", "projectDraft", "cuts"]
        }
      }
    };
  },

  buildPrompt(payload) {
    const brief = payload?.brief?.trim() || "";
    const project = payload?.project || {};
    const existingCount = Number(payload?.existingPanelCount) || 0;
    const referenceImageCount = Number(payload?.referenceImageCount) || 0;
    const referenceWeight = Number(payload?.referenceWeight) || 2;
    const selectedPanels = Array.isArray(payload?.selectedPanels) ? payload.selectedPanels : [];
    const isSelectedRegeneration = payload?.generationMode === "selected-panels";

    if (isSelectedRegeneration) {
      const selectedPanelCount = Number(payload?.selectedPanelCount) || selectedPanels.length || 1;
      const selectedPanelContext = selectedPanels.map((panel, index) => [
        `Selected cut ${index + 1}:`,
        `- sceneTitle: ${panel?.sceneTitle || ""}`,
        `- durationLabel: ${panel?.durationLabel || ""}`,
        `- caption: ${panel?.caption || ""}`,
        `- referenceImageName: ${panel?.referenceImageName || ""}`,
        `- referenceImageIndex: ${Number.isInteger(panel?.referenceImageIndex) ? panel.referenceImageIndex : -1}`,
        `- currentT2I: ${panel?.t2iPrompt || ""}`,
        `- currentI2VStart: ${panel?.i2vStartPrompt || ""}`,
        `- currentI2VMotion: ${panel?.i2vMotionPrompt || ""}`,
        `- currentI2VEnd: ${panel?.i2vEndPrompt || ""}`
      ].join("\n")).join("\n\n");

      return [
        "You are an AI storyboard refiner for short commercial videos.",
        "Return only valid JSON matching the provided schema.",
        "This is NOT a full storyboard generation request.",
        `Regenerate only the ${selectedPanelCount} selected cuts listed below.`,
        "Keep the same cut count and preserve each cut's role in the sequence.",
        "Improve clarity, shot design, and production usability while keeping the existing intent.",
        "",
        "Requirements:",
        `- Return exactly ${selectedPanelCount} cuts in the same order as the selected cuts.`,
        "- summary, sceneTitle, durationLabel, and caption must be written in natural Korean.",
        "- durationLabel should use Korean style like '약 3초'.",
        "- caption should naturally mention how many seconds this shot roughly takes.",
        "- t2iPrompt, i2vStartPrompt, i2vMotionPrompt, and i2vEndPrompt should be written in strong production-friendly English.",
        "- When reference images are provided, use them to preserve subject, styling, composition, and mood anchors.",
        "- referenceImageIndex should point to the best matching uploaded reference image for each regenerated cut. Use 0-based indexes. If none fit, use -1.",
        "- projectDraft fields can stay close to the current project context and do not need to invent a new project direction.",
        "- If preview video or poster URLs do not exist, return empty strings.",
        "",
        "Project context:",
        `- title: ${project.title || ""}`,
        `- sequence: ${project.sequence || ""}`,
        `- runtime: ${project.runtime || ""}`,
        `- tone: ${project.tone || ""}`,
        `- aspectRatio: ${project.aspectRatio || ""}`,
        `- logline: ${project.logline || ""}`,
        `- notes: ${project.notes || ""}`,
        `- referenceImageCount: ${referenceImageCount}`,
        `- referenceImageWeight: ${referenceWeight}`,
        "",
        "Original user brief:",
        brief,
        "",
        "Selected cuts to regenerate:",
        selectedPanelContext
      ].join("\n");
    }

    return [
      "You are an AI storyboard planner for short commercial videos.",
      "Read the user's vague Korean brief and convert it into a practical storyboard plan.",
      "Return only valid JSON matching the provided schema.",
      "",
      "Requirements:",
      "- Infer an appropriate number of cuts for a 15-30 second commercial unless the brief explicitly requests something else.",
      "- Write concise but production-usable shot descriptions.",
      "- summary, sceneTitle, durationLabel, and caption must be written in natural Korean.",
      "- durationLabel should use Korean style like '약 3초'.",
      "- caption should naturally mention how many seconds this shot roughly takes.",
      "- referenceImageIndex should point to the most relevant uploaded reference image for each cut. Use 0-based indexes. If there are no reference images, omit it or use -1.",
      "- t2iPrompt, i2vStartPrompt, i2vMotionPrompt, and i2vEndPrompt should be written in strong production-friendly English for image/video generation.",
      "- projectDraft.title, sequence, runtime, tone, logline, and notes must be filled in Korean for the left sidebar.",
      "- projectDraft.notes should include camera movement, emotional flow, visual tone, or edit direction.",
      "- Write T2I prompts for Nano Banana Pro 2 style image generation.",
      "- Write I2V prompts for Kling or Higgsfield using start frame, motion, and end frame fields.",
      "- Keep prompts visually specific and ad-ready.",
      "- If preview video or poster URLs do not exist, return empty strings.",
      "- When reference images are provided, analyze them and use their subject, styling, composition, and mood as the basis for T2I and I2V prompts.",
      "- referenceImageWeight describes how strongly the original reference images should be preserved. Higher values should keep more composition, silhouette, and styling anchors.",
      "",
      "Project context:",
      `- title: ${project.title || ""}`,
      `- sequence: ${project.sequence || ""}`,
      `- runtime: ${project.runtime || ""}`,
      `- tone: ${project.tone || ""}`,
      `- aspectRatio: ${project.aspectRatio || ""}`,
      `- logline: ${project.logline || ""}`,
      `- notes: ${project.notes || ""}`,
      `- currentPanelCount: ${existingCount}`,
      `- referenceImageCount: ${referenceImageCount}`,
      `- referenceImageWeight: ${referenceWeight}`,
      "",
      "User brief:",
      brief
    ].join("\n");
  },

  toInlineData(image) {
    if (!image?.dataUrl || typeof image.dataUrl !== "string") {
      return null;
    }

    const commaIndex = image.dataUrl.indexOf(",");
    if (commaIndex === -1) {
      return null;
    }

    const metadata = image.dataUrl.slice(0, commaIndex);
    const payload = image.dataUrl.slice(commaIndex + 1);
    const mimeTypeMatch = metadata.match(/^data:([^;,]+)/i);
    const mimeType = image.mimeType || mimeTypeMatch?.[1] || "image/jpeg";
    const data = /;base64/i.test(metadata)
      ? payload
      : this.encodeBase64Data(decodeURIComponent(payload));

    return {
      mimeType,
      data
    };
  },

  encodeBase64Data(value) {
    const bytes = new TextEncoder().encode(value);
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary);
  },

  mapResponse(result) {
    const candidateText = result?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || "")
      .join("")
      .trim();

    if (!candidateText) {
      throw new Error("Gemini returned no text content.");
    }

    let parsed;
    try {
      parsed = JSON.parse(candidateText);
    } catch (error) {
      throw new Error(`Gemini JSON parse failed: ${error.message}`);
    }

    return {
      summary: typeof parsed?.summary === "string" ? parsed.summary : "",
      previewVideoUrl: typeof parsed?.previewVideoUrl === "string" ? parsed.previewVideoUrl : "",
      previewPosterUrl: typeof parsed?.previewPosterUrl === "string" ? parsed.previewPosterUrl : "",
      projectDraft: parsed?.projectDraft && typeof parsed.projectDraft === "object" ? parsed.projectDraft : {},
      cuts: Array.isArray(parsed?.cuts) ? parsed.cuts : []
    };
  }
};
