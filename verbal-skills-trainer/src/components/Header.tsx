// src/components/Header.tsx
import { Bell, User } from "lucide-react";

export default function Header() {
  return (
    <div className="bg-white border-b shadow-sm mb-6">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center">EduMaster</h1>
        <div className="flex items-center space-x-6">
          <Bell className="w-5 h-5 text-gray-600 cursor-pointer" />
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-gray-600 cursor-pointer" />
            <span className="text-sm font-medium text-gray-700">John Doe</span>
          </div>
        </div>
      </div>
    </div>
  );
}
