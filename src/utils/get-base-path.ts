import path from "node:path";

export function getBasePath(url: string) {
	const base = import.meta.env.BASE_URL;
	return path.join(base, url);
}
