'use client';

import React, { useEffect, useState } from 'react';
import {
  UtensilsCrossed,
  RefreshCw,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  Info,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { api } from '@/lib/api';
import { MessMenuItem } from '@/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';

const MEAL_CONFIG: Record<string, { label: string; gradient: string; iconColor: string }> = {
  Breakfast: { label: 'Morning Breakfast', gradient: 'from-amber-500/10 to-orange-500/10', iconColor: 'text-amber-600' },
  Lunch: { label: 'Afternoon Lunch', gradient: 'from-emerald-500/10 to-teal-500/10', iconColor: 'text-emerald-600' },
  Snacks: { label: 'Evening Snacks & Tea', gradient: 'from-purple-500/10 to-indigo-500/10', iconColor: 'text-purple-600' },
  Dinner: { label: 'Night Dinner', gradient: 'from-blue-500/10 to-indigo-500/10', iconColor: 'text-indigo-600' },
};

export default function MessMenuPage() {
  const [menuItems, setMenuItems] = useState<MessMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const [selectedDay, setSelectedDay] = useState<string>(() => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return days.includes(today) ? today : 'Monday';
  });

  const [viewMode, setViewMode] = useState<'day' | 'matrix'>('day');

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getWeeklyMenu();
      setMenuItems(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load mess menu schedule.');
    } finally {
      setLoading(false);
    }
  };

  const dayMeals = menuItems.filter((item) => item.day_of_week === selectedDay);
  dayMeals.sort((a, b) => a.start_time.localeCompare(b.start_time));

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-card">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-emerald-500/10 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
              Hostel Dining Services
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 poppins">
              Dining Schedule &amp; Mess Menu
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl">
              Official 7-day residential dining schedule certified by the Student Mess Committee and Wardens Council at Kalasalingam University.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={loadMenu}
              disabled={loading}
              className="btn-press inline-flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-subtle disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
              <span>Sync</span>
            </button>

            {/* Segmented View Switcher */}
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  viewMode === 'day'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Day View
              </button>
              <button
                onClick={() => setViewMode('matrix')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  viewMode === 'matrix'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Weekly Matrix
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-none">
        {days.map((day) => {
          const isSelected = selectedDay === day;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`btn-press whitespace-nowrap rounded-2xl px-4 py-2.5 text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'border border-slate-200/90 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 animate-slide-down">
          {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card space-y-4 animate-pulse">
              <div className="h-4 w-32 bg-slate-200 rounded" />
              <div className="h-3 w-48 bg-slate-100 rounded" />
              <div className="space-y-2 pt-2">
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : viewMode === 'day' ? (
        /* Day View Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {dayMeals.length > 0 ? (
            dayMeals.map((meal) => {
              const cfg = MEAL_CONFIG[meal.meal_type] || {
                label: meal.meal_type,
                gradient: 'from-slate-500/10 to-slate-500/10',
                iconColor: 'text-slate-600',
              };
              return (
                <div
                  key={meal.id}
                  className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card hover-lift transition-all space-y-4"
                >
                  <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.iconColor}`}>
                          {meal.meal_type}
                        </span>
                        <span className="text-slate-300">&bull;</span>
                        <div className="flex items-center space-x-1 text-xs text-slate-500 font-mono">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span>{meal.start_time} - {meal.end_time}</span>
                        </div>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">
                        {cfg.label}
                      </h3>
                    </div>

                    {/* Dietary Badges */}
                    <div className="flex gap-1.5 shrink-0">
                      {meal.dietary_info.veg && (
                        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          Veg
                        </span>
                      )}
                      {meal.dietary_info.egg && (
                        <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                          Egg
                        </span>
                      )}
                      {meal.dietary_info.jain && (
                        <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                          Jain
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Dishes &amp; Accompaniments
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 font-medium">
                      {meal.items.map((item, i) => (
                        <li key={i} className="flex items-center space-x-2 p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span className="truncate">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2">
              <EmptyState
                icon={UtensilsCrossed}
                title={`No menu published for ${selectedDay}`}
                description="Dining schedules for this day are currently being finalized by the Student Mess Committee."
              />
            </div>
          )}
        </div>
      ) : (
        /* Weekly Matrix View */
        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-card">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-4 font-bold">Meal</th>
                <th className="py-3.5 px-4 font-bold">Timings</th>
                {days.map((d) => (
                  <th key={d} className="py-3.5 px-4 font-bold">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map((mealType) => (
                <tr key={mealType} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-4 font-bold text-slate-900 whitespace-nowrap">
                    {mealType}
                  </td>
                  <td className="py-4 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {menuItems.find((m) => m.meal_type === mealType)?.start_time || '—'} - {menuItems.find((m) => m.meal_type === mealType)?.end_time || '—'}
                  </td>
                  {days.map((day) => {
                    const match = menuItems.find((m) => m.day_of_week === day && m.meal_type === mealType);
                    return (
                      <td key={day} className="py-4 px-4 min-w-[180px] align-top">
                        {match ? (
                          <div className="space-y-1">
                            <div className="text-[11px] font-medium text-slate-800">
                              {match.items.join(', ')}
                            </div>
                            <div className="flex gap-1 pt-1">
                              {match.dietary_info.veg && (
                                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 rounded px-1">V</span>
                              )}
                              {match.dietary_info.egg && (
                                <span className="text-[9px] font-bold text-amber-700 bg-amber-50 rounded px-1">E</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
