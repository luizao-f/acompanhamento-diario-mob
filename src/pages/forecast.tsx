import ForecastCalendar from '@/components/ForecastCalendar';
import { useMenstruationHistory } from '@/hooks/useMenstruationHistory';

export default function ForecastPage() {
  // Hook para buscar histórico real do supabase/backend
  const { history, loading } = useMenstruationHistory();

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-4">Previsão de Menstruação</h1>
      {loading ? (
        <div>Carregando...</div>
      ) : (
        <ForecastCalendar history={history} />
      )}
    </main>
  );
}