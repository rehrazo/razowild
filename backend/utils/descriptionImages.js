function normalizeImageUrl(value) {
  return String(value || '').trim();
}

function getImageDedupKey(imageUrl) {
  const raw = normalizeImageUrl(imageUrl);
  if (!raw) {
    return '';
  }

  const normalized = raw.replace(/[?#].*$/, '').toLowerCase();
  const parts = normalized.split('/').filter(Boolean);
  const filename = parts.length ? parts[parts.length - 1] : normalized;
  return filename || normalized;
}

function extractImageUrlsFromHtml(html = '') {
  const content = String(html || '');
  if (!content) {
    return [];
  }

  const results = [];
  const imgTagPattern = /<img\b[^>]*>/gi;
  const srcAttrPattern = /\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i;

  let tagMatch = imgTagPattern.exec(content);
  while (tagMatch) {
    const tag = tagMatch[0];
    const srcMatch = srcAttrPattern.exec(tag);
    const src = normalizeImageUrl(srcMatch?.[1] || srcMatch?.[2] || srcMatch?.[3] || '');

    if (src) {
      results.push(src.replace(/&amp;/gi, '&'));
    }

    tagMatch = imgTagPattern.exec(content);
  }

  return results;
}

function stripImageTagsFromHtml(html = '') {
  const content = String(html || '');
  if (!content) {
    return null;
  }

  const withoutImages = content
    .replace(/<img\b[^>]*>/gi, '')
    .replace(/<p>\s*<\/p>/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return withoutImages || null;
}

function normalizeImagesForStorage(images = [], additionalImageUrls = []) {
  const merged = [];
  const seenExact = new Set();
  const seenFilename = new Set();

  const pushExistingImage = (value) => {
    const url = normalizeImageUrl(value);
    if (!url) {
      return;
    }

    const exactKey = url.toLowerCase();
    if (seenExact.has(exactKey)) {
      return;
    }

    seenExact.add(exactKey);
    const filenameKey = getImageDedupKey(url);
    if (filenameKey) {
      seenFilename.add(filenameKey);
    }

    merged.push({
      image_url: url,
      image_order: merged.length + 1,
      is_additional: false,
    });
  };

  const pushAdditionalImage = (value) => {
    const url = normalizeImageUrl(value);
    if (!url) {
      return;
    }

    const exactKey = url.toLowerCase();
    const filenameKey = getImageDedupKey(url);

    if (seenExact.has(exactKey)) {
      return;
    }

    if (filenameKey && seenFilename.has(filenameKey)) {
      return;
    }

    seenExact.add(exactKey);
    if (filenameKey) {
      seenFilename.add(filenameKey);
    }

    merged.push({
      image_url: url,
      image_order: merged.length + 1,
      is_additional: false,
    });
  };

  (Array.isArray(images) ? images : []).forEach((item) => {
    if (typeof item === 'string') {
      pushExistingImage(item);
      return;
    }

    pushExistingImage(item?.image_url || item?.image || item?.url || item?.src || '');
  });

  (Array.isArray(additionalImageUrls) ? additionalImageUrls : []).forEach((url) => {
    pushAdditionalImage(url);
  });

  return merged;
}

module.exports = {
  extractImageUrlsFromHtml,
  stripImageTagsFromHtml,
  normalizeImagesForStorage,
};
