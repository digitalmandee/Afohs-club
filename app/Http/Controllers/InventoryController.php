<?php

namespace App\Http\Controllers;

use App\Helpers\FileHelper;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class InventoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $productLists = Product::latest()->with(['category', 'variants', 'variants.values'])->get();

        return Inertia::render('App/Inventory/Dashboard', compact('productLists'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate the incoming request data
        $request->validate([
            'name' => 'required|string|max:255',
            'menu_code' => 'required|string|max:100',
            'category' => 'required|string|max:100',
            'currentStock' => 'required|integer|min:0',
            'minimalStock' => 'required|integer|min:0',
            'orderTypes' => 'required|array|min:1',
            'orderTypes.*' => 'string', // assuming order types are strings
            'cogs' => 'required|numeric|min:0',
            'basePrice' => 'required|numeric|min:0',
            'profit' => 'required|numeric',
            'description' => 'required|string',
            'images' => 'nullable|array',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp,svg|max:2048',
        ]);

        // Create a new product
        // Handle image uploads (if any)
        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                // Use the FileHelper to store the image
                $path = FileHelper::saveImage($image, 'products');

                // Store the image URL or path in the array
                $imagePaths[] = $path;
            }
        }

        // Create a new product and store it in the database
        $product = Product::create([
            'name' => $request->input('name'),
            'menu_code' => $request->input('menu_code'),
            'category_id' => $request->input('category'),
            'current_stock' => $request->input('currentStock'),
            'minimal_stock' => $request->input('minimalStock'),
            'available_order_types' => $request->input('orderTypes'),
            'cost_of_goods_sold' => $request->input('cogs'),
            'base_price' => $request->input('basePrice'),
            'profit' => $request->input('profit'),
            'description' => $request->input('description'),
            'images' => $imagePaths,
        ]);

        // Handle variants if passed as an object
        if ($request->has('variants')) {
            foreach ($request->input('variants') as $key => $variant) {
                // Create the ProductVariant (like "Size")
                $productVariant = $product->variants()->create([
                    'product_id' => $product->id,
                    'name' => $key,  // The variant name, e.g., "Size"
                    'type' => $variant['type'],  // The type, e.g., "multiple"
                ]);

                // Now create the ProductVariantValue records for each item in the variant
                foreach ($variant['items'] as $item) {
                    $productVariant->values()->create([
                        'product_variant_id' => $productVariant->id,
                        'name' => $item['name'],  // e.g., "Small", "Medium", "Large"
                        'additional_price' => $item['price'],  // Price for this variant item
                        'stock' => $item['stock'],  // Stock for this variant item
                        'is_default' => false,  // Assuming you don't want a default variant yet
                    ]);
                }
            }
        }

        // Optionally return a response
        return redirect()->back()->with('success', 'Product created.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
