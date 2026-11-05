import React, { useState } from 'react';
import { CabralState, OSItem, OSStatus, TabId } from '../types/cabral';
import { brl, numBR } from '../utils/calculations';

interface TabOSProps {
  state: CabralState;
  onSwitchTab: (tab: TabId) => void;
  onOpenNewOS: (editOS?: OSItem) => void;
  onChangeOSStatus: (id: string, status: OSStatus) => void;
  onUpdateOSExec: (id: string, exec: number) => void;
  onOpenTimemarkChoice: (osId: string) => void;
  onOpenOSA4Modal: (osId: string) => void;
  onDeleteOS: (osId: string) => void;
  onPrintOSListA4: () => void;
  onDownloadOSListPDF: () => void;
}

export const TabOS: React.FC<TabOSProps> = ({
  state,
  onSwitchTab,
  onOpenNewOS,
  onChangeOSStatus,
  onUpdateOSExec,
  onOpenTimemarkChoice,
  onOpenOSA4Modal,
  onDeleteOS,
  onPrintOSListA4,
  onDownloadOSListPDF,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [blocoFilter, setBlocoFilter] = useState('ALL');

  const allWk = state.osList.filter((o) => o.week === state.currentWeek);
  const sumPrev = allWk.reduce(
    (acc, x) => acc + (Number(x.prev) || 0) * (Number(x.unitPrice) || 0),
    0
  );

  const filtered = allWk.filter((o) => {
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    if (
      blocoFilter !== 'ALL' &&
      !o.bloco.toUpperCase().includes(blocoFilter.toUpperCase())
    )
      return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const hay = `${o.id} ${o.desc} ${o.executor} ${o.local} ${o.afericao} ${o.unit}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return (
    <section id="sec-os" className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-extrabold text-scnavy">
            Controle de Metas e Ordens de Serviço (Banco Próprio + SINAPI)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Detecção automática de métricas para somatória precisa de valores e
            repasse direto à Planilha de Medição quando executada.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onPrintOSListA4}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-extrabold px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            Imprimir Quadro O.S. (1 Pág. A4)
          </button>
          <button
            type="button"
            onClick={onDownloadOSListPDF}
            className="bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-extrabold px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            Baixar Quadro em PDF
          </button>
          <button
            type="button"
            onClick={() => onSwitchTab('afericao')}
            className="bg-scnavy hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer whitespace-nowrap"
          >
            Consultar Planta & Medidas Reais
          </button>
          <button
            type="button"
            onClick={() => onOpenNewOS()}
            className="bg-scorange hover:bg-orange-600 text-white text-xs font-extrabold px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            Nova Ordem de Serviço
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <div className="text-xs font-semibold text-slate-500">
            Total O.S. na Semana
          </div>
          <div className="text-xl font-extrabold text-scnavy mt-1 font-mono tabular-nums">
            {allWk.length}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <div className="text-xs font-semibold text-red-600">
            O.S. Urgentes
          </div>
          <div className="text-xl font-extrabold text-red-600 mt-1 font-mono tabular-nums">
            {allWk.filter((x) => x.status === 'URGENTE').length}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <div className="text-xs font-semibold text-amber-600">
            Em Execução / Campo
          </div>
          <div className="text-xl font-extrabold text-amber-600 mt-1 font-mono tabular-nums">
            {allWk.filter((x) => x.status === 'EXECUÇÃO').length}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <div className="text-xs font-semibold text-emerald-600">
            Executadas & Aceitas
          </div>
          <div className="text-xl font-extrabold text-emerald-600 mt-1 font-mono tabular-nums">
            {allWk.filter((x) => x.status === 'EXECUTADO').length}
          </div>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-300 p-3">
          <div className="text-xs font-semibold text-emerald-900">
            Somatória Prevista O.S.
          </div>
          <div className="text-xl font-extrabold text-emerald-800 mt-1 font-mono tabular-nums">
            {brl(sumPrev)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-wrap items-center gap-2">
        <input
          type="text"
          aria-label="Buscar Ordens de Serviço"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por código, descrição, métrica, executor ou ambiente..."
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs flex-1 min-w-[240px]"
        />
        <select
          aria-label="Filtrar por Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white font-semibold"
        >
          <option value="ALL">Todos os Status</option>
          <option value="URGENTE">Urgente</option>
          <option value="EXECUÇÃO">Em Execução</option>
          <option value="LIBERADO">Liberado</option>
          <option value="EXECUTADO">Executado</option>
        </select>
        <select
          aria-label="Filtrar por Bloco"
          value={blocoFilter}
          onChange={(e) => setBlocoFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white font-semibold"
        >
          <option value="ALL">Todos os Blocos</option>
          <option value="ALVENARIA 1, 2 E 3">Alvenaria 1, 2 e 3</option>
          <option value="REVESTIMENTO EM GERAL">Revestimento em Geral</option>
          <option value="EMASSAMENTO">Emassamento</option>
          <option value="SUPERESTRUTURA">Superestrutura Fase 2</option>
          <option value="REDE HIDRÁULICA">Rede Hidráulica</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="sc-fit-table text-left">
          <thead>
            <tr className="bg-scnavy text-white text-[10px] uppercase tracking-tight">
              <th className="py-2.5 px-2 w-[7%]">Cód.</th>
              <th className="py-2.5 px-1.5 w-[9%] text-center">Status</th>
              <th className="py-2.5 px-2 w-[11%]">Bloco</th>
              <th className="py-2.5 px-2 w-[11%]">Ambiente / Aferição</th>
              <th className="py-2.5 px-2 w-[19%]">
                Diretriz Técnica / Serviço & Preço
              </th>
              <th className="py-2.5 px-1.5 w-[8%]">Executor</th>
              <th className="py-2.5 px-1 w-[6%] text-center">Métrica</th>
              <th className="py-2.5 px-1.5 w-[8%] text-center">Exec / Prev</th>
              <th className="py-2.5 px-2 w-[7%] text-right">Subtotal</th>
              <th className="py-2.5 px-1 w-[6%] text-center">TM</th>
              <th className="py-2.5 px-2 w-[8%] text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-[11px]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-slate-500">
                  Nenhuma Ordem de Serviço encontrada para os filtros atuais.
                </td>
              </tr>
            ) : (
              filtered.map((o) => {
                const sub = (Number(o.prev) || 0) * (Number(o.unitPrice) || 0);
                const tmCount = (o.photos || []).filter(Boolean).length;
                return (
                  <tr
                    key={o.id}
                    className="hover:bg-slate-50 transition align-top"
                  >
                    <td className="py-2 px-2 font-extrabold text-scnavy font-mono">
                      {o.id}
                    </td>
                    <td className="py-2 px-1.5">
                      <select
                        aria-label={`Status da ${o.id}`}
                        value={o.status}
                        onChange={(e) =>
                          onChangeOSStatus(o.id, e.target.value as OSStatus)
                        }
                        className={`border rounded px-1 py-0.5 text-[10px] font-bold w-full cursor-pointer ${
                          o.status === 'EXECUTADO'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : o.status === 'URGENTE'
                            ? 'bg-red-50 text-red-700 border-red-300'
                            : 'bg-white text-slate-800 border-slate-300'
                        }`}
                      >
                        <option value="URGENTE">URGENTE</option>
                        <option value="EXECUÇÃO">EXECUÇÃO</option>
                        <option value="LIBERADO">LIBERADO</option>
                        <option value="EXECUTADO">EXECUTADO</option>
                      </select>
                    </td>
                    <td className="py-2 px-2 font-extrabold text-[10px] text-scnavy leading-tight">
                      {o.bloco}
                    </td>
                    <td className="py-2 px-2 text-[10px]">
                      <div className="font-bold text-scorange">
                        {o.local || '-'}
                      </div>
                      {o.afericao && (
                        <div className="text-[9.5px] text-slate-500 mt-0.5 font-mono">
                          {o.afericao}
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-2">
                      <div className="text-slate-900 font-bold text-[11px] leading-snug">
                        {o.desc}
                      </div>
                      <div className="text-[10px] font-bold text-emerald-800 font-mono mt-0.5">
                        {brl(o.unitPrice)} / {o.unit} ·{' '}
                        {o.costMode === 'MO_ONLY' ? 'Só M.O.' : 'M.O.+Insumo'}
                      </div>
                    </td>
                    <td className="py-2 px-1.5 font-bold text-slate-700 text-[10px]">
                      {o.executor}
                    </td>
                    <td className="py-2 px-1 text-center font-extrabold text-blue-900 text-[10px] font-mono">
                      {o.unit}
                    </td>
                    <td className="py-2 px-1.5 text-center font-mono text-[10px]">
                      <input
                        type="number"
                        step="0.01"
                        aria-label={`Quantidade executada ${o.id}`}
                        value={o.exec}
                        onChange={(e) =>
                          onUpdateOSExec(o.id, parseFloat(e.target.value) || 0)
                        }
                        className="w-14 border border-slate-300 rounded px-1 py-0.5 text-center font-bold text-emerald-800 bg-white"
                      />
                      <span className="text-slate-500 block mt-0.5">
                        de {numBR(o.prev)}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right font-extrabold text-scnavy text-[11px] font-mono tabular-nums">
                      {brl(sub)}
                    </td>
                    <td className="py-2 px-1 text-center">
                      <button
                        type="button"
                        onClick={() => onOpenTimemarkChoice(o.id)}
                        aria-label={`Timemark ${o.id}`}
                        className={`px-1.5 py-0.5 rounded border text-[9.5px] font-extrabold cursor-pointer font-mono ${
                          tmCount >= 2
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        📷 {tmCount}/2
                      </button>
                    </td>
                    <td className="py-2 px-1.5 text-right whitespace-nowrap space-x-1">
                      <button
                        type="button"
                        onClick={() => onOpenOSA4Modal(o.id)}
                        aria-label={`Visualizar A4 ${o.id}`}
                        className="bg-scnavy text-white text-[9.5px] font-bold px-1.5 py-1 rounded cursor-pointer"
                      >
                        A4
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenNewOS(o)}
                        aria-label={`Editar ${o.id}`}
                        className="text-blue-600 hover:bg-blue-50 px-1 py-0.5 rounded cursor-pointer text-[10px]"
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteOS(o.id)}
                        aria-label={`Excluir ${o.id}`}
                        className="text-red-500 hover:bg-red-50 px-1 py-0.5 rounded cursor-pointer text-[10px]"
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
