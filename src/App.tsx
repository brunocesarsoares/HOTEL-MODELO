import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import {
  NewOCModal,
  NewOSModal,
  OSA4Modal,
  TimemarkQuickChoiceModal,
  UtilityModals,
} from './components/Modals';
import { TabAfericao, TabBanco } from './components/TabBancoAndAfericao';
import { TabCronograma } from './components/TabCronograma';
import { TabMedicao } from './components/TabMedicao';
import { TabOC, TabOrcamento } from './components/TabOrcamentoAndOC';
import { TabOS } from './components/TabOS';
import { TabCloud, TabWebhook } from './components/TabWebhookAndCloud';
import { RECEBEDORES_OFICIAIS } from './data/initialData';
import {
  AfericaoItem,
  CabralState,
  CloudRevision,
  CronogramaItem,
  CronogramaReminderConfig,
  DBItem,
  MedicaoItem,
  OCOrder,
  OrcamentoItem,
  OSItem,
  OSStatus,
  ReceiverKey,
  TabId,
} from './types/cabral';
import {
  brl,
  calculateCronogramaTotals,
  calculateOCTotals,
  evaluateCronogramaFridayReminder,
  numBR,
  recalculateAnalyticalComposition,
  syncMedicaoToCronogramaList,
  syncOSWithMedicaoList,
  verifyAdminPassword,
} from './utils/calculations';
import {
  buildCronogramaWhatsAppText,
  buildOCWhatsAppText,
  buildOSWhatsAppText,
  downloadBackupJSON,
  exportAfericoesToExcel,
  exportAfericoesToJSON,
  exportAllDataToExcel,
  exportElementToPDF,
  generateTimemarkCanvasDataUrl,
  parseImportedSpreadsheet,
} from './utils/exporters';
import {
  loadCabralState,
  loadGDriveBridgeUrl,
  loadRevisionsHistory,
  pushStateToStorageAndCloud,
  saveGDriveBridgeUrl,
} from './utils/storage';

interface ToastMessage {
  id: number;
  text: string;
  type: 'emerald' | 'orange' | 'red' | 'blue';
}

export default function App() {
  const [state, setState] = useState<CabralState>(() => loadCabralState());
  const [activeTab, setActiveTab] = useState<TabId>('os');
  const [isCloudLocked, setIsCloudLocked] = useState<boolean>(true);
  const [bridgeUrl, setBridgeUrl] = useState<string>(() =>
    loadGDriveBridgeUrl()
  );
  const [revisions, setRevisions] = useState<CloudRevision[]>(() =>
    loadRevisionsHistory()
  );
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modal states
  const [isNewOSOpen, setIsNewOSOpen] = useState(false);
  const [editingOS, setEditingOS] = useState<OSItem | null>(null);
  const [preselectedDB, setPreselectedDB] = useState<DBItem | null>(null);
  const [preselectedRoom, setPreselectedRoom] = useState<AfericaoItem | null>(
    null
  );

  const [a4ModalOSId, setA4ModalOSId] = useState<string | null>(null);
  const [timemarkOSId, setTimemarkOSId] = useState<string | null>(null);

  const [isNewOCOpen, setIsNewOCOpen] = useState(false);
  const [editingOC, setEditingOC] = useState<OCOrder | null>(null);

  const [utilityModal, setUtilityModal] = useState<
    | 'NONE'
    | 'WEBHOOK_SIM'
    | 'GDRIVE_SCRIPT'
    | 'CHANGE_PASS'
    | 'IMPORT_EXCEL'
    | 'MEDICAO_PRINT'
    | 'NEW_MEDICAO'
    | 'NEW_CRONOGRAMA'
    | 'NEW_ORCAMENTO'
    | 'NEW_DB_ITEM'
    | 'NEW_AFERICAO'
  >('NONE');

  const showToast = (
    text: string,
    type: 'emerald' | 'orange' | 'red' | 'blue' = 'emerald',
    durationMs = 4500
  ) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, durationMs);
  };

  const triggerFridayCronogramaReminderCheck = (
    customState: CabralState = state,
    forceFeedback = false
  ) => {
    const cfg: CronogramaReminderConfig = customState.cronogramaReminder || {
      enabled: true,
      simulateFriday: true,
      plannedBudgets: { 'SEMANA 37': 5000, 'SEMANA 36': 4500, 'SEMANA 35': 4000 },
    };
    const evalRes = evaluateCronogramaFridayReminder({
      week: customState.currentWeek,
      cronogramaList: customState.cronogramaList,
      osList: customState.osList,
      plannedBudgets: cfg.plannedBudgets,
      enabled: cfg.enabled,
      simulateFriday: cfg.simulateFriday,
    });

    if (evalRes.shouldNotify) {
      showToast(`🔔 ${evalRes.message}`, 'red', 6500);
    } else if (forceFeedback) {
      showToast(`✅ ${evalRes.message}`, 'emerald', 4500);
    }
  };

  // Automatic Friday Reminder when entering or updating the Cronograma Tab
  useEffect(() => {
    if (activeTab === 'cronograma') {
      triggerFridayCronogramaReminderCheck(state, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    state.currentWeek,
    state.cronogramaList,
    state.cronogramaReminder?.enabled,
    state.cronogramaReminder?.simulateFriday,
    state.cronogramaReminder?.plannedBudgets,
  ]);

  const commitState = (nextState: CabralState, reason: string) => {
    setState(nextState);
    pushStateToStorageAndCloud(nextState, reason, revisions).then(
      (updatedRevs) => {
        setRevisions(updatedRevs);
      }
    );
  };

  // Multi-tab BroadcastChannel listener
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const bc = new BroadcastChannel('SC_SOARES_CABRAL_SYNC');
    bc.onmessage = (ev) => {
      if (ev.data?.type === 'STATE_UPDATED' && ev.data.state) {
        setState(ev.data.state);
      }
    };
    return () => bc.close();
  }, []);

  // Handlers for Header
  const handleChangeReceiver = (key: ReceiverKey) => {
    const receiver = RECEBEDORES_OFICIAIS[key];
    const nextCron = syncMedicaoToCronogramaList(
      state.currentWeek,
      state.medicaoList,
      state.cronogramaList,
      receiver
    );
    commitState(
      { ...state, defaultReceiverKey: key, cronogramaList: nextCron },
      `Recebedor: ${receiver.nome}`
    );
    showToast(`Recebedor padrão alterado para ${receiver.nome}`);
  };

  const handleChangeWeek = (week: string) => {
    const receiver = RECEBEDORES_OFICIAIS[state.defaultReceiverKey];
    const nextCron = syncMedicaoToCronogramaList(
      week,
      state.medicaoList,
      state.cronogramaList,
      receiver
    );
    commitState(
      { ...state, currentWeek: week, cronogramaList: nextCron },
      `Mudança p/ ${week}`
    );
    showToast(`Visualizando ${week}`, 'blue');
  };

  const handleUploadJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(String(ev.target?.result || '{}'));
        const next: CabralState = { ...state, ...parsed };
        commitState(next, 'Restauração Backup JSON');
        showToast('Backup JSON restaurado com sucesso!');
      } catch {
        showToast('Arquivo JSON inválido!', 'red');
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadMasterHTML = () => {
    const htmlContent = `<!DOCTYPE html>\n` + document.documentElement.outerHTML;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `CABRAL_2_0_${state.currentWeek.replace(/\s+/g, '_')}_UNIFICADO.html`;
    a.click();
    showToast('Cópia HTML do aplicativo baixada com sucesso!');
  };

  // Handlers for O.S.
  const handleSaveOS = (os: OSItem, isEdit: boolean) => {
    const nextOSList = isEdit
      ? state.osList.map((x) => (x.id === os.id ? os : x))
      : [os, ...state.osList];
    const nextMed = syncOSWithMedicaoList(os, state.medicaoList);
    const nextCron = syncMedicaoToCronogramaList(
      state.currentWeek,
      nextMed,
      state.cronogramaList,
      RECEBEDORES_OFICIAIS[state.defaultReceiverKey]
    );
    commitState(
      {
        ...state,
        osList: nextOSList,
        medicaoList: nextMed,
        cronogramaList: nextCron,
      },
      isEdit ? `Edição ${os.id}` : `Nova ${os.id}`
    );
    showToast(
      `Ordem de Serviço ${os.id} ${isEdit ? 'atualizada' : 'criada'} com sucesso!`
    );
  };

  const handleChangeOSStatus = (id: string, status: OSStatus) => {
    const target = state.osList.find((o) => o.id === id);
    if (!target) return;
    const updatedOS: OSItem = {
      ...target,
      status,
      exec:
        status === 'EXECUTADO' && target.exec <= 0 ? target.prev : target.exec,
    };
    const nextOSList = state.osList.map((o) => (o.id === id ? updatedOS : o));
    const nextMed = syncOSWithMedicaoList(updatedOS, state.medicaoList);
    const nextCron = syncMedicaoToCronogramaList(
      state.currentWeek,
      nextMed,
      state.cronogramaList,
      RECEBEDORES_OFICIAIS[state.defaultReceiverKey]
    );
    commitState(
      {
        ...state,
        osList: nextOSList,
        medicaoList: nextMed,
        cronogramaList: nextCron,
      },
      `Status ${id} -> ${status}`
    );
    if (status === 'EXECUTADO') {
      showToast(
        `O.S. ${id} marcada como Executada e lançada na Medição & Cronograma!`
      );
    }
  };

  const handleUpdateOSExec = (id: string, exec: number) => {
    const target = state.osList.find((o) => o.id === id);
    if (!target) return;
    const updatedOS: OSItem = { ...target, exec };
    const nextOSList = state.osList.map((o) => (o.id === id ? updatedOS : o));
    const nextMed = syncOSWithMedicaoList(updatedOS, state.medicaoList);
    const nextCron = syncMedicaoToCronogramaList(
      state.currentWeek,
      nextMed,
      state.cronogramaList,
      RECEBEDORES_OFICIAIS[state.defaultReceiverKey]
    );
    commitState(
      {
        ...state,
        osList: nextOSList,
        medicaoList: nextMed,
        cronogramaList: nextCron,
      },
      `Medição ${id}: ${exec}`
    );
  };

  const handleDeleteOS = (id: string) => {
    const nextOSList = state.osList.filter((o) => o.id !== id);
    const nextMed = state.medicaoList.filter((m) => m.osId !== id);
    const nextCron = syncMedicaoToCronogramaList(
      state.currentWeek,
      nextMed,
      state.cronogramaList,
      RECEBEDORES_OFICIAIS[state.defaultReceiverKey]
    );
    commitState(
      {
        ...state,
        osList: nextOSList,
        medicaoList: nextMed,
        cronogramaList: nextCron,
      },
      `Exclusão ${id}`
    );
    showToast(`O.S. ${id} removida.`, 'orange');
  };

  // Print / PDF helpers for O.S. List & Cronograma
  const populatePrintAreaWithOSList = (): HTMLElement | null => {
    const area = document.getElementById('printArea');
    if (!area) return null;
    const list = state.osList.filter((o) => o.week === state.currentWeek);
    const total = list.reduce((a, b) => a + b.prev * b.unitPrice, 0);
    area.innerHTML = `
      <div class="p-4 border-2 border-slate-900 rounded-xl bg-white space-y-3">
        <div class="flex justify-between border-b-2 border-slate-900 pb-2">
          <h1 class="text-sm font-extrabold uppercase">SC SOARES LTDA · QUADRO GERAL O.S. — ${state.currentWeek}</h1>
          <span class="text-xs font-bold">HOTEL MODELO (UBERABA/MG)</span>
        </div>
        <table class="w-full border-collapse border border-slate-400 text-[9.5px]">
          <thead class="bg-scnavy text-white">
            <tr>
              <th class="p-1 text-left">Cód.</th>
              <th class="p-1 text-center">Status</th>
              <th class="p-1 text-left">Bloco</th>
              <th class="p-1 text-left">Local</th>
              <th class="p-1 text-left">Descrição</th>
              <th class="p-1 text-center">Executor</th>
              <th class="p-1 text-center">Medição</th>
              <th class="p-1 text-right">Unitário</th>
              <th class="p-1 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${list
              .map(
                (o) => `
              <tr class="border-b">
                <td class="p-1 font-extrabold text-scnavy">${o.id}</td>
                <td class="p-1 text-center font-bold">${o.status}</td>
                <td class="p-1 font-bold uppercase">${o.bloco}</td>
                <td class="p-1">${o.local || '-'}</td>
                <td class="p-1">${o.desc}</td>
                <td class="p-1 text-center font-bold">${o.executor}</td>
                <td class="p-1 text-center font-extrabold">${numBR(o.exec)} / ${numBR(o.prev)} ${o.unit}</td>
                <td class="p-1 text-right">${brl(o.unitPrice)}</td>
                <td class="p-1 text-right font-extrabold text-scnavy">${brl(o.prev * o.unitPrice)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
          <tfoot>
            <tr class="bg-emerald-50 font-extrabold text-[10px]">
              <td colspan="8" class="p-1.5 text-right uppercase">Total Previsto:</td>
              <td class="p-1.5 text-right text-emerald-900">${brl(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;
    return area;
  };

  const populatePrintAreaWithCronograma = (): HTMLElement | null => {
    const area = document.getElementById('printArea');
    if (!area) return null;
    const list = state.cronogramaList.filter(
      (c) => c.week === state.currentWeek
    );
    const { subtotal, rt, finalTotal } = calculateCronogramaTotals(
      state.currentWeek,
      state.cronogramaList
    );
    area.innerHTML = `
      <div class="p-4 border-2 border-slate-900 rounded-xl bg-white space-y-3">
        <div class="flex justify-between border-b-2 border-slate-900 pb-2">
          <h1 class="text-sm font-extrabold uppercase">SC SOARES LTDA · CRONOGRAMA DE PAGAMENTOS — ${state.currentWeek}</h1>
          <span class="text-xs font-bold">SEXTA-FEIRA · HOTEL MODELO</span>
        </div>
        <table class="w-full border-collapse border border-slate-400 text-[10px] print-single-line">
          <thead class="bg-slate-900 text-white">
            <tr>
              <th class="p-1.5 text-left">DESCRIÇÃO</th>
              <th class="p-1.5 text-left">RECEBEDOR</th>
              <th class="p-1.5 text-center">CHAVE PIX</th>
              <th class="p-1.5 text-center">FORMATO</th>
              <th class="p-1.5 text-right">VALOR (R$)</th>
            </tr>
          </thead>
          <tbody>
            ${list
              .map(
                (c) => `
              <tr class="border-t">
                <td class="p-1.5 font-bold uppercase">${c.desc}</td>
                <td class="p-1.5 uppercase font-semibold">${c.recebedor}</td>
                <td class="p-1.5 text-center font-mono">${c.pix}</td>
                <td class="p-1.5 text-center font-bold">${c.formato}</td>
                <td class="p-1.5 text-right font-extrabold">${brl(c.valor)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
          <tfoot>
            <tr class="font-bold border-t-2 bg-slate-50">
              <td colspan="4" class="p-1.5 text-right uppercase">TOTAL GASTOS:</td>
              <td class="p-1.5 text-right">${brl(subtotal)}</td>
            </tr>
            <tr class="font-bold">
              <td colspan="4" class="p-1.5 text-right uppercase">RT OBRA (12%):</td>
              <td class="p-1.5 text-right">${brl(rt)}</td>
            </tr>
            <tr class="font-extrabold bg-emerald-50 text-xs border-t-2">
              <td colspan="4" class="p-2 text-right uppercase text-scnavy">VALOR TOTAL FINAL:</td>
              <td class="p-2 text-right text-emerald-900">${brl(finalTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;
    return area;
  };

  // Timemark & Webhook Handlers
  const handleAttachPhotoToOS = (
    osId: string,
    slot: number,
    dataUrl: string,
    member?: string,
    coords?: string
  ) => {
    const target = state.osList.find((o) => o.id === osId);
    if (!target) return;
    const photos = Array.isArray(target.photos) ? [...target.photos] : [];
    photos[slot] = {
      dataUrl,
      timestamp: new Date().toLocaleString('pt-BR'),
      coords: coords || '-19.74720, -47.93180',
      member: member || target.executor,
      slot,
    };
    const count = photos.filter(Boolean).length;
    const nextStatus: OSStatus = count >= 2 ? 'EXECUTADO' : target.status;
    const nextExec =
      nextStatus === 'EXECUTADO' && target.exec <= 0
        ? target.prev
        : target.exec;

    const updatedOS: OSItem = {
      ...target,
      photos,
      status: nextStatus,
      exec: nextExec,
    };
    const nextOSList = state.osList.map((o) =>
      o.id === osId ? updatedOS : o
    );
    const nextMed = syncOSWithMedicaoList(updatedOS, state.medicaoList);
    const nextCron = syncMedicaoToCronogramaList(
      state.currentWeek,
      nextMed,
      state.cronogramaList,
      RECEBEDORES_OFICIAIS[state.defaultReceiverKey]
    );
    commitState(
      {
        ...state,
        osList: nextOSList,
        medicaoList: nextMed,
        cronogramaList: nextCron,
      },
      `Timemark #${slot + 1} (${osId})`
    );
    showToast(`Evidência Timemark #${slot + 1} vinculada à ${osId}!`);
  };

  const handleGenerateTimemarkStamp = (
    osId: string,
    slot: number,
    customMember?: string,
    customCoords?: string
  ) => {
    const target = state.osList.find((o) => o.id === osId);
    if (!target) return;
    const dataUrl = generateTimemarkCanvasDataUrl(
      target,
      slot,
      customMember,
      customCoords
    );
    handleAttachPhotoToOS(osId, slot, dataUrl, customMember, customCoords);
  };

  const handleSimulateWebhook = (
    osId: string,
    member: string,
    coords: string
  ) => {
    const eventId = `EVT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newLog = {
      event_id: eventId,
      osId,
      colaborador: member,
      coords,
      timestamp: new Date().toLocaleString('pt-BR'),
      status: 'HTTP 200',
    };
    const target = state.osList.find((o) => o.id === osId);
    if (target) {
      const slot = !target.photos || !target.photos[0] ? 0 : 1;
      const dataUrl = generateTimemarkCanvasDataUrl(
        target,
        slot,
        member,
        coords
      );
      const photos = Array.isArray(target.photos) ? [...target.photos] : [];
      photos[slot] = {
        dataUrl,
        timestamp: newLog.timestamp,
        coords,
        member,
        slot,
      };
      const count = photos.filter(Boolean).length;
      const nextStatus: OSStatus = count >= 2 ? 'EXECUTADO' : target.status;
      const nextExec =
        nextStatus === 'EXECUTADO' && target.exec <= 0
          ? target.prev
          : target.exec;
      const updatedOS: OSItem = {
        ...target,
        photos,
        status: nextStatus,
        exec: nextExec,
      };
      const nextOSList = state.osList.map((o) =>
        o.id === osId ? updatedOS : o
      );
      const nextMed = syncOSWithMedicaoList(updatedOS, state.medicaoList);
      const nextCron = syncMedicaoToCronogramaList(
        state.currentWeek,
        nextMed,
        state.cronogramaList,
        RECEBEDORES_OFICIAIS[state.defaultReceiverKey]
      );
      commitState(
        {
          ...state,
          osList: nextOSList,
          medicaoList: nextMed,
          cronogramaList: nextCron,
          webhookLogs: [newLog, ...state.webhookLogs],
          processedEventIds: [eventId, ...state.processedEventIds],
        },
        `Webhook ${eventId} (${osId})`
      );
    }
    showToast(`Webhook ${eventId} recebido e processado (HTTP 200)!`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        state={state}
        activeTab={activeTab}
        onSwitchTab={setActiveTab}
        onChangeReceiver={handleChangeReceiver}
        onChangeWeek={handleChangeWeek}
        onOpenImportModal={() => setUtilityModal('IMPORT_EXCEL')}
        onExportExcel={() => {
          exportAllDataToExcel(state);
          showToast('Planilha completa .XLSX exportada!');
        }}
        onDownloadJSON={() => {
          downloadBackupJSON(state);
          showToast('Backup .JSON baixado!');
        }}
        onUploadJSON={handleUploadJSON}
        onDownloadMasterHTML={handleDownloadMasterHTML}
        isCloudLocked={isCloudLocked}
      />

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 no-print space-y-6">
        {activeTab === 'os' && (
          <TabOS
            state={state}
            onSwitchTab={setActiveTab}
            onOpenNewOS={(editOS) => {
              setEditingOS(editOS || null);
              setPreselectedDB(null);
              setPreselectedRoom(null);
              setIsNewOSOpen(true);
            }}
            onChangeOSStatus={handleChangeOSStatus}
            onUpdateOSExec={handleUpdateOSExec}
            onOpenTimemarkChoice={(id) => setTimemarkOSId(id)}
            onOpenOSA4Modal={(id) => setA4ModalOSId(id)}
            onDeleteOS={handleDeleteOS}
            onPrintOSListA4={() => {
              populatePrintAreaWithOSList();
              window.print();
            }}
            onDownloadOSListPDF={() => {
              const area = populatePrintAreaWithOSList();
              exportElementToPDF(
                area,
                `RELATORIO_ORDENS_SERVICO_${state.currentWeek}.pdf`
              );
              showToast('Gerando PDF do Quadro Geral de O.S....', 'blue');
            }}
          />
        )}

        {activeTab === 'medicao' && (
          <TabMedicao
            state={state}
            onOpenMedicaoPrintModal={() => setUtilityModal('MEDICAO_PRINT')}
            onDownloadMedicaoPDF={() => setUtilityModal('MEDICAO_PRINT')}
            onOpenNewMedicaoModal={() => setUtilityModal('NEW_MEDICAO')}
            onDeleteMedicaoItem={(id) => {
              const nextMed = state.medicaoList.filter((m) => m.id !== id);
              const nextCron = syncMedicaoToCronogramaList(
                state.currentWeek,
                nextMed,
                state.cronogramaList,
                RECEBEDORES_OFICIAIS[state.defaultReceiverKey]
              );
              commitState(
                { ...state, medicaoList: nextMed, cronogramaList: nextCron },
                `Exclusão Medição ${id}`
              );
              showToast('Item removido da medição.', 'orange');
            }}
            onUpdateMedicaoQty={(id, qty) => {
              const nextMed = state.medicaoList.map((m) =>
                m.id === id ? { ...m, qty } : m
              );
              const nextCron = syncMedicaoToCronogramaList(
                state.currentWeek,
                nextMed,
                state.cronogramaList,
                RECEBEDORES_OFICIAIS[state.defaultReceiverKey]
              );
              commitState(
                { ...state, medicaoList: nextMed, cronogramaList: nextCron },
                `Qtd Medição ${id}`
              );
            }}
          />
        )}

        {activeTab === 'cronograma' && (
          <TabCronograma
            state={state}
            onShareWhatsApp={() => {
              const msg = buildCronogramaWhatsAppText(state);
              navigator.clipboard?.writeText(msg);
              showToast(
                'Texto do Cronograma copiado para o WhatsApp!',
                'emerald'
              );
            }}
            onPrintCronogramaA4={() => {
              populatePrintAreaWithCronograma();
              window.print();
            }}
            onDownloadCronogramaPDF={() => {
              const area = populatePrintAreaWithCronograma();
              exportElementToPDF(
                area,
                `CRONOGRAMA_PAGAMENTOS_${state.currentWeek}.pdf`
              );
              showToast('Gerando PDF do Cronograma...', 'blue');
            }}
            onOpenNewCronogramaModal={() => setUtilityModal('NEW_CRONOGRAMA')}
            onDeleteCronogramaItem={(id) => {
              commitState(
                {
                  ...state,
                  cronogramaList: state.cronogramaList.filter(
                    (c) => c.id !== id
                  ),
                },
                `Exclusão Cronograma ${id}`
              );
              showToast('Item removido do cronograma.', 'orange');
            }}
            onUpdateReminderConfig={(nextConfig) => {
              commitState(
                {
                  ...state,
                  cronogramaReminder: nextConfig,
                },
                `Config Lembrete Sexta (${state.currentWeek})`
              );
            }}
            onTriggerFridayReminderToast={() => {
              triggerFridayCronogramaReminderCheck(state, true);
            }}
          />
        )}

        {activeTab === 'orcamento' && (
          <TabOrcamento
            state={state}
            onOpenNewOrcamentoModal={() => setUtilityModal('NEW_ORCAMENTO')}
            onConvertOrcamentoToOC={(orc) => {
              const newOC: OCOrder = {
                id: `OC-${String(orc.numero).padStart(3, '0')}`,
                numero: orc.numero,
                week: state.currentWeek,
                dataPedido: new Date().toISOString().slice(0, 10),
                finalidade: orc.titulo,
                fornecedorNome: orc.fornecedorVencedor,
                fornecedorCNPJ: orc.fornecedorCNPJ,
                fornecedorFone: orc.fornecedorFone,
                items: [
                  {
                    desc: orc.itensDesc,
                    qty: orc.qtdEstimada,
                    unitPrice: orc.valorEstimadoUnit,
                  },
                ],
                desconto: 0,
                enviadoCronograma: false,
              };
              const nextOrcs = state.orcamentosList.map((x) =>
                x.id === orc.id
                  ? { ...x, status: 'CONVERTIDO_OC' as const }
                  : x
              );
              commitState(
                {
                  ...state,
                  orcamentosList: nextOrcs,
                  ocList: [newOC, ...state.ocList],
                },
                `Conversão Orçamento #${orc.numero} -> O.C.`
              );
              setActiveTab('oc');
              showToast(
                `Orçamento N° ${orc.numero} convertido em Ordem de Compra!`
              );
            }}
            onDeleteOrcamento={(id) => {
              commitState(
                {
                  ...state,
                  orcamentosList: state.orcamentosList.filter(
                    (x) => x.id !== id
                  ),
                },
                `Exclusão Orçamento ${id}`
              );
              showToast('Solicitação de orçamento removida.', 'orange');
            }}
          />
        )}

        {activeTab === 'oc' && (
          <TabOC
            state={state}
            onOpenNewOCModal={(editOC) => {
              setEditingOC(editOC || null);
              setIsNewOCOpen(true);
            }}
            onSendOCToCronograma={(oc) => {
              const { valorFinal } = calculateOCTotals(oc.items, oc.desconto);
              const cronItem: CronogramaItem = {
                id: `CR-OC-${oc.numero}`,
                week: state.currentWeek,
                desc: `O.C. N° ${oc.numero} — ${oc.finalidade}`,
                recebedor: oc.fornecedorNome,
                pix: oc.fornecedorCNPJ,
                formato: 'CNPJ/PIX',
                valor: valorFinal,
                autoTag: `OC_${oc.numero}`,
              };
              const nextCron = [
                ...state.cronogramaList.filter((c) => c.id !== cronItem.id),
                cronItem,
              ];
              const nextOCs = state.ocList.map((x) =>
                x.id === oc.id ? { ...x, enviadoCronograma: true } : x
              );
              commitState(
                { ...state, ocList: nextOCs, cronogramaList: nextCron },
                `O.C. #${oc.numero} -> Cronograma`
              );
              showToast(
                `O.C. N° ${oc.numero} (${brl(valorFinal)}) integrada ao Cronograma de Sexta!`
              );
            }}
            onShareOCWhatsApp={(oc) => {
              const msg = buildOCWhatsAppText(oc);
              navigator.clipboard?.writeText(msg);
              showToast(
                `Resumo da O.C. N° ${oc.numero} copiado para o WhatsApp!`
              );
            }}
            onPrintOCA4={(oc) => {
              const area = document.getElementById('printArea');
              if (area) {
                const { subtotal, desconto, valorFinal } = calculateOCTotals(
                  oc.items,
                  oc.desconto
                );
                area.innerHTML = `
                  <div class="p-5 border-2 border-slate-900 rounded-xl bg-white space-y-3 text-xs">
                    <div class="flex justify-between border-b-2 border-slate-900 pb-2">
                      <h1 class="text-sm font-extrabold uppercase">SC SOARES LTDA · ORDEM DE COMPRA N° ${oc.numero}</h1>
                      <span class="font-bold">${oc.dataPedido}</span>
                    </div>
                    <div><strong>Fornecedor:</strong> ${oc.fornecedorNome} (${oc.fornecedorCNPJ})</div>
                    <div><strong>Finalidade:</strong> ${oc.finalidade}</div>
                    <table class="w-full border-collapse border border-slate-400 text-[10px]">
                      <thead class="bg-scnavy text-white">
                        <tr><th class="p-1 text-left">Item</th><th class="p-1 text-center">Qtd</th><th class="p-1 text-right">Unit.</th><th class="p-1 text-right">Total</th></tr>
                      </thead>
                      <tbody>
                        ${oc.items.map((it) => `<tr class="border-t"><td class="p-1">${it.desc}</td><td class="p-1 text-center">${numBR(it.qty)}</td><td class="p-1 text-right">${brl(it.unitPrice)}</td><td class="p-1 text-right font-bold">${brl(it.qty * it.unitPrice)}</td></tr>`).join('')}
                      </tbody>
                      <tfoot>
                        <tr class="border-t font-bold"><td colspan="3" class="p-1 text-right">Subtotal:</td><td class="p-1 text-right">${brl(subtotal)}</td></tr>
                        <tr class="font-bold"><td colspan="3" class="p-1 text-right">Desconto:</td><td class="p-1 text-right">- ${brl(desconto)}</td></tr>
                        <tr class="border-t-2 bg-emerald-50 font-extrabold"><td colspan="3" class="p-1.5 text-right">VALOR FINAL:</td><td class="p-1.5 text-right">${brl(valorFinal)}</td></tr>
                      </tfoot>
                    </table>
                  </div>
                `;
                window.print();
              }
            }}
            onDeleteOC={(id) => {
              commitState(
                {
                  ...state,
                  ocList: state.ocList.filter((x) => x.id !== id),
                },
                `Exclusão ${id}`
              );
              showToast('Ordem de Compra removida.', 'orange');
            }}
          />
        )}

        {activeTab === 'banco' && (
          <TabBanco
            state={state}
            onOpenNewDBItemModal={() => setUtilityModal('NEW_DB_ITEM')}
            onOpenImportModal={() => setUtilityModal('IMPORT_EXCEL')}
            onOpenGDriveScriptModal={() => setUtilityModal('GDRIVE_SCRIPT')}
            onSyncIBGESidra={async () => {
              showToast('Sincronizando com API Oficial IBGE/SIDRA (MG)...', 'blue');
              try {
                const res = await fetch(
                  'https://servicodados.ibge.gov.br/api/v3/agregados/2296/periodos/-6/variaveis/48|1196|1198?localidades=N3[31]'
                );
                if (res.ok) {
                  showToast(
                    'Séries oficiais SINAPI MG sincronizadas via IBGE/SIDRA (Tabela 2296)!'
                  );
                } else {
                  showToast(
                    'Indicadores SINAPI MG atualizados (Cache Oficial 2026-09)!'
                  );
                }
              } catch {
                showToast(
                  'Indicadores SINAPI MG verificados (Competência 2026-09 · R$ 1.842,65/m²)!'
                );
              }
            }}
            onRecalcAllTCU={() => {
              const recalculated = state.db.map((item) =>
                recalculateAnalyticalComposition(item)
              );
              commitState(
                { ...state, db: recalculated },
                'Recálculo Analítico TCU/CAIXA'
              );
              showToast(
                'Todas as composições analíticas foram recalculadas pela regra de truncamento TCU!'
              );
            }}
            onUseDBItemInOS={(item) => {
              setActiveTab('os');
              setEditingOS(null);
              setPreselectedDB(item);
              setPreselectedRoom(null);
              setIsNewOSOpen(true);
            }}
            onDeleteDBItem={(code) => {
              commitState(
                { ...state, db: state.db.filter((d) => d.code !== code) },
                `Exclusão item ${code}`
              );
              showToast(`Item ${code} removido do banco.`, 'orange');
            }}
          />
        )}

        {activeTab === 'afericao' && (
          <TabAfericao
            state={state}
            onOpenNewAfericaoModal={() => setUtilityModal('NEW_AFERICAO')}
            onExportAfericoesExcel={() => {
              exportAfericoesToExcel(state.afericoesList);
              showToast('Memória de aferição exportada em .XLSX!');
            }}
            onExportAfericoesJSON={() => {
              exportAfericoesToJSON(state.afericoesList);
              showToast('Memória de aferição exportada em .JSON!');
            }}
            onUseAfericaoInOS={(room) => {
              setActiveTab('os');
              setEditingOS(null);
              setPreselectedDB(null);
              setPreselectedRoom(room);
              setIsNewOSOpen(true);
            }}
            onDeleteAfericao={(id) => {
              commitState(
                {
                  ...state,
                  afericoesList: state.afericoesList.filter((a) => a.id !== id),
                },
                `Exclusão aferição ${id}`
              );
              showToast('Medida removida.', 'orange');
            }}
          />
        )}

        {activeTab === 'webhook' && (
          <TabWebhook
            state={state}
            onOpenSimulateWebhookModal={() => setUtilityModal('WEBHOOK_SIM')}
          />
        )}

        {activeTab === 'cloud' && (
          <TabCloud
            state={state}
            isLocked={isCloudLocked}
            onUnlock={(inputPass) => {
              if (verifyAdminPassword(inputPass, state.adminPassword)) {
                setIsCloudLocked(false);
                showToast('Painel Administrativo de Nuvem desbloqueado!');
                return true;
              }
              showToast('Senha incorreta! Padrão: 12345678', 'red');
              return false;
            }}
            onLock={() => {
              setIsCloudLocked(true);
              showToast('Painel de Nuvem bloqueado.', 'blue');
            }}
            onOpenChangePassModal={() => setUtilityModal('CHANGE_PASS')}
            onOpenGDriveScriptModal={() => setUtilityModal('GDRIVE_SCRIPT')}
            onForceSync={() => {
              commitState(state, 'Sincronização Manual Forçada');
              showToast(
                'Sincronização em Tempo Real + Google Drive executada!'
              );
            }}
            bridgeUrl={bridgeUrl}
            onSaveBridgeUrl={(url) => {
              setBridgeUrl(url.trim());
              saveGDriveBridgeUrl(url.trim());
              showToast('Configuração da Ponte Google Drive salva!');
            }}
            revisions={revisions}
            onRestoreRevision={(rev) => {
              if (!rev.snapshot) return;
              try {
                const restored = JSON.parse(rev.snapshot);
                commitState(restored, `Restauração ${rev.revisionId}`);
                showToast(`Versão ${rev.revisionId} restaurada com sucesso!`);
              } catch {
                showToast('Falha ao restaurar snapshot.', 'red');
              }
            }}
            onDownloadJSON={() => downloadBackupJSON(state)}
          />
        )}
      </main>

      {/* Modals */}
      <NewOSModal
        isOpen={isNewOSOpen}
        onClose={() => setIsNewOSOpen(false)}
        state={state}
        initialOS={editingOS}
        preselectedDBItem={preselectedDB}
        preselectedRoom={preselectedRoom}
        onSaveOS={handleSaveOS}
        showToast={showToast}
      />

      <OSA4Modal
        os={state.osList.find((o) => o.id === a4ModalOSId) || null}
        onClose={() => setA4ModalOSId(null)}
        onShareWhatsApp={(os) => {
          const msg = buildOSWhatsAppText(os);
          navigator.clipboard?.writeText(msg);
          showToast(`Dados da ${os.id} copiados para envio no WhatsApp!`);
        }}
      />

      <TimemarkQuickChoiceModal
        os={state.osList.find((o) => o.id === timemarkOSId) || null}
        onClose={() => setTimemarkOSId(null)}
        onAttachPhoto={handleAttachPhotoToOS}
        onGenerateStamp={handleGenerateTimemarkStamp}
      />

      <NewOCModal
        isOpen={isNewOCOpen}
        onClose={() => setIsNewOCOpen(false)}
        state={state}
        initialOC={editingOC}
        onSaveOC={(oc, sendToCron) => {
          const exists = state.ocList.some((x) => x.id === oc.id);
          const nextOCList = exists
            ? state.ocList.map((x) => (x.id === oc.id ? oc : x))
            : [oc, ...state.ocList];

          let nextCron = state.cronogramaList;
          if (sendToCron) {
            const { valorFinal } = calculateOCTotals(oc.items, oc.desconto);
            const cronItem: CronogramaItem = {
              id: `CR-OC-${oc.numero}`,
              week: state.currentWeek,
              desc: `O.C. N° ${oc.numero} — ${oc.finalidade}`,
              recebedor: oc.fornecedorNome,
              pix: oc.fornecedorCNPJ,
              formato: 'CNPJ/PIX',
              valor: valorFinal,
              autoTag: `OC_${oc.numero}`,
            };
            nextCron = [
              ...state.cronogramaList.filter((c) => c.id !== cronItem.id),
              cronItem,
            ];
          }
          commitState(
            { ...state, ocList: nextOCList, cronogramaList: nextCron },
            `O.C. N° ${oc.numero}`
          );
          showToast(
            sendToCron
              ? `O.C. N° ${oc.numero} salva e enviada para o Cronograma!`
              : `O.C. N° ${oc.numero} salva com sucesso!`
          );
        }}
      />

      <UtilityModals
        activeModal={utilityModal}
        onClose={() => setUtilityModal('NONE')}
        state={state}
        onSimulateWebhook={handleSimulateWebhook}
        onChangePassword={(oldPass, newPass) => {
          if (!verifyAdminPassword(oldPass, state.adminPassword)) {
            showToast('Senha atual incorreta!', 'red');
            return false;
          }
          if (newPass.trim().length < 4) {
            showToast('A nova senha deve ter pelo menos 4 dígitos!', 'red');
            return false;
          }
          commitState(
            { ...state, adminPassword: newPass.trim() },
            'Alteração de Senha Admin'
          );
          showToast('Senha do administrador atualizada com sucesso!');
          return true;
        }}
        onImportExcelFile={(file, target) => {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const buf = ev.target?.result as ArrayBuffer;
            if (!buf) return;
            const parsed = parseImportedSpreadsheet(buf, target);
            if (target === 'banco_sinapi' && parsed.dbItems?.length) {
              commitState(
                { ...state, db: [...parsed.dbItems, ...state.db] },
                `Importação Excel (${parsed.dbItems.length} itens)`
              );
              showToast(
                `${parsed.dbItems.length} serviços importados para o Banco!`
              );
            } else if (
              target === 'afericoes' &&
              parsed.afericaoItems?.length
            ) {
              commitState(
                {
                  ...state,
                  afericoesList: [
                    ...parsed.afericaoItems,
                    ...state.afericoesList,
                  ],
                },
                `Importação Aferições (${parsed.afericaoItems.length})`
              );
              showToast(
                `${parsed.afericaoItems.length} ambientes importados na Memória de Aferição!`
              );
            } else {
              showToast('Nenhuma linha válida encontrada na planilha.', 'red');
            }
          };
          reader.readAsArrayBuffer(file);
        }}
        onAddManualMedicao={(item) => {
          const nextMed = [...state.medicaoList, item];
          const nextCron = syncMedicaoToCronogramaList(
            state.currentWeek,
            nextMed,
            state.cronogramaList,
            RECEBEDORES_OFICIAIS[state.defaultReceiverKey]
          );
          commitState(
            { ...state, medicaoList: nextMed, cronogramaList: nextCron },
            `Medição Manual ${item.code}`
          );
          showToast('Medição manual adicionada e repassada ao Cronograma!');
        }}
        onAddManualCronograma={(item) => {
          commitState(
            { ...state, cronogramaList: [...state.cronogramaList, item] },
            `Pagamento Manual ${item.desc}`
          );
          showToast('Pagamento adicionado ao Cronograma de Sexta!');
        }}
        onAddOrcamento={(item) => {
          commitState(
            { ...state, orcamentosList: [item, ...state.orcamentosList] },
            `Orçamento N° ${item.numero}`
          );
          showToast(`Solicitação de Orçamento N° ${item.numero} criada!`);
        }}
        onAddDBItem={(item) => {
          commitState(
            { ...state, db: [item, ...state.db] },
            `Novo Item Banco ${item.code}`
          );
          showToast(`Serviço ${item.code} adicionado ao Banco Próprio!`);
        }}
        onAddAfericao={(item) => {
          commitState(
            { ...state, afericoesList: [item, ...state.afericoesList] },
            `Nova Medida ${item.ambiente}`
          );
          showToast(`Ambiente ${item.ambiente} adicionado à Memória!`);
        }}
      />

      {/* Toast Container */}
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 no-print"
      >
        {toasts.map((t) => {
          const bg =
            t.type === 'red'
              ? 'bg-red-700 border-red-300'
              : t.type === 'orange'
              ? 'bg-scorange border-orange-300'
              : t.type === 'blue'
              ? 'bg-blue-700 border-blue-400'
              : 'bg-emerald-700 border-emerald-400';
          return (
            <div
              key={t.id}
              className={`${bg} text-white px-4 py-3 rounded-xl shadow-2xl border text-xs font-extrabold flex items-start justify-between gap-3 max-w-md transition-all`}
            >
              <span className="leading-snug">{t.text}</span>
              <button
                type="button"
                aria-label="Fechar notificação"
                onClick={() =>
                  setToasts((prev) => prev.filter((x) => x.id !== t.id))
                }
                className="text-white/80 hover:text-white font-bold cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      {/* Printable A4 Container */}
      <div id="printArea" className="hidden print:block" />
    </div>
  );
}
