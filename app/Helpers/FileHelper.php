<?php

namespace App\Helpers;

use Illuminate\Http\UploadedFile;

class FileHelper
{
    public static function saveImage(UploadedFile $image, string $folder): string
    {
        // Get the tenant ID (Adjust this based on your tenant identification logic)
        $tenantId = tenant('id') ?? 'default';  // Use 'default' if tenant is not found

        // Define tenant-specific folder inside public
        $destinationPath = public_path("tenants/{$tenantId}/{$folder}");

        // Create folder if it doesn't exist
        if (!file_exists($destinationPath)) {
            mkdir($destinationPath, 0777, true);
        }

        // Generate unique filename
        $filename = time() . '_' . strtolower(str_replace(' ', '-', $image->getClientOriginalName()));

        // Move the file to the tenant's folder
        $image->move($destinationPath, $filename);

        // Return the full URL of the image
        return "tenants/{$tenantId}/{$folder}/{$filename}";
    }
}
