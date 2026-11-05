import React from 'react';
import { CabralState } from '../types/cabral';
import {
  brl,
  calculateMedicaoBlockTotals,
  numBR,
} from '../utils/calculations';

interface TabMedicaoProps {
  state: CabralState;
  onOpenMedicaoPrintModal: () => void;
  onDownloadMedicaoPDF: () => void;
  onOpenNewMedicaoModal: () => void;
  onDeleteMedicaoItem: (id: string) => void;
  onUpdateMedicaoQty: (id: string, qty: number) => void;
}

export const TabMedicao: React.FC<TabMedicaoProps> = ({
  state,
  onOpenMedicaoPrintModal,
  onDownloadMedicaoPDF,
  onOpenNewMedicaoModal,
  onDeleteMedicaoItem,
  onUpdateMedicaoQty,
}) => {
  const list = state.medicaoList.filter((m) => m.week === state.currentWeek);
  const { sumAlv, sumRev, sumEma, sumTotal } = calculateMedicaoBlockTotals(
    state.currentWeek,
    state.medicaoList
  );

  return (
    <section id="sec-medicao" className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-extrabold text-scnavy">
            Planilha de Medição Semanal (Banco Próprio & SINAPI) —{' '}
            <span>{state.currentWeek}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Alvenaria, Revestimentos e Emassamento executados repassam os
            valores consolidados diretamente para o Cronograma de Pagamentos.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenMedicaoPrintModal}
            className="bg-scorange hover:bg-orange-600 text-white text-xs font-extrabold px-3.5 py-2 rounded-lg cursor-pointer whitespace-nowrap"
          >
            Visualizar & Imprimir Medição A4
          </button>
          <button
            type="button"
            onClick={onDownloadMedicaoPDF}
            className="bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-extrabold px-3.5 py-2 rounded-lg cursor-pointer whitespace-nowrap"
          >
            Baixar Medição em PDF
          </button>
          <button
            type="button"
            onClick={onOpenNewMedicaoModal}
            className="bg-scnavy hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer whitespace-nowrap"
          >
            Adicionar Medição Manual
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <div className="text-xs font-semibold text-slate-500">
            Alvenaria 1, 2 e 3
          </div>
          <div className="text-lg font-extrabold text-scnavy mt-1 font-mono tabular-nums">
            {brl(sumAlv)}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <div className="text-xs font-semibold text-slate-500">
            Revestimentos em Geral
          </div>
          <div className="text-lg font-extrabold text-scnavy mt-1 font-mono tabular-nums">
            {brl(sumRev)}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <div className="text-xs font-semibold text-slate-500">
            Emassamento
          </div>
          <div className="text-lg font-extrabold text-scnavy mt-1 font-mono tabular-nums">
            {brl(sumEma)}
          </div>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-300 p-3">
          <div className="text-xs font-semibold text-emerald-800">
            Total Medição Semanal
          </div>
          <div className="text-lg font-extrabold text-emerald-900 mt-1 font-mono tabular-nums">
            {brl(sumTotal)}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="sc-fit-table text-left">
          <thead>
            <tr className="bg-scnavy text-white text-[10px] uppercase">
              <th className="py-2.5 px-2.5 w-[16%]">Bloco</th>
              <th className="py-2.5 px-2 w-[8%]">Código</th>
              <th className="py-2.5 px-2.5 w-[33%]">Serviço / O.S.</th>
              <th className="py-2.5 px-1.5 w-[8%] text-center">Métrica</th>
              <th className="py-2.5 px-2 w-[9%] text-right">R$ Unit.</th>
              <th className="py-2.5 px-2 w-[9%] text-center">Medição</th>
              <th className="py-2.5 px-2.5 w-[10%] text-right">Subtotal</th>
              <th className="py-2.5 px-2 w-[4%] text-center">Status</th>
              <th className="py-2.5 px-1.5 w-[3%] text-center">✕</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-[11px]">
            {list.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500">
                  Nenhum item medido nesta semana. Marque uma O.S. como
                  Executada ou adicione uma medição manual.
                </td>
              </tr>
            ) : (
              list.map((m) => {
                const sub = (Number(m.qty) || 0) * (Number(m.unitPrice) || 0);
                return (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-2.5 font-extrabold text-scnavy">
                      {m.bloco}
                    </td>
                    <td className="py-2.5 px-2 font-bold text-slate-700 font-mono">
                      {m.code}
                    </td>
                    <td className="py-2.5 px-2.5 font-medium text-slate-800">
                      {m.desc}
                    </td>
                    <td className="py-2.5 px-1.5 text-center font-extrabold text-scnavy font-mono">
                      {m.unit}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                      {brl(m.unitPrice)}
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono">
                      <input
                        type="number"
                        step="0.01"
                        aria-label={`Quantidade medição ${m.code}`}
                        value={m.qty}
                        onChange={(e) =>
                          onUpdateMedicaoQty(
                            m.id,
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-16 border border-slate-300 rounded px-1.5 py-0.5 text-center font-extrabold text-scnavy"
                      />
                    </td>
                    <td className="py-2.5 px-2.5 text-right font-extrabold text-scnavy font-mono tabular-nums">
                      {brl(sub)}
                    </td>
                    <td className="py-2.5 px-2 text-center text-[10px] text-emerald-700 font-semibold">
                      Repasse
                    </td>
                    <td className="py-2.5 px-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => onDeleteMedicaoItem(m.id)}
                        aria-label={`Remover medição ${m.code}`}
                        className="text-red-500 hover:bg-red-50 px-1.5 py-0.5 rounded cursor-pointer"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
