
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getBillingData, saveBillingData } from '@/lib/supabase';

interface DayFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDay: Date | null;
}

const DayFormModal: React.FC<DayFormModalProps> = ({ isOpen, onClose, selectedDay }) => {
  const [sensacao, setSensacao] = useState<string[]>([]);
  const [muco, setMuco] = useState<string[]>([]);
  const [relacaoSexual, setRelacaoSexual] = useState(false);
  const [menstruacao, setMenstruacao] = useState('sem_sangramento');
  const [observacoes, setObservacoes] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const dayString = selectedDay ? format(selectedDay, 'yyyy-MM-dd') : '';
  
  const { data: existingData } = useQuery({
    queryKey: ['billing', dayString],
    queryFn: () => getBillingData(dayString),
    enabled: !!dayString,
  });

  useEffect(() => {
    if (existingData) {
      setSensacao(existingData.sensacao || []);
      setMuco(existingData.muco || []);
      setRelacaoSexual(existingData.relacao_sexual || false);
      setMenstruacao(existingData.menstruacao || 'sem_sangramento');
      setObservacoes(existingData.observacoes || '');
    } else {
      // Reset form when no existing data
      setSensacao([]);
      setMuco([]);
      setRelacaoSexual(false);
      setMenstruacao('sem_sangramento');
      setObservacoes('');
    }
  }, [existingData, selectedDay]);

  const handleSensacaoChange = (value: string, checked: boolean) => {
    if (checked) {
      setSensacao([...sensacao, value]);
    } else {
      setSensacao(sensacao.filter(s => s !== value));
    }
  };

  const handleMucoChange = (value: string, checked: boolean) => {
    if (checked) {
      setMuco([...muco, value]);
    } else {
      setMuco(muco.filter(m => m !== value));
    }
  };

  const handleSave = async () => {
    if (!selectedDay) return;

    const data = {
      date: dayString,
      sensacao,
      muco,
      relacao_sexual: relacaoSexual,
      menstruacao,
      observacoes,
    };

    try {
      await saveBillingData(data);
      queryClient.invalidateQueries({ queryKey: ['billing'] });
      toast({
        title: "Dados salvos com sucesso!",
        description: `Registro do dia ${format(selectedDay, 'dd/MM/yyyy')} atualizado.`,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar os dados. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (!selectedDay) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {format(selectedDay, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sensação */}
          <div>
            <Label className="text-base font-medium">Sensação</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {['seca', 'umida', 'pegajosa', 'escorregadia'].map((item) => (
                <div key={item} className="flex items-center space-x-2">
                  <Checkbox
                    id={`sensacao-${item}`}
                    checked={sensacao.includes(item)}
                    onCheckedChange={(checked) => handleSensacaoChange(item, !!checked)}
                  />
                  <Label htmlFor={`sensacao-${item}`} className="text-sm capitalize">
                    {item.replace('_', ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Muco */}
          <div>
            <Label className="text-base font-medium">Muco</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {['nenhum', 'pegajoso', 'espesso', 'branco', 'elastico', 'transparente', 'clara_de_ovo'].map((item) => (
                <div key={item} className="flex items-center space-x-2">
                  <Checkbox
                    id={`muco-${item}`}
                    checked={muco.includes(item)}
                    onCheckedChange={(checked) => handleMucoChange(item, !!checked)}
                  />
                  <Label htmlFor={`muco-${item}`} className="text-sm capitalize">
                    {item.replace('_', ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Relação Sexual */}
          <div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="relacao-sexual"
                checked={relacaoSexual}
                onCheckedChange={(checked) => setRelacaoSexual(!!checked)}
              />
              <Label htmlFor="relacao-sexual" className="text-base font-medium">
                Relação Sexual
              </Label>
            </div>
          </div>

          {/* Menstruação */}
          <div>
            <Label className="text-base font-medium">Menstruação</Label>
            <Select value={menstruacao} onValueChange={setMenstruacao}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sem_sangramento">Sem sangramento</SelectItem>
                <SelectItem value="manchas">Manchas</SelectItem>
                <SelectItem value="forte">Forte</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="observacoes" className="text-base font-medium">
              Observações
            </Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Digite suas observações..."
              className="mt-2"
              rows={3}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DayFormModal;
