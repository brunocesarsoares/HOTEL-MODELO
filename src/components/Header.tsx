import React from 'react';
import { TIMEMARK_INVITE_URL } from '../data/initialData';
import { CabralState, ReceiverKey, TabId } from '../types/cabral';

interface HeaderProps {
  state: CabralState;
  activeTab: TabId;
  onSwitchTab: (tab: TabId) => void;
  onChangeReceiver: (key: ReceiverKey) => void;
  onChangeWeek: (week: string) => void;
  onOpenImportModal: () => void;
  onExportExcel: () => void;
  onDownloadJSON: () => void;
  onUploadJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadMasterHTML: () => void;
  isCloudLocked: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  activeTab,
  onSwitchTab,
  onChangeReceiver,
  onChangeWeek,
  onOpenImportModal,
  onExportExcel,
  onDownloadJSON,
  onUploadJSON,
  onDownloadMasterHTML,
  isCloudLocked,
}) => {
  const wkOS = state.osList.filter((o) => o.week === state.currentWeek);
  const wkMed = state.medicaoList.filter((m) => m.week === state.currentWeek);
  const wkCron = state.cronogramaList.filter(
    (c) => c.week === state.currentWeek
  );

  const tabs: { id: TabId; label: string; count: string | number }[] = [
    { id: 'os', label: '1. Ordens de Serviço (O.S.)', count: wkOS.length },
    { id: 'medicao', label: '2. Planilha de Medição', count: wkMed.length },
    {
      id: 'cronograma',
      label: '3. Cronograma (Sexta)',
      count: wkCron.length,
    },
    {
      id: 'orcamento',
      label: '4. Solic. Orçamento',
      count: state.orcamentosList.length,
    },
    {
      id: 'oc',
      label: '5. Ordens de Compra (O.C.)',
      count: state.ocList.length,
    },
    {
      id: 'banco',
      label: '6. Banco Próprio & SINAPI',
      count: state.db.length,
    },
    {
      id: 'afericao',
      label: '7. Memória de Aferição',
      count: state.afericoesList.length,
    },
    {
      id: 'webhook',
      label: '8. Webhook Timemark',
      count: state.webhookLogs.length,
    },
    {
      id: 'cloud',
      label: '9. Nuvem & Google Drive',
      count: isCloudLocked ? 'LOCK' : 'ON',
    },
  ];

  return (
    <header className="bg-scnavy text-white shadow-md sticky top-0 z-40 no-print">
      <div className="max-w-[1600px] mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-scorange flex items-center justify-center font-extrabold text-lg tracking-tighter shadow">
            SC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base tracking-tight whitespace-nowrap">
                SC SOARES LTDA · CABRAL 2.0
              </h1>
              <span className="text-[11px] text-emerald-300 font-medium">
                · Banco Próprio + SINAPI + Aferição Real
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              CNPJ 48.629.736/0001-50 · R. João Caetano, 33 / Artur Machado, 429
              (Hotel Modelo) · Uberaba/MG
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            className="flex items-center bg-slate-800/90 border border-slate-700 rounded-lg px-2.5 py-1 text-xs"
            title="Define qual titular da empresa receberá os repasses"
          >
            <label
              htmlFor="globalReceiverSelector"
              className="text-emerald-400 mr-1.5 font-bold whitespace-nowrap"
            >
              Recebedor:
            </label>
            <select
              id="globalReceiverSelector"
              aria-label="Selecionar Recebedor Padrão"
              value={state.defaultReceiverKey}
              onChange={(e) => onChangeReceiver(e.target.value as ReceiverKey)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="ELIENAY" className="text-slate-900">
                ELIENAY MARQUES NEVES DUQUE (55.906.923/0001-07)
              </option>
              <option value="SAMIA" className="text-slate-900">
                SAMIA TARCILIA DE CAMPOS SOARES (48.629.736/0001-50)
              </option>
            </select>
          </div>

          <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-lg px-2.5 py-1 text-xs">
            <label
              htmlFor="weekSelector"
              className="text-slate-300 mr-1.5 font-medium whitespace-nowrap"
            >
              Semana:
            </label>
            <select
              id="weekSelector"
              aria-label="Selecionar Semana"
              value={state.currentWeek}
              onChange={(e) => onChangeWeek(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="SEMANA 37" className="text-slate-900">
                SEMANA 37 (Ativa · 02/11 a 06/11)
              </option>
              <option value="SEMANA 36" className="text-slate-900">
                SEMANA 36 (Fechada · 26/10 a 30/10)
              </option>
              <option value="SEMANA 35" className="text-slate-900">
                SEMANA 35 (Histórico · 19/10 a 23/10)
              </option>
            </select>
          </div>

          <a
            href={TIMEMARK_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow transition cursor-pointer whitespace-nowrap"
            title="Abrir Espaço Timemark (Código: 449cSPnrsg)"
          >
            Timemark 449cSPnrsg
          </a>

          <button
            type="button"
            onClick={onOpenImportModal}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow transition cursor-pointer whitespace-nowrap"
          >
            Alimentar (Excel)
          </button>

          <button
            type="button"
            onClick={onExportExcel}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow transition cursor-pointer whitespace-nowrap"
            title="Exporta todas as abas em Excel .XLSX"
          >
            Exportar Excel
          </button>

          <button
            type="button"
            onClick={onDownloadJSON}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow transition cursor-pointer whitespace-nowrap"
            title="Baixar Backup .JSON"
          >
            Backup .JSON
          </button>

          <label
            className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer shadow transition whitespace-nowrap"
            title="Restaurar Backup JSON"
          >
            Subir JSON
            <input
              type="file"
              accept=".json"
              aria-label="Restaurar Backup JSON"
              className="hidden"
              onChange={onUploadJSON}
            />
          </label>

          <button
            type="button"
            onClick={onDownloadMasterHTML}
            className="bg-scorange hover:bg-orange-600 text-white text-xs font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow transition cursor-pointer whitespace-nowrap"
            title="Baixar arquivo HTML unificado standalone"
          >
            Salvar App HTML
          </button>

          <button
            type="button"
            onClick={() => onSwitchTab('cloud')}
            className="bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-400/60 text-emerald-300 text-xs font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow transition cursor-pointer whitespace-nowrap"
          >
            <span>{isCloudLocked ? '🔒 Nuvem Ativa' : '🔓 Nuvem Aberta'}</span>
          </button>
        </div>
      </div>

      <nav
        aria-label="Módulos do Sistema"
        className="bg-scblue/95 border-t border-slate-700/80"
      >
        <div className="max-w-[1600px] mx-auto px-4 flex items-center gap-1 overflow-x-auto sc-scroll py-1.5">
          {tabs.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onSwitchTab(t.id)}
                className={`text-[11px] px-2.5 py-1.5 rounded-md whitespace-nowrap transition flex items-center gap-1 cursor-pointer ${
                  isActive
                    ? 'bg-scorange text-white font-bold shadow'
                    : 'text-slate-200 hover:bg-white/10 font-medium'
                }`}
              >
                <span>{t.label}</span>
                <span className="opacity-80 font-mono text-[10px]">
                  ({t.count})
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
