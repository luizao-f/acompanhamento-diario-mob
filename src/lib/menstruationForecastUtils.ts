import { addDays, differenceInDays, format, parseISO, subMonths, startOfMonth } from 'date-fns';

export interface BillingData {
  date: string;
  menstruacao?: string;
}

export function calcCycleStats(
  billingData: BillingData[],
  months: number
): { avgDuration: number; avgCycle: number; historyCycles: { start: Date; end: Date }[] } {
  // Filtra só o período dos últimos X meses
  const today = new Date();
  const historyStart = subMonths(today, months - 1);
  const filtered = billingData
    .filter((d) => parseISO(d.date) >= startOfMonth(historyStart))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Acha todos os primeiros dias de menstruação
  const starts = filtered.filter(
    (d, i, arr) =>
      (d.menstruacao === 'forte' || d.menstruacao === 'manchas') &&
      (i === 0 ||
        arr[i - 1].menstruacao !== 'forte' && arr[i - 1].menstruacao !== 'manchas')
  );

  // Calcula ciclos
  const cycles: { start: Date; end: Date }[] = [];
  for (let i = 0; i < starts.length - 1; i++) {
    const start = parseISO(starts[i].date);
    // Fim é o último dia antes do próximo início
    const nextStart = parseISO(starts[i + 1].date);
    let end = start;
    let d = start;
    while (
      d < nextStart &&
      filtered.find((x) => x.date === format(d, 'yyyy-MM-dd') && (x.menstruacao === 'forte' || x.menstruacao === 'manchas'))
    ) {
      end = d;
      d = addDays(d, 1);
    }
    cycles.push({ start, end });
  }
  // Último ciclo
  if (starts.length > 1) {
    const lastStart = parseISO(starts[starts.length - 1].date);
    let end = lastStart;
    let d = lastStart;
    while (
      filtered.find((x) => x.date === format(d, 'yyyy-MM-dd') && (x.menstruacao === 'forte' || x.menstruacao === 'manchas'))
    ) {
      end = d;
      d = addDays(d, 1);
    }
    cycles.push({ start: lastStart, end });
  }

  // Cálculo das médias
  const cycleLengths = cycles
    .slice(1)
    .map((c, i) => differenceInDays(c.start, cycles[i].start));
  const menstruationDurations = cycles.map((c) => differenceInDays(c.end, c.start) + 1);

  const avgCycle = Math.round(
    cycleLengths.length > 0
      ? cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length
      : 28
  );
  const avgDuration = Math.round(
    menstruationDurations.length > 0
      ? menstruationDurations.reduce((a, b) => a + b, 0) / menstruationDurations.length
      : 5
  );
  return { avgDuration, avgCycle, historyCycles: cycles };
}

export function getForecastedMenstruation(
  lastCycleStart: Date,
  avgCycle: number,
  avgDuration: number,
  months: number
): Array<{ start: Date; end: Date }> {
  // Gera os próximos 6 ciclos
  const cycles: Array<{ start: Date; end: Date }> = [];
  let start = addDays(lastCycleStart, avgCycle);
  for (let i = 0; i < months; i++) {
    const end = addDays(start, avgDuration - 1);
    cycles.push({ start, end });
    start = addDays(start, avgCycle);
  }
  return cycles;
}