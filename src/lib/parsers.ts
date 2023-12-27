export function getOgValue(ogField: string): string {
    const node = document.querySelectorAll(`meta[property="og:${ogField}"]`);
    if (node.length > 0) {
        return node[0].getAttribute('content');
    }
    return null;
}

export function getTitle() {
    const ogTitle = getOgValue('title');
    return ogTitle || document.title;
}