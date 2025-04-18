@extends('layouts.app')

@section('content')
    <div class="max-w-3xl mx-auto px-4 py-8">
        <h2 class="text-2xl font-bold mb-6">Edit Table</h2>

        <form action="{{ route('tables.update', $table->id) }}" method="POST" class="space-y-4">
            @csrf
            @method('PUT')

            <div>
                <label for="floor_id" class="block text-sm font-medium text-gray-700">Select Floor</label>
                <select name="floor_id"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200" required>
                    @foreach ($floors as $floor)
                        <option value="{{ $floor->id }}" {{ $table->floor_id == $floor->id ? 'selected' : '' }}>
                            {{ $floor->name }}
                        </option>
                    @endforeach
                </select>
            </div>

            <div>
                <label for="table_no" class="block text-sm font-medium text-gray-700">Table No</label>
                <input type="text" name="table_no" value="{{ $table->table_no }}"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200" required>
            </div>

            <div>
                <label for="capacity" class="block text-sm font-medium text-gray-700">Capacity</label>
                <input type="number" name="capacity" value="{{ $table->capacity }}"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200" required>
            </div>

            <div class="pt-4">
                <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow">
                    Update Table
                </button>
            </div>
        </form>
    </div>
@endsection
