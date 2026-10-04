export interface VerstappenOptions {
    quality?: number;
    webp?: boolean;
    directory?: string;
    output?: 'file' | 'buffer';
}
export declare function verstappen(url: string, name: string, options?: VerstappenOptions & {
    output?: 'file';
}): Promise<void>;
export declare function verstappen(url: string, name: string, options: VerstappenOptions & {
    output: 'buffer';
}): Promise<Buffer>;
export default verstappen;
