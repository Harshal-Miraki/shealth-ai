declare module 'cornerstone-core' {
    export function enable(element: HTMLElement): void;
    export function loadImage(imageId: string): Promise<any>;
    export function displayImage(element: HTMLElement, image: any): void;
    export function resize(element: HTMLElement, forceFit?: boolean): void;
}

declare module 'cornerstone-wado-image-loader' {
    export const wadouri: {
        fileManager: {
            add(file: File): string;
        };
        dataSetCacheManager: {
            unload(imageId: string): void;
        };
    };
    export const external: {
        cornerstone: any;
        dicomParser: any;
    };
    export function configure(options: any): void;
}
