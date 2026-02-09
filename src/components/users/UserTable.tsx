import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Mail, Phone, Trash2, Edit } from 'lucide-react';
import type { Teacher, Student } from '../../types';

interface UserTableProps<T extends Teacher | Student> {
  users: T[];
  type: 'teacher' | 'student';
  title: string;
  onEdit?: (user: T) => void;
  onDelete?: (user: T) => void;
}

export function UserTable<T extends Teacher | Student>({ users, type, title, onEdit, onDelete }: UserTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const filteredUsers = users.filter(
    (user) =>
      user.name.includes(searchTerm) ||
      user.email.includes(searchTerm)
  );

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    }
  };

  const toggleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 flex-1 sm:w-64">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="بحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none flex-1 text-sm text-gray-600 placeholder-gray-400"
              />
            </div>
            {/* Filter button */}
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-right">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">
                الاسم
              </th>
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">
                البريد الإلكتروني
              </th>
              {type === 'teacher' && (
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">
                  المواد
                </th>
              )}
              {type === 'student' && (
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">
                  الصف
                </th>
              )}
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleSelectUser(user.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {user.phone || 'غير متوفر'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                </td>
                {type === 'teacher' && (
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(user as Teacher).subjects?.slice(0, 2).map((subject) => (
                        <span
                          key={subject}
                          className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700"
                        >
                          {subject}
                        </span>
                      ))}
                      {(user as Teacher).subjects?.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{(user as Teacher).subjects.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                )}
                {type === 'student' && (
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-green-50 text-green-700">
                      {(user as Student).grade}
                    </span>
                  </td>
                )}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit?.(user)}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete?.(user)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          عرض {filteredUsers.length} من {users.length} {type === 'teacher' ? 'معلم' : 'طالب'}
        </p>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            السابق
          </button>
          <button className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            التالي
          </button>
        </div>
      </div>
    </div>
  );
}
