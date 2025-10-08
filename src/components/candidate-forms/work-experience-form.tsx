
'use client';

import { useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { StepButtons } from './step-buttons';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

const experienceSchema = z.object({
    organization: z.string().min(1, "Organization is required"),
    designation: z.string().min(1, "Designation is required"),
    from: z.string().min(1, "Start date is required"),
    to: z.string().min(1, "End date is required"),
});

const workExperienceSchema = z.object({
  hasWorkExperience: z.enum(['Yes', 'No']),
  experiences: z.array(experienceSchema),
});

type ExperienceEntry = z.infer<typeof experienceSchema>;
type WorkExperienceFormValues = z.infer<typeof workExperienceSchema>;

interface WorkExperienceFormProps {
  userData: any;
  onNext: (data: WorkExperienceFormValues) => void;
  onBack: () => void;
}

export function WorkExperienceForm({
  userData,
  onNext,
  onBack,
}: WorkExperienceFormProps) {
  const [newExperience, setNewExperience] = useState<ExperienceEntry>({
    organization: '',
    designation: '',
    from: '',
    to: '',
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
  } = useForm<WorkExperienceFormValues>({
    resolver: zodResolver(workExperienceSchema),
    defaultValues: {
      hasWorkExperience: userData.hasWorkExperience || 'No',
      experiences: userData.experiences || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'experiences',
  });

  const hasWorkExperience = watch('hasWorkExperience');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewExperience(prev => ({ ...prev, [name]: value }));
  };

  const handleAddExperience = () => {
    // Basic validation before adding
    if (newExperience.organization && newExperience.designation && newExperience.from && newExperience.to) {
        append(newExperience);
        setNewExperience({ organization: '', designation: '', from: '', to: '' }); // Reset form
    } else {
        // Optionally, show a toast message for incomplete fields
        console.warn("Please fill all fields for the new experience.");
    }
  };

  const onSubmit = (data: WorkExperienceFormValues) => {
    onNext(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold text-primary">
          Work Experience
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label>Do you have work experience? *</Label>
            <Controller
              name="hasWorkExperience"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={(value) => {
                    field.onChange(value);
                    if (value === 'No') {
                      // Clear experiences if user selects No
                      setValue('experiences', []);
                    }
                  }}
                  defaultValue={field.value}
                  className="flex items-center gap-4 pt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Yes" id="experience-yes" />
                    <Label htmlFor="experience-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No" id="experience-no" />
                    <Label htmlFor="experience-no">No</Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>

          {hasWorkExperience === 'Yes' && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold">Add Experience</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <Input 
                    placeholder="Organization" 
                    name="organization"
                    value={newExperience.organization}
                    onChange={handleInputChange}
                />
                <Input 
                    placeholder="Designation"
                    name="designation"
                    value={newExperience.designation}
                    onChange={handleInputChange}
                />
                <div className="space-y-1">
                    <Label className='text-xs'>From</Label>
                    <Input 
                        type="date" 
                        name="from"
                        value={newExperience.from}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="space-y-1">
                    <Label className='text-xs'>To</Label>
                    <Input 
                        type="date"
                        name="to"
                        value={newExperience.to}
                        onChange={handleInputChange}
                    />
                </div>
                <Button type="button" onClick={handleAddExperience}>Add</Button>
              </div>
              
              <div className="mt-6">
                    <h3 className="font-semibold mb-4">Added Experience</h3>
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Organization</TableHead>
                                    <TableHead>Designation</TableHead>
                                    <TableHead>From</TableHead>
                                    <TableHead>To</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fields.map((field, index) => (
                                    <TableRow key={field.id}>
                                        <TableCell>{watch(`experiences.${index}.organization`)}</TableCell>
                                        <TableCell>{watch(`experiences.${index}.designation`)}</TableCell>
                                        <TableCell>{watch(`experiences.${index}.from`)}</TableCell>
                                        <TableCell>{watch(`experiences.${index}.to`)}</TableCell>
                                        <TableCell>
                                            <Button variant="destructive" size="icon" onClick={() => remove(index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {fields.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center">No experience added yet.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
          )}

          <StepButtons onReset={() => reset()} onBack={onBack} />
        </form>
      </CardContent>
    </Card>
  );
}
