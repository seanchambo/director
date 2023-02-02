import * as Comlink from 'comlink';
import { VideoMediaObject } from '../../model';
import type { VideoResourceWorker } from './VideoResourceWorker';

export type VideoResource = Comlink.Remote<VideoResourceWorker>;

export const createVideoResource = async (videoObject: VideoMediaObject): Promise<VideoResource> => {
	const worker = Comlink.wrap<VideoResourceWorker>(new Worker(new URL("./VideoResourceWorker.ts", import.meta.url)));
	await worker.init(videoObject);
	return worker;
}
