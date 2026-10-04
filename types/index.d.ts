export interface AzelfOptions {
    quality?: number;
    webp?: boolean;
    directory?: string;
    output?: 'file' | 'buffer';
}
export declare function azelf(url: string, name: string, options?: AzelfOptions & {
    output?: 'file';
}): Promise<void>;
export declare function azelf(url: string, name: string, options: AzelfOptions & {
    output: 'buffer';
}): Promise<Buffer>;
export declare function azelf(url: string, name: string, options?: AzelfOptions): Promise<void | Buffer>;
export default azelf;
/** @deprecated Use {@link AzelfOptions} */
export type VerstappenOptions = AzelfOptions;
