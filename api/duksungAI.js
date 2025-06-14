import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req, res) {
  const  allowedOrigin = "https://hyeonjirhee.github.io"

  res.setHeader("Access-Control-Aloow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { mood, partner } = req.body;

  if (!mood || !partner) {
    return res.status(400).json({ error: "기분(mood)과 놀이 대상(partner)을 입력해주세요." });
  }

  try {
    const today = new Date().toISOString().slice(0, 10);

    const prompt = `
    오늘의 날짜: ${today}
    기분: ${mood}
    함께 놀고 싶은 대상: ${partner}

    위 정보를 바탕으로 상황에 맞는 재미있는 놀이를 하나 추천해줘.
    장소나 준비물도 함께 말해줘. 추천은 2~3문장 이내로 짧고 가볍게!
    `;

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "당신은 기분과 상황에 맞춰 놀이를 제안해주는 AI 놀이 전문가입니다. 추천은 밝고 긍정적이며 유쾌하게 제안해주세요. 추천은 짧고 간결하게, 부정적인 표현은 피하고, 놀이 이름이나 장소·준비물을 구체적으로 언급해주세요.",
      },
    });

    res.status(200).json({ answer: result.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gemini API 오류 발생" });
  }
}