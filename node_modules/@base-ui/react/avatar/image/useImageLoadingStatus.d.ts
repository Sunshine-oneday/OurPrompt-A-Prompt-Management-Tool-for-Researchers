import * as React from 'react';
export type ImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';
interface UseImageLoadingStatusOptions {
  referrerPolicy?: React.HTMLAttributeReferrerPolicy | undefined;
  crossOrigin?: React.ImgHTMLAttributes<HTMLImageElement>['crossOrigin'] | undefined;
}
export declare function useImageLoadingStatus(src: string | undefined, {
  referrerPolicy,
  crossOrigin
}: UseImageLoadingStatusOptions): ImageLoadingStatus;
export {};