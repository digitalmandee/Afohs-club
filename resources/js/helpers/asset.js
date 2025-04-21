import { usePage } from '@inertiajs/react';

export const tenantAsset = (path) => {
    const base = usePage().props?.tenantAssetBase ?? '';
    return `${base}/${path}`;
};
