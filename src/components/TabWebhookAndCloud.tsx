import React, { useState } from 'react';
import {
  GDRIVE_TARGET_FOLDER_ID,
  GDRIVE_TARGET_URL,
} from '../data/initialData';
import { CabralState, CloudRevision } from '../types/cabral';

interface TabWebhookProps {
  state: CabralState;
  onOpenSimulateWebhookModal: () => void;
}

export const TabWebhook: React.FC<TabWebhookProps> = ({
  state,
  onOpenSimulateWebhookModal,
}) => {
  return (
    <section id="sec-webhook" className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-extrabold text-scnavy">
            Monitor de Eventos Webhook Timemark (photo.uploaded)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Endpoint Oficial:{' '}
            <code className="bg-slate-100 px-2 py-0.5 rounded font-mono text-scnavy font-bold">
              https://api.scsoares.com.br/api/webhooks/timemark/photo-uploaded
            </code>
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenSimulateWebhookModal}
          className="bg-scorange hover:bg-orange-600 text-white text-xs font-extrabold px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap"
        >
          Simular Recebimento de Foto Webhook
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto sc-scroll">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-scnavy text-white text-[11px] uppercase">
                <th className="py-2.5 px-3 w-36">Event ID</th>
                <th className="py-2.5 px-3 w-32">Código O.S.</th>
                <th className="py-2.5 px-3">Colaborador / Dispositivo</th>
                <th className="py-2.5 px-3">Coordenadas GPS</th>
                <th className="py-2.5 px-3 w-44">Data / Hora Timemark</th>
                <th className="py-2.5 px-3 w-28 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {state.webhookLogs.map((l) => (
                <tr key={l.event_id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold">
                    {l.event_id}
                  </td>
                  <td className="py-2.5 px-3 font-extrabold text-scorange font-mono">
                    {l.osId}
                  </td>
                  <td className="py-2.5 px-3 font-bold">{l.colaborador}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">
                    {l.coords}
                  </td>
                  <td className="py-2.5 px-3 font-mono">{l.timestamp}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700">
                    {l.status || 'HTTP 200'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

interface TabCloudProps {
  state: CabralState;
  isLocked: boolean;
  onUnlock: (password: string) => boolean;
  onLock: () => void;
  onOpenChangePassModal: () => void;
  onOpenGDriveScriptModal: () => void;
  onForceSync: () => void;
  bridgeUrl: string;
  onSaveBridgeUrl: (url: string) => void;
  revisions: CloudRevision[];
  onRestoreRevision: (rev: CloudRevision) => void;
  onDownloadJSON: () => void;
}

export const TabCloud: React.FC<TabCloudProps> = ({
  isLocked,
  onUnlock,
  onLock,
  onOpenChangePassModal,
  onOpenGDriveScriptModal,
  onForceSync,
  bridgeUrl,
  onSaveBridgeUrl,
  revisions,
  onRestoreRevision,
  onDownloadJSON,
}) => {
  const [passInput, setPassInput] = useState('');
  const [localBridgeUrl, setLocalBridgeUrl] = useState(bridgeUrl);

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = onUnlock(passInput);
    if (ok) {
      setPassInput('');
    }
  };

  if (isLocked) {
    return (
      <section id="sec-cloud" className="space-y-4">
        <div className="max-w-lg mx-auto bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-center my-8">
          <div className="w-12 h-12 rounded-xl bg-scnavy text-white flex items-center justify-center mx-auto text-xl font-bold">
            🔒
          </div>
          <div>
            <h2 className="text-base font-extrabold text-scnavy">
              Painel Administrativo de Nuvem & Google Drive Protegido
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              A sincronização em segundo plano e o cache IndexedDB continuam
              operando normalmente 24/7. Digite a senha de administrador para
              acessar configurações de ponte e histórico de revisões.
            </p>
          </div>
          <form onSubmit={handleUnlockSubmit} className="space-y-3">
            <div>
              <label
                htmlFor="adminPassInput"
                className="block text-xs font-bold text-slate-700 mb-1"
              >
                Senha do Administrador
              </label>
              <input
                id="adminPassInput"
                type="password"
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
                placeholder="Digite a senha (padrão: 12345678)"
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-center font-mono font-bold focus:outline-none focus:border-scorange"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-scorange hover:bg-orange-600 text-white text-xs font-extrabold py-2.5 rounded-xl cursor-pointer transition"
            >
              Desbloquear Painel
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section id="sec-cloud" className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-extrabold text-scnavy">
              Sincronização em Tempo Real & Backup Google Drive
            </h2>
            <span className="text-xs text-emerald-700 font-semibold">
              · Multi-Dispositivos Ativo
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Sincronização imediata entre dispositivos e gravação cumulativa no
            projeto Google Drive compartilhado ({GDRIVE_TARGET_FOLDER_ID}).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={GDRIVE_TARGET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            Abrir Google Drive ({GDRIVE_TARGET_FOLDER_ID.slice(0, 8)}...) ↗
          </a>
          <button
            type="button"
            onClick={onOpenGDriveScriptModal}
            className="bg-scnavy hover:bg-slate-800 text-white text-xs font-extrabold px-3.5 py-2 rounded-lg cursor-pointer whitespace-nowrap"
          >
            Código Google Apps Script
          </button>
          <button
            type="button"
            onClick={onForceSync}
            className="bg-scorange hover:bg-orange-600 text-white text-xs font-extrabold px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap"
          >
            Forçar Sincronização Agora
          </button>
          <button
            type="button"
            onClick={onOpenChangePassModal}
            className="border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold px-3 py-2 rounded-lg cursor-pointer whitespace-nowrap"
          >
            Alterar Senha
          </button>
          <button
            type="button"
            onClick={onLock}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer whitespace-nowrap"
          >
            🔒 Bloquear Painel
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3.5">
          <div className="text-xs font-semibold text-slate-500">
            Status da Conexão
          </div>
          <div className="text-sm font-extrabold text-emerald-700 mt-1">
            Conectado em Tempo Real
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
            Última sinc.: {revisions[0]?.timestamp || 'Agora'}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3.5">
          <div className="text-xs font-semibold text-blue-700">
            Projeto / Pasta Alvo Google Drive
          </div>
          <div className="text-xs font-mono font-extrabold text-scnavy mt-1 truncate">
            ID: {GDRIVE_TARGET_FOLDER_ID}
          </div>
          <div className="text-[11px] text-emerald-700 font-bold mt-0.5">
            4 Subpastas Configuradas
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3.5">
          <div className="text-xs font-semibold text-purple-700">
            Cópias Salvas (Sem Sobrescrever)
          </div>
          <div className="text-lg font-extrabold text-scnavy mt-0.5 font-mono tabular-nums">
            {revisions.length} Revisões
          </div>
          <div className="text-[11px] text-slate-500">
            Histórico cumulativo imutável
          </div>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-300 p-3.5">
          <div className="text-xs font-semibold text-emerald-900">
            Cache IndexedDB Local
          </div>
          <div className="text-sm font-extrabold text-emerald-800 mt-1">
            Ativo · Zero Perda
          </div>
          <div className="text-[11px] text-emerald-700 mt-0.5">
            Auto-Recovery Automático
          </div>
        </div>
      </div>

      {/* 4 Subfolders Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <div className="font-mono font-bold text-scnavy">
            /01_Backups_Versionados_Historico
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Snapshots JSON cumulativos a cada alteração de O.S., Medição ou
            Cronograma.
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <div className="font-mono font-bold text-scnavy">
            /02_Cache_Otimizacao_App
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Espelho de sincronização rápida para abertura instantânea no celular
            e desktop.
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <div className="font-mono font-bold text-scnavy">
            /03_Fotos_Timemark_Evidencias
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Repositório de fotos autenticadas com carimbo GPS Uberaba/MG e
            Teamspace 449cSPnrsg.
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <div className="font-mono font-bold text-scnavy">
            /04_Exportacoes_Planilhas_PDF
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Planilhas semanais .XLSX e relatórios A4 de engenharia prontos para
            auditoria.
          </p>
        </div>
      </div>

      {/* Bridge URL Config */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-xs font-extrabold text-scnavy">
            Configuração da Gravação Automática no Google Drive (Projeto{' '}
            {GDRIVE_TARGET_FOLDER_ID})
          </h3>
          <span className="text-xs text-emerald-700 font-semibold">
            Execução Silenciosa 24/7
          </span>
        </div>
        <div>
          <label
            htmlFor="gdriveBridgeUrlInput"
            className="block font-bold text-slate-700 text-xs mb-1"
          >
            URL do Web App Google Apps Script (Implantado como "Qualquer
            Pessoa"):
          </label>
          <div className="flex gap-2">
            <input
              id="gdriveBridgeUrlInput"
              type="text"
              value={localBridgeUrl}
              onChange={(e) => setLocalBridgeUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 font-mono text-xs"
            />
            <button
              type="button"
              onClick={() => onSaveBridgeUrl(localBridgeUrl)}
              className="bg-scnavy text-white text-xs font-bold px-4 py-1.5 rounded-lg cursor-pointer"
            >
              Salvar Configuração
            </button>
          </div>
        </div>
      </div>

      {/* Revisions Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-2.5 bg-scnavy text-white text-xs font-extrabold flex justify-between items-center">
          <span>Histórico de Versões Salvas (Sem Sobrescrever)</span>
          <span className="font-mono text-amber-300">
            Google Drive ID: {GDRIVE_TARGET_FOLDER_ID}
          </span>
        </div>
        <div className="overflow-x-auto sc-scroll">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-scnavy text-[10px] uppercase border-b border-slate-200">
                <th className="py-2 px-3">Revisão</th>
                <th className="py-2 px-3">Arquivo</th>
                <th className="py-2 px-3">Origem</th>
                <th className="py-2 px-3 text-center">Hora</th>
                <th className="py-2 px-3 text-center">Status</th>
                <th className="py-2 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[11px]">
              {revisions.map((v) => (
                <tr key={v.revisionId} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-mono font-bold text-scnavy">
                    {v.revisionId}
                  </td>
                  <td className="py-2 px-3 font-mono text-[10px]">
                    {v.fileName}
                  </td>
                  <td className="py-2 px-3">{v.origin}</td>
                  <td className="py-2 px-3 text-center font-mono">
                    {v.timestamp}
                  </td>
                  <td className="py-2 px-3 text-center font-semibold text-emerald-700">
                    {v.status}
                  </td>
                  <td className="py-2 px-3 text-right space-x-1.5">
                    {v.snapshot && (
                      <button
                        type="button"
                        onClick={() => onRestoreRevision(v)}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-bold px-2.5 py-1 rounded cursor-pointer"
                      >
                        Restaurar
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={onDownloadJSON}
                      className="bg-scnavy text-white text-[10px] font-bold px-2.5 py-1 rounded cursor-pointer"
                    >
                      Baixar .JSON
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
