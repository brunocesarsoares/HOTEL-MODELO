import React from 'react';
import { CabralState, OCOrder, OrcamentoItem } from '../types/cabral';
import { brl, calculateOCTotals, numBR } from '../utils/calculations';

interface TabOrcamentoProps {
  state: CabralState;
  onOpenNewOrcamentoModal: () => void;
  onConvertOrcamentoToOC: (orc: OrcamentoItem) => void;
  onDeleteOrcamento: (id: string) => void;
}

export const TabOrcamento: React.FC<TabOrcamentoProps> = ({
  state,
  onOpenNewOrcamentoModal,
  onConvertOrcamentoToOC,
  onDeleteOrcamento,
}) => {
  return (
    <section id="sec-orcamento" className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-extrabold text-scnavy">
            Central de Solicitação de Orçamento (N° 67+)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registre cotações de materiais/insumos com fornecedores e converta
            com 1 clique em Ordens de Compra (O.C.).
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenNewOrcamentoModal}
          className="bg-scorange hover:bg-orange-600 text-white text-xs font-extrabold px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap"
        >
          Nova Solicitação de Orçamento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.orcamentosList.length === 0 ? (
          <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
            Nenhuma Solicitação de Orçamento registrada. Clique em "Nova
            Solicitação de Orçamento" para cadastrar.
          </div>
        ) : (
          state.orcamentosList.map((orc) => {
            const totalEst =
              (Number(orc.qtdEstimada) || 0) *
              (Number(orc.valorEstimadoUnit) || 0);
            return (
              <div
                key={orc.id}
                className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                      <span className="font-extrabold text-scnavy">
                        ORÇAMENTO N° {orc.numero}
                      </span>
                      <span>·</span>
                      <span>{orc.data}</span>
                      <span>·</span>
                      <span className="font-semibold text-emerald-700">
                        {orc.status}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteOrcamento(orc.id)}
                      aria-label={`Excluir orçamento ${orc.numero}`}
                      className="text-red-500 hover:bg-red-50 px-2 py-0.5 rounded text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <h3 className="font-extrabold text-scnavy text-sm">
                    {orc.titulo}
                  </h3>
                  <p className="text-xs text-slate-600">{orc.itensDesc}</p>
                  <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Solicitante:</span>
                      <span className="font-bold text-slate-800">
                        {orc.solicitante}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">
                        Fornecedor Cotado:
                      </span>
                      <span className="font-bold text-scnavy">
                        {orc.fornecedorVencedor} ({orc.fornecedorCNPJ})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Estimativa Total:</span>
                      <span className="font-extrabold text-emerald-800 font-mono tabular-nums">
                        {numBR(orc.qtdEstimada)} {orc.unidade} ×{' '}
                        {brl(orc.valorEstimadoUnit)} = {brl(totalEst)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onConvertOrcamentoToOC(orc)}
                    className="bg-scnavy hover:bg-slate-800 text-white text-xs font-extrabold px-3.5 py-2 rounded-lg cursor-pointer"
                  >
                    Converter em Ordem de Compra (O.C.)
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

interface TabOCProps {
  state: CabralState;
  onOpenNewOCModal: (editOC?: OCOrder) => void;
  onSendOCToCronograma: (oc: OCOrder) => void;
  onShareOCWhatsApp: (oc: OCOrder) => void;
  onPrintOCA4: (oc: OCOrder) => void;
  onDeleteOC: (id: string) => void;
}

export const TabOC: React.FC<TabOCProps> = ({
  state,
  onOpenNewOCModal,
  onSendOCToCronograma,
  onShareOCWhatsApp,
  onPrintOCA4,
  onDeleteOC,
}) => {
  return (
    <section id="sec-oc" className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-extrabold text-scnavy">
            Central de Ordens de Compra (Padrão Oficial SC SOARES)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Emissão de O.C. sequencial vinculada a cotações, descontos e
            repasse direto ao Cronograma de Pagamentos de Sexta-Feira.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onOpenNewOCModal()}
          className="bg-scorange hover:bg-orange-600 text-white text-xs font-extrabold px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          Nova Ordem de Compra
        </button>
      </div>

      <div className="space-y-4">
        {state.ocList.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
            Nenhuma Ordem de Compra emitida. Clique em "Nova Ordem de Compra"
            para cadastrar.
          </div>
        ) : (
          state.ocList.map((oc) => {
            const { subtotal, desconto, valorFinal } = calculateOCTotals(
              oc.items,
              oc.desconto
            );
            return (
              <div
                key={oc.id}
                className="bg-white rounded-xl border border-slate-200 p-4 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                      <span className="font-extrabold text-scnavy text-sm">
                        ORDEM DE COMPRA N° {oc.numero}
                      </span>
                      <span>·</span>
                      <span>Data: {oc.dataPedido}</span>
                      <span>·</span>
                      <span>{oc.week}</span>
                      {oc.enviadoCronograma && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-700 font-bold">
                            Integrada ao Cronograma
                          </span>
                        </>
                      )}
                    </div>
                    <div className="text-xs font-bold text-scorange mt-1">
                      Finalidade: {oc.finalidade}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onShareOCWhatsApp(oc)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                    >
                      WhatsApp Fornecedor
                    </button>
                    <button
                      type="button"
                      onClick={() => onPrintOCA4(oc)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                    >
                      Imprimir O.C. A4
                    </button>
                    <button
                      type="button"
                      onClick={() => onSendOCToCronograma(oc)}
                      className="bg-scnavy hover:bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                    >
                      Enviar p/ Cronograma
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenNewOCModal(oc)}
                      className="border border-slate-300 text-slate-700 text-xs font-bold px-2.5 py-1.5 rounded-lg cursor-pointer"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteOC(oc.id)}
                      aria-label={`Excluir OC ${oc.numero}`}
                      className="text-red-500 hover:bg-red-50 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-500 block text-[10px]">
                      Fornecedor:
                    </span>
                    <span className="font-extrabold text-scnavy">
                      {oc.fornecedorNome}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">
                      CNPJ / Chave PIX:
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {oc.fornecedorCNPJ}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">
                      Telefone / Contato:
                    </span>
                    <span className="font-bold text-slate-800">
                      {oc.fornecedorFone}
                    </span>
                  </div>
                </div>

                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-scnavy text-[10px] uppercase border-b border-slate-200">
                      <th className="py-2 px-3 w-12">#</th>
                      <th className="py-2 px-3">Descrição do Insumo / Material</th>
                      <th className="py-2 px-3 w-24 text-center">Qtd</th>
                      <th className="py-2 px-3 w-32 text-right">R$ Unit.</th>
                      <th className="py-2 px-3 w-32 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {oc.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-mono text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-800">
                          {it.desc}
                        </td>
                        <td className="py-2 px-3 text-center font-mono">
                          {numBR(it.qty)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono tabular-nums">
                          {brl(it.unitPrice)}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-scnavy font-mono tabular-nums">
                          {brl(it.qty * it.unitPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-slate-200 text-xs font-bold">
                      <td colSpan={4} className="py-1.5 px-3 text-right">
                        Subtotal:
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono tabular-nums">
                        {brl(subtotal)}
                      </td>
                    </tr>
                    <tr className="text-xs font-bold text-amber-800">
                      <td colSpan={4} className="py-1.5 px-3 text-right">
                        Desconto Negociado:
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono tabular-nums">
                        - {brl(desconto)}
                      </td>
                    </tr>
                    <tr className="border-t border-slate-300 bg-emerald-50 text-xs font-extrabold text-emerald-900">
                      <td colSpan={4} className="py-2 px-3 text-right">
                        VALOR FINAL DA O.C.:
                      </td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums">
                        {brl(valorFinal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
