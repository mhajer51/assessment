import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const buildDefaultRange = () => ({
    startDate: new Date(2013, 9, 1),
    endDate: new Date(2013, 9, 3),
});

const formatDate = (date) => {
    if (!date) {
        return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const validateRange = ({ startDate, endDate }) => {
    const errors = {};

    if (!startDate) {
        errors.startDate = 'Please select a start date.';
    }

    if (!endDate) {
        errors.endDate = 'Please select an end date.';
    }

    if (startDate && endDate && startDate > endDate) {
        errors.endDate = 'End date must be on or after the start date.';
    }

    return errors;
};

export default function Welcome() {
    const defaults = useMemo(() => buildDefaultRange(), []);
    const [startDate, setStartDate] = useState(defaults.startDate);
    const [endDate, setEndDate] = useState(defaults.endDate);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [rates, setRates] = useState([]);
    const [apiError, setApiError] = useState('');

    const fetchRates = async ({ startDate: fromDate, endDate: toDate }) => {
        const formattedStart = formatDate(fromDate);
        const formattedEnd = formatDate(toDate);
        const nextErrors = validateRange({ startDate: fromDate, endDate: toDate });

        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            return;
        }

        setLoading(true);
        setApiError('');

        const params = new URLSearchParams({
            start_date: formattedStart,
            end_date: formattedEnd,
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
                throw new Error('Unable to load data.');
            }

            const payload = await response.json();
            setRates(payload.data ?? []);
        } catch (error) {
            setApiError('Unable to load the report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRates({ startDate, endDate });
    }, []);

    const totalDays = useMemo(() => {
        if (!rates.length) {
            return 0;
        }
        const values = rates.map((rate) => rate.cancellation_rate);
        return values.length;
    }, [rates]);




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
                                    Operations Reports
                                </p>
                                <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                                    Cancellation Rate Dashboard
                                </h1>
                                <p className="mt-3 max-w-2xl text-sm text-slate-200">
                                    Track daily trip performance, responsive experience powered by the /reports/cancellation-rate API.
                                </p>
                            </div>
                        </header>

                        <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
                            <div className="space-y-6 rounded-3xl bg-white/5 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.35)] backdrop-blur">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold text-white">
                                            Daily cancellation table
                                        </h2>
                                        <p className="text-sm text-slate-300">
                                            Detailed breakdown for each day in the selected range.
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-cyan-400/20 px-3 py-1 text-xs font-semibold text-cyan-100">
                                        {totalDays} days
                                    </span>
                                </div>
                                <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
                                    <table className="w-full border-collapse text-left text-sm text-slate-200">
                                        <thead className="bg-white/10 text-xs uppercase tracking-wide text-slate-300">
                                        <tr>
                                            <th className="px-4 py-3">Day</th>
                                            <th className="px-4 py-3">Cancellation Rate</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/10">
                                        {rates.length ? (
                                            rates.map((rate) => (
                                                <tr key={rate.day} className="bg-slate-950/40">
                                                    <td className="px-4 py-3">{rate.day}</td>
                                                    <td className="px-4 py-3 font-semibold text-cyan-200">
                                                        {rate.cancellation_rate.toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={2}
                                                    className="px-4 py-6 text-center text-sm text-slate-400"
                                                >
                                                    No rows to display yet.
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </div>


                            </div>

                            <div className="flex flex-col gap-6">
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
                                >
                                    <div>
                                        <h2 className="text-lg font-semibold text-white">
                                            Report configuration
                                        </h2>
                                        <p className="mt-2 text-sm text-slate-300">
                                            Choose a start and end date to generate accurate
                                            insights with inline validation.
                                        </p>
                                    </div>

                                    <div className="grid gap-4">
                                        <label className="text-sm font-medium text-slate-200">
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
                                                <span className="pt-2 text-sm font-medium text-slate-200 sm:w-24">
                                                    Start date
                                                </span>
                                                <div className="flex-1">
                                                    <DatePicker
                                                        selected={startDate}
                                                        onChange={(date) => setStartDate(date)}
                                                        dateFormat="yyyy-MM-dd"
                                                        className="date-picker-input w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                                                        calendarClassName="date-picker-calendar"
                                                        popperClassName="date-picker-popper"
                                                        showPopperArrow={false}
                                                    />
                                                </div>
                                            </div>

                                            {errors.startDate ? (
                                                <span className="text-xs text-rose-300">
                                                {errors.startDate}
                                            </span>
                                            ) : null}
                                        </label>

                                        <label className="text-sm font-medium text-slate-200">
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
                                                <span className="pt-2 text-sm font-medium text-slate-200 sm:w-24">
                                                    End date
                                                </span>
                                                <div className="flex-1">
                                                    <DatePicker
                                                        selected={endDate}
                                                        onChange={(date) => setEndDate(date)}
                                                        dateFormat="yyyy-MM-dd"
                                                        className="date-picker-input w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                                                        calendarClassName="date-picker-calendar"
                                                        popperClassName="date-picker-popper"
                                                        minDate={startDate}
                                                        showPopperArrow={false}
                                                    />
                                                </div>
                                            </div>
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
                                        {loading ? 'Updating...' : 'Refresh report'}
                                    </button>

                                    {apiError ? (
                                        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                                            {apiError}
                                        </div>
                                    ) : null}
                                </form>
                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </>
    );
}
