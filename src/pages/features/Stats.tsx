// src/features/boards/Stats.tsx
import React, { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import type { BoardOutletCtx } from "../home/Dashboard";

export default function Stats() {
  const { cards, lists } = useOutletContext<BoardOutletCtx>();

  const { total, completed, overdue, soon, byList } = useMemo(() => {
    const total = cards.length;
    const completed = cards.filter(c => c.isCompleted).length;
    const overdue = cards.filter(c => !c.isCompleted && c.dueDate && new Date(c.dueDate) < new Date()).length;
    const soon = cards.filter(c => {
      if (!c.dueDate || c.isCompleted) return false;
      const diffH = (new Date(c.dueDate).getTime() - Date.now()) / 36e5;
      return diffH >= 0 && diffH < 72;
    }).length;
    const byList = lists.map(l => ({
      listId: l._id,
      title: l.title,
      count: cards.filter(c => c.listId === l._id).length
    }));
    return { total, completed, overdue, soon, byList };
  }, [cards, lists]);

  return (
    <div className="px-6 pb-10 pt-6">
      <div className="mx-auto grid max-w-[1200px] gap-6 md:grid-cols-2">
        {/* KPIs */}
        <div className="rounded-2xl bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-bold">Tổng quan</h3>
          <div className="grid grid-cols-2 gap-4">
            <Kpi title="Tổng thẻ" value={total} tone="default" />
            <Kpi title="Hoàn thành" value={completed} tone="green" />
            <Kpi title="Quá hạn" value={overdue} tone="red" />
            <Kpi title="Sắp đến hạn" value={soon} tone="amber" />
          </div>
        </div>

        {/* Distribution by list */}
        <div className="rounded-2xl bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-bold">Phân bố theo danh sách</h3>
          <div className="space-y-3">
            {byList.map(b => (
              <div key={b.listId}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{b.title}</span>
                  <span className="text-gray-500">{b.count}</span>
                </div>
                <div className="h-3 w-full rounded-full bg-gray-100">
                  <div
                    className="h-3 rounded-full bg-blue-500"
                    style={{ width: `${total ? (b.count / total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
            {byList.length === 0 && (
              <p className="py-8 text-center text-gray-500">Chưa có danh sách</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ title, value, tone }: { title: string; value: number; tone: "default" | "green" | "red" | "amber" }) {
  const toneMap: Record<string, string> = {
    default: "bg-gray-50 text-gray-800",
    green: "bg-green-50 text-green-800",
    red: "bg-red-50 text-red-800",
    amber: "bg-amber-50 text-amber-800",
  };
  return (
    <div className={`rounded-xl p-4 ${toneMap[tone]}`}>
      <div className="text-sm font-medium opacity-80">{title}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}
