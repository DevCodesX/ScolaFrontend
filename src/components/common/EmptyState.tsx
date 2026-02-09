import React from "react";
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
    return (
        <div className="border border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50/50">
            <div className="flex justify-center mb-3">
                {icon || <Inbox className="w-10 h-10 text-gray-400" />}
            </div>
            <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
            {description && (
                <p className="text-gray-500 mt-2 text-sm">{description}</p>
            )}
        </div>
    );
}
