import { getAuthHeaders } from './authService';
import { apiUrl } from '../lib/api';
import * as XLSX from 'xlsx';

const API_URL = apiUrl('/api/teachers');

// ─── Types ───────────────────────────────────────────
export interface BulkTeacherRow {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    subject: string;
    _rowNum?: number;
    _error?: string;
    _status?: 'pending' | 'success' | 'error' | 'duplicate';
}

export interface BulkImportResult {
    added: { email: string; name: string }[];
    failed: { email: string; reason: string }[];
    duplicates: { email: string; reason: string }[];
    total: number;
}

// ─── Excel Parsing ───────────────────────────────────
const COLUMN_MAP: Record<string, keyof BulkTeacherRow> = {
    'الاسم الأول': 'first_name',
    'first_name': 'first_name',
    'first name': 'first_name',
    'الاسم': 'first_name',
    'اسم العائلة': 'last_name',
    'last_name': 'last_name',
    'last name': 'last_name',
    'العائلة': 'last_name',
    'البريد الإلكتروني': 'email',
    'email': 'email',
    'البريد': 'email',
    'رقم الهاتف': 'phone',
    'phone': 'phone',
    'الهاتف': 'phone',
    'المادة': 'subject',
    'subject': 'subject',
    'التخصص': 'subject',
};

export function parseExcelFile(file: File): Promise<BulkTeacherRow[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                if (!sheetName) {
                    reject(new Error('الملف لا يحتوي على أي بيانات'));
                    return;
                }

                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' });

                if (jsonData.length === 0) {
                    reject(new Error('الملف لا يحتوي على صفوف بيانات'));
                    return;
                }

                // Map columns
                const rows: BulkTeacherRow[] = jsonData.map((row, idx) => {
                    const mapped: BulkTeacherRow = {
                        first_name: '',
                        last_name: '',
                        email: '',
                        phone: '',
                        subject: '',
                        _rowNum: idx + 2, // +2 for header row + 0-index
                    };

                    for (const [key, value] of Object.entries(row)) {
                        const normalizedKey = key.trim().toLowerCase();
                        const mappedField = COLUMN_MAP[normalizedKey];
                        if (mappedField && mappedField !== '_rowNum' && mappedField !== '_error' && mappedField !== '_status') {
                            (mapped as any)[mappedField] = String(value).trim();
                        }
                    }

                    return mapped;
                });

                resolve(rows);
            } catch (err) {
                reject(new Error('فشل في قراءة الملف. تأكد من أنه ملف Excel صالح (.xlsx/.xls)'));
            }
        };
        reader.onerror = () => reject(new Error('فشل في قراءة الملف'));
        reader.readAsArrayBuffer(file);
    });
}

// ─── PDF Text Parsing (simple) ───────────────────────
export function parsePDFText(text: string): BulkTeacherRow[] {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const rows: BulkTeacherRow[] = [];

    for (let i = 0; i < lines.length; i++) {
        const parts = lines[i].split(/[,\t;|]+/).map(p => p.trim()).filter(Boolean);
        if (parts.length >= 2) {
            const emailPart = parts.find(p => p.includes('@'));
            const nameParts = parts.filter(p => !p.includes('@') && !/^\d/.test(p));
            const phonePart = parts.find(p => /^\d{5,}/.test(p));
            const subjectPart = parts.filter(p => !p.includes('@') && !/^\d{5,}/.test(p)).slice(2);

            rows.push({
                first_name: nameParts[0] || '',
                last_name: nameParts[1] || '',
                email: emailPart || '',
                phone: phonePart || '',
                subject: subjectPart.join(', ') || '',
                _rowNum: i + 1,
            });
        }
    }

    return rows;
}

// ─── Validation ──────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRows(rows: BulkTeacherRow[]): BulkTeacherRow[] {
    const seenEmails = new Set<string>();

    return rows.map(row => {
        const errors: string[] = [];

        if (!row.first_name) errors.push('الاسم الأول مطلوب');
        if (!row.email) {
            errors.push('البريد الإلكتروني مطلوب');
        } else if (!EMAIL_REGEX.test(row.email)) {
            errors.push('صيغة البريد الإلكتروني غير صحيحة');
        } else if (seenEmails.has(row.email.toLowerCase())) {
            errors.push('بريد مكرر في الملف');
            return { ...row, _error: errors.join(' | '), _status: 'duplicate' as const };
        }

        if (row.email) seenEmails.add(row.email.toLowerCase());

        return {
            ...row,
            _error: errors.length > 0 ? errors.join(' | ') : undefined,
            _status: errors.length > 0 ? 'error' as const : 'pending' as const,
        };
    });
}

// ─── Download Template ───────────────────────────────
export function downloadTemplate() {
    const headers = [
        ['الاسم الأول', 'اسم العائلة', 'البريد الإلكتروني', 'رقم الهاتف', 'المادة'],
        ['أحمد', 'محمد', 'ahmed@example.com', '0501234567', 'رياضيات'],
        ['سارة', 'علي', 'sara@example.com', '0507654321', 'علوم'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(headers);
    ws['!cols'] = [
        { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 15 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'المعلمين');
    XLSX.writeFile(wb, 'قالب_استيراد_المعلمين.xlsx');
}

// ─── Bulk API Call ───────────────────────────────────
export async function bulkAddTeachers(
    teachers: BulkTeacherRow[],
    sendInvitations: boolean = false
): Promise<BulkImportResult> {
    const payload = teachers
        .filter(t => t._status !== 'error' && t._status !== 'duplicate')
        .map(({ first_name, last_name, email, phone, subject }) => ({
            first_name, last_name, email, phone, subject,
        }));

    const res = await fetch(`${API_URL}/bulk`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify({ teachers: payload, sendInvitations }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'فشل في إضافة المعلمين');
    }

    return res.json();
}
