export class VideoLoader {
	items: { id: string, url: string }[] = [];

	add(id: string, url: string): void {
		this.items.push({ id, url });
	}

	async load(): Promise<Record<string, ArrayBuffer>> {
		const buffers: Record<string, ArrayBuffer> = {};

		for (const { id, url } of this.items) {
			buffers[id] = await this.fetch(url);
		}

		return buffers;
	}

	private fetch(url: string): Promise<ArrayBuffer> {
		return new Promise((resolve) => {
			const request = new XMLHttpRequest();
			request.open("GET", url);
			request.responseType = 'arraybuffer';
			request.onload = () => {
				resolve(request.response);
			}
			request.send();
		})
	}
}
