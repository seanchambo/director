declare module "mp4box" {

	interface MP4MediaTrack {
		id: number;
		created: Date;
		modified: Date;
		movie_duration: number;
		layer: number;
		alternate_group: number;
		volume: number;
		track_width: number;
		track_height: number;
		timescale: number;
		duration: number;
		bitrate: number;
		codec: string;
		language: string;
		nb_samples: number;
		samples_duration: number;
		type: 'audio' | 'video';
	}

	interface MP4VideoData {
		width: number;
		height: number;
	}

	export interface MP4VideoTrack extends MP4MediaTrack {
		video: MP4VideoData;
		type: 'video'
	}

	interface MP4AudioData {
		sample_rate: number;
		channel_count: number;
		sample_size: number;
	}

	export interface MP4AudioTrack extends MP4MediaTrack {
		audio: MP4AudioData;
		type: 'audio'
	}

	type MP4Track = MP4VideoTrack | MP4AudioTrack;

	export interface MP4Info {
		duration: number;
		timescale: number;
		fragment_duration: number;
		isFragmented: boolean;
		isProgressive: boolean;
		hasIOD: boolean;
		brands: string[];
		created: Date;
		modified: Date;
		tracks: MP4Track[];
	}

	export interface MP4Sample {
		track_id: number;
		description: string;
		is_rap: boolean;
		is_sync: boolean;
		timescale: number;
		dts: number;
		cts: number;
		duration: number;
		size: number;
		data: MP4ArrayBuffer;
		number: number;
	}

	export type MP4ArrayBuffer = ArrayBuffer & { fileStart: number };

	export interface MP4Segment {
		id: number;
		user: any;
		buffer: ArrayBuffer;
		sampleNumber: number;
	}

	export interface MP4File {
		moov: any;

		onMoovStart?: () => void;
		onReady?: (info: MP4Info) => void;
		onError?: (e: string) => void;
		onSamples?: (id: number, user: any, samples: MP4Sample[]) => void

		appendBuffer(data: MP4ArrayBuffer): number;
		start(): void;
		stop(): void;
		flush(): void;

		setSegmentOptions(id: number, user?: any, options?: { nbSamples?: number, rapAlignement?: boolean }): void;
		initializeSegmentation(): MP4Segment[];
		setExtractionOptions(id: number): void;
		seek(time: number, useRap: boolean): void;
	}

	export function createFile(): MP4File;

	export { };

}
