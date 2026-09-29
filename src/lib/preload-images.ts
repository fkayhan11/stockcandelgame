const preloaded = new Set<string>();

export function preloadImages(urls: string[]) {
  urls.forEach((url) => {
    if (!url || preloaded.has(url)) return;
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    preloaded.add(url);
  });
}
