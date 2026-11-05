import React, { useEffect, useRef, useState } from 'react';
import {
  FULL_CODIGO_GS,
  GDRIVE_TARGET_FOLDER_ID,
  TIMEMARK_INVITE_URL,
} from '../data/initialData';
import {
  AfericaoItem,
  CabralState,
  CronogramaItem,
  DBItem,
  MedicaoItem,
  MetricUnit,
  OCItem,
  OCOrder,
  OrcamentoItem,
  OSItem,
  OSStatus,
} from '../types/cabral';
import {
  brl,
  calculateOCTotals,
  computeDimensionForMode,
  detectMetricFromDescription,
  numBR,
} from '../utils/calculations';
import { exportElementToPDF } from '../utils/exporters';

// 1. MODAL NOVA / EDITAR O.S.
interface NewOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: CabralState;
  initialOS?: OSItem | null;
  preselectedDBItem?: DBItem | null;
  preselectedRoom?: AfericaoItem | null;
  onSaveOS: (os: OSItem, isEdit: boolean) => void;
  showToast: (msg: string, type?: 'emerald' | 'orange' | 'red' | 'blue') => void;
}

export const NewOSModal: React.FC<NewOSModalProps> = ({
  isOpen,
  onClose,
  state,
  initialOS,
  preselectedDBItem,
  preselectedRoom,
  onSaveOS,
  showToast,
}) => {
  const [codigo, setCodigo] = useState('');
  const [status, setStatus] = useState<OSStatus>('URGENTE');
  const [bloco, setBloco] = useState('ALVENARIA 1, 2 E 3');
  const [desc, setDesc] = useState('');
  const [codeRef, setCodeRef] = useState('PRP');
  const [local, setLocal] = useState('');
  const [afericao, setAfericao] = useState('');
  const [executor, setExecutor] = useState('NAY / PABLO');
  const [unit, setUnit] = useState<MetricUnit>('M²');
  const [prev, setPrev] = useState<number>(10);
  const [exec, setExec] = useState<number>(0);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [costMode, setCostMode] = useState<'MO_ONLY' | 'MO_INSUMO'>('MO_ONLY');
  const [selectedDB, setSelectedDB] = useState<DBItem | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [dimMode, setDimMode] = useState('AUTO');
  const [manualLabel, setManualLabel] = useState('');
  const [manualC, setManualC] = useState('');
  const [manualL, setManualL] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (initialOS) {
      setCodigo(initialOS.id);
      setStatus(initialOS.status);
      setBloco(initialOS.bloco);
      setDesc(initialOS.desc);
      setCodeRef(initialOS.codeRef || 'PRP');
      setLocal(initialOS.local || '');
      setAfericao(initialOS.afericao || '');
      setExecutor(initialOS.executor || 'NAY / PABLO');
      setUnit(initialOS.unit);
      setPrev(initialOS.prev);
      setExec(initialOS.exec);
      setUnitPrice(initialOS.unitPrice);
      setCostMode(initialOS.costMode || 'MO_ONLY');
      setSelectedDB(
        state.db.find((d) => d.code === initialOS.codeRef) || null
      );
      return;
    }

    const nextNum = String(state.osList.length + 1).padStart(2, '0');
    setCodigo(`OS-${nextNum}`);
    setStatus('URGENTE');
    setBloco('REVESTIMENTO EM GERAL');
    setDesc('');
    setCodeRef('PRP');
    setLocal('');
    setAfericao('');
    setExecutor('NAY / PABLO');
    setUnit('M²');
    setPrev(10);
    setExec(0);
    setUnitPrice(0);
    setCostMode('MO_ONLY');
    setSelectedDB(null);

    if (preselectedDBItem) {
      setSelectedDB(preselectedDBItem);
      setDesc(preselectedDBItem.desc);
      setCodeRef(preselectedDBItem.code);
      setUnit(preselectedDBItem.unit);
      setUnitPrice(preselectedDBItem.priceMO);
    }

    if (preselectedRoom) {
      setSelectedRoomId(preselectedRoom.id);
      const calc = computeDimensionForMode(preselectedRoom, 'AUTO', 'M²');
      setLocal(preselectedRoom.ambiente);
      setAfericao(calc.formula);
      setPrev(calc.value);
    } else {
      setSelectedRoomId('');
    }
  }, [isOpen, initialOS, preselectedDBItem, preselectedRoom, state.osList.length, state.db]);

  if (!isOpen) return null;

  const matches = state.db.filter((i) =>
    `${i.code} ${i.desc} ${i.unit}`
      .toLowerCase()
      .includes(desc.trim().toLowerCase())
  );

  const handleSelectDBItem = (item: DBItem) => {
    setSelectedDB(item);
    setDesc(item.desc);
    setCodeRef(item.code);
    setUnit(item.unit);
    setUnitPrice(costMode === 'MO_ONLY' ? item.priceMO : item.priceTotal);
    setShowDropdown(false);
  };

  const handleAddPlantaRoom = () => {
    if (!selectedRoomId) {
      showToast('Selecione um ambiente da planta real primeiro!', 'orange');
      return;
    }
    const room = state.afericoesList.find((a) => a.id === selectedRoomId);
    if (!room) return;
    const calc = computeDimensionForMode(room, dimMode, unit);
    const nextLocal = local ? `${local} + ${room.ambiente}` : room.ambiente;
    const nextAf = afericao ? `${afericao} | ${calc.formula}` : calc.formula;
    const nextPrev = local
      ? +(Number(prev) + calc.value).toFixed(2)
      : calc.value;
    setLocal(nextLocal);
    setAfericao(nextAf);
    setPrev(nextPrev);
    if (dimMode !== 'AUTO') {
      setUnit(calc.suggestedUnit);
    }
    showToast(`Medidas de ${room.ambiente} somadas na O.S.!`, 'emerald');
  };

  const handleAddManualMeasure = () => {
    const c = parseFloat(manualC) || 0;
    const l = parseFloat(manualL) || 1;
    if (c <= 0) {
      showToast('Informe o comprimento em metros!', 'red');
      return;
    }
    const val = +(c * l).toFixed(2);
    const lbl = manualLabel.trim() || 'Trecho Manual';
    const formula = `${lbl} (${c}m × ${l}m = ${val})`;
    setLocal(local ? `${local} + ${lbl}` : lbl);
    setAfericao(afericao ? `${afericao} | ${formula}` : formula);
    setPrev(local ? +(Number(prev) + val).toFixed(2) : val);
    setManualLabel('');
    setManualC('');
    setManualL('');
    showToast('Medida manual adicionada à O.S.!', 'emerald');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim()) {
      showToast('Informe a descrição do serviço da O.S.!', 'red');
      return;
    }
    const saved: OSItem = {
      id: codigo.trim() || `OS-${state.osList.length + 1}`,
      week: state.currentWeek,
      status,
      bloco,
      local: local.trim(),
      afericao: afericao.trim(),
      codeRef,
      desc: desc.trim().toUpperCase(),
      executor: executor.trim().toUpperCase(),
      unit,
      prev: Number(prev) || 1,
      exec: status === 'EXECUTADO' && exec <= 0 ? Number(prev) || 1 : Number(exec) || 0,
      unitPrice: Number(unitPrice) || 0,
      costMode,
      prazo: initialOS?.prazo || '2026-11-06',
      recebedorKey: state.defaultReceiverKey,
      photos: initialOS?.photos || [],
    };
    onSaveOS(saved, Boolean(initialOS));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden border border-slate-300">
        <div className="bg-scnavy text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-sm">
              {initialOS
                ? `Editar Ordem de Serviço (${initialOS.id})`
                : 'Confecção de Ordem de Serviço (O.S.)'}
            </h3>
            <p className="text-[11px] text-slate-300">
              1ª Prioridade: Banco Próprio SC Soares + SINAPI · Detecção
              automática de métrica.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal Nova O.S."
            className="text-slate-300 hover:text-white text-lg font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-5 overflow-y-auto sc-scroll space-y-4 text-xs"
        >
          {/* 1. Smart Search */}
          <div className="relative">
            <label
              htmlFor="osSmartInput"
              className="block font-extrabold text-scnavy mb-1"
            >
              1. Buscar Serviço no Banco de Dados (Próprio / SINAPI) ou Digitar
              Livremente:
            </label>
            <div className="relative flex items-center">
              <input
                id="osSmartInput"
                type="text"
                value={desc}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 180)}
                onChange={(e) => {
                  const val = e.target.value;
                  setDesc(val);
                  setShowDropdown(true);
                  if (val.length > 3 && !selectedDB) {
                    setUnit(detectMetricFromDescription(val).unit);
                  }
                }}
                placeholder="Comece a digitar (ex: chumbamento, requadro, laje seca, graute)..."
                className="w-full border-2 border-scorange rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-bold text-scnavy bg-orange-50/20 focus:bg-white focus:outline-none"
              />
              {desc && (
                <button
                  type="button"
                  onClick={() => {
                    setDesc('');
                    setSelectedDB(null);
                  }}
                  className="absolute right-3 text-slate-400 hover:text-red-600 font-bold cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
            {showDropdown && matches.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border-2 border-scnavy rounded-xl shadow-2xl max-h-56 overflow-y-auto z-50 divide-y divide-slate-100">
                {matches.slice(0, 12).map((item) => (
                  <button
                    type="button"
                    key={item.code}
                    onClick={() => handleSelectDBItem(item)}
                    className="w-full text-left p-2.5 hover:bg-orange-50 cursor-pointer flex justify-between items-center text-xs"
                  >
                    <div>
                      <span className="font-bold text-scnavy font-mono">
                        {item.code}
                      </span>{' '}
                      · <span>{item.desc}</span>
                    </div>
                    <span className="font-extrabold text-emerald-700 ml-2 font-mono whitespace-nowrap">
                      {brl(item.priceMO)}/{item.unit}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Floorplan Afericao Builder */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-blue-950 text-xs">
                2. Alimentar Memória de Aferição com Ambientes da Planta Real:
              </span>
              <span className="text-[11px] text-emerald-800 font-bold">
                Quartos 01 a 22 & Banheiros 01 a 22
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="md:col-span-2">
                <select
                  aria-label="Escolher Quarto ou Banheiro da Planta"
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="w-full border border-blue-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-scnavy bg-white"
                >
                  <option value="">
                    -- Escolher Quarto / Banheiro da Planta --
                  </option>
                  {state.afericoesList.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.ambiente} ({a.comp}m × {a.larg}m ={' '}
                      {(a.comp * a.larg).toFixed(2)}m²)
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-1">
                <select
                  aria-label="Modo de Dimensão da Planta"
                  value={dimMode}
                  onChange={(e) => setDimMode(e.target.value)}
                  className="border border-blue-300 rounded-lg px-2 py-1.5 text-xs font-bold text-blue-950 bg-white flex-1"
                >
                  <option value="AUTO">Automático p/ Métrica</option>
                  <option value="AREA_PISO">Área Piso/Laje (M²)</option>
                  <option value="PERIMETRO">Perímetro/Rodapé (M.Lin)</option>
                  <option value="AREA_PAREDE">Área Paredes (M²)</option>
                  <option value="UNIDADE">Unidade (1 UN)</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddPlantaRoom}
                  className="bg-blue-700 hover:bg-blue-600 text-white font-extrabold px-3 py-1.5 rounded-lg cursor-pointer whitespace-nowrap"
                >
                  + Somar
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-blue-200 flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={manualLabel}
                onChange={(e) => setManualLabel(e.target.value)}
                placeholder="Trecho Manual (Ex: Parede WC)"
                className="border border-blue-300 rounded px-2 py-1 font-bold text-scnavy bg-white flex-1 min-w-[130px]"
              />
              <input
                type="number"
                step="0.01"
                value={manualC}
                onChange={(e) => setManualC(e.target.value)}
                placeholder="Comp.(m)"
                className="border border-blue-300 rounded px-2 py-1 w-20 text-center font-bold bg-white font-mono"
              />
              <input
                type="number"
                step="0.01"
                value={manualL}
                onChange={(e) => setManualL(e.target.value)}
                placeholder="Larg.(m)"
                className="border border-blue-300 rounded px-2 py-1 w-20 text-center font-bold bg-white font-mono"
              />
              <button
                type="button"
                onClick={handleAddManualMeasure}
                className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-3 py-1 rounded cursor-pointer"
              >
                + Manual
              </button>
              <button
                type="button"
                onClick={() => {
                  setLocal('');
                  setAfericao('');
                  setPrev(0);
                }}
                className="text-red-600 font-bold hover:underline px-1 cursor-pointer"
              >
                Limpar
              </button>
            </div>
          </div>

          {/* 3. Cost Mode */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <span className="font-bold text-scnavy block">
              3. Modalidade de Custo:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-300 bg-white cursor-pointer">
                <input
                  type="radio"
                  name="osCostMode"
                  checked={costMode === 'MO_ONLY'}
                  onChange={() => {
                    setCostMode('MO_ONLY');
                    if (selectedDB) setUnitPrice(selectedDB.priceMO);
                  }}
                />
                <div>
                  <div className="font-bold text-scnavy">
                    Somente Mão de Obra
                  </div>
                  <div className="text-[11px] text-emerald-700 font-bold font-mono">
                    {brl(selectedDB ? selectedDB.priceMO : unitPrice)}
                  </div>
                </div>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-300 bg-white cursor-pointer">
                <input
                  type="radio"
                  name="osCostMode"
                  checked={costMode === 'MO_INSUMO'}
                  onChange={() => {
                    setCostMode('MO_INSUMO');
                    if (selectedDB) setUnitPrice(selectedDB.priceTotal);
                  }}
                />
                <div>
                  <div className="font-bold text-scnavy">
                    Mão de Obra + Insumo
                  </div>
                  <div className="text-[11px] text-blue-700 font-bold font-mono">
                    {brl(selectedDB ? selectedDB.priceTotal : unitPrice)}
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Main Fields */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label
                htmlFor="osCodigoInput"
                className="block font-bold text-slate-700 mb-1"
              >
                Código O.S.
              </label>
              <input
                id="osCodigoInput"
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold font-mono"
              />
            </div>
            <div>
              <label
                htmlFor="osStatusSelect"
                className="block font-bold text-slate-700 mb-1"
              >
                Status
              </label>
              <select
                id="osStatusSelect"
                value={status}
                onChange={(e) => setStatus(e.target.value as OSStatus)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold"
              >
                <option value="URGENTE">URGENTE</option>
                <option value="EXECUÇÃO">EXECUÇÃO</option>
                <option value="LIBERADO">LIBERADO</option>
                <option value="EXECUTADO">EXECUTADO</option>
              </select>
            </div>
            <div className="col-span-2">
              <label
                htmlFor="osBlocoSelect"
                className="block font-bold text-slate-700 mb-1"
              >
                Bloco na Medição Semanal
              </label>
              <select
                id="osBlocoSelect"
                value={bloco}
                onChange={(e) => setBloco(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold"
              >
                <option value="ALVENARIA 1, 2 E 3">ALVENARIA 1, 2 E 3</option>
                <option value="REVESTIMENTO EM GERAL">
                  REVESTIMENTO EM GERAL
                </option>
                <option value="EMASSAMENTO">EMASSAMENTO</option>
                <option value="SUPERESTRUTURA FASE 2 (+2,75M A +5,85M)">
                  SUPERESTRUTURA FASE 2
                </option>
                <option value="REDE HIDRÁULICA">REDE HIDRÁULICA</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-orange-50/60 border border-orange-200 rounded-xl p-3">
            <div>
              <label
                htmlFor="osLocalInput"
                className="block font-extrabold text-scnavy mb-1"
              >
                Local / Ambiente:
              </label>
              <input
                id="osLocalInput"
                type="text"
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                placeholder="Ex: Banheiro 02..."
                className="w-full border border-orange-300 rounded-lg px-3 py-1.5 font-bold text-scnavy bg-white"
              />
            </div>
            <div>
              <label
                htmlFor="osAfericaoInput"
                className="block font-extrabold text-scnavy mb-1"
              >
                Memória de Aferição:
              </label>
              <input
                id="osAfericaoInput"
                type="text"
                value={afericao}
                onChange={(e) => setAfericao(e.target.value)}
                placeholder="Ex: 2,234m × 1,380m = 3,08 M²"
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-slate-700 bg-white font-semibold font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label
                htmlFor="osExecutorInput"
                className="block font-bold text-slate-700 mb-1"
              >
                Executor
              </label>
              <input
                id="osExecutorInput"
                type="text"
                value={executor}
                onChange={(e) => setExecutor(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold"
              />
            </div>
            <div>
              <label
                htmlFor="osUnidadeSelect"
                className="block font-bold text-slate-700 mb-1"
              >
                Métrica
              </label>
              <select
                id="osUnidadeSelect"
                value={unit}
                onChange={(e) => setUnit(e.target.value as MetricUnit)}
                className="w-full border border-blue-300 bg-blue-50 text-blue-900 rounded-lg px-2.5 py-1.5 font-extrabold text-center font-mono"
              >
                <option value="M²">M²</option>
                <option value="M. LINEAR">M. LINEAR</option>
                <option value="M³">M³</option>
                <option value="UN">UN</option>
                <option value="DIÁRIA">DIÁRIA</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="osPrevistoInput"
                className="block font-bold text-slate-700 mb-1"
              >
                Previsto
              </label>
              <input
                id="osPrevistoInput"
                type="number"
                step="0.01"
                value={prev}
                onChange={(e) => setPrev(parseFloat(e.target.value) || 0)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-center font-extrabold font-mono"
              />
            </div>
            <div>
              <label
                htmlFor="osExecutadoInput"
                className="block font-bold text-slate-700 mb-1"
              >
                Executado
              </label>
              <input
                id="osExecutadoInput"
                type="number"
                step="0.01"
                value={exec}
                onChange={(e) => setExec(parseFloat(e.target.value) || 0)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-center font-extrabold text-emerald-700 font-mono"
              />
            </div>
            <div>
              <label
                htmlFor="osValorUnitInput"
                className="block font-bold text-slate-700 mb-1"
              >
                R$ Unitário
              </label>
              <input
                id="osValorUnitInput"
                type="number"
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-right font-extrabold text-scnavy font-mono"
              />
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 flex items-center justify-between">
            <span className="font-mono text-scnavy font-bold">
              {numBR(prev)} {unit} × {brl(unitPrice)}
            </span>
            <span className="font-extrabold text-emerald-950">
              Total Previsto:{' '}
              <strong className="text-emerald-800 text-base font-mono tabular-nums">
                {brl(prev * unitPrice)}
              </strong>
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-scorange hover:bg-orange-600 text-white font-bold px-5 py-2 rounded-lg shadow cursor-pointer"
            >
              Salvar Ordem de Serviço
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 2. MODAL VISUALIZAÇÃO A4 DA O.S.
interface OSA4ModalProps {
  os: OSItem | null;
  onClose: () => void;
  onShareWhatsApp: (os: OSItem) => void;
}

export const OSA4Modal: React.FC<OSA4ModalProps> = ({
  os,
  onClose,
  onShareWhatsApp,
}) => {
  const [mode, setMode] = useState<'AMBAS' | 'EXECUCAO' | 'ENGENHARIA'>('AMBAS');
  const printRef = useRef<HTMLDivElement>(null);

  if (!os) return null;

  const renderSheet = (isViaExecucao: boolean, addPageBreak: boolean) => {
    const subtotal = (os.prev || 0) * (os.unitPrice || 0);
    const p1 =
      os.photos && os.photos[0]
        ? typeof os.photos[0] === 'string'
          ? os.photos[0]
          : os.photos[0].dataUrl
        : null;
    const p2 =
      os.photos && os.photos[1]
        ? typeof os.photos[1] === 'string'
          ? os.photos[1]
          : os.photos[1].dataUrl
        : null;

    return (
      <div
        className={`a4-distinct-sheet ${
          addPageBreak ? 'page-break' : ''
        } rounded-xl border-2 border-slate-900 p-5 space-y-3 text-xs bg-white`}
      >
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
          <div>
            <h1 className="text-sm font-extrabold text-scnavy uppercase">
              SC SOARES LTDA · ENGENHARIA E OBRAS
            </h1>
            <p className="text-[10px] text-slate-600 font-bold">
              CNPJ: 48.629.736/0001-50 · OBRA: HOTEL MODELO (UBERABA/MG)
            </p>
          </div>
          <div className="text-right">
            <span className="bg-scnavy text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded font-mono">
              O.S. Nº {os.id}
            </span>
            <span className="block text-[9.5px] font-bold text-scorange mt-1 uppercase">
              {isViaExecucao
                ? '2ª VIA — CAMPO / EXECUTOR (SEM VALORES)'
                : '1ª VIA — ENGENHARIA & CUSTOS'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-300 text-[10px]">
          <div>
            <strong className="block text-slate-500">Executor:</strong>
            <span className="font-bold text-scnavy">{os.executor}</span>
          </div>
          <div>
            <strong className="block text-slate-500">Semana:</strong>
            <span className="font-bold text-scnavy">{os.week}</span>
          </div>
          <div>
            <strong className="block text-slate-500">Bloco:</strong>
            <span className="font-bold text-scnavy">{os.bloco}</span>
          </div>
          <div>
            <strong className="block text-slate-500">Local / Aferição:</strong>
            <span className="font-bold text-scorange">{os.local || '-'}</span>
          </div>
        </div>

        {os.afericao && (
          <div className="p-2 border border-blue-200 rounded bg-blue-50/50 text-[10px] font-mono">
            <strong>Memória de Aferição:</strong> {os.afericao}
          </div>
        )}

        <div className="p-2.5 border border-slate-300 rounded bg-white">
          <span className="text-[9.5px] font-extrabold text-scorange uppercase block">
            Diretriz Técnica do Serviço:
          </span>
          <div className="font-extrabold text-scnavy text-xs leading-snug mt-0.5">
            {os.desc}
          </div>
        </div>

        <table className="w-full border-collapse border border-slate-800 text-[10.5px]">
          <thead className="bg-scnavy text-white">
            <tr>
              <th className="p-1.5 text-left">Métrica</th>
              <th className="p-1.5 text-center">Meta Prevista</th>
              <th className="p-1.5 text-center">Executado</th>
              {!isViaExecucao && (
                <>
                  <th className="p-1.5 text-right">R$ Unit.</th>
                  <th className="p-1.5 text-right">Subtotal Previsto</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            <tr className="font-bold text-center font-mono">
              <td className="p-1.5 border border-slate-300 text-left">
                {os.unit}
              </td>
              <td className="p-1.5 border border-slate-300">
                {numBR(os.prev)} {os.unit}
              </td>
              <td className="p-1.5 border border-slate-300 text-emerald-700">
                {numBR(os.exec)} {os.unit}
              </td>
              {!isViaExecucao && (
                <>
                  <td className="p-1.5 border border-slate-300 text-right">
                    {brl(os.unitPrice)}
                  </td>
                  <td className="p-1.5 border border-slate-300 text-right font-extrabold text-scnavy bg-emerald-50">
                    {brl(subtotal)}
                  </td>
                </>
              )}
            </tr>
          </tbody>
        </table>

        <div className="border border-slate-300 rounded-xl p-2.5 bg-slate-50 space-y-1.5">
          <span className="font-extrabold text-[9.5px] text-scnavy uppercase block">
            Evidências Fotográficas Timemark (Teamspace: 449cSPnrsg)
          </span>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-32 border border-dashed border-slate-300 rounded bg-white flex items-center justify-center p-1 overflow-hidden">
              {p1 && p1.startsWith('data:image') ? (
                <img
                  src={p1}
                  alt="1ª Foto Início"
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-[10px] text-slate-500 font-mono">
                  {p1 ? `✔ ${p1} Verificado` : '1ª Foto (Início / Base)'}
                </span>
              )}
            </div>
            <div className="h-32 border border-dashed border-slate-300 rounded bg-white flex items-center justify-center p-1 overflow-hidden">
              {p2 && p2.startsWith('data:image') ? (
                <img
                  src={p2}
                  alt="2ª Foto Conclusão"
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-[10px] text-slate-500 font-mono">
                  {p2 ? `✔ ${p2} Verificado` : '2ª Foto (Conclusão 100%)'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 text-center text-[9.5px]">
          <div className="border-t border-slate-800 pt-1 font-bold">
            {os.executor}
            <br />
            <span className="font-normal text-slate-500">Executor</span>
          </div>
          <div className="border-t border-slate-800 pt-1 font-bold">
            EVANDRO TEIXEIRA
            <br />
            <span className="font-normal text-slate-500">Mestre de Obras</span>
          </div>
          <div className="border-t border-slate-800 pt-1 font-bold">
            CABRAL / ENG. JOÃO
            <br />
            <span className="font-normal text-slate-500">Engenharia</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="bg-scnavy text-white px-5 py-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm">
              Visualização de Impressão A4 — Ordem de Serviço {os.id}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setMode('AMBAS')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer ${
                mode === 'AMBAS'
                  ? 'bg-scorange text-white'
                  : 'bg-slate-700 text-slate-200'
              }`}
            >
              2 Vias (1 Pág. Cada)
            </button>
            <button
              type="button"
              onClick={() => setMode('EXECUCAO')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer ${
                mode === 'EXECUCAO'
                  ? 'bg-scorange text-white'
                  : 'bg-slate-700 text-slate-200'
              }`}
            >
              Só Executor
            </button>
            <button
              type="button"
              onClick={() => setMode('ENGENHARIA')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer ${
                mode === 'ENGENHARIA'
                  ? 'bg-scorange text-white'
                  : 'bg-slate-700 text-slate-200'
              }`}
            >
              Só Engenharia
            </button>
            <button
              type="button"
              onClick={() => onShareWhatsApp(os)}
              className="bg-emerald-600 text-white text-xs font-extrabold px-3 py-1.5 rounded-lg cursor-pointer"
            >
              WhatsApp
            </button>
            <button
              type="button"
              onClick={() =>
                exportElementToPDF(
                  printRef.current,
                  `ORDEM_SERVICO_${os.id}.pdf`
                )
              }
              className="bg-indigo-600 text-white text-xs font-extrabold px-3 py-1.5 rounded-lg cursor-pointer"
            >
              Baixar PDF
            </button>
            <button
              type="button"
              onClick={() => {
                const area = document.getElementById('printArea');
                if (area && printRef.current) {
                  area.innerHTML = printRef.current.innerHTML;
                  window.print();
                }
              }}
              className="bg-emerald-700 text-white text-xs font-extrabold px-3.5 py-1.5 rounded-lg cursor-pointer"
            >
              Imprimir A4
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar Visualização A4"
              className="text-slate-300 hover:text-white text-lg font-bold px-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
        <div
          ref={printRef}
          className="p-6 overflow-y-auto sc-scroll space-y-6 bg-slate-200"
        >
          {mode === 'AMBAS' && (
            <>
              {renderSheet(false, true)}
              {renderSheet(true, false)}
            </>
          )}
          {mode === 'ENGENHARIA' && renderSheet(false, false)}
          {mode === 'EXECUCAO' && renderSheet(true, false)}
        </div>
      </div>
    </div>
  );
};

// 3. MODAL TIMEMARK ESCOLHA RÁPIDA
interface TimemarkModalProps {
  os: OSItem | null;
  onClose: () => void;
  onAttachPhoto: (osId: string, slot: number, dataUrl: string) => void;
  onGenerateStamp: (osId: string, slot: number) => void;
}

export const TimemarkQuickChoiceModal: React.FC<TimemarkModalProps> = ({
  os,
  onClose,
  onAttachPhoto,
  onGenerateStamp,
}) => {
  const [slot, setSlot] = useState(0);

  useEffect(() => {
    if (os) {
      setSlot(!os.photos || !os.photos[0] ? 0 : 1);
    }
  }, [os]);

  if (!os) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const res = String(ev.target?.result || '');
      if (res) {
        onAttachPhoto(os.id, slot, res);
        onClose();
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border-2 border-scorange">
        <div className="bg-scnavy text-white px-5 py-3.5 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm">
              Timemark Camera — Comprovação Fotográfica ({os.id})
            </h3>
            <p className="text-[11px] text-slate-300">
              Hora e coordenadas autênticas · Teamspace: 449cSPnrsg
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal Timemark"
            className="text-slate-300 hover:text-white text-lg font-bold px-2 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-3 text-xs bg-slate-50">
          <div className="grid grid-cols-2 gap-2 bg-white p-2 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setSlot(0)}
              className={`py-2 px-3 rounded-lg font-extrabold text-xs transition cursor-pointer ${
                slot === 0
                  ? 'bg-scnavy text-white shadow'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              1ª FOTO — INÍCIO / BASE
            </button>
            <button
              type="button"
              onClick={() => setSlot(1)}
              className={`py-2 px-3 rounded-lg font-extrabold text-xs transition cursor-pointer ${
                slot === 1
                  ? 'bg-emerald-700 text-white shadow'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              2ª FOTO — CONCLUSÃO 100%
            </button>
          </div>

          <div className="space-y-2">
            <a
              href={TIMEMARK_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-scorange text-white font-extrabold p-3 rounded-xl shadow flex items-center justify-between cursor-pointer"
            >
              <span>1. Abrir Espaço de Equipe Timemark (449cSPnrsg)</span>
              <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-mono">
                TEAMSPACE ↗
              </span>
            </a>

            <label className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold p-3 rounded-xl shadow flex items-center justify-between cursor-pointer text-left">
              <span>2. Selecionar Foto Salva no Celular / Computador</span>
              <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-mono">
                ARQUIVO
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            <button
              type="button"
              onClick={() => {
                onGenerateStamp(os.id, slot);
                onClose();
              }}
              className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold p-3 rounded-xl shadow cursor-pointer text-left"
            >
              3. Gerar Carimbo Timemark Verificado com Coordenadas de Uberaba/MG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 4. MODAL NOVA / EDITAR ORDEM DE COMPRA (O.C.)
interface NewOCModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: CabralState;
  initialOC?: OCOrder | null;
  onSaveOC: (oc: OCOrder, sendToCronograma: boolean) => void;
}

export const NewOCModal: React.FC<NewOCModalProps> = ({
  isOpen,
  onClose,
  state,
  initialOC,
  onSaveOC,
}) => {
  const [numero, setNumero] = useState(68);
  const [dataPedido, setDataPedido] = useState('2026-11-04');
  const [finalidade, setFinalidade] = useState('');
  const [fornecedorNome, setFornecedorNome] = useState('');
  const [fornecedorCNPJ, setFornecedorCNPJ] = useState('');
  const [fornecedorFone, setFornecedorFone] = useState('');
  const [items, setItems] = useState<OCItem[]>([
    { desc: '', qty: 1, unitPrice: 0 },
  ]);
  const [desconto, setDesconto] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    if (initialOC) {
      setNumero(initialOC.numero);
      setDataPedido(initialOC.dataPedido);
      setFinalidade(initialOC.finalidade);
      setFornecedorNome(initialOC.fornecedorNome);
      setFornecedorCNPJ(initialOC.fornecedorCNPJ);
      setFornecedorFone(initialOC.fornecedorFone);
      setItems(initialOC.items.length ? initialOC.items : [{ desc: '', qty: 1, unitPrice: 0 }]);
      setDesconto(initialOC.desconto);
    } else {
      const maxNum = state.ocList.reduce(
        (max, x) => Math.max(max, x.numero),
        66
      );
      setNumero(maxNum + 1);
      setDataPedido(new Date().toISOString().slice(0, 10));
      setFinalidade('');
      setFornecedorNome('');
      setFornecedorCNPJ('');
      setFornecedorFone('');
      setItems([{ desc: '', qty: 1, unitPrice: 0 }]);
      setDesconto(0);
    }
  }, [isOpen, initialOC, state.ocList]);

  if (!isOpen) return null;

  const { subtotal, valorFinal } = calculateOCTotals(items, desconto);

  const handleSave = (sendToCron: boolean) => {
    const validItems = items.filter((i) => i.desc.trim().length > 0);
    if (!fornecedorNome.trim() || validItems.length === 0) return;

    const order: OCOrder = {
      id: initialOC?.id || `OC-${String(numero).padStart(3, '0')}`,
      numero,
      week: state.currentWeek,
      dataPedido,
      finalidade: finalidade.trim().toUpperCase() || 'INSUMOS DE OBRA',
      fornecedorNome: fornecedorNome.trim().toUpperCase(),
      fornecedorCNPJ: fornecedorCNPJ.trim() || '00.000.000/0001-00',
      fornecedorFone: fornecedorFone.trim() || '(34) 0000-0000',
      items: validItems,
      desconto: Number(desconto) || 0,
      enviadoCronograma: sendToCron || Boolean(initialOC?.enviadoCronograma),
    };
    onSaveOC(order, sendToCron);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden border border-slate-300">
        <div className="bg-scnavy text-white px-5 py-3.5 flex items-center justify-between">
          <h3 className="font-extrabold text-sm">
            Emissão de Ordem de Compra (O.C. N° {numero}) — Padrão SC SOARES
            LTDA
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal O.C."
            className="text-slate-300 hover:text-white text-lg font-bold px-2 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-5 overflow-y-auto sc-scroll space-y-4 text-xs bg-slate-50">
          <div className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block font-extrabold text-scnavy mb-1">
                N° da O.C.:
              </label>
              <input
                type="number"
                value={numero}
                onChange={(e) => setNumero(parseInt(e.target.value, 10) || 67)}
                className="w-full border border-scorange rounded-lg px-3 py-1.5 font-extrabold text-sm text-scnavy font-mono"
              />
            </div>
            <div>
              <label className="block font-extrabold text-scnavy mb-1">
                Data do Pedido:
              </label>
              <input
                type="date"
                value={dataPedido}
                onChange={(e) => setDataPedido(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-bold font-mono"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-extrabold text-scnavy mb-1">
                Título / Finalidade da Compra:
              </label>
              <input
                type="text"
                value={finalidade}
                onChange={(e) => setFinalidade(e.target.value)}
                placeholder="Ex: CONCLUSÃO LAJE SECA BANHEIROS..."
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-bold uppercase"
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-extrabold text-slate-700 uppercase">
                  Fornecedor:
                </label>
                <input
                  type="text"
                  value={fornecedorNome}
                  onChange={(e) => setFornecedorNome(e.target.value)}
                  placeholder="Nome Empresarial do Fornecedor"
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-extrabold uppercase"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-700 uppercase">
                  CNPJ / PIX:
                </label>
                <input
                  type="text"
                  value={fornecedorCNPJ}
                  onChange={(e) => setFornecedorCNPJ(e.target.value)}
                  placeholder="00.000.000/0001-00"
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-bold font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-700 uppercase">
                  Telefone:
                </label>
                <input
                  type="text"
                  value={fornecedorFone}
                  onChange={(e) => setFornecedorFone(e.target.value)}
                  placeholder="(34) 99999-0000"
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-bold"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="font-extrabold text-scnavy uppercase">
                Itens da Ordem de Compra
              </span>
              <button
                type="button"
                onClick={() =>
                  setItems([...items, { desc: '', qty: 1, unitPrice: 0 }])
                }
                className="bg-scnavy text-white text-[11px] font-bold px-3 py-1 rounded-lg cursor-pointer"
              >
                + Adicionar Item
              </button>
            </div>

            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-scnavy text-white">
                  <th className="p-2 w-10">#</th>
                  <th className="p-2 text-left">Descrição do Material</th>
                  <th className="p-2 w-24 text-center">Qtd</th>
                  <th className="p-2 w-28 text-right">R$ Unit</th>
                  <th className="p-2 w-28 text-right">Total</th>
                  <th className="p-2 w-10">✕</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={idx} className="border-t border-slate-200">
                    <td className="p-2 text-center font-mono">{idx + 1}</td>
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={it.desc}
                        onChange={(e) => {
                          const next = [...items];
                          next[idx] = { ...it, desc: e.target.value };
                          setItems(next);
                        }}
                        placeholder="Descrição do material..."
                        className="w-full border border-slate-300 rounded px-2 py-1 font-semibold"
                      />
                    </td>
                    <td className="p-1.5">
                      <input
                        type="number"
                        step="0.01"
                        value={it.qty}
                        onChange={(e) => {
                          const next = [...items];
                          next[idx] = {
                            ...it,
                            qty: parseFloat(e.target.value) || 0,
                          };
                          setItems(next);
                        }}
                        className="w-full border border-slate-300 rounded px-2 py-1 text-center font-mono font-bold"
                      />
                    </td>
                    <td className="p-1.5">
                      <input
                        type="number"
                        step="0.01"
                        value={it.unitPrice}
                        onChange={(e) => {
                          const next = [...items];
                          next[idx] = {
                            ...it,
                            unitPrice: parseFloat(e.target.value) || 0,
                          };
                          setItems(next);
                        }}
                        className="w-full border border-slate-300 rounded px-2 py-1 text-right font-mono font-bold"
                      />
                    </td>
                    <td className="p-2 text-right font-mono font-bold text-scnavy">
                      {brl(it.qty * it.unitPrice)}
                    </td>
                    <td className="p-2 text-center">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setItems(items.filter((_, i) => i !== idx))
                          }
                          className="text-red-500 font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold bg-slate-50 border-t border-slate-200">
                  <td colSpan={4} className="p-2 text-right">
                    SUBTOTAL:
                  </td>
                  <td className="p-2 text-right font-mono">{brl(subtotal)}</td>
                  <td></td>
                </tr>
                <tr className="font-bold bg-amber-50">
                  <td colSpan={4} className="p-2 text-right">
                    DESCONTO (R$):
                  </td>
                  <td className="p-1 text-right">
                    <input
                      type="number"
                      step="0.01"
                      value={desconto}
                      onChange={(e) =>
                        setDesconto(parseFloat(e.target.value) || 0)
                      }
                      className="w-24 text-right border border-slate-300 rounded px-1.5 py-0.5 font-mono font-bold bg-white"
                    />
                  </td>
                  <td></td>
                </tr>
                <tr className="font-extrabold bg-emerald-50 border-t border-slate-300">
                  <td colSpan={4} className="p-2 text-right">
                    VALOR FINAL:
                  </td>
                  <td className="p-2 text-right text-emerald-800 font-mono">
                    {brl(valorFinal)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleSave(false)}
                className="bg-scnavy text-white font-extrabold px-4 py-2 rounded-lg cursor-pointer"
              >
                Salvar O.C.
              </button>
              <button
                type="button"
                onClick={() => handleSave(true)}
                className="bg-scorange text-white font-extrabold px-4 py-2 rounded-lg cursor-pointer"
              >
                Salvar e Enviar p/ Cronograma
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 5. MODAL SIMULAR WEBHOOK, APPS SCRIPT, ALTERAR SENHA & IMPORTADOR EXCEL
interface UtilityModalsProps {
  activeModal:
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
    | 'NEW_AFERICAO';
  onClose: () => void;
  state: CabralState;
  onSimulateWebhook: (osId: string, member: string, coords: string) => void;
  onChangePassword: (oldPass: string, newPass: string) => boolean;
  onImportExcelFile: (
    file: File,
    target: 'banco_sinapi' | 'afericoes'
  ) => void;
  onAddManualMedicao: (item: MedicaoItem) => void;
  onAddManualCronograma: (item: CronogramaItem) => void;
  onAddOrcamento: (item: OrcamentoItem) => void;
  onAddDBItem: (item: DBItem) => void;
  onAddAfericao: (item: AfericaoItem) => void;
}

export const UtilityModals: React.FC<UtilityModalsProps> = ({
  activeModal,
  onClose,
  state,
  onSimulateWebhook,
  onChangePassword,
  onImportExcelFile,
  onAddManualMedicao,
  onAddManualCronograma,
  onAddOrcamento,
  onAddDBItem,
  onAddAfericao,
}) => {
  const [simOSId, setSimOSId] = useState(state.osList[0]?.id || 'OS-01');
  const [simMember, setSimMember] = useState('Evandro Teixeira');
  const [simCoords, setSimCoords] = useState('-19.74720, -47.93180');

  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');

  const [importTarget, setImportTarget] = useState<
    'banco_sinapi' | 'afericoes'
  >('banco_sinapi');

  // Quick Form states
  const [qBloco, setQBloco] = useState('ALVENARIA 1, 2 E 3');
  const [qCode, setQCode] = useState('PRP-MANUAL');
  const [qDesc, setQDesc] = useState('');
  const [qUnit, setQUnit] = useState<MetricUnit>('M²');
  const [qPrice, setQPrice] = useState(50);
  const [qPriceTotal, setQPriceTotal] = useState(70);
  const [qQty, setQQty] = useState(10);
  const [qRecebedor, setQRecebedor] = useState('ELIENAY MARQUES NEVES DUQUE');
  const [qPix, setQPix] = useState('55.906.923/0001-07');
  const [qFormato, setQFormato] = useState('CNPJ');
  const [qComp, setQComp] = useState(3.5);
  const [qLarg, setQLarg] = useState(2.8);
  const [qPeDir, setQPeDir] = useState(2.8);

  const medPrintRef = useRef<HTMLDivElement>(null);

  if (activeModal === 'NONE') return null;

  if (activeModal === 'WEBHOOK_SIM') {
    return (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 no-print">
        <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden">
          <div className="bg-scnavy text-white px-5 py-3.5 flex items-center justify-between">
            <h3 className="font-bold text-sm">
              Simular Evento Webhook Timemark (photo.uploaded)
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-300 hover:text-white text-lg font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="p-5 space-y-3 text-xs">
            <div>
              <label className="block font-bold mb-1">Ordem de Serviço</label>
              <select
                value={simOSId}
                onChange={(e) => setSimOSId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 font-bold text-scnavy"
              >
                {state.osList.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.id} — {o.desc.slice(0, 48)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold mb-1">Colaborador</label>
              <input
                type="text"
                value={simMember}
                onChange={(e) => setSimMember(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-bold"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">
                Coordenadas GPS (Uberaba/MG)
              </label>
              <input
                type="text"
                value={simCoords}
                onChange={(e) => setSimCoords(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-300 font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onSimulateWebhook(simOSId, simMember, simCoords);
                  onClose();
                }}
                className="bg-scorange text-white font-bold px-4 py-2 rounded-lg shadow cursor-pointer"
              >
                Disparar Webhook
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeModal === 'GDRIVE_SCRIPT') {
    return (
      <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 no-print">
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-300">
          <div className="bg-scnavy text-white px-5 py-3.5 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm">
                Motor de Banco de Dados SINAPI & Gestão Cabral 2.0 (Codigo.gs)
              </h3>
              <p className="text-[11px] text-slate-300">
                Planilha Relacional BD_SINAPI_SC_SOARES_CABRAL · Projeto Drive:{' '}
                {GDRIVE_TARGET_FOLDER_ID}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-300 hover:text-white text-lg font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="p-5 overflow-y-auto sc-scroll space-y-3 text-xs">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
              <div className="font-extrabold text-scnavy">
                Passo a Passo em 3 Minutos (Google Apps Script):
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-700">
                <li>
                  Acesse <strong>https://sheets.new</strong> e dê o nome{' '}
                  <code className="font-mono font-bold text-scnavy">
                    BD_SINAPI_SC_SOARES_CABRAL
                  </code>
                  .
                </li>
                <li>
                  No menu superior, clique em <strong>Extensões</strong> →{' '}
                  <strong>Apps Script</strong> e cole o código{' '}
                  <code className="font-mono font-bold">Codigo.gs</code> abaixo.
                </li>
                <li>
                  Execute a função{' '}
                  <code className="font-mono font-bold">
                    inicializarBancoDeDados()
                  </code>{' '}
                  para criar as 6 abas oficiais (
                  <code className="font-mono">SINAPI_COMPOSICOES</code>,{' '}
                  <code className="font-mono">SINAPI_INSUMOS</code>,{' '}
                  <code className="font-mono">SINAPI_COMPOSICAO_ITENS</code>,{' '}
                  <code className="font-mono">SINAPI_IBGE_HISTORICO</code>,{' '}
                  <code className="font-mono">CABRAL_2_0_STATE_JSON</code>,{' '}
                  <code className="font-mono">LOGS_SINCRONIZACAO</code>).
                </li>
                <li>
                  Clique em <strong>Implantar</strong> →{' '}
                  <strong>Nova implantação</strong> → Tipo:{' '}
                  <strong>App da Web</strong> → Quem pode acessar:{' '}
                  <strong>Qualquer pessoa</strong> e cole a URL gerada na aba 9!
                </li>
              </ol>
            </div>
            <textarea
              readOnly
              value={FULL_CODIGO_GS}
              className="w-full h-60 font-mono text-[11px] bg-slate-900 text-emerald-400 p-3 rounded-xl border border-slate-700"
            />
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(FULL_CODIGO_GS)}
                className="bg-scorange text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
              >
                Copiar Codigo.gs Completo
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-scnavy text-white font-bold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeModal === 'CHANGE_PASS') {
    return (
      <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 no-print">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
          <div className="bg-scnavy text-white px-5 py-3.5 flex items-center justify-between">
            <h3 className="font-extrabold text-sm">
              Alterar Senha do Administrador
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-300 hover:text-white text-lg font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (onChangePassword(oldPass, newPass)) {
                setOldPass('');
                setNewPass('');
                onClose();
              }
            }}
            className="p-5 space-y-3 text-xs"
          >
            <div>
              <label className="block font-bold mb-1">Senha Atual</label>
              <input
                type="password"
                value={oldPass}
                onChange={(e) => setOldPass(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Nova Senha</label>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-300 font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-scorange text-white font-bold px-4 py-2 rounded-lg cursor-pointer"
              >
                Salvar Nova Senha
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (activeModal === 'IMPORT_EXCEL') {
    return (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 no-print">
        <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden">
          <div className="bg-scnavy text-white px-5 py-3.5 flex items-center justify-between">
            <h3 className="font-bold text-sm">
              Alimentar Dados via Planilha Excel (.XLSX / .CSV)
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-300 hover:text-white text-lg font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="p-5 space-y-4 text-xs">
            <div>
              <label className="block font-bold text-scnavy mb-1">
                Destino da Importação:
              </label>
              <select
                value={importTarget}
                onChange={(e) =>
                  setImportTarget(
                    e.target.value as 'banco_sinapi' | 'afericoes'
                  )
                }
                className="w-full border border-slate-300 rounded-xl px-3 py-2 font-bold text-scnavy"
              >
                <option value="banco_sinapi">
                  Banco de Dados Próprio / SINAPI
                </option>
                <option value="afericoes">
                  Banco de Memória de Aferição (Planta)
                </option>
              </select>
            </div>
            <div className="border-2 border-dashed border-blue-400 bg-blue-50/50 rounded-xl p-6 text-center">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onImportExcelFile(file, importTarget);
                    onClose();
                  }
                }}
                className="block mx-auto text-xs"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-scnavy text-white font-bold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeModal === 'MEDICAO_PRINT') {
    const list = state.medicaoList.filter((m) => m.week === state.currentWeek);
    const total = list.reduce((a, b) => a + b.qty * b.unitPrice, 0);
    return (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
          <div className="bg-scnavy text-white px-5 py-3 flex items-center justify-between">
            <h3 className="font-bold text-sm">
              Planilha Oficial de Medição Semanal — {state.currentWeek}
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  exportElementToPDF(
                    medPrintRef.current,
                    `PLANILHA_MEDICAO_${state.currentWeek}.pdf`
                  )
                }
                className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer"
              >
                Baixar PDF
              </button>
              <button
                type="button"
                onClick={() => {
                  const area = document.getElementById('printArea');
                  if (area && medPrintRef.current) {
                    area.innerHTML = medPrintRef.current.outerHTML;
                    window.print();
                  }
                }}
                className="bg-scorange text-white text-xs font-bold px-3.5 py-1.5 rounded-lg cursor-pointer"
              >
                Imprimir A4
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-300 hover:text-white text-lg font-bold px-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="p-6 overflow-y-auto sc-scroll">
            <div
              ref={medPrintRef}
              className="bg-white border-2 border-scnavy rounded-xl p-5 space-y-3"
            >
              <div className="flex justify-between items-center border-b-2 border-scnavy pb-2">
                <h3 className="text-sm font-extrabold text-scnavy uppercase">
                  SC SOARES LTDA · PLANILHA DE MEDIÇÃO SEMANAL —{' '}
                  {state.currentWeek}
                </h3>
                <span className="text-xs font-bold text-slate-600">
                  HOTEL MODELO (UBERABA/MG)
                </span>
              </div>
              <table className="w-full text-[10.5px] border-collapse">
                <thead className="bg-scnavy text-white">
                  <tr>
                    <th className="p-1.5 text-left">Bloco</th>
                    <th className="p-1.5 text-center">Cód.</th>
                    <th className="p-1.5 text-left">Serviço / O.S.</th>
                    <th className="p-1.5 text-center">Métrica</th>
                    <th className="p-1.5 text-right">R$ Unit.</th>
                    <th className="p-1.5 text-right">Medição</th>
                    <th className="p-1.5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((m) => (
                    <tr key={m.id} className="border-b border-slate-200">
                      <td className="p-1.5 font-extrabold uppercase">
                        {m.bloco}
                      </td>
                      <td className="p-1.5 text-center font-mono font-bold">
                        {m.code}
                      </td>
                      <td className="p-1.5 uppercase">{m.desc}</td>
                      <td className="p-1.5 text-center font-mono font-extrabold">
                        {m.unit}
                      </td>
                      <td className="p-1.5 text-right font-mono">
                        {brl(m.unitPrice)}
                      </td>
                      <td className="p-1.5 text-right font-mono font-extrabold">
                        {numBR(m.qty)}
                      </td>
                      <td className="p-1.5 text-right font-mono font-extrabold text-scnavy">
                        {brl(m.qty * m.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-extrabold text-xs">
                    <td colSpan={6} className="p-2 text-right uppercase">
                      TOTAL DA MEDIÇÃO SEMANAL:
                    </td>
                    <td className="p-2 text-right text-scnavy font-mono">
                      {brl(total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quick Form Modals (NEW_MEDICAO, NEW_CRONOGRAMA, NEW_ORCAMENTO, NEW_DB_ITEM, NEW_AFERICAO)
  const titles: Record<string, string> = {
    NEW_MEDICAO: 'Adicionar Medição Manual na Semana',
    NEW_CRONOGRAMA: 'Adicionar Pagamento / Reembolso no Cronograma',
    NEW_ORCAMENTO: 'Nova Solicitação de Orçamento',
    NEW_DB_ITEM: 'Novo Item no Banco Próprio SC Soares',
    NEW_AFERICAO: 'Incluir Medida Manual na Memória de Aferição',
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden">
        <div className="bg-scnavy text-white px-5 py-3.5 flex items-center justify-between">
          <h3 className="font-bold text-sm">{titles[activeModal]}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white text-lg font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!qDesc.trim()) return;

            if (activeModal === 'NEW_MEDICAO') {
              onAddManualMedicao({
                id: `MED-MAN-${Date.now().toString().slice(-4)}`,
                week: state.currentWeek,
                bloco: qBloco,
                code: qCode || 'PRP',
                desc: qDesc.toUpperCase(),
                unit: qUnit,
                unitPrice: Number(qPrice) || 0,
                qty: Number(qQty) || 1,
              });
            } else if (activeModal === 'NEW_CRONOGRAMA') {
              onAddManualCronograma({
                id: `CR-MAN-${Date.now().toString().slice(-4)}`,
                week: state.currentWeek,
                desc: qDesc.toUpperCase(),
                recebedor: qRecebedor.toUpperCase(),
                pix: qPix,
                formato: qFormato,
                valor: Number(qPrice) || 0,
              });
            } else if (activeModal === 'NEW_ORCAMENTO') {
              const nextNum =
                state.orcamentosList.reduce(
                  (m, x) => Math.max(m, x.numero),
                  66
                ) + 1;
              onAddOrcamento({
                id: `ORC-${nextNum}`,
                numero: nextNum,
                data: new Date().toISOString().slice(0, 10),
                titulo: qDesc.toUpperCase(),
                solicitante: 'ENGENHARIA SC SOARES',
                status: 'ABERTO',
                itensDesc: qCode,
                qtdEstimada: Number(qQty) || 1,
                unidade: qUnit,
                valorEstimadoUnit: Number(qPrice) || 0,
                fornecedorVencedor: qRecebedor.toUpperCase(),
                fornecedorCNPJ: qPix,
                fornecedorFone: '(34) 3312-0000',
              });
            } else if (activeModal === 'NEW_DB_ITEM') {
              onAddDBItem({
                code: qCode || `PRP-${state.db.length + 1}`,
                priority: 1,
                origin: 'BANCO_PROPRIO',
                sourceLabel: 'BANCO PRÓPRIO',
                desc: qDesc.toUpperCase(),
                unit: qUnit,
                priceMO: Number(qPrice) || 0,
                priceTotal: Number(qPriceTotal) || Number(qPrice) || 0,
                category: qBloco,
              });
            } else if (activeModal === 'NEW_AFERICAO') {
              onAddAfericao({
                id: `AF-MAN-${state.afericoesList.length + 1}`,
                tipo: 'MANUAL',
                ambiente: qDesc.toUpperCase(),
                origem: 'AFERIÇÃO MANUAL OBRA',
                comp: Number(qComp) || 3,
                larg: Number(qLarg) || 2.5,
                peDireito: Number(qPeDir) || 2.8,
                cotasMM: `${Math.round((Number(qComp) || 3) * 1000)} x ${Math.round((Number(qLarg) || 2.5) * 1000)} mm`,
              });
            }
            setQDesc('');
            onClose();
          }}
          className="p-5 space-y-3 text-xs"
        >
          {activeModal === 'NEW_MEDICAO' && (
            <>
              <div>
                <label className="block font-bold mb-1">Bloco</label>
                <select
                  value={qBloco}
                  onChange={(e) => setQBloco(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-bold"
                >
                  <option value="ALVENARIA 1, 2 E 3">ALVENARIA 1, 2 E 3</option>
                  <option value="REVESTIMENTO EM GERAL">
                    REVESTIMENTO EM GERAL
                  </option>
                  <option value="EMASSAMENTO">EMASSAMENTO</option>
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">
                  Descrição do Serviço Medido
                </label>
                <input
                  type="text"
                  value={qDesc}
                  onChange={(e) => setQDesc(e.target.value)}
                  placeholder="Ex: Requadro de Vãos Pavimento Superior"
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-bold"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold mb-1">Métrica</label>
                  <select
                    value={qUnit}
                    onChange={(e) => setQUnit(e.target.value as MetricUnit)}
                    className="w-full border border-slate-300 rounded-lg px-2 py-1.5 font-bold"
                  >
                    <option value="M²">M²</option>
                    <option value="M. LINEAR">M. LINEAR</option>
                    <option value="UN">UN</option>
                    <option value="DIÁRIA">DIÁRIA</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Quantidade</label>
                  <input
                    type="number"
                    step="0.01"
                    value={qQty}
                    onChange={(e) => setQQty(parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded-lg px-2 py-1.5 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">R$ Unitário</label>
                  <input
                    type="number"
                    step="0.01"
                    value={qPrice}
                    onChange={(e) => setQPrice(parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded-lg px-2 py-1.5 font-mono font-bold"
                  />
                </div>
              </div>
            </>
          )}

          {activeModal === 'NEW_CRONOGRAMA' && (
            <>
              <div>
                <label className="block font-bold mb-1">
                  Descrição do Pagamento / Reembolso
                </label>
                <input
                  type="text"
                  value={qDesc}
                  onChange={(e) => setQDesc(e.target.value)}
                  placeholder="Ex: REEMBOLSO INSUMOS HIDRÁULICA"
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-bold"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Recebedor</label>
                <input
                  type="text"
                  value={qRecebedor}
                  onChange={(e) => setQRecebedor(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-bold"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold mb-1">Chave PIX</label>
                  <input
                    type="text"
                    value={qPix}
                    onChange={(e) => setQPix(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-2 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Formato PIX</label>
                  <select
                    value={qFormato}
                    onChange={(e) => setQFormato(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-2 py-1.5 font-bold"
                  >
                    <option value="CNPJ">CNPJ</option>
                    <option value="CPF">CPF</option>
                    <option value="CELULAR">CELULAR</option>
                    <option value="E-MAIL">E-MAIL</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={qPrice}
                    onChange={(e) => setQPrice(parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded-lg px-2 py-1.5 font-mono font-bold"
                  />
                </div>
              </div>
            </>
          )}

          {activeModal === 'NEW_ORCAMENTO' && (
            <>
              <div>
                <label className="block font-bold mb-1">
                  Título da Cotação / Material
                </label>
                <input
                  type="text"
                  value={qDesc}
                  onChange={(e) => setQDesc(e.target.value)}
                  placeholder="Ex: PERFIS DRYWALL E PARAFUSOS"
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-bold"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">
                  Especificação dos Itens
                </label>
                <input
                  type="text"
                  value={qCode}
                  onChange={(e) => setQCode(e.target.value)}
                  placeholder="Ex: 30 Guias 70mm + 60 Montantes 70mm"
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">
                    Fornecedor Cotado
                  </label>
                  <input
                    type="text"
                    value={qRecebedor}
                    onChange={(e) => setQRecebedor(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-2 py-1.5 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">CNPJ / PIX</label>
                  <input
                    type="text"
                    value={qPix}
                    onChange={(e) => setQPix(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-2 py-1.5 font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">
                    Quantidade Estimada
                  </label>
                  <input
                    type="number"
                    value={qQty}
                    onChange={(e) => setQQty(parseFloat(e.target.value) || 1)}
                    className="w-full border border-slate-300 rounded-lg px-2 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">
                    Valor Unitário Estimado (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={qPrice}
                    onChange={(e) => setQPrice(parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded-lg px-2 py-1.5 font-mono"
                  />
                </div>
              </div>
            </>
          )}

          {activeModal === 'NEW_DB_ITEM' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Código</label>
                  <input
                    type="text"
                    value={qCode}
                    onChange={(e) => setQCode(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-2 py-1.5 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Métrica</label>
                  <select
                    value={qUnit}
                    onChange={(e) => setQUnit(e.target.value as MetricUnit)}
                    className="w-full border border-slate-300 rounded-lg px-2 py-1.5 font-bold"
                  >
                    <option value="M²">M²</option>
                    <option value="M. LINEAR">M. LINEAR</option>
                    <option value="M³">M³</option>
                    <option value="UN">UN</option>
                    <option value="DIÁRIA">DIÁRIA</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1">
                  Descrição Oficial do Serviço
                </label>
                <input
                  type="text"
                  value={qDesc}
                  onChange={(e) => setQDesc(e.target.value)}
                  placeholder="Descrição técnica completa..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">
                    R$ Só Mão de Obra
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={qPrice}
                    onChange={(e) => setQPrice(parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded-lg px-2 py-1.5 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">
                    R$ M.O. + Insumo
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={qPriceTotal}
                    onChange={(e) =>
                      setQPriceTotal(parseFloat(e.target.value) || 0)
                    }
                    className="w-full border border-slate-300 rounded-lg px-2 py-1.5 font-mono font-bold"
                  />
                </div>
              </div>
            </>
          )}

          {activeModal === 'NEW_AFERICAO' && (
            <>
              <div>
                <label className="block font-bold mb-1">
                  Nome do Ambiente / Trecho Medido
                </label>
                <input
                  type="text"
                  value={qDesc}
                  onChange={(e) => setQDesc(e.target.value)}
                  placeholder="Ex: RECEPÇÃO TÉRREO / HALL ELEVADOR"
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-bold"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold mb-1">Comp. (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={qComp}
                    onChange={(e) => setQComp(parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded-lg px-2 py-1.5 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Larg. (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={qLarg}
                    onChange={(e) => setQLarg(parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded-lg px-2 py-1.5 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Pé-Direito (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={qPeDir}
                    onChange={(e) => setQPeDir(parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded-lg px-2 py-1.5 font-mono font-bold"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-scorange text-white font-bold px-5 py-2 rounded-lg cursor-pointer"
            >
              Salvar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
