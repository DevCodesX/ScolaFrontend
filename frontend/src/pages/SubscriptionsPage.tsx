import React, { useEffect, useState } from "react";
import { BookMarked, XCircle, Clock, CheckCircle } from "lucide-react";
import { getMySubscriptions, cancelSubscription, Subscription } from "../services/subscriptionsService";

export function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadSubscriptions();
    }, []);

    async function loadSubscriptions() {
        try {
            setLoading(true);
            const data = await getMySubscriptions();
            setSubscriptions(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleCancel(id: string) {
        if (!confirm("هل أنت متأكد من إلغاء هذا الاشتراك؟")) return;
        try {
            await cancelSubscription(id);
            await loadSubscriptions();
        } catch (err: any) {
            setError(err.message);
        }
    }

    function getStatusBadge(status: string) {
        switch (status) {
            case "active":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        <CheckCircle className="w-3.5 h-3.5" />
                        فعال
                    </span>
                );
            case "cancelled":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                        <XCircle className="w-3.5 h-3.5" />
                        ملغي
                    </span>
                );
            case "expired":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                        <Clock className="w-3.5 h-3.5" />
                        منتهي
                    </span>
                );
            default:
                return null;
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-12 h-12 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
                    <p className="text-gray-500 mt-4">جاري تحميل الاشتراكات...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">اشتراكاتي</h1>
                <p className="text-gray-500 mt-1">إدارة اشتراكاتك في الدورات</p>
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                    {error}
                    <button onClick={() => setError(null)} className="mr-2 text-red-500 hover:text-red-700">✕</button>
                </div>
            )}

            {/* Subscriptions List */}
            {subscriptions.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookMarked className="w-8 h-8 text-indigo-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">لا توجد اشتراكات</h3>
                    <p className="text-gray-500">لم تشترك في أي دورة بعد</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {subscriptions.map((sub) => (
                        <div key={sub.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-gray-800">{sub.course_title}</h3>
                                        {getStatusBadge(sub.status)}
                                    </div>
                                    <p className="text-gray-500 text-sm mb-3">{sub.course_description || "بدون وصف"}</p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span>💰 {sub.price} ر.س</span>
                                        <span>📅 ينتهي: {new Date(sub.expires_at).toLocaleDateString("ar-SA")}</span>
                                    </div>
                                </div>

                                {sub.status === "active" && (
                                    <button
                                        onClick={() => handleCancel(sub.id)}
                                        className="flex items-center gap-1 px-3 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 text-sm font-medium"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        إلغاء
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
