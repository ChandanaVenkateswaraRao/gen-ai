'use client';

import React, { useState, useEffect } from 'react';
import {
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  UtensilsCrossed,
  Clock,
  Sparkles,
  RefreshCw,
  X,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { MessMenuItem } from '@/types';

export default function AdminMessEditorPage() {
  const { currentRole, currentUser } = useApp();
  const [weeklyMenu, setWeeklyMenu] = useState<MessMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Editor form state
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const meals = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedMeal, setSelectedMeal] = useState('Breakfast');
  const [startTime, setStartTime] = useState('07:30');
  const [endTime, setEndTime] = useState('09:30');
  const [items, setItems] = useState<string[]>(['']);
  const [isVeg, setIsVeg] = useState(true);
  const [hasEgg, setHasEgg] = useState(false);
  const [hasDairy, setHasDairy] = useState(true);
  const [isJain, setIsJain] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMenu();
  }, [currentUser]);

  const loadMenu = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getWeeklyMenu();
      setWeeklyMenu(data);
      populateFormFor(selectedDay, selectedMeal, data);
    } catch (err: any) {
      setError(err.message || 'Failed to load menu schedule.');
    } finally {
      setLoading(false);
    }
  };

  const populateFormFor = (day: string, meal: string, list: MessMenuItem[]) => {
    const found = list.find((m) => m.day_of_week === day && m.meal_type === meal);
    if (found) {
      setStartTime(found.start_time);
      setEndTime(found.end_time);
      setItems(found.items.length > 0 ? found.items : ['']);
      setIsVeg(found.dietary_info.veg);
      setHasEgg(found.dietary_info.egg);
      setHasDairy(found.dietary_info.dairy ?? true);
      setIsJain(found.dietary_info.jain);
    }
  };

  const handleSelectSlot = (day: string, meal: string) => {
    setSelectedDay(day);
    setSelectedMeal(meal);
    populateFormFor(day, meal, weeklyMenu);
  };

  const handleItemChange = (index: number, val: string) => {
    const updated = [...items];
    updated[index] = val;
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([...items, '']);
  };

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated.length > 0 ? updated : ['']);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanItems = items.map((i) => i.trim()).filter(Boolean);
    if (cleanItems.length === 0) {
      setError('Please add at least one menu item.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSaveSuccess(null);

      const updated = await api.updateMenuItem({
        day_of_week: selectedDay,
        meal_type: selectedMeal,
        start_time: startTime,
        end_time: endTime,
        items: cleanItems,
        dietary_info: {
          veg: isVeg,
          egg: hasEgg,
          dairy: hasDairy,
          jain: isJain,
        },
      });

      setSaveSuccess(`${selectedDay} ${selectedMeal} updated successfully.`);
      loadMenu();
    } catch (err: any) {
      setError(err.message || 'Failed to update mess menu.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-card">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-emerald-500/10 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
              Dining Hall Operations
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 poppins">
              Weekly Mess Schedule Editor
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl">
              Modify the 7-day breakfast, lunch, snacks, and dinner schedules. Changes take effect across student residential portals instantly.
            </p>
          </div>

          <button
            onClick={loadMenu}
            disabled={loading}
            className="btn-press inline-flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-subtle shrink-0 self-start sm:self-auto disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
            <span>Sync Menu</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-emerald-800 shadow-card animate-slide-down flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{saveSuccess}</span>
          </div>
          <button onClick={() => setSaveSuccess(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 animate-slide-down">
          {error}
        </div>
      )}

      {/* Day & Meal Selector Grid */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-card space-y-4">
        {/* Days Bar */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Select Day of Week
          </span>
          <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-none">
            {days.map((day) => {
              const isSelected = selectedDay === day;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectSlot(day, selectedMeal)}
                  className={`btn-press whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Meals Bar */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Select Meal Slot
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {meals.map((meal) => {
              const isSelected = selectedMeal === meal;
              return (
                <button
                  key={meal}
                  type="button"
                  onClick={() => handleSelectSlot(selectedDay, meal)}
                  className={`btn-press rounded-xl p-2.5 text-xs font-bold transition-all border ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 ring-1 ring-indigo-600'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {meal}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Meal Editor Form */}
      <form onSubmit={handleSave} className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Editing: {selectedDay} &bull; {selectedMeal}
            </h3>
            <p className="text-xs text-slate-400">Configure timings, dishes, and dietary flags</p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-press inline-flex items-center space-x-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Publishing…' : 'Publish Slot Changes'}</span>
          </button>
        </div>

        {/* Timings & Dietary Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 block">
              Meal Hours (24-Hour)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-900 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 block">
              Dietary Tags
            </span>
            <div className="flex flex-wrap gap-4 pt-1">
              <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVeg}
                  onChange={(e) => setIsVeg(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Vegetarian</span>
              </label>
              <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasEgg}
                  onChange={(e) => setHasEgg(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span>Contains Egg</span>
              </label>
              <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isJain}
                  onChange={(e) => setIsJain(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Jain Available</span>
              </label>
            </div>
          </div>
        </div>

        {/* Dishes List */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Menu Dishes ({items.length})
            </span>
            <button
              type="button"
              onClick={handleAddItem}
              className="btn-press inline-flex items-center space-x-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Dish Item</span>
            </button>
          </div>

          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <span className="text-xs font-mono text-slate-400 w-6 text-center">{idx + 1}.</span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleItemChange(idx, e.target.value)}
                  placeholder="e.g. Masala Dosa, Sambar, Coconut Chutney"
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
