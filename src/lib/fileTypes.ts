export const imageExtensions = [
  'jpg',
  'jpeg',
  'png',
  'svg',
  'gif',
  'bmp',
  'webp',
  'tiff',
] as const;

export const audioExtensions = [
  'mp3',
  'wav',
  'flac',
  'aac',
  'ogg',
  'm4a',
] as const;

export const textExtensions = [
  'txt',
  'rtf',
  'odt',
] as const;

export const markdownExtensions = [
  'md',
  'markdown',
  'mdx',
] as const;

export type ExtensionArray = readonly string[];

export function getExtension(name: string): string {
  const idx = name.lastIndexOf('.');
  return idx !== -1 ? name.slice(idx + 1).toLowerCase() : '';
}

export function isExtension(ext: string, list: ExtensionArray): boolean {
  return (list as readonly string[]).includes(ext);
}

export function isImageExtension(ext: string): boolean {
  return isExtension(ext, imageExtensions);
}

export function isAudioExtension(ext: string): boolean {
  return isExtension(ext, audioExtensions);
}

export function isTextExtension(ext: string): boolean {
  return isExtension(ext, textExtensions);
}

export function isMarkdownExtension(ext: string): boolean {
  return isExtension(ext, markdownExtensions);
}
