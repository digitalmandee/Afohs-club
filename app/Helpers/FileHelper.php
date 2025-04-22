<?php

namespace App\Helpers;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class FileHelper
{
    public static function saveImage(UploadedFile $image, string $folder): string
    {
        // Generate a unique filename with the current timestamp and the original name
        $filename = time() . '_' . strtolower(str_replace(' ', '-', $image->getClientOriginalName()));
    
        // Store the image in the 'public' disk in the specified folder
        $path = $image->storeAs($folder, $filename, 'public');  // 'public' disk
    
        // Return the public URL using tenant_asset to make the path tenant-aware
        return $path;  // tenant-specific URL
    }
    
}