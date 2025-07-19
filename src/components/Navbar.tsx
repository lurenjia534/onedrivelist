// src/components/Navbar.tsx
import React from "react";

export default function Navbar() {
    return (
        <header className="p-4 border-b mb-4">
            <form action="/search" className="flex gap-2 max-w-md mx-auto">
                <input
                    type="text"
                    name="q"
                    placeholder="Search files..."
                    className="flex-1 px-2 py-1 border rounded-md"
                />
                <button
                    type="submit"
                    className="px-3 py-1 bg-blue-600 text-white rounded-md"
                >
                    Search
                </button>
            </form>
        </header>
    );
}