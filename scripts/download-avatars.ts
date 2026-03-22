import fs from 'fs';
import path from 'path';

async function downloadAvatar(prompt: string, filename: string) {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=400&height=400&nologo=true`;
  console.log(`Downloading ${filename} from ${url}`);
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(path.join(publicDir, filename), buffer);
    console.log(`Successfully saved ${filename}`);
  } catch (error) {
    console.error(`Failed to download ${filename}:`, error);
  }
}

async function main() {
  await downloadAvatar(
    "cute 3d clay human avatar, handmade plasticine texture with smudges and light bumpy surface, simulating handmade clay, soft lighting, pastel colors, isometric view, high quality render, portrait",
    "user-avatar.jpg"
  );
  await downloadAvatar(
    "cute 3d clay robot avatar, handmade plasticine texture with smudges and light bumpy surface, simulating handmade clay, soft lighting, pastel colors, isometric view, high quality render, portrait",
    "bot-avatar.jpg"
  );
}

main();
