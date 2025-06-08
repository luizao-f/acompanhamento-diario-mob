import React, { useState, useMemo } from 'react';
import {
  format,
  addDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  differenceInDays,
  parseISO,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { calcCycleStats, getForecastedMenstruation } from '@/lib/menstruationForecastUtils';

type MenstruationEditType = 'suggested' | 'removed' | 'added';

interface MenstruationDayEdit {
  date: string; // yyyy-MM-dd
  type: MenstruationEditType;
}

interface BillingData {
  date: string;
  menstruacao?: string;
}

interface ForecastCalendarProps {
  history: BillingData[]; // Histórico dos dias já cadastrados
}

const range = (start: number, end: number): number[] =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

const ForecastCalendar: React.FC<ForecastCalendarProps> = ({ history }) => {
  // Estado
  const [learningMonths, setLearningMonths] = useState(6);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [edits, setEdits] = useState<MenstruationDayEdit[]>([]);

  // Cálculo dos dados
  const { avgDuration, avgCycle, historyCycles } = useMemo(
    () => calcCycleStats(history, learningMonths),
    [history, learningMonths]
  );

  // Último ciclo do histórico para basear previsão
  const lastCycleStart =
    historyCycles.length > 0 ? historyCycles[historyCycles.length - 1].start : new Date();

  // Previsão dos próximos 6 ciclos
  const forecastCycles = useMemo(
    () => getForecastedMenstruation(lastCycleStart, avgCycle, avgDuration, 6),
    [lastCycleStart, avgCycle, avgDuration]
  );

  // Junta histórico e previsão em um map para lookup rápido
  const forecastMap: Record<string, 'suggested' | 'history'> = {};
  historyCycles.forEach((c) => {
    let d = c.start;
    while (d <= c.end) {
      forecastMap[format(d, 'yyyy-MM-dd')] = 'history';
      d = addDays(d, 1);
    }
  });
  forecastCycles.forEach((c) => {
    let d = c.start;
    while (d <= c.end) {
      const s = format(d, 'yyyy-MM-dd');
      if (!forecastMap[s]) forecastMap[s] = 'suggested';
      d = addDays(d, 1);
    }
  });

  // Dias do mês corrente
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysOfMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Aplica edições manuais
  const getDayStatus = (d: Date): MenstruationEditType | null => {
    const s = format(d, 'yyyy-MM-dd');
    const manual = edits.find((e) => e.date === s);
    if (manual) return manual.type;
    return forecastMap[s] === 'history'
      ? 'history'
      : forecastMap[s] === 'suggested'
      ? 'suggested'
      : null;
  };

  // Handler de edição de dia
  const handleDayClick = (d: Date) => {
    const s = format(d, 'yyyy-MM-dd');
    const status = getDayStatus(d);

    // Se é sugerido, ao clicar remove (vira branco + barra laranja)
    if (status === 'suggested')
      setEdits((ed) => [...ed, { date: s, type: 'removed' }]);
    // Se é removido manual, ao clicar volta pra sugerido
    else if (status === 'removed')
      setEdits((ed) => ed.filter((e) => e.date !== s));
    // Se não era nada ou removido, ao clicar adiciona (vira vermelho + barra preta)
    else if (status === null)
      setEdits((ed) => [...ed, { date: s, type: 'added' }]);
    // Se era adicionado manual, ao clicar remove edição (volta ao padrão)
    else if (status === 'added')
      setEdits((ed) => ed.filter((e) => e.date !== s));
    // Se é histórico, não permite editar
  };

  // Insights do mês
  const insights = useMemo(() => {
    let menstruationDays = 0;
    let antecipated = 0;
    let delayed = 0;
    daysOfMonth.forEach((d) => {
      const status = getDayStatus(d);
      if (status === 'history' || status === 'suggested' || status === 'added') {
        menstruationDays++;
      }
      if (status === 'added') antecipated++;
      if (status === 'removed') delayed++;
    });
    return {
      menstruationDays,
      antecipated,
      delayed,
    };
  }, [daysOfMonth, edits]);

  // Navegação
  const goPrev = () => setCurrentMonth((m) => subMonths(m, 1));
  const goNext = () => setCurrentMonth((m) => addMonths(m, 1));
  const goToday = () => setCurrentMonth(startOfMonth(new Date()));

  return (
    <div className="max-w-2xl mx-auto p-2">
      {/* Aprendizado retroativo */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="text-xs opacity-60">Aprender padrão dos últimos:</span>
        <select
          className="text-xs border rounded p-1"
          value={learningMonths}
          onChange={(e) => setLearningMonths(Number(e.target.value))}
        >
          {range(1, 24).map((m) => (
            <option key={m} value={m}>
              {m} {m === 1 ? 'mês' : 'meses'}
            </option>
          ))}
        </select>
        <span className="text-xs opacity-40">(usado para sugerir próximos 6 meses)</span>
      </div>

      {/* Navegação */}
      <div className="flex items-center justify-between mb-2">
        <button className="rounded p-1 hover:bg-gray-100" onClick={goPrev}>
          <ChevronLeft size={18} /> <span className="sr-only">Anterior</span>
        </button>
        <div className="flex-1 flex justify-center items-center gap-2">
          <button
            className="px-2 py-1 rounded bg-gray-100 text-xs hover:bg-gray-200"
            onClick={goToday}
          >
            Hoje
          </button>
          <span className="font-semibold">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </span>
        </div>
        <button className="rounded p-1 hover:bg-gray-100" onClick={goNext}>
          <ChevronRight size={18} /> <span className="sr-only">Próximo</span>
        </button>
      </div>

      {/* Semana */}
      <div className="grid grid-cols-7 bg-gray-50 rounded-t">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
          <div key={d} className="p-2 text-center text-xs font-medium text-gray-600">
            {d}
          </div>
        ))}
      </div>
      {/* Dias */}
      <div className="grid grid-cols-7 border-b border-l border-r rounded-b overflow-hidden">
        {Array.from({ length: daysOfMonth[0].getDay() }).map((_, i) => (
          <div key={`empty-start-${i}`} />
        ))}
        {daysOfMonth.map((d) => {
          const status = getDayStatus(d);
          const today = isSameDay(d, new Date());
          const canEdit = status !== 'history';

          // Visual
          let bg = '';
          let text = '';
          let bar = '';
          if (status === 'history' || status === 'suggested') {
            bg = 'bg-red-100';
            text = 'text-red-900';
            bar = 'bg-red-600';
          }
          if (status === 'removed') {
            bg = 'bg-white';
            text = 'text-gray-700';
            bar = 'bg-orange-400';
          }
          if (status === 'added') {
            bg = 'bg-red-100';
            text = 'text-red-900';
            bar = 'bg-black';
          }

          return (
            <div
              key={d.toISOString()}
              onClick={() => canEdit && handleDayClick(d)}
              className={cn(
                'h-16 flex flex-col items-center justify-between border-r border-b relative group transition cursor-pointer select-none',
                bg,
                text,
                today && 'ring-2 ring-blue-400 ring-inset'
              )}
            >
              <span className="mt-1 text-xs">{format(d, 'd')}</span>
              {bar && (
                <span
                  className={cn(
                    'absolute bottom-1 left-2 right-2 h-2 rounded-full opacity-80 pointer-events-none transition-all',
                    bar
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Insights */}
      <div className="mt-3 p-3 bg-gray-50 rounded shadow-sm text-xs text-gray-700">
        <strong className="block mb-1 text-gray-900 text-sm">Insights do mês</strong>
        <div>Dias menstruados: <b>{insights.menstruationDays}</b></div>
        <div>
          Dias de atraso/antecipação:{" "}
          <b>
            {insights.antecipated > 0 && (
              <span className="text-black">{insights.antecipated} antecipação</span>
            )}
            {insights.delayed > 0 && (
              <>
                {insights.antecipated > 0 && " e "}
                <span className="text-orange-500">{insights.delayed} atraso</span>
              </>
            )}
            {(insights.antecipated === 0 && insights.delayed === 0) && "nenhum"}
          </b>
        </div>
        <div className="mt-1 text-gray-500">
          Média do ciclo: <b>{avgCycle} dias</b> - Média de menstruação: <b>{avgDuration} dias</b>
        </div>
      </div>
    </div>
  );
};

export default ForecastCalendar;