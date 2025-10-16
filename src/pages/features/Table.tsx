// src/features/boards/Table.tsx
import React, { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import type { BoardOutletCtx } from "../home/Dashboard";
import { Trash2 } from "lucide-react";
import { cardsApi } from "../../api/cards";

export default function Table() {
  const { cards, lists, setCards } = useOutletContext<BoardOutletCtx>();
  const listName = useMemo(() => Object.fromEntries(lists.map(l => [l._id, l.title])), [lists]);
  const rows = useMemo(() => cards.slice().sort((a,b)=>(a.dueDate?+new Date(a.dueDate):9e15)-(b.dueDate?+new Date(b.dueDate):9e15)), [cards]);

  const remove = async (id: string) => {
    if (!confirm("Xóa thẻ này?")) return;
    await cardsApi.deleteCard(id);
    setCards(xs => xs.filter(c => c._id !== id));
  };

  return (
    <div className="px-6 pb-10 pt-6">
      <div className="mx-auto max-w-[1200px] overflow-hidden rounded-2xl bg-white shadow">
        <div className="border-b px-6 py-4"><h3 className="text-lg font-bold">Bảng thẻ</h3></div>
        <div className="max-h-[70vh] overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-6 py-3 font-semibold">Tiêu đề</th>
                <th className="px-6 py-3 font-semibold">Danh sách</th>
                <th className="px-6 py-3 font-semibold">Nhãn</th>
                <th className="px-6 py-3 font-semibold">Hạn chót</th>
                <th className="px-6 py-3 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-900">{c.title}</td>
                  <td className="px-6 py-3">{listName[c.listId] || "—"}</td>
                  <td className="px-6 py-3">{c.labels?.[0] ? <span className="inline-block h-3 w-8 rounded" style={{background:c.labels[0]}}/> : "—"}</td>
                  <td className="px-6 py-3">{c.dueDate ? new Date(c.dueDate).toLocaleString("vi-VN") : "—"}</td>
                  <td className="px-6 py-3 text-right">
                    <button onClick={()=>remove(c._id)} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"><Trash2 size={14}/></button>
                  </td>
                </tr>
              ))}
              {rows.length===0 && <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">Chưa có thẻ nào</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
