import { EditorBlock } from '../models/publishing.models';

export interface PreviewBlock {
  id: string;
  kind:
    | 'heading'
    | 'html'
    | 'quote'
    | 'panel'
    | 'image'
    | 'code'
    | 'source';
  text: string;
  label: string;
  url?: string;
  alt?: string;
}

export function previewBlock(block: EditorBlock): PreviewBlock {
  const base: PreviewBlock = {
    id: block.blockId,
    kind: 'source',
    text: block.dataClean,
    label: 'Block source',
  };
  switch (block.componentInstanceName) {
    case 'HeaderBlockComponent':
      return { ...base, kind: 'heading' };
    case 'ParagraphBlockComponent':
      return { ...base, kind: 'html' };
    case 'NgxEditorJs2BlockquotesComponent':
      return { ...base, kind: 'quote' };
    case 'NgxEditorJs2PanelComponent':
      return { ...base, kind: 'panel' };
    case 'NgxEditorJs2CodemirrorComponent': {
      const data = objectPayload(block.dataClean);
      return {
        ...base,
        kind: 'code',
        label: 'Code example',
        text:
          typeof data?.['code'] === 'string'
            ? data['code']
            : block.dataClean,
      };
    }
    case 'NgxEditorJs2ImageComponent': {
      const data = objectPayload(block.dataClean);
      const url = safePreviewImageUrl(data?.['url']);
      return url
        ? {
            ...base,
            kind: 'image',
            url,
            alt:
              typeof data?.['title'] === 'string'
                ? data['title']
                : 'Workshop illustration',
          }
        : { ...base, label: 'Image unavailable · source preview' };
    }
    case 'NgxEditorJs2MermaidjsComponent':
      return { ...base, label: 'Diagram · source preview' };
    case 'NgxEditorJs2PopQuizComponent':
      return { ...base, label: 'Interactive quiz · source preview' };
    default:
      return base;
  }
}

function objectPayload(text: string): Record<string, unknown> | null {
  try {
    const value: unknown = JSON.parse(text);
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export function safePreviewImageUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}
