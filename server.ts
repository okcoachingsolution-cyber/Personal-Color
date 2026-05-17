import express from "express";
import path from "path";
import multer from "multer";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Multer for image upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Gemini initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY as string,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const personalColorSchema = {
  type: Type.OBJECT,
  properties: {
    disclaimer: { type: Type.STRING },
    summary: { type: Type.STRING },
    tone_direction: { type: Type.STRING },
    season_type: { type: Type.STRING },
    sub_type: { type: Type.STRING },
    confidence: { type: Type.NUMBER },
    analysis: {
      type: Type.OBJECT,
      properties: {
        skin_tone: { type: Type.STRING },
        brightness: { type: Type.STRING },
        saturation: { type: Type.STRING },
        contrast: { type: Type.STRING },
        overall_impression: { type: Type.STRING }
      },
      required: ["skin_tone", "brightness", "saturation", "contrast", "overall_impression"]
    },
    recommended_colors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          hex: { type: Type.STRING },
          reason: { type: Type.STRING }
        },
        required: ["name", "hex", "reason"]
      }
    },
    avoid_colors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          hex: { type: Type.STRING },
          reason: { type: Type.STRING }
        },
        required: ["name", "hex", "reason"]
      }
    },
    makeup_recommendations: {
      type: Type.OBJECT,
      properties: {
        lip: { type: Type.ARRAY, items: { type: Type.STRING } },
        blush: { type: Type.ARRAY, items: { type: Type.STRING } },
        eyeshadow: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["lip", "blush", "eyeshadow"]
    },
    hair_recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
    fashion_recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
    style_tip: { type: Type.STRING },
    photo_quality_note: { type: Type.STRING }
  },
  required: [
    "disclaimer", "summary", "tone_direction", "season_type", "sub_type", 
    "confidence", "analysis", "recommended_colors", "avoid_colors", 
    "makeup_recommendations", "hair_recommendations", "fashion_recommendations", 
    "style_tip", "photo_quality_note"
  ]
};

app.post("/api/analyze", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "이미지가 필요합니다." });
    }

    const base64Image = req.file.buffer.toString("base64");
    const prompt = `
너는 전문 퍼스널컬러 컨설턴트이자 이미지 분석 전문가야.
사용자가 업로드한 얼굴 사진을 바탕으로 퍼스널컬러를 분석해줘. 

분석할 항목은 다음과 같아.
1. 피부 톤 (밝기, 색감, 투명도 - 구체적으로)
2. 전체 인상 (명도, 채도, 대비감, 이미지 느낌)
3. 웜톤 / 쿨톤 / 중립톤 판단
4. 4계절 퍼스널컬러 및 세부 타입 추천 (예: 가을 웜 뮤트)
5. 추천 컬러 (정확히 8개), 피해야 할 컬러 (정확히 5개)
6. 립, 블러셔, 아이섀도우, 헤어, 의류 추천
7. 스타일링 팁

반드시 제공된 JSON 형식으로 한국어로 답변해줘. 너무 단정적이지 않은 "현재 이미지 기준으로는", "가까워 보여요" 같은 친절한 어조를 사용해.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: prompt },
            { inlineData: { data: base64Image, mimeType: req.file.mimetype } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: personalColorSchema
      }
    });

    const result = JSON.parse(response.text);
    res.json(result);
  } catch (error: any) {
    console.error("Analysis error:", error);
    res.status(500).json({ error: "분석 중 오류가 발생했습니다.", details: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
