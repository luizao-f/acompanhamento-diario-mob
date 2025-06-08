import { useEffect, useState } from 'react';
// Altere para sua fonte real de dados
import { BillingData } from '@/lib/menstruationForecastUtils';

// Exemplo com mock, troque pelo fetch real do Supabase/Backend
export function useMenstruationHistory() {
  const [history, setHistory] = useState<BillingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Troque por seu fetch real
    // Exemplo:
    // supabase.from('menstruation').select('*').then(...)
    setTimeout(() => {
      setHistory([
        // Exemplo: { date: '2025-01-05', menstruacao: 'forte' }, ...
      ]);
      setLoading(false);
    }, 800);
  }, []);

  return { history, loading };
}