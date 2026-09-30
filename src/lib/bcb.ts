import "server-only";

// Série 12 do SGS/Banco Central: taxa diária de CDI (% ao dia), a mesma
// fonte de dados aberta que qualquer ferramenta financeira séria usa para
// CDI real (não uma taxa fixa chutada). https://api.bcb.gov.br/dados/serie
const SERIE_CDI_DIARIO = 12;

function paraDataBCB(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

// Retorna o percentual acumulado do CDI entre duas datas (inclusive),
// compondo a taxa diária publicada pelo Bacen. Datas futuras ou sem dados
// ainda publicados simplesmente não entram na composição.
export async function cdiAcumulado(dataInicial: string, dataFinal: string): Promise<number | null> {
  if (dataInicial >= dataFinal) return 0;

  try {
    const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_CDI_DIARIO}/dados?dataInicial=${paraDataBCB(dataInicial)}&dataFinal=${paraDataBCB(dataFinal)}&formato=json`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;

    const serie: { data: string; valor: string }[] = await res.json();
    if (!Array.isArray(serie) || serie.length === 0) return null;

    const fator = serie.reduce((acc, ponto) => {
      const taxaDia = parseFloat(ponto.valor.replace(",", "."));
      if (isNaN(taxaDia)) return acc;
      return acc * (1 + taxaDia / 100);
    }, 1);

    return (fator - 1) * 100;
  } catch (err) {
    console.warn("[bcb] falha ao buscar CDI:", err);
    return null;
  }
}
