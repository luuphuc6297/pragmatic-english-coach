import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generate() {
  try {
    console.log("Generating image...");
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: 'A cute 3D clay illustration of a globe, plasticine texture, cute, soft lighting, pastel colors, isometric view, chunky and soft, handmade feel, tactile clay texture, white background',
          },
        ],
      },
    });

    if (!response.candidates || response.candidates.length === 0) {
      console.error("No candidates returned");
      return;
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64Data = part.inlineData.data;
        const publicDir = path.join(process.cwd(), 'public');
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }
        fs.writeFileSync(path.join(publicDir, 'clay-icon.png'), base64Data, 'base64');
        console.log('Image generated successfully at public/clay-icon.png');
        return;
      }
    }
    console.log("No image data found in response.");
  } catch (error) {
    console.error('Error generating image:', error);
  }
}

generate();
