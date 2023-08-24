export class AudioLoader {
	items: { id: string, url: string }[] = [];
	audioContext: AudioContext = new AudioContext();

	add(id: string, url: string): void {
		this.items.push({ id, url });
	}

	async load(): Promise<Record<string, AudioBuffer>> {
		const buffers: Record<string, AudioBuffer> = {};

		for (const { id, url } of this.items) {
			buffers[id] = await this.fetch(url);
		}

		return buffers;
	}

	private fetch(url: string): Promise<AudioBuffer> {
		return new Promise((resolve) => {
			const request = new XMLHttpRequest();
			request.open("GET", url);
			request.responseType = 'arraybuffer';
			request.onload = () => {
				this.audioContext.decodeAudioData(request.response, (buffer) => resolve(buffer))
			}
			request.send();
		})
	}
}
