interface Options {
    quality: number;
    webp: Boolean;
    directory: string;
}
export declare function azelf(url: string, name: string, options?: Options): Promise<void>;
export default azelf;
