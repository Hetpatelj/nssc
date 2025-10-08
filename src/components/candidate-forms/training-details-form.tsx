
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { StepButtons } from './step-buttons';

const trainingSchema = z.object({
  completedTraining: z.enum(['Yes', 'No']),
});

type TrainingFormValues = z.infer<typeof trainingSchema>;

interface TrainingDetailsFormProps {
  userData: any;
  onNext: (data: TrainingFormValues) => void;
  onBack: () => void;
}

export function TrainingDetailsForm({
  userData,
  onNext,
  onBack,
}: TrainingDetailsFormProps) {
  const {
    control,
    handleSubmit,
    reset,
  } = useForm<TrainingFormValues>({
    resolver: zodResolver(trainingSchema),
    defaultValues: {
      completedTraining: userData.completedTraining || 'No',
    },
  });

  const onSubmit = (data: TrainingFormValues) => {
    onNext(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold text-primary">
          Training Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label>Have you completed any training? *</Label>
            <Controller
              name="completedTraining"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex items-center gap-4 pt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Yes" id="training-yes" />
                    <Label htmlFor="training-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No" id="training-no" />
                    <Label htmlFor="training-no">No</Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>
          <StepButtons onReset={() => reset()} onBack={onBack} />
        </form>
      </CardContent>
    </Card>
  );
}
