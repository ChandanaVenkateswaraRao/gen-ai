'use client';

import React, { useEffect, useState } from 'react';
import { Info, RefreshCw, UtensilsCrossed } from 'lucide-react';
import { api } from '@/lib/api';
import { MessMenuItem } from '@/types';
import { EmptyState } from '@/components/ui/EmptyState';

const MEAL_LABELS: Record<string, string> = {
  Breakfast: 'Breakfast',
  Lunch: 'Lunch',
  Snacks: 'Evening Snacks',
  Dinner: 'Dinner',
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
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col lg:flex-shrink-0">
          <div className="flex items-center space-x-2.5 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FDF2F2] text-[#DC143C]">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <h1 className="text-base font-semibold tracking-tight text-[#101C3A]">
              Hostel Dining &amp; Mess Schedule
            </h1>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#647794]">
            <span>Official 7-day dining roster certified by the Student Mess Committee and Wardens Council.</span>
            <span>\u2022</span>
            <span className="font-mono text-[10px] text-[#DC143C]">Academic Term 2026</span>
          </div>
        </div>
        <div className="flex items-center space-x-2 shrink-0 lg:ml-4">
          <button
            onClick={loadMenu}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] px-3 py-1.5 text-xs font-medium text-[#101C3A] hover:bg-[#EAF4FF] transition-smooth disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
          <div className="rounded-md border border-[#DCE6F2] bg-[#FFFFFF] p-1">
            <button
              onClick={() => setViewMode('day')}
              className={`rounded px-2.5 py-1 font-medium transition-colors ${
                viewMode === 'day' ? 'bg-[#021861] text-white' : 'text-[#101C3A] hover:bg-[#F5F7FF]'
              }`}
            >
              Day View
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`rounded px-2.5 py-1 font-medium transition-colors ${
                viewMode === 'matrix' ? 'bg-[#021861] text-white' : 'text-[#101C3A] hover:bg-[#F5F7FF]'
              }`}
            >
              Weekly Matrix
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-[#DC143C]/30 bg-[#FDF2F2] p-4 text-xs text-[#DC143C]">
          <div className="font-semibold">Schedule Loading Notice</div>
          <p className="mt-0.5">{error}</p>
        </div>
      )}

      {/* Day View */}
      {viewMode === 'day' && (
        <div className="space-y-4">
          {/* Day Navigation Tabs */}
          <div className="flex space-x-1.5 overflow-x-auto border-b border-[#DCE6F2] pb-2">
            {days.map((day) => {
              const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day;
              const isSelected = selectedDay === day;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`flex shrink-0 items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-smooth ${
                    isSelected
                      ? 'border border-[#021861] bg-[#021861] text-white'
                      : 'border border-[#DCE6F2] bg-[#FFFFFF] text-[#101C3A] hover:bg-[#F5F7FF]'
                  }`}
                >
                  <span>{day}</span>
                  {isToday && (
                    <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-[#DC143C]'}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Meals Table for Selected Day */}
          <div className="rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#DCE6F2] bg-[#EAF4FF]/50 text-[10px] font-semibold uppercase text-[#647794]">
                <tr>
                  <th className="px-4 py-3">Meal Slot</th>
                  <th className="px-4 py-3">Operating Hours</th>
                  <th className="px-4 py-3">Authorized Menu Items</th>
                  <th className="px-4 py-3">Dietary Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE6F2]">
                {dayMeals.length > 0 ? (
                  dayMeals.map((meal) => (
                    <tr
                      key={meal.id}
                      className={meal.is_active_now ? 'bg-[#FFF4F3]/50' : 'hover:bg-[#F5F7FF]'}
                    >
                      <td className="px-4 py-4 font-semibold text-[#101C3A]">
                        <div className="flex items-center space-x-2">
                          <span className="text-[#647794]">{MEAL_LABELS[meal.meal_type]}</span>
                          {meal.is_active_now && (
                            <span className="inline-flex items-center rounded border border-[#DC143C]/30 bg-[#FDF2F2] px-2 py-0.5 text-[10px] font-medium text-[#DC143C]">
                              Serving Now
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[#647794] font-mono text-[10px]">
                        {meal.start_time} \u2013 {meal.end_time}
                      </td>
                      <td className="px-4 py-4">
                        <ul className="space-y-1">
                          {meal.items.map((item, idx) => (
                            <li key={idx} className="flex items-center space-x-2 text-[#101C3A]">
                              <span className="h-1 w-1 rounded-full bg-[#DC143C]" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {meal.dietary_info.veg && (
                            <span className="rounded border border-[#3F51B5]/30 bg-[#EAF4FF] px-1.5 py-0.5 text-[10px] font-medium text-[#3F51B5]">
                              Vegetarian
                            </span>
                          )}
                          {meal.dietary_info.egg && (
                            <span className="rounded border border-[#DC143C]/30 bg-[#FDF2F2] px-1.5 py-0.5 text-[10px] font-medium text-[#DC143C]">
                              Egg
                            </span>
                          )}
                          {meal.dietary_info.jain && (
                            <span className="rounded border border-[#DCE6F2] bg-[#FFFFFF] px-1.5 py-0.5 text-[10px] font-medium text-[#647794]">
                              Jain Option
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8">
                      <EmptyState
                        icon={UtensilsCrossed}
                        title={`No schedule found for ${selectedDay}`}
                        description="The dining roster for this day is currently awaiting publication by the Student Mess Committee."
                        accent="crimson"
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Weekly Matrix View */}
      {viewMode === 'matrix' && (
        <div className="rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCE6F2] bg-[#EAF4FF]/50 text-[10px] font-semibold uppercase text-[#647794]">
              <tr>
                <th className="px-4 py-3">Day</th>
                <th className="px-4 py-3">Breakfast</th>
                <th className="px-4 py-3">Lunch</th>
                <th className="px-4 py-3">Evening Snacks</th>
                <th className="px-4 py-3">Dinner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE6F2]">
              {days.map((day) => {
                const b = menuItems.find((m) => m.day_of_week === day && m.meal_type === 'Breakfast');
                const l = menuItems.find((m) => m.day_of_week === day && m.meal_type === 'Lunch');
                const s = menuItems.find((m) => m.day_of_week === day && m.meal_type === 'Snacks');
                const d = menuItems.find((m) => m.day_of_week === day && m.meal_type === 'Dinner');
                return (
                  <tr key={day} className="hover:bg-[#F5F7FF] align-top">
                    <td className="px-4 py-3 font-semibold text-[#101C3A] whitespace-nowrap">
                      {day}
                    </td>
                    <td className="px-4 py-3 text-[10px] text-[#101C3A] max-w-[200px]">
                      {b ? `${MEAL_LABELS.Breakfast}: ${b.items.join(', ')}` : '\u2014'}
                    </td>
                    <td className="px-4 py-3 text-[10px] text-[#101C3A] max-w-[200px]">
                      {l ? `${MEAL_LABELS.Lunch}: ${l.items.join(', ')}` : '\u2014'}
                    </td>
                    <td className="px-4 py-3 text-[10px] text-[#101C3A] max-w-[200px]">
                      {s ? `${MEAL_LABELS.Snacks}: ${s.items.join(', ')}` : '\u2014'}
                    </td>
                    <td className="px-4 py-3 text-[10px] text-[#101C3A] max-w-[200px]">
                      {d ? `${MEAL_LABELS.Dinner}: ${d.items.join(', ')}` : '\u2014'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Mess Guidelines & Rebate Notice */}
      <div className="rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] p-5">
        <div className="flex items-center space-x-2 font-semibold text-[#101C3A] mb-1">
          <Info className="h-4 w-4 text-[#DC143C]" />
          <span>Dining Hall Policies &amp; Rebate Standards</span>
        </div>
        <p className="text-[10px] leading-relaxed text-[#647794]">
          Per Section 2 of the approved Mess Guidelines 2026: Students requesting dining rebate during absence must submit applications at least 72 hours in advance. A minimum continuous leave of four (4) days is required.
        </p>
      </div>
    </div>
  );
}
