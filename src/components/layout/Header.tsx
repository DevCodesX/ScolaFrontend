import React from "react";
import { Menu, Bell, Search, User } from 'lucide-react';
import { mockInstitution } from '../../data/mockData';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Right side - Menu & Search */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="فتح القائمة"
        >
          <Menu className="w-6 h-6 text-gray-600" />
        </button>

        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2 w-64 lg:w-80">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="بحث..."
            className="bg-transparent border-none outline-none flex-1 text-sm text-gray-600 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Left side - Institution & User */}
      <div className="flex items-center gap-4">
        {/* Institution name */}
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900">{mockInstitution.name}</p>
          <p className="text-xs text-gray-500">المؤسسة الحالية</p>
        </div>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User avatar */}
        <button className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-xl transition-colors">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        </button>
      </div>
    </header>
  );
}
