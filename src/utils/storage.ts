import {
  DEFAULT_ADMIN_PASS,
  INITIAL_AFERICOES,
  INITIAL_CRONOGRAMA,
  INITIAL_DB,
  INITIAL_MEDICAO,
  INITIAL_OCS,
  INITIAL_ORCAMENTOS,
  INITIAL_OS,
  INITIAL_WEBHOOK_LOGS,
  RECEBEDORES_OFICIAIS,
  STORAGE_KEY,
} from '../data/initialData';
import { CabralState, CloudRevision } from '../types/cabral';
import { syncMedicaoToCronogramaList } from './calculations';

const IDB_NAME = 'SC_SOARES_CABRAL_2_0_CACHE_DB';
const IDB_STORE = 'snapshots';
const GDRIVE_CFG_KEY = 'SC_SOARES_GDRIVE_CFG';
const REVISIONS_KEY = 'SC_SOARES_REVISIONS_HISTORY';

export function getInitialCabralState(): CabralState {
  const receiver = RECEBEDORES_OFICIAIS.ELIENAY;
  const syncedCronograma = syncMedicaoToCronogramaList(
    'SEMANA 37',
    INITIAL_MEDICAO,
    INITIAL_CRONOGRAMA,
    receiver
  );

  return {
    currentWeek: 'SEMANA 37',
    defaultReceiverKey: 'ELIENAY',
    adminPassword: DEFAULT_ADMIN_PASS,
    lastUpdatedTimestamp: Date.now(),
    processedEventIds: ['EVT-8492', 'EVT-8495'],
    webhookLogs: [...INITIAL_WEBHOOK_LOGS],
    db: [...INITIAL_DB],
    afericoesList: [...INITIAL_AFERICOES],
    osList: [...INITIAL_OS],
    medicaoList: [...INITIAL_MEDICAO],
    cronogramaList: syncedCronograma,
    orcamentosList: [...INITIAL_ORCAMENTOS],
    ocList: [...INITIAL_OCS],
    cronogramaReminder: {
      enabled: true,
      simulateFriday: true,
      plannedBudgets: {
        'SEMANA 37': 5000,
        'SEMANA 36': 4500,
        'SEMANA 35': 4000,
      },
    },
  };
}

export function loadCabralState(): CabralState {
  const fallback = getInitialCabralState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return {
      ...fallback,
      ...parsed,
      adminPassword: parsed.adminPassword || DEFAULT_ADMIN_PASS,
      db: Array.isArray(parsed.db) && parsed.db.length ? parsed.db : fallback.db,
      afericoesList:
        Array.isArray(parsed.afericoesList) && parsed.afericoesList.length
          ? parsed.afericoesList
          : fallback.afericoesList,
      osList: Array.isArray(parsed.osList) ? parsed.osList : fallback.osList,
      medicaoList: Array.isArray(parsed.medicaoList)
        ? parsed.medicaoList
        : fallback.medicaoList,
      cronogramaList: Array.isArray(parsed.cronogramaList)
        ? parsed.cronogramaList
        : fallback.cronogramaList,
      orcamentosList: Array.isArray(parsed.orcamentosList)
        ? parsed.orcamentosList
        : fallback.orcamentosList,
      ocList: Array.isArray(parsed.ocList) ? parsed.ocList : fallback.ocList,
      webhookLogs: Array.isArray(parsed.webhookLogs)
        ? parsed.webhookLogs
        : fallback.webhookLogs,
      cronogramaReminder: parsed.cronogramaReminder
        ? {
            ...fallback.cronogramaReminder!,
            ...parsed.cronogramaReminder,
            plannedBudgets: {
              ...fallback.cronogramaReminder!.plannedBudgets,
              ...(parsed.cronogramaReminder.plannedBudgets || {}),
            },
          }
        : fallback.cronogramaReminder,
    };
  } catch {
    return fallback;
  }
}

export function saveToIndexedDB(state: CabralState, revisionId: string): void {
  if (typeof indexedDB === 'undefined') return;
  try {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      store.put({
        id: 'LATEST_STATE',
        revisionId,
        timestamp: Date.now(),
        state,
      });
      store.put({
        id: revisionId,
        revisionId,
        timestamp: Date.now(),
        state,
      });
    };
  } catch {
    // IndexedDB fallback silent
  }
}

export function loadRevisionsHistory(): CloudRevision[] {
  try {
    const raw = localStorage.getItem(REVISIONS_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) return list;
    }
  } catch {
    // ignore
  }
  return [
    {
      revisionId: 'REV-INIT-37',
      fileName: 'CABRAL_2_0_SEMANA_37_MATRIZ.json',
      origin: 'Inicialização Sistema / IndexedDB',
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      status: 'Sincronizado em Cache',
    },
  ];
}

export function saveRevisionsHistory(list: CloudRevision[]): void {
  try {
    localStorage.setItem(REVISIONS_KEY, JSON.stringify(list.slice(0, 25)));
  } catch {
    // ignore
  }
}

export function loadGDriveBridgeUrl(): string {
  try {
    const raw = localStorage.getItem(GDRIVE_CFG_KEY);
    if (!raw) return '';
    const parsed = JSON.parse(raw);
    return parsed.bridgeUrl || '';
  } catch {
    return '';
  }
}

export function saveGDriveBridgeUrl(bridgeUrl: string): void {
  try {
    localStorage.setItem(GDRIVE_CFG_KEY, JSON.stringify({ bridgeUrl }));
  } catch {
    // ignore
  }
}

export async function pushStateToStorageAndCloud(
  state: CabralState,
  reason: string,
  currentRevisions: CloudRevision[]
): Promise<CloudRevision[]> {
  const stamped: CabralState = {
    ...state,
    lastUpdatedTimestamp: Date.now(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stamped));
  } catch {
    // ignore quota error
  }

  const revId = `REV-${Date.now().toString().slice(-6)}`;
  const safeWeek = stamped.currentWeek.replace(/\s+/g, '_');
  const fileName = `CABRAL_2_0_${safeWeek}_${revId}.json`;

  saveToIndexedDB(stamped, revId);

  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('SC_SOARES_CABRAL_SYNC');
      bc.postMessage({ type: 'STATE_UPDATED', state: stamped, revId });
      bc.close();
    }
  } catch {
    // ignore
  }

  const newRev: CloudRevision = {
    revisionId: revId,
    fileName,
    origin: `Sistema / ${reason}`,
    timestamp: new Date().toLocaleTimeString('pt-BR'),
    status: 'Salvo em Cache + IDB',
    snapshot: JSON.stringify(stamped),
  };

  const bridgeUrl = loadGDriveBridgeUrl();
  if (bridgeUrl && bridgeUrl.startsWith('http')) {
    try {
      await fetch(bridgeUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ fileName, state: stamped, reason }),
      });
      newRev.status = 'Gravado no Google Drive';
    } catch {
      newRev.status = 'Salvo Local (Drive Offline)';
    }
  }

  const updated = [newRev, ...currentRevisions].slice(0, 25);
  saveRevisionsHistory(updated);
  return updated;
}
