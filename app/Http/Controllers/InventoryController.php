<?php

namespace App\Http\Controllers;

use App\Helpers\FileHelper;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductVariantValue;
use App\Rules\KitchenRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class InventoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $category_id = $request->query('category_id');

        $query = Product::latest()->with(['category', 'variants', 'variants.values']);

        if ($category_id) {
            $query->where('category_id', $category_id);
        }

        $productLists = $query->get();

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
            'category_id' => 'required',
            'kitchen' => 'required|array',
            'kitchen.id' => ['required', 'exists:users,id', new KitchenRole()],
            'current_stock' => 'required|integer|min:0',
            'minimal_stock' => 'required|integer|min:0',
            'available_order_types' => 'required|array|min:1',
            'available_order_types.*' => 'string', // assuming order types are strings
            'cost_of_goods_sold' => 'required|numeric|min:0',
            'base_price' => 'required|numeric|min:0',
            'profit' => 'required|numeric',
            'description' => 'required|string',
            'images' => 'nullable|array',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp,svg|max:2048',
        ]);

        DB::beginTransaction();
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
            'category_id' => $request->input('category_id'),
            'kitchen_id' => $request->input('kitchen.id'),
            'current_stock' => $request->input('current_stock'),
            'minimal_stock' => $request->input('minimal_stock'),
            'available_order_types' => $request->input('available_order_types'),
            'cost_of_goods_sold' => $request->input('cost_of_goods_sold'),
            'base_price' => $request->input('base_price'),
            // 'profit' => $request->input('profit'),
            'description' => $request->input('description'),
            'images' => $imagePaths,
        ]);

        // Handle variants if passed as an object
        if ($request->has('variants')) {
            foreach ($request->input('variants') as $variant) {
                if (!$variant['active']) {
                    continue;
                }

                // Create the ProductVariant (like "Size")
                $productVariant = $product->variants()->create([
                    'product_id' => $product->id,
                    'name' => $variant['name'],  // The variant name, e.g., "Size"
                    'type' => $variant['type'],  // The type, e.g., "multiple"
                ]);

                // Now create the ProductVariantValue records for each item in the variant
                foreach ($variant['items'] as $item) {
                    if ($item['name'] === '') {
                        continue;
                    }

                    $productVariant->values()->create([
                        'product_variant_id' => $productVariant->id,
                        'name' => $item['name'],  // e.g., "Small", "Medium", "Large"
                        'additional_price' => $item['additional_price'],  // Price for this variant item
                        'stock' => $item['stock'],  // Stock for this variant item
                        'is_default' => false,  // Assuming you want to set the default variant
                    ]);
                }
            }
        }

        DB::commit();
        // Optionally return a response
        return redirect()->back()->with('success', 'Product created.');
    }
    // Get Single Product

    public function getProduct($id)
    {
        $product = Product::with(['variants:id,product_id,name', 'variants.values', 'kitchen'])->find($id);
        return response()->json(['success' => true, 'product' => $product], 200);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $product = Product::with(['variants:id,product_id,name,type,active', 'variants.items', 'category', 'kitchen'])->find($id);

        return Inertia::render('App/Inventory/Product', compact('product', 'id'));
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
        $request->validate([
            'name' => 'required|string|max:255',
            'menu_code' => 'required|string|max:100',
            'category_id' => 'required',
            'kitchen' => 'required|array',
            'kitchen.id' => ['required', 'exists:users,id', new KitchenRole()],
            'current_stock' => 'required|integer|min:0',
            'minimal_stock' => 'required|integer|min:0',
            'available_order_types' => 'required|array|min:1',
            'available_order_types.*' => 'string', // assuming order types are strings
            'cost_of_goods_sold' => 'required|numeric|min:0',
            'base_price' => 'required|numeric|min:0',
            'profit' => 'required|numeric',
            'description' => 'required|string',
            'images' => 'nullable|array',
        ]);

        $imagePaths = [];

        // First, keep existing image paths (if any)
        if ($request->has('existing_images')) {
            foreach ($request->input('existing_images') as $existingPath) {
                $imagePaths[] = $existingPath;
            }
        }

        // Then, store newly uploaded images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = FileHelper::saveImage($image, 'products');
                $imagePaths[] = $path;
            }
        }


        Product::where('id', $id)->update([
            'name' => $request->input('name'),
            'menu_code' => $request->input('menu_code'),
            'category_id' => $request->input('category_id'),
            'kitchen_id' => $request->input('kitchen.id'),
            'current_stock' => $request->input('current_stock'),
            'minimal_stock' => $request->input('minimal_stock'),
            'available_order_types' => $request->input('available_order_types'),
            'cost_of_goods_sold' => $request->input('cost_of_goods_sold'),
            'base_price' => $request->input('base_price'),
            // 'profit' => $request->input('profit'),
            'description' => $request->input('description'),
            'images' => $imagePaths,
        ]);


        // Handle variants if passed as an object
        if ($request->has('variants')) {
            $submittedVariantIds = [];

            foreach ($request->input('variants') as $variant) {
                // Update or create the ProductVariant
                $productVariant = ProductVariant::updateOrCreate(
                    ['id' => $variant['id'] ?? null, 'product_id' => $id], // Use id if available
                    [
                        'product_id' => $id,
                        'name' => $variant['name'],
                        'type' => $variant['type'],
                    ]
                );

                $submittedVariantIds[] = $productVariant->id;

                // Track value IDs to preserve
                $submittedValueIds = [];

                foreach ($variant['items'] as $item) {
                    if (empty($item['name'])) {
                        continue;
                    }

                    $variantValue = ProductVariantValue::updateOrCreate(
                        ['id' => $item['id'] ?? null],
                        [
                            'product_variant_id' => $productVariant->id,
                            'name' => $item['name'],
                            'additional_price' => $item['additional_price'],
                            'stock' => $item['stock'],
                            'is_default' => false,
                        ]
                    );

                    $submittedValueIds[] = $variantValue->id;
                }

                // 🧹 Delete ProductVariantValues not in submitted items
                ProductVariantValue::where('product_variant_id', $productVariant->id)
                    ->whereNotIn('id', $submittedValueIds)
                    ->delete();
            }

            // 🧹 Remove ProductVariants with no remaining values
            ProductVariant::where('product_id', $id)
                ->whereNotIn('id', $submittedVariantIds)
                ->orWhereDoesntHave('values') // assuming the relation is called `values`
                ->delete();
        }


        return redirect()->back()->with('success', 'Product updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            Product::where('id', $id)->delete();
            return response()->json(['success' => true, 'message' => 'Product deleted.']);
        } catch (\Throwable $th) {
            Log::info($th);
            return response()->json(['success' => false, 'message' => 'Failed to delete product.']);
        }
    }
}