// src/features/boards/Calendar.tsx
import React, { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import type { BoardOutletCtx } from "../home/Dashboard";
import { ChevronLeft, ChevronRight } from "lucide-react";

function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth()+1, 0); }
function addMonths(d: Date, n: number) { return new Date(d.getFullYear(), d.getMonth()+n, 1); }

export default function Calendar() {
  const { cards } = useOutletContext<BoardOutletCtx>();
  const [cursor, setCursor] = useState(startOfMonth(new Date()));
  const days = useMemo(() => {
    const start = startOfMonth(cursor), end = endOfMonth(cursor), arr: Date[] = [];
    const offset = (start.getDay()+6)%7; // Monday first
    for (let i=0;i<offset;i++) arr.push(new Date(start.getTime()-(offset-i)*86400000));
    for (let d=1; d<=end.getDate(); d++) arr.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    while(arr.length%7!==0) arr.push(new Date(arr[arr.length-1].getTime()+86400000));
    return arr;
  }, [cursor]);

  const byDay = useMemo(() => {
    const m = new Map<string, typeof cards>();
    for (const c of cards) {
      if (!c.dueDate) continue;
      const k = new Date(c.dueDate).toDateString();
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(c);
    }
    return m;
  }, [cards]);

  const monthLabel = cursor.toLocaleDateString("vi-VN",{month:"long",year:"numeric"});
  const weekdays = ["T2","T3","T4","T5","T6","T7","CN"];

  return (
    <div className="px-6 pb-10 pt-6">
      <div className="mx-auto max-w-[1200px] rounded-2xl bg-white shadow">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="text-lg font-bold">{monthLabel}</div>
          <div className="flex items-center gap-2">
            <button className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50" onClick={()=>setCursor(addMonths(cursor,-1))}><ChevronLeft size={16}/> Trước</button>
            <button className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50" onClick={()=>setCursor(startOfMonth(new Date()))}>Hôm nay</button>
            <button className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50" onClick={()=>setCursor(addMonths(cursor,1))}>Sau <ChevronRight size={16}/></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {weekdays.map(w=> <div key={w} className="bg-gray-50 px-3 py-2 text-center text-xs font-semibold text-gray-600">{w}</div>)}
          {days.map((d,i)=>{
            const inMonth = d.getMonth() === cursor.getMonth();
            const key = d.toDateString();
            const items = byDay.get(key) || [];
            return (
              <div key={i} className={`min-h-[110px] bg-white p-2 ${!inMonth ? "opacity-50":""}`}>
                <div className="mb-1 text-right text-xs font-semibold text-gray-500">{d.getDate()}</div>
                <div className="space-y-1">
                  {items.slice(0,3).map(c => (
                    <div key={c._id} className="truncate rounded-md px-2 py-1 text-xs font-medium" style={{ background: c.labels?.[0] || "#e5e7eb", color: "#111827" }}>
                      {c.title}
                    </div>
                  ))}
                  {items.length>3 && <div className="text-xs text-gray-500">+{items.length-3} thêm…</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
