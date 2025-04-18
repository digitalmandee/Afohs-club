@extends('layouts.app')

@section('content')
    <div class="max-w-xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">➕ Add New Table</h2>

        <form action="{{ route('tables.store') }}" method="POST" class="space-y-6 bg-white p-6 rounded-lg shadow">
            @csrf

            <div>
                <label for="floor_id" class="block text-sm font-medium text-gray-700">Select Floor</label>
                <select name="floor_id" id="floor_id"
                    class="mt-1 block w-full px-4 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required>
                    <option value="">-- Select Floor --</option>
                    @foreach ($floors as $floor)
                        <option value="{{ $floor->id }}">{{ $floor->name }}</option>
                    @endforeach
                </select>
            </div>

            <div>
                <label for="table_no" class="block text-sm font-medium text-gray-700">Table No</label>
                <input type="text" name="table_no" id="table_no"
                    class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required>
            </div>

            <div>
                <label for="capacity" class="block text-sm font-medium text-gray-700">Capacity</label>
                <input type="number" name="capacity" id="capacity"
                    class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required>
            </div>

            <div class="flex justify-end">
                <a href="{{ route('tables.index') }}"
                    class="mr-3 inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-md shadow-sm">
                    Cancel
                </a>
                <button type="submit"
                    class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm">
                    💾 Add Table
                </button>
            </div>
        </form>
    </div>
@endsection
