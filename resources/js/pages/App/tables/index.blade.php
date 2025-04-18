@extends('layouts.app')

@section('content')
    <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-800">🍽️ Table Management</h2>
            <a href="{{ route('tables.create') }}"
                class="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md shadow">
                ➕ Add New Table
            </a>
        </div>

        {{-- Floor Filter Dropdown --}}
        <form method="GET" action="{{ route('tables.index') }}" class="mb-6">
            <label for="floor_id" class="block text-sm font-medium text-gray-700 mb-1">Filter by Floor:</label>
            <select name="floor_id" id="floor_id" onchange="this.form.submit()"
                class="w-full sm:w-64 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Floors</option>
                @foreach ($floors as $floor)
                    <option value="{{ $floor->id }}" {{ request('floor_id') == $floor->id ? 'selected' : '' }}>
                        {{ $floor->name }}
                    </option>
                @endforeach
            </select>
        </form>

        @if (session('success'))
            <div class="mb-4 p-3 rounded bg-green-100 text-green-800 text-sm">
                {{ session('success') }}
            </div>
        @endif

        <div class="overflow-x-auto">
            <table class="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                <thead>
                    <tr class="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                        <th class="px-4 py-3 border-b">#</th>
                        <th class="px-4 py-3 border-b">Table No</th>
                        <th class="px-4 py-3 border-b">Capacity</th>
                        <th class="px-4 py-3 border-b">Floor</th>
                        <th class="px-4 py-3 border-b">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($tables as $table)
                        <tr class="hover:bg-gray-50 text-sm">
                            <td class="px-4 py-2 border-b">{{ $loop->iteration }}</td>
                            <td class="px-4 py-2 border-b">{{ $table->table_no }}</td>
                            <td class="px-4 py-2 border-b">{{ $table->capacity }}</td>
                            <td class="px-4 py-2 border-b">{{ $table->floor->name }}</td>
                            <td class="px-4 py-2 border-b flex items-center space-x-2">
                                <a href="{{ route('tables.edit', $table) }}"
                                    class="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium shadow">
                                    ✏️ Edit
                                </a>
                                <form action="{{ route('tables.destroy', $table) }}" method="POST"
                                    onsubmit="return confirm('Delete this table?');" class="inline">
                                    @csrf @method('DELETE')
                                    <button type="submit"
                                        class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium shadow">
                                        🗑️ Delete
                                    </button>
                                </form>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="text-center px-4 py-4 text-gray-500">No tables found.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
@endsection
