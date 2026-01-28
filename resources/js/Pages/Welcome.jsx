import { Head, Link } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

const formatDate = (date) => date.toISOString().slice(0, 10);

const buildDefaultRange = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 13);

    return {
        startDate: formatDate(start),
        endDate: formatDate(end),
    };
};

const validateRange = ({ startDate, endDate }) => {
    const errors = {};

    if (!startDate) {
        errors.startDate = 'يرجى تحديد تاريخ البداية.';
    }

    if (!endDate) {
        errors.endDate = 'يرجى تحديد تاريخ النهاية.';
    }

    if (startDate && endDate && startDate > endDate) {
        errors.endDate = 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية.';
    }

    return errors;
};

const toPercentage = (value) => `${Math.round(value * 1000) / 10}%`;

export default function Welcome({ auth }) {
    const defaults = useMemo(() => buildDefaultRange(), []);
    const [startDate, setStartDate] = useState(defaults.startDate);
    const [endDate, setEndDate] = useState(defaults.endDate);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [rates, setRates] = useState([]);
    const [apiError, setApiError] = useState('');

    const fetchRates = async ({ startDate: fromDate, endDate: toDate }) => {
        const nextErrors = validateRange({ startDate: fromDate, endDate: toDate });

        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            return;
        }

        setLoading(true);
        setApiError('');

        const params = new URLSearchParams({
            start_date: fromDate,
            end_date: toDate,
        });

        try {
            const response = await fetch(
                `/reports/cancellation-rate?${params.toString()}`,
                {
                    headers: {
                        Accept: 'application/json',
                    },
                },
            );

            if (!response.ok) {
                throw new Error('تعذر تحميل البيانات.');
            }

            const payload = await response.json();
            setRates(payload.data ?? []);
        } catch (error) {
            setApiError('حدث خطأ أثناء تحميل التقرير، حاول مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRates({ startDate, endDate });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const summary = useMemo(() => {
        if (!rates.length) {
            return {
                average: 0,
                min: 0,
                max: 0,
                totalDays: 0,
            };
        }

        const values = rates.map((rate) => rate.cancellation_rate);
        const total = values.reduce((sum, value) => sum + value, 0);
        const average = total / values.length;

        return {
            average,
            min: Math.min(...values),
            max: Math.max(...values),
            totalDays: values.length,
        };
    }, [rates]);

    const chartPoints = useMemo(() => {
        if (!rates.length) {
            return '';
        }

        const width = 640;
        const height = 180;
        const padding = 12;
        const maxValue = Math.max(1, summary.max);

        return rates
            .map((rate, index) => {
                const x =
                    padding + (index / (rates.length - 1 || 1)) * (width - padding * 2);
                const y =
                    height -
                    padding -
                    (rate.cancellation_rate / maxValue) * (height - padding * 2);
                return `${x},${y}`;
            })
            .join(' ');
    }, [rates, summary.max]);

    const chartArea = useMemo(() => {
        if (!chartPoints) {
            return '';
        }

        const baseY = 180 - 12;
        return `${chartPoints} 628,${baseY} 12,${baseY}`;
    }, [chartPoints]);

    const handleSubmit = (event) => {
        event.preventDefault();
        fetchRates({ startDate, endDate });
    };

    return (
        <>
            <Head title="Cancellation Rate" />
            <div className="min-h-screen bg-slate-950 text-white">
                <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_60%)]" />
                    <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-16 pt-10">
                        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
                                    تقارير العمليات
                                </p>
                                <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                                    لوحة معدل الإلغاء
                                </h1>
                                <p className="mt-3 max-w-2xl text-sm text-slate-200">
                                    راقب أداء الرحلات يوميًا عبر تقرير احترافي مع واجهة
                                    سريعة الاستجابة تعتمد على API /reports/cancellation-rate.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-200">
                                <span className="rounded-full bg-white/10 px-3 py-1">
                                    تحديث سريع
                                </span>
                                <span className="rounded-full bg-white/10 px-3 py-1">
                                    بيانات لحظية
                                </span>
                                {auth?.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-full bg-cyan-400/90 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                                    >
                                        لوحة التحكم
                                    </Link>
                                ) : (
                                    <Link
                                        href={route('login')}
                                        className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/60"
                                    >
                                        تسجيل الدخول
                                    </Link>
                                )}
                            </div>
                        </header>

                        <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
                            <div className="space-y-6 rounded-3xl bg-white/5 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.35)] backdrop-blur">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-white">
                                        نظرة عامة على الفترة
                                    </h2>
                                    <span className="rounded-full bg-cyan-400/20 px-3 py-1 text-xs font-semibold text-cyan-100">
                                        {summary.totalDays} يوم
                                    </span>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <p className="text-xs text-slate-300">
                                            المتوسط اليومي
                                        </p>
                                        <p className="mt-2 text-2xl font-semibold">
                                            {toPercentage(summary.average)}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-400">
                                            معدل الإلغاء الكلي
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <p className="text-xs text-slate-300">
                                            أقل معدل
                                        </p>
                                        <p className="mt-2 text-2xl font-semibold text-emerald-300">
                                            {toPercentage(summary.min)}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-400">
                                            أفضل أداء يومي
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <p className="text-xs text-slate-300">
                                            أعلى معدل
                                        </p>
                                        <p className="mt-2 text-2xl font-semibold text-rose-300">
                                            {toPercentage(summary.max)}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-400">
                                            أعلى ضغط تشغيلي
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-slate-400">
                                                مخطط الإلغاء اليومي
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-white">
                                                اتجاهات الإلغاء خلال الفترة
                                            </p>
                                        </div>
                                        <span className="text-xs text-slate-400">
                                            {loading ? 'جارٍ التحديث...' : 'آخر تحديث الآن'}
                                        </span>
                                    </div>

                                    <div className="mt-4">
                                        {rates.length ? (
                                            <svg
                                                viewBox="0 0 640 180"
                                                className="h-44 w-full"
                                                role="img"
                                                aria-label="Cancellation rate chart"
                                            >
                                                <defs>
                                                    <linearGradient
                                                        id="areaFill"
                                                        x1="0"
                                                        x2="0"
                                                        y1="0"
                                                        y2="1"
                                                    >
                                                        <stop
                                                            offset="0%"
                                                            stopColor="#22d3ee"
                                                            stopOpacity="0.35"
                                                        />
                                                        <stop
                                                            offset="100%"
                                                            stopColor="#22d3ee"
                                                            stopOpacity="0.05"
                                                        />
                                                    </linearGradient>
                                                </defs>
                                                <polygon
                                                    points={chartArea}
                                                    fill="url(#areaFill)"
                                                />
                                                <polyline
                                                    points={chartPoints}
                                                    fill="none"
                                                    stroke="#38bdf8"
                                                    strokeWidth="3"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        ) : (
                                            <div className="flex h-44 items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/5 text-sm text-slate-300">
                                                لا توجد بيانات لعرضها ضمن هذه الفترة.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-6">
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
                                >
                                    <div>
                                        <h2 className="text-lg font-semibold text-white">
                                            إعداد التقرير
                                        </h2>
                                        <p className="mt-2 text-sm text-slate-300">
                                            اختر تاريخ البداية والنهاية لإنشاء تقرير دقيق
                                            وتحقق تلقائي من صحة المدخلات.
                                        </p>
                                    </div>

                                    <div className="grid gap-4">
                                        <label className="space-y-2 text-sm font-medium text-slate-200">
                                            تاريخ البداية
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={(event) =>
                                                    setStartDate(event.target.value)
                                                }
                                                className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                                            />
                                            {errors.startDate ? (
                                                <span className="text-xs text-rose-300">
                                                    {errors.startDate}
                                                </span>
                                            ) : null}
                                        </label>

                                        <label className="space-y-2 text-sm font-medium text-slate-200">
                                            تاريخ النهاية
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={(event) =>
                                                    setEndDate(event.target.value)
                                                }
                                                className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                                            />
                                            {errors.endDate ? (
                                                <span className="text-xs text-rose-300">
                                                    {errors.endDate}
                                                </span>
                                            ) : null}
                                        </label>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-cyan-400/60"
                                    >
                                        {loading ? 'جاري التحديث...' : 'تحديث التقرير'}
                                    </button>

                                    {apiError ? (
                                        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                                            {apiError}
                                        </div>
                                    ) : null}
                                </form>

                                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                                    <h3 className="text-lg font-semibold text-white">
                                        مؤشرات الأداء السريعة
                                    </h3>
                                    <p className="mt-2 text-sm text-slate-300">
                                        قراءات جاهزة يمكن مشاركتها مع فريق العمليات.
                                    </p>
                                    <div className="mt-5 space-y-3">
                                        {rates.slice(0, 4).map((rate) => (
                                            <div
                                                key={rate.day}
                                                className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-950/60 px-4 py-3"
                                            >
                                                <span className="text-sm text-slate-200">
                                                    {rate.day}
                                                </span>
                                                <span className="text-sm font-semibold text-cyan-200">
                                                    {toPercentage(rate.cancellation_rate)}
                                                </span>
                                            </div>
                                        ))}
                                        {!rates.length ? (
                                            <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 px-4 py-6 text-center text-sm text-slate-400">
                                                سيتم عرض مؤشرات الأداء هنا بعد تحميل البيانات.
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
}
