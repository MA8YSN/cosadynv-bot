/**
 * services/welcomeImageService.ts
 * ─────────────────────────────────────────────────────────────────────────
 * The ONE render function for every welcome card theme. A theme is data
 * (WelcomeThemeLayout, defined in config/welcomeThemes.config.ts), not
 * code — this file never branches on "which theme is this," only on
 * "what kind of background/decoration/etc does this layout specify."
 * Adding a new theme means adding a new layout object to that config
 * file; this file doesn't change.
 *
 * The one place that DOES grow with new themes: if a future theme needs
 * a genuinely new visual primitive (not solid/gradient/serverBanner
 * backgrounds, or radialGlow/grid/particles/frame/stripe decorations),
 * that's a small addition to the DecorationSpec union + one new case
 * below — still a shared, reusable primitive, not a theme-specific
 * drawing function.
 */

import { createCanvas, loadImage, SKRSContext2D } from '@napi-rs/canvas';
import { DecorationSpec, TextElementSpec, WelcomeThemeLayout } from '../config/welcomeThemes.config';
import { ResolvedWelcomeData, resolveWelcomeVariables } from './welcomeVariables';

/** Converts a 0–1 fraction anchor into an absolute pixel coordinate for this layout's canvas. */
function ax(layout: WelcomeThemeLayout, x: number): number {
  return x * layout.canvas.width;
}
function ay(layout: WelcomeThemeLayout, y: number): number {
  return y * layout.canvas.height;
}

/** Appends an alpha channel to a "#RRGGBB" hex string, clamped to [0, 1]. */
function hexWithAlpha(hex: string, alpha: number): string {
  const clamped = Math.max(0, Math.min(1, alpha));
  const alphaHex = Math.round(clamped * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${alphaHex}`;
}

function drawFallbackGradient(ctx: SKRSContext2D, layout: WelcomeThemeLayout): void {
  const { width, height } = layout.canvas;
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#1e1f22');
  gradient.addColorStop(1, '#2b2d31');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawSolidOrGradientBackground(ctx: SKRSContext2D, layout: WelcomeThemeLayout): void {
  const { width, height } = layout.canvas;
  const bg = layout.background;

  if (bg.type === 'solid') {
    ctx.fillStyle = bg.color;
    ctx.fillRect(0, 0, width, height);
    return;
  }

  if (bg.type === 'gradient') {
    const angle = (bg.angleDeg * Math.PI) / 180;
    const x1 = width / 2 - Math.cos(angle) * width;
    const y1 = height / 2 - Math.sin(angle) * height;
    const x2 = width / 2 + Math.cos(angle) * width;
    const y2 = height / 2 + Math.sin(angle) * height;
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, bg.from);
    gradient.addColorStop(1, bg.to);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
}

function drawDecoration(ctx: SKRSContext2D, layout: WelcomeThemeLayout, decoration: DecorationSpec): void {
  const { width, height } = layout.canvas;

  if (decoration.type === 'radialGlow') {
    const cx = ax(layout, decoration.x);
    const cy = ay(layout, decoration.y);
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, decoration.radius);
    gradient.addColorStop(0, hexWithAlpha(decoration.color, decoration.opacity));
    gradient.addColorStop(1, hexWithAlpha(decoration.color, 0));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    return;
  }

  if (decoration.type === 'grid') {
    ctx.strokeStyle = hexWithAlpha(decoration.color, decoration.opacity);
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += decoration.spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += decoration.spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    return;
  }

  if (decoration.type === 'particles') {
    ctx.fillStyle = decoration.color;
    for (let i = 0; i < decoration.count; i++) {
      const px = Math.random() * width;
      const py = Math.random() * height;
      const size =
        decoration.sizeRange[0] + Math.random() * (decoration.sizeRange[1] - decoration.sizeRange[0]);
      ctx.globalAlpha = 0.4 + Math.random() * 0.6;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    return;
  }

  if (decoration.type === 'frame') {
    ctx.strokeStyle = decoration.color;
    ctx.lineWidth = decoration.width;
    ctx.strokeRect(
      decoration.inset,
      decoration.inset,
      width - decoration.inset * 2,
      height - decoration.inset * 2,
    );
    return;
  }

  if (decoration.type === 'stripe') {
    ctx.fillStyle = decoration.color;
    ctx.fillRect(0, ay(layout, decoration.y), width, decoration.height);
  }
}

async function drawClippedImage(
  ctx: SKRSContext2D,
  imageUrl: string,
  centerX: number,
  centerY: number,
  size: number,
  shape: 'circle' | 'square',
  borderColor?: string,
  borderWidth = 0,
): Promise<void> {
  const image = await loadImage(imageUrl);
  const radius = size / 2;

  const clipPath = () => {
    ctx.beginPath();
    if (shape === 'circle') {
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    } else {
      ctx.rect(centerX - radius, centerY - radius, size, size);
    }
    ctx.closePath();
  };

  ctx.save();
  clipPath();
  ctx.clip();
  ctx.drawImage(image, centerX - radius, centerY - radius, size, size);
  ctx.restore();

  if (borderColor && borderWidth > 0) {
    clipPath();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    ctx.stroke();
  }
}

function drawTextElement(
  ctx: SKRSContext2D,
  layout: WelcomeThemeLayout,
  element: TextElementSpec,
  resolvedContent: string,
): void {
  ctx.font = `${element.weight === 'bold' ? 'bold ' : ''}${element.size}px ${layout.fonts[element.font]}`;
  ctx.fillStyle = element.color;
  ctx.textAlign = element.align;
  ctx.textBaseline = 'middle';

  // Not all @napi-rs/canvas versions expose letterSpacing — safe to
  // remove this block if your installed version throws on it.
  try {
    ctx.letterSpacing = element.letterSpacing ? `${element.letterSpacing}px` : '0px';
  } catch {
    // Ignored — letter spacing is a cosmetic nicety, not worth failing the render over.
  }

  ctx.fillText(resolvedContent, ax(layout, element.anchor.x), ay(layout, element.anchor.y));
}

/**
 * Renders a complete welcome card as a PNG buffer, ready to attach to a
 * Discord message. This is the single entry point — every theme, every
 * caller (real joins, /welcome test, the setup wizard's Preview) goes
 * through this exact function.
 */
export async function renderWelcomeCard(
  layout: WelcomeThemeLayout,
  data: ResolvedWelcomeData,
): Promise<Buffer> {
      console.log("🎨 Rendering welcome card:", layout.key);
  const canvas = createCanvas(layout.canvas.width, layout.canvas.height);
  const ctx = canvas.getContext('2d');

  if (layout.background.type === 'serverBanner') {
    if (data.serverBannerURL) {
      const banner = await loadImage(data.serverBannerURL);
      ctx.drawImage(banner, 0, 0, layout.canvas.width, layout.canvas.height);
      ctx.fillStyle = hexWithAlpha(layout.background.overlayColor, layout.background.overlayOpacity);
      ctx.fillRect(0, 0, layout.canvas.width, layout.canvas.height);
    } else {
      // Layout asked for the server's banner, but this guild has none set — fall back safely.
      drawFallbackGradient(ctx, layout);
    }
  } else {
    drawSolidOrGradientBackground(ctx, layout);
  }

  for (const decoration of layout.decorations) {
    drawDecoration(ctx, layout, decoration);
  }

  if (layout.logo && data.serverIconURL) {
    await drawClippedImage(
      ctx,
      data.serverIconURL,
      ax(layout, layout.logo.anchor.x),
      ay(layout, layout.logo.anchor.y),
      layout.logo.size,
      layout.logo.shape,
      layout.logo.borderColor,
      layout.logo.borderWidth,
    );
  }

  await drawClippedImage(
    ctx,
    data.avatarURL,
    ax(layout, layout.avatar.anchor.x),
    ay(layout, layout.avatar.anchor.y),
    layout.avatar.size,
    layout.avatar.shape,
    layout.avatar.borderColor,
    layout.avatar.borderWidth,
  );

  for (const element of layout.textElements) {
    const resolved = resolveWelcomeVariables(element.content, data);
    drawTextElement(ctx, layout, element, resolved);
  }

  return canvas.toBuffer('image/png');
}