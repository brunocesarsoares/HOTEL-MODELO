import React, { useState } from 'react';
import { INITIAL_IBGE_INDICATORS } from '../data/initialData';
import { AfericaoItem, CabralState, DBItem } from '../types/cabral';
import {
  brl,
  calculateAfericaoMetrics,
  numBR,
} from '../utils/calculations';

interface TabBancoProps {
  state: CabralState;
  onOpenNewDBItemModal: () => void;
  onOpenImportModal: () => void;
  onOpenGDriveScriptModal: () => void;
  onSyncIBGESidra: () => void;
  onRecalcAllTCU: () => void;
  onUseDBItemInOS: (item: DBItem) => void;
  onDeleteDBItem: (code: string) => void;
}

export const TabBanco: React.FC<TabBancoProps> = ({
  state,
  onOpenNewDBItemModal,
  onOpenImportModal,
  onOpenGDriveScriptModal,
  onSyncIBGESidra,
  onRecalcAllTCU,
  onUseDBItemInOS,
  onDeleteDBItem,
}) => {
  const [search, setSearch] = useState('');
  const [originFilter, setOriginFilter] = useState('ALL');
  const [expandedCode, setExpandedCode] = useState<string | null>('SINAPI-98554');

  const indicators =
    state.ibgeIndicators && state.ibgeIndicators.length > 0
      ? state.ibgeIndicators
      : INITIAL_IBGE_INDICATORS;
  const latestIBGE = indicators[0];

  const filtered = state.db.filter((i) => {
    if (originFilter !== 'ALL' && i.origin !== originFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (
        !`${i.code} ${i.idInterno || ''} ${i.desc} ${i.unit} ${i.category} ${i.etapa || ''} ${i.grupo || ''}`
          .toLowerCase()
          .includes(q)
      )
        return false;
    }
    return true;
  });

  return (
    <section id="sec-banco" className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-extrabold text-scnavy">
            Motor de Banco de Dados SINAPI MG & Banco Próprio SC Soares (UF: MG
            · Comp. {latestIBGE.competencia})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            1ª Prioridade: Banco Próprio SC Soares + Composições Analíticas
            CAIXA/SINAPI com regra de truncamento TCU e API IBGE/SIDRA.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onSyncIBGESidra}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-extrabold px-3 py-2 rounded-lg cursor-pointer whitespace-nowrap"
          >
            Sincronizar IBGE/SIDRA (MG)
          </button>
          <button
            type="button"
            onClick={onRecalcAllTCU}
            className="bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-extrabold px-3 py-2 rounded-lg cursor-pointer whitespace-nowrap"
          >
            Recalcular Analítico (Regra TCU)
          </button>
          <button
            type="button"
            onClick={onOpenGDriveScriptModal}
            className="bg-scnavy hover:bg-slate-800 text-white text-xs font-extrabold px-3 py-2 rounded-lg cursor-pointer whitespace-nowrap"
          >
            Automação Google Script (Codigo.gs)
          </button>
          <button
            type="button"
            onClick={onOpenNewDBItemModal}
            className="bg-scorange hover:bg-orange-600 text-white text-xs font-bold px-3.5 py-2 rounded-lg cursor-pointer whitespace-nowrap"
          >
            Novo Item no Banco
          </button>
          <button
            type="button"
            onClick={onOpenImportModal}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer whitespace-nowrap"
          >
            Importar CAIXA (.XLSX)
          </button>
        </div>
      </div>

      {/* Indicadores IBGE / SIDRA MG */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <div className="text-xs font-semibold text-slate-500">
            Custo Médio SINAPI MG ({latestIBGE.competencia})
          </div>
          <div className="text-lg font-extrabold text-scnavy mt-1 font-mono tabular-nums">
            {brl(latestIBGE.custoMedioM2)} / m²
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {latestIBGE.fonte}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <div className="text-xs font-semibold text-blue-700">
            Variação Mensal / 12 Meses (MG)
          </div>
          <div className="text-lg font-extrabold text-blue-800 mt-1 font-mono tabular-nums">
            +{numBR(latestIBGE.variacaoMensalPct)}% mês · +
            {numBR(latestIBGE.variacao12MPct)}% 12m
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Série histórica oficial IBGE
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <div className="text-xs font-semibold text-emerald-700">
            Encargos Horista MG (Desonerado)
          </div>
          <div className="text-lg font-extrabold text-emerald-800 mt-1 font-mono tabular-nums">
            {numBR(latestIBGE.encargosDesoneradoPct)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Lei 14.973/2024 · Onerado: {numBR(latestIBGE.encargosOneradoPct)}%
          </div>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-300 p-3">
          <div className="text-xs font-semibold text-emerald-900">
            Total Composições Ativas
          </div>
          <div className="text-lg font-extrabold text-emerald-900 mt-1 font-mono tabular-nums">
            {state.db.length} Serviços
          </div>
          <div className="text-[11px] text-emerald-800 mt-0.5">
            Truncamento 2 casas decimais TCU
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-wrap items-center gap-2">
        <input
          type="text"
          aria-label="Buscar no Banco de Preços"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por código SINAPI (ex: 98554, 103316), etapa, descrição ou métrica..."
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs flex-1 min-w-[260px]"
        />
        <select
          aria-label="Filtrar por Origem do Banco"
          value={originFilter}
          onChange={(e) => setOriginFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white font-semibold"
        >
          <option value="ALL">Todas as Origens (Prioridade Banco Próprio)</option>
          <option value="BANCO_PROPRIO">
            1ª Prioridade: Banco Próprio & Histórico Pago
          </option>
          <option value="ADAPTADA">Composições Adaptadas</option>
          <option value="SINAPI">Oficial SINAPI CAIXA (MG)</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto sc-scroll">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-scnavy text-white text-[10.5px] uppercase">
                <th className="py-2.5 px-2.5 w-28">Código</th>
                <th className="py-2.5 px-2.5 w-40">Origem / Etapa</th>
                <th className="py-2.5 px-2.5">Descrição Oficial do Serviço</th>
                <th className="py-2.5 px-1.5 w-20 text-center">Métrica</th>
                <th className="py-2.5 px-2.5 w-28 text-right">R$ Mão Obra</th>
                <th className="py-2.5 px-2.5 w-28 text-right">R$ Insumos</th>
                <th className="py-2.5 px-2.5 w-32 text-right">
                  Total Deson.
                </th>
                <th className="py-2.5 px-2 w-16 text-center">% M.O.</th>
                <th className="py-2.5 px-2.5 w-40 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filtered.map((i) => {
                const insumoVal =
                  i.priceInsumo !== undefined
                    ? i.priceInsumo
                    : Math.max(0, +(i.priceTotal - i.priceMO).toFixed(2));
                const pctMO =
                  i.pctMO !== undefined
                    ? i.pctMO
                    : i.priceTotal > 0
                    ? +((i.priceMO / i.priceTotal) * 100).toFixed(1)
                    : 0;
                const hasAnalitico =
                  i.itensAnaliticos && i.itensAnaliticos.length > 0;
                const isExpanded = expandedCode === i.code;

                return (
                  <React.Fragment key={i.code}>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2 px-2.5 font-extrabold text-scnavy font-mono">
                        <div>{i.code}</div>
                        {i.idInterno && i.idInterno !== i.code && (
                          <div className="text-[10px] text-slate-500">
                            {i.idInterno}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-2.5 text-[10.5px]">
                        <div className="font-bold text-amber-900">
                          {i.sourceLabel}
                        </div>
                        {i.etapa && (
                          <div className="text-slate-500">{i.etapa}</div>
                        )}
                      </td>
                      <td className="py-2 px-2.5 font-semibold text-slate-800">
                        {i.desc}
                      </td>
                      <td className="py-2 px-1.5 text-center font-extrabold text-blue-900 font-mono">
                        {i.unit}
                      </td>
                      <td className="py-2 px-2.5 text-right font-bold text-emerald-700 font-mono tabular-nums">
                        {brl(i.priceMO)}
                      </td>
                      <td className="py-2 px-2.5 text-right font-semibold text-slate-700 font-mono tabular-nums">
                        {brl(insumoVal)}
                      </td>
                      <td className="py-2 px-2.5 text-right font-extrabold text-blue-800 font-mono tabular-nums">
                        <div>{brl(i.priceTotal)}</div>
                        {i.priceNaoDesonerado && (
                          <div className="text-[9.5px] text-slate-500 font-normal">
                            Oner.: {brl(i.priceNaoDesonerado)}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-2 text-center font-mono text-[11px] font-bold text-slate-700">
                        {numBR(pctMO)}%
                      </td>
                      <td className="py-2 px-2.5 text-center space-x-1 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onUseDBItemInOS(i)}
                          className="bg-scorange hover:bg-orange-600 text-white text-[10px] font-bold px-2 py-1 rounded cursor-pointer"
                        >
                          + O.S.
                        </button>
                        {hasAnalitico && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedCode(isExpanded ? null : i.code)
                            }
                            className="bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded cursor-pointer"
                          >
                            {isExpanded ? 'Ocultar' : 'Analítico'}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onDeleteDBItem(i.code)}
                          aria-label={`Remover ${i.code}`}
                          className="text-red-500 hover:bg-red-50 px-1.5 py-1 rounded cursor-pointer"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                    {hasAnalitico && isExpanded && (
                      <tr className="bg-slate-50">
                        <td colSpan={9} className="p-3 border-b border-slate-200">
                          <div className="text-[11px] font-bold text-scnavy mb-1.5">
                            Explosão Analítica ({i.code}) — Regra de Truncamento
                            TCU/CAIXA (2 Casas Decimais):
                          </div>
                          <table className="w-full text-[11px] border border-slate-300 bg-white">
                            <thead className="bg-slate-100 text-slate-700">
                              <tr>
                                <th className="p-1.5 text-left">Tipo</th>
                                <th className="p-1.5 text-left">Código Filho</th>
                                <th className="p-1.5 text-left">
                                  Descrição do Insumo / Composição Auxiliar
                                </th>
                                <th className="p-1.5 text-center">Unid.</th>
                                <th className="p-1.5 text-right">Coeficiente</th>
                                <th className="p-1.5 text-right">
                                  Preço Unit.
                                </th>
                                <th className="p-1.5 text-right">
                                  Custo Parcial Truncado
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 font-mono">
                              {i.itensAnaliticos!.map((child, idx) => (
                                <tr key={idx}>
                                  <td className="p-1.5">{child.tipo}</td>
                                  <td className="p-1.5 font-bold">
                                    {child.codigo}
                                  </td>
                                  <td className="p-1.5 font-sans">
                                    {child.descricao}
                                  </td>
                                  <td className="p-1.5 text-center">
                                    {child.unidade}
                                  </td>
                                  <td className="p-1.5 text-right">
                                    {child.coeficiente}
                                  </td>
                                  <td className="p-1.5 text-right">
                                    {brl(child.precoUnitario)}
                                  </td>
                                  <td className="p-1.5 text-right font-bold text-emerald-800">
                                    {brl(child.custoParcialTruncado)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

interface TabAfericaoProps {
  state: CabralState;
  onOpenNewAfericaoModal: () => void;
  onExportAfericoesExcel: () => void;
  onExportAfericoesJSON: () => void;
  onUseAfericaoInOS: (item: AfericaoItem) => void;
  onDeleteAfericao: (id: string) => void;
}

export const TabAfericao: React.FC<TabAfericaoProps> = ({
  state,
  onOpenNewAfericaoModal,
  onExportAfericoesExcel,
  onExportAfericoesJSON,
  onUseAfericaoInOS,
  onDeleteAfericao,
}) => {
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState('ALL');

  let sumArea = 0;
  let sumPerim = 0;
  let sumParede = 0;

  state.afericoesList.forEach((a) => {
    const m = calculateAfericaoMetrics(a.comp, a.larg, a.peDireito);
    sumArea += m.areaPiso;
    sumPerim += m.perimetro;
    sumParede += m.areaParede;
  });

  const filtered = state.afericoesList.filter((a) => {
    if (tipoFilter !== 'ALL' && a.tipo !== tipoFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!`${a.id} ${a.ambiente} ${a.cotasMM}`.toLowerCase().includes(q))
        return false;
    }
    return true;
  });

  return (
    <section id="sec-afericao" className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-extrabold text-scnavy">
              Memória de Aferição (Planta Real do Hotel Modelo + Medidas
              Manuais)
            </h2>
            <span className="text-xs text-emerald-700 font-semibold">
              · Interoperável c/ AutoCAD, Excel e ERP
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Quartos 1 a 22, Banheiros 1 a 22, Copa e Corredores convertidos de
            milímetros para metros, com cálculo de Área (M²), Perímetro (M) e
            Parede (M²).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenNewAfericaoModal}
            className="bg-scorange hover:bg-orange-600 text-white text-xs font-extrabold px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap"
          >
            Incluir Medida Manual
          </button>
          <button
            type="button"
            onClick={onExportAfericoesExcel}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-3.5 py-2 rounded-lg cursor-pointer whitespace-nowrap"
          >
            Exportar Aferições (.XLSX)
          </button>
          <button
            type="button"
            onClick={onExportAfericoesJSON}
            className="bg-scnavy hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-lg cursor-pointer whitespace-nowrap"
          >
            Exportar p/ Sistemas (.JSON)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <div className="text-xs font-semibold text-slate-500">
            Ambientes Mapeados
          </div>
          <div className="text-xl font-extrabold text-scnavy mt-1 font-mono tabular-nums">
            {state.afericoesList.length}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <div className="text-xs font-semibold text-blue-700">
            Soma Área Piso/Laje
          </div>
          <div className="text-xl font-extrabold text-blue-800 mt-1 font-mono tabular-nums">
            {numBR(sumArea)} M²
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <div className="text-xs font-semibold text-amber-700">
            Soma Perímetro / Rodapé
          </div>
          <div className="text-xl font-extrabold text-amber-800 mt-1 font-mono tabular-nums">
            {numBR(sumPerim)} M. LIN
          </div>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-300 p-3">
          <div className="text-xs font-semibold text-emerald-800">
            Soma Área Paredes
          </div>
          <div className="text-xl font-extrabold text-emerald-900 mt-1 font-mono tabular-nums">
            {numBR(sumParede)} M²
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-wrap items-center gap-2">
        <input
          type="text"
          aria-label="Buscar Ambiente na Planta"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar ambiente (ex: Quarto 01, Banheiro 21, Copa, Corredor)..."
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs flex-1 min-w-[240px]"
        />
        <select
          aria-label="Filtrar por Tipo de Ambiente"
          value={tipoFilter}
          onChange={(e) => setTipoFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white font-semibold"
        >
          <option value="ALL">Todos os Tipos</option>
          <option value="QUARTO">Quartos (01 a 22)</option>
          <option value="BANHEIRO">Banheiros (01 a 22)</option>
          <option value="CIRCULACAO">Circulação / Copa / Gerais</option>
          <option value="MANUAL">Medidas Manuais</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="sc-fit-table text-left">
          <thead>
            <tr className="bg-scnavy text-white text-[10px] uppercase">
              <th className="py-2 px-2 w-[7%]">Cód.</th>
              <th className="py-2 px-2 w-[17%]">Ambiente / Local</th>
              <th className="py-2 px-1.5 w-[13%] text-center">Origem</th>
              <th className="py-2 px-1 w-[7%] text-center">Comp.(m)</th>
              <th className="py-2 px-1 w-[7%] text-center">Larg.(m)</th>
              <th className="py-2 px-1 w-[6%] text-center">Pé-Dir.</th>
              <th className="py-2 px-1.5 w-[8%] text-right bg-blue-950/60">
                Área (M²)
              </th>
              <th className="py-2 px-1.5 w-[8%] text-right bg-amber-900/40">
                Perím.(M)
              </th>
              <th className="py-2 px-1.5 w-[9%] text-right bg-emerald-950/50">
                Parede(M²)
              </th>
              <th className="py-2 px-2 w-[11%]">Cotas Planta (mm)</th>
              <th className="py-2 px-1.5 w-[7%] text-center">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-[11px]">
            {filtered.map((a) => {
              const m = calculateAfericaoMetrics(a.comp, a.larg, a.peDireito);
              return (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="py-1.5 px-2 font-bold font-mono">{a.id}</td>
                  <td className="py-1.5 px-2 font-bold text-scnavy">
                    {a.ambiente}
                  </td>
                  <td className="py-1.5 px-1.5 text-center text-[10px] text-slate-600">
                    {a.origem}
                  </td>
                  <td className="py-1.5 px-1 text-center font-mono">
                    {a.comp}
                  </td>
                  <td className="py-1.5 px-1 text-center font-mono">
                    {a.larg}
                  </td>
                  <td className="py-1.5 px-1 text-center font-mono">
                    {a.peDireito}
                  </td>
                  <td className="py-1.5 px-1.5 text-right font-bold text-blue-800 font-mono tabular-nums">
                    {numBR(m.areaPiso)} m²
                  </td>
                  <td className="py-1.5 px-1.5 text-right font-bold text-amber-800 font-mono tabular-nums">
                    {numBR(m.perimetro)} m
                  </td>
                  <td className="py-1.5 px-1.5 text-right font-bold text-emerald-800 font-mono tabular-nums">
                    {numBR(m.areaParede)} m²
                  </td>
                  <td className="py-1.5 px-2 font-mono text-[10px]">
                    {a.cotasMM || '-'}
                  </td>
                  <td className="py-1.5 px-1.5 text-center whitespace-nowrap space-x-1">
                    <button
                      type="button"
                      onClick={() => onUseAfericaoInOS(a)}
                      className="bg-scorange text-white text-[9.5px] font-bold px-1.5 py-0.5 rounded cursor-pointer"
                    >
                      + O.S.
                    </button>
                    {a.tipo === 'MANUAL' && (
                      <button
                        type="button"
                        onClick={() => onDeleteAfericao(a.id)}
                        aria-label={`Remover aferição ${a.id}`}
                        className="text-red-500 hover:bg-red-50 px-1 py-0.5 rounded cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
