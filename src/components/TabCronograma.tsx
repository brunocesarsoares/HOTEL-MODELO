import React from 'react';
import { CabralState, CronogramaReminderConfig } from '../types/cabral';
import {
  brl,
  calculateCronogramaTotals,
  evaluateCronogramaFridayReminder,
  numBR,
} from '../utils/calculations';

interface TabCronogramaProps {
  state: CabralState;
  onShareWhatsApp: () => void;
  onPrintCronogramaA4: () => void;
  onDownloadCronogramaPDF: () => void;
  onOpenNewCronogramaModal: () => void;
  onDeleteCronogramaItem: (id: string) => void;
  onUpdateReminderConfig: (nextConfig: CronogramaReminderConfig) => void;
  onTriggerFridayReminderToast: () => void;
}

export const TabCronograma: React.FC<TabCronogramaProps> = ({
  state,
  onShareWhatsApp,
  onPrintCronogramaA4,
  onDownloadCronogramaPDF,
  onOpenNewCronogramaModal,
  onDeleteCronogramaItem,
  onUpdateReminderConfig,
  onTriggerFridayReminderToast,
}) => {
  const list = state.cronogramaList.filter((c) => c.week === state.currentWeek);
  const { subtotal, rt, finalTotal } = calculateCronogramaTotals(
    state.currentWeek,
    state.cronogramaList
  );

  const reminderCfg: CronogramaReminderConfig = state.cronogramaReminder || {
    enabled: true,
    simulateFriday: true,
    plannedBudgets: { 'SEMANA 37': 5000, 'SEMANA 36': 4500, 'SEMANA 35': 4000 },
  };

  const reminderEval = evaluateCronogramaFridayReminder({
    week: state.currentWeek,
    cronogramaList: state.cronogramaList,
    osList: state.osList,
    plannedBudgets: reminderCfg.plannedBudgets,
    enabled: reminderCfg.enabled,
    simulateFriday: reminderCfg.simulateFriday,
  });

  const isRealFriday = new Date().getDay() === 5;
  const isOverBudget = reminderEval.isExceeded;

  const statusColorTheme = isOverBudget
    ? {
        panelBg: 'bg-red-50/80 border-red-400',
        headerBadge: 'bg-red-600 text-white border-red-700',
        dot: 'bg-red-600 animate-ping',
        barFill: 'bg-red-600',
        accentText: 'text-red-800',
        subText: 'text-red-700',
        cardBorder: 'border-red-300',
        kpiCardBg: 'bg-red-50 border-red-400',
      }
    : {
        panelBg: 'bg-emerald-50/80 border-emerald-400',
        headerBadge: 'bg-emerald-600 text-white border-emerald-700',
        dot: 'bg-emerald-500',
        barFill: 'bg-emerald-600',
        accentText: 'text-emerald-800',
        subText: 'text-emerald-700',
        cardBorder: 'border-emerald-300',
        kpiCardBg: 'bg-emerald-50 border-emerald-400',
      };

  const progressWidth = Math.min(100, Math.max(0, reminderEval.usagePct));

  return (
    <section id="sec-cronograma" className="space-y-4">
      {/* PAINEL DE INDICADORES (KPIs) NO TOPO DA TABCRONOGRAMA */}
      <div
        id="cronogramaKpiGrid"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {/* KPI 1: Status Geral do Orçamento (Verde = Dentro / Vermelho = Estouro) */}
        <div
          id="kpi-cron-status"
          className={`rounded-xl border-2 p-3.5 transition-colors ${statusColorTheme.kpiCardBg}`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[11px] font-extrabold uppercase ${statusColorTheme.subText}`}
            >
              Status do Orçamento ({state.currentWeek})
            </span>
            <span
              className={`w-3 h-3 rounded-full inline-block ${
                isOverBudget ? 'bg-red-600' : 'bg-emerald-600'
              }`}
            />
          </div>
          <div
            className={`text-lg font-extrabold mt-1 ${statusColorTheme.accentText}`}
          >
            {isOverBudget ? 'Alerta de estouro' : 'Dentro do orçamento'}
          </div>
          <div className={`text-[11px] font-bold mt-0.5 ${statusColorTheme.subText}`}>
            {isOverBudget
              ? `Fora do orçamento (+${numBR(reminderEval.excessPct)}%)`
              : `${numBR(reminderEval.usagePct)}% do orçamento utilizado`}
          </div>
        </div>

        {/* KPI 2: Orçamento Planejado da Semana */}
        <div
          id="kpi-cron-planned"
          className="bg-white rounded-xl border border-slate-200 p-3.5"
        >
          <label
            htmlFor="cronPlannedBudgetInput"
            className="block text-[11px] font-extrabold text-slate-500 uppercase"
          >
            Orçamento Planejado Semanal
          </label>
          <div className="flex items-center gap-1.5 mt-1">
            <input
              id="cronPlannedBudgetInput"
              type="number"
              step="50"
              aria-label="Valor Planejado da Semana"
              value={reminderEval.plannedBudget}
              onChange={(e) => {
                const val = Math.max(0, parseFloat(e.target.value) || 0);
                onUpdateReminderConfig({
                  ...reminderCfg,
                  plannedBudgets: {
                    ...reminderCfg.plannedBudgets,
                    [state.currentWeek]: val,
                  },
                });
              }}
              className="w-full border border-slate-300 rounded px-2.5 py-1 text-base font-extrabold text-scnavy font-mono tabular-nums"
            />
            {reminderEval.plannedOSTotal > 0 && (
              <button
                type="button"
                onClick={() =>
                  onUpdateReminderConfig({
                    ...reminderCfg,
                    plannedBudgets: {
                      ...reminderCfg.plannedBudgets,
                      [state.currentWeek]: reminderEval.plannedOSTotal,
                    },
                  })
                }
                title="Sincronizar com a Somatória Prevista das O.S. da semana"
                className="bg-slate-100 hover:bg-slate-200 text-scnavy text-[10px] font-bold px-2 py-1.5 rounded border border-slate-300 cursor-pointer whitespace-nowrap"
              >
                Usar O.S. ({brl(reminderEval.plannedOSTotal)})
              </button>
            )}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Meta base p/ {state.currentWeek}: {brl(reminderEval.plannedBudget)}
          </div>
        </div>

        {/* KPI 3: Total das Despesas da Semana (c/ RT 12%) */}
        <div
          id="kpi-cron-expenses"
          className={`rounded-xl border-2 p-3.5 transition-colors ${
            isOverBudget
              ? 'bg-red-50/60 border-red-300'
              : 'bg-emerald-50/60 border-emerald-300'
          }`}
        >
          <div className="text-[11px] font-extrabold text-slate-600 uppercase">
            Total de Despesas (c/ RT 12%)
          </div>
          <div
            className={`text-xl font-extrabold mt-1 font-mono tabular-nums ${statusColorTheme.accentText}`}
          >
            {brl(reminderEval.finalTotal)}
          </div>
          <div className="text-[10px] text-slate-600 font-mono mt-0.5">
            Subtotal: {brl(subtotal)} + RT (12%): {brl(rt)}
          </div>
        </div>

        {/* KPI 4: Saldo Disponível ou Excesso (Verde vs. Vermelho) */}
        <div
          id="kpi-cron-variance"
          className={`rounded-xl border-2 p-3.5 transition-colors ${statusColorTheme.kpiCardBg}`}
        >
          <div
            className={`text-[11px] font-extrabold uppercase ${statusColorTheme.subText}`}
          >
            {isOverBudget
              ? 'Valor Excedente (Estouro)'
              : 'Saldo Disponível no Orçamento'}
          </div>
          <div
            className={`text-xl font-extrabold mt-1 font-mono tabular-nums ${statusColorTheme.accentText}`}
          >
            {isOverBudget
              ? `+ ${brl(reminderEval.excessAmount)}`
              : brl(reminderEval.remainingBudget)}
          </div>
          <div className={`text-[10px] font-bold mt-0.5 ${statusColorTheme.subText}`}>
            {isOverBudget
              ? `Ultrapassou a meta em ${numBR(reminderEval.excessPct)}%`
              : `Margem livre de ${numBR(Math.max(0, 100 - reminderEval.usagePct))}%`}
          </div>
        </div>
      </div>

      {/* PAINEL DE CONTROLE DO LEMBRETE AUTOMÁTICO DE SEXTA-FEIRA & PROGRESSO */}
      <div
        id="cronogramaBudgetStatusPanel"
        className={`rounded-xl border-2 p-4 space-y-3 transition-all ${statusColorTheme.panelBg}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-tight text-scnavy">
                <span
                  className={`w-2.5 h-2.5 rounded-full inline-block ${statusColorTheme.dot}`}
                />
                Diagnóstico de Sexta-Feira ({state.currentWeek})
              </span>

              <span
                id="cronogramaStatusBadge"
                className={`text-xs font-extrabold px-2.5 py-0.5 rounded-md border ${statusColorTheme.headerBadge}`}
              >
                {isOverBudget
                  ? `FORA DO ORÇAMENTO (+${numBR(reminderEval.excessPct)}%)`
                  : `DENTRO DO ORÇAMENTO (${numBR(reminderEval.usagePct)}%)`}
              </span>

              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                  reminderEval.shouldNotify
                    ? 'bg-red-700 text-white border-red-800'
                    : 'bg-emerald-700 text-white border-emerald-800'
                }`}
              >
                {reminderEval.shouldNotify
                  ? '🔔 Notificação Toast: DISPARO ATIVO'
                  : '✅ Notificação Toast: Sem estouro'}
              </span>
            </div>

            <p className={`text-xs font-bold ${statusColorTheme.accentText}`}>
              {reminderEval.message}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer bg-white px-2.5 py-1.5 rounded-lg border border-slate-300">
              <input
                type="checkbox"
                checked={reminderCfg.enabled}
                onChange={(e) =>
                  onUpdateReminderConfig({
                    ...reminderCfg,
                    enabled: e.target.checked,
                  })
                }
              />
              <span>Alerta de Sexta Ativo</span>
            </label>

            <label
              className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer bg-white px-2.5 py-1.5 rounded-lg border border-slate-300"
              title="Permite simular a validação de sexta-feira em qualquer dia da semana"
            >
              <input
                type="checkbox"
                checked={reminderCfg.simulateFriday}
                onChange={(e) =>
                  onUpdateReminderConfig({
                    ...reminderCfg,
                    simulateFriday: e.target.checked,
                  })
                }
              />
              <span>
                {isRealFriday ? 'Sexta-Feira Oficial' : 'Simular Sexta-Feira'}
              </span>
            </label>

            <button
              type="button"
              onClick={onTriggerFridayReminderToast}
              className="bg-scorange hover:bg-orange-600 text-white text-xs font-extrabold px-3 py-1.5 rounded-lg cursor-pointer whitespace-nowrap"
            >
              Testar Alerta Toast
            </button>
          </div>
        </div>

        {/* Barra de Progresso Visual (Verde = Sucesso / Vermelho = Estouro) */}
        <div className="bg-white/90 rounded-lg p-2.5 border border-slate-200/80 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-slate-700">
              Execução Orçamentária: {brl(reminderEval.finalTotal)} de{' '}
              {brl(reminderEval.plannedBudget)} planejados
            </span>
            <span className={`font-mono font-extrabold ${statusColorTheme.accentText}`}>
              {numBR(reminderEval.usagePct)}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${statusColorTheme.barFill}`}
              style={{ width: `${progressWidth}%` }}
            />
          </div>
        </div>
      </div>

      {/* BARRA DE AÇÕES DO CRONOGRAMA */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-extrabold text-scnavy">
            Cronograma de Pagamentos (Sexta-Feira) —{' '}
            <span>{state.currentWeek}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Consolidação automática da Medição Semanal e Ordens de Compra com
            chave PIX em linha única e taxa de RT de Obra (12%).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onShareWhatsApp}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            Enviar no WhatsApp
          </button>
          <button
            type="button"
            onClick={onPrintCronogramaA4}
            className="bg-scorange hover:bg-orange-600 text-white text-xs font-extrabold px-3.5 py-2 rounded-lg cursor-pointer whitespace-nowrap"
          >
            Imprimir Cronograma A4
          </button>
          <button
            type="button"
            onClick={onDownloadCronogramaPDF}
            className="bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-extrabold px-3.5 py-2 rounded-lg cursor-pointer whitespace-nowrap"
          >
            Baixar Cronograma em PDF
          </button>
          <button
            type="button"
            onClick={onOpenNewCronogramaModal}
            className="bg-scnavy hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer whitespace-nowrap"
          >
            Adicionar Pagamento / Reembolso
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto sc-scroll">
          <table
            className="w-full text-left border-collapse"
            id="cronogramaLiveTable"
          >
            <thead>
              <tr className="bg-scnavy text-white text-[11px] uppercase">
                <th className="py-2.5 px-3">Item / Descrição do Pagamento</th>
                <th className="py-2.5 px-3 w-64">Recebedor</th>
                <th className="py-2.5 px-3 w-48">Chave PIX</th>
                <th className="py-2.5 px-2 w-28 text-center">Formato PIX</th>
                <th className="py-2.5 px-3 w-36 text-right">Valor (R$)</th>
                <th className="py-2.5 px-2 w-16 text-center">✕</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {list.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-scnavy">
                    {c.desc}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">
                    {c.recebedor}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">
                    {c.pix}
                  </td>
                  <td className="py-2.5 px-2 text-center font-bold text-slate-600">
                    {c.formato}
                  </td>
                  <td className="py-2.5 px-3 text-right font-extrabold text-scnavy font-mono tabular-nums">
                    {brl(c.valor)}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <button
                      type="button"
                      onClick={() => onDeleteCronogramaItem(c.id)}
                      aria-label={`Excluir pagamento ${c.desc}`}
                      className="text-red-500 hover:bg-red-50 px-1.5 py-1 rounded cursor-pointer"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300 font-extrabold bg-slate-50 text-xs">
                <td colSpan={4} className="py-2.5 px-3 text-right uppercase">
                  TOTAL GASTOS:
                </td>
                <td className="py-2.5 px-3 text-right text-scnavy text-sm font-mono tabular-nums">
                  {brl(subtotal)}
                </td>
                <td></td>
              </tr>
              <tr className="border-t border-slate-300 font-bold bg-white text-xs">
                <td
                  colSpan={4}
                  className="py-2.5 px-3 text-right uppercase text-slate-700"
                >
                  RT OBRA SEMANA (12%):
                </td>
                <td className="py-2.5 px-3 text-right text-slate-800 text-sm font-mono tabular-nums">
                  {brl(rt)}
                </td>
                <td></td>
              </tr>
              <tr className="border-t-2 border-scnavy font-extrabold text-base bg-emerald-50">
                <td
                  colSpan={4}
                  className="py-3 px-3 text-right uppercase text-scnavy"
                >
                  VALOR TOTAL FINAL:
                </td>
                <td className="py-3 px-3 text-right text-emerald-800 text-base font-mono tabular-nums">
                  {brl(finalTotal)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </section>
  );
};

