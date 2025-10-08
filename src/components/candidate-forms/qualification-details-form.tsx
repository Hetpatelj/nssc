
'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { StepButtons } from './step-buttons';
import { Trash2, CalendarIcon } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';


const qualificationEntrySchema = z.object({
  examination: z.string().min(1, 'Examination is required'),
  boardUniversity: z.string().min(1, 'Board/University is required'),
  schoolCollege: z.string().min(1, 'School/College is required'),
  passingMonthYear: z.date({ required_error: 'Passing date is required.' }),
  result: z.enum(['Pass', 'Fail']),
  mode: z.enum(['Regular', 'Distance', 'Part-Time']),
  marksSystem: z.enum(['Marks', 'Grade', 'CGPA']),
  marksObtained: z.string().optional(),
  outOfMarks: z.string().optional(),
  cgpa: z.string().optional(),
  percentage: z.string().min(1, 'Percentage is required'),
  classGrade: z.string().min(1, 'Class/Grade is required'),
});

type QualificationEntry = z.infer<typeof qualificationEntrySchema>;

const qualificationSchema = z.object({
  qualifications: z.array(qualificationEntrySchema),
});

type QualificationFormValues = z.infer<typeof qualificationSchema>;

interface QualificationDetailsFormProps {
  userData: any;
  onNext: (data: QualificationFormValues) => void;
  onBack: () => void;
}

const getGradeFromPercentage = (percentage: number): string => {
    if (isNaN(percentage)) return '';
    if (percentage >= 80) return 'First Class';
    if (percentage >= 60) return 'Second Class';
    if (percentage >= 40) return 'Third Class';
    return 'Fail';
}

export function QualificationDetailsForm({
  userData,
  onNext,
  onBack,
}: QualificationDetailsFormProps) {
  const [qualifications, setQualifications] = useState<QualificationEntry[]>(userData.qualifications || []);

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<QualificationEntry>({
    resolver: zodResolver(qualificationEntrySchema),
    defaultValues: {
      examination: '',
      boardUniversity: '',
      schoolCollege: '',
      passingMonthYear: undefined,
      result: 'Pass',
      mode: 'Regular',
      marksSystem: 'Marks',
      marksObtained: '',
      outOfMarks: '',
      cgpa: '',
      percentage: '',
      classGrade: '',
    },
  });

  const marksObtained = watch('marksObtained');
  const outOfMarks = watch('outOfMarks');
  const cgpa = watch('cgpa');
  const percentage = watch('percentage');
  const marksSystem = watch('marksSystem');

  useEffect(() => {
    let calculatedPercentage: number | null = null;
    if (marksSystem === 'Marks' && marksObtained && outOfMarks) {
        const obtained = parseFloat(marksObtained);
        const outOf = parseFloat(outOfMarks);
        if (!isNaN(obtained) && !isNaN(outOf) && outOf > 0) {
            calculatedPercentage = (obtained / outOf) * 100;
            setValue('percentage', calculatedPercentage.toFixed(2));
        }
    } else if (marksSystem === 'CGPA' && cgpa) {
         const cgpaValue = parseFloat(cgpa);
         if (!isNaN(cgpaValue)) {
             calculatedPercentage = cgpaValue * 9.5;
             setValue('percentage', calculatedPercentage.toFixed(2));
         }
    } else if (marksSystem === 'Grade' && percentage) {
        calculatedPercentage = parseFloat(percentage);
    }
    
    if (calculatedPercentage !== null) {
        setValue('classGrade', getGradeFromPercentage(calculatedPercentage));
    }
  }, [marksObtained, outOfMarks, cgpa, marksSystem, percentage, setValue]);
  
  const handleAddQualification = (data: QualificationEntry) => {
    const newQualifications = [...qualifications, data];
    setQualifications(newQualifications);
    reset();
  };

  const handleRemoveQualification = (index: number) => {
    const newQualifications = qualifications.filter((_, i) => i !== index);
    setQualifications(newQualifications);
  };

  const onFinalSubmit = () => {
    onNext({ qualifications });
  };
  
  return (
    <Card>
        <CardHeader>
            <CardTitle className="text-lg font-bold text-primary">Qualification Details (SSC & Above)</CardTitle>
        </CardHeader>
        <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); onFinalSubmit(); }}>
                <div className="space-y-6 border-b pb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Examination *</Label>
                            <Controller name="examination" control={control} render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger><SelectValue placeholder="Select Examination" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SSC">SSC</SelectItem>
                                        <SelectItem value="HSC">HSC</SelectItem>
                                        <SelectItem value="Diploma">Diploma</SelectItem>
                                        <SelectItem value="Advanced Diploma">Advanced Diploma</SelectItem>
                                        <SelectItem value="Degree">Degree</SelectItem>
                                        <SelectItem value="Master Degree">Master Degree</SelectItem>
                                        <SelectItem value="Post Graduation Diploma">Post Graduation Diploma</SelectItem>
                                    </SelectContent>
                                </Select>
                            )} />
                            {errors.examination && <p className="text-sm text-destructive">{errors.examination.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Board/University *</Label>
                            <Controller name="boardUniversity" control={control} render={({ field }) => <Input {...field} />} />
                            {errors.boardUniversity && <p className="text-sm text-destructive">{errors.boardUniversity.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>School/College Name *</Label>
                            <Controller name="schoolCollege" control={control} render={({ field }) => <Input {...field} />} />
                            {errors.schoolCollege && <p className="text-sm text-destructive">{errors.schoolCollege.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label>Passing Date *</Label>
                            <Controller
                                name="passingMonthYear"
                                control={control}
                                render={({ field }) => (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                            variant={'outline'}
                                            className={cn(
                                                'w-full justify-start text-left font-normal',
                                                !field.value && 'text-muted-foreground'
                                            )}
                                            >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                initialFocus
                                                captionLayout="dropdown-buttons"
                                                fromYear={1950}
                                                toYear={new Date().getFullYear()}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            />
                            {errors.passingMonthYear && <p className="text-sm text-destructive">{errors.passingMonthYear.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Result *</Label>
                            <Controller name="result" control={control} render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pass">Pass</SelectItem>
                                        <SelectItem value="Fail">Fail</SelectItem>
                                    </SelectContent>
                                </Select>
                            )} />
                        </div>
                        <div className="space-y-2">
                            <Label>Mode *</Label>
                            <Controller name="mode" control={control} render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Regular">Regular</SelectItem>
                                        <SelectItem value="Distance">Distance</SelectItem>
                                        <SelectItem value="Part-Time">Part Time</SelectItem>
                                    </SelectContent>
                                </Select>
                            )} />
                        </div>
                        <div className="space-y-2">
                            <Label>Marks System *</Label>
                            <Controller name="marksSystem" control={control} render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Marks">Marks</SelectItem>
                                        <SelectItem value="Grade">Grade</SelectItem>
                                        <SelectItem value="CGPA">CGPA</SelectItem>
                                    </SelectContent>
                                </Select>
                            )} />
                        </div>
                        
                        {marksSystem === 'Marks' && (
                            <>
                                <div className="space-y-2">
                                    <Label>Marks Obtained *</Label>
                                    <Controller name="marksObtained" control={control} render={({ field }) => <Input {...field} type="number" />} />
                                    {errors.marksObtained && <p className="text-sm text-destructive">{errors.marksObtained.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Out of Marks *</Label>
                                    <Controller name="outOfMarks" control={control} render={({ field }) => <Input {...field} type="number" />} />
                                    {errors.outOfMarks && <p className="text-sm text-destructive">{errors.outOfMarks.message}</p>}
                                </div>
                            </>
                        )}

                        {marksSystem === 'CGPA' && (
                             <div className="space-y-2">
                                <Label>CGPA Obtained *</Label>
                                <Controller name="cgpa" control={control} render={({ field }) => <Input {...field} type="number" step="0.01" />} />
                                {errors.cgpa && <p className="text-sm text-destructive">{errors.cgpa.message}</p>}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Percentage *</Label>
                            <Controller name="percentage" control={control} render={({ field }) => <Input {...field} readOnly={marksSystem !== 'Grade'} type="number" step="0.01" />} />
                            {errors.percentage && <p className="text-sm text-destructive">{errors.percentage.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Class/Grade *</Label>
                            <Controller name="classGrade" control={control} render={({ field }) => <Input {...field} readOnly />} />
                            {errors.classGrade && <p className="text-sm text-destructive">{errors.classGrade.message}</p>}
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button type="button" onClick={handleSubmit(handleAddQualification)}>Add</Button>
                    </div>
                </div>
                
                <div className="mt-6">
                    <h3 className="font-semibold mb-4">Added Qualifications</h3>
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Examination</TableHead>
                                    <TableHead>Board/University</TableHead>
                                    <TableHead>Passing Date</TableHead>
                                    <TableHead>Percentage</TableHead>
                                    <TableHead>Class/Grade</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {qualifications.map((qual, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{qual.examination}</TableCell>
                                        <TableCell>{qual.boardUniversity}</TableCell>
                                        <TableCell>{qual.passingMonthYear ? format(new Date(qual.passingMonthYear), 'PPP') : '-'}</TableCell>
                                        <TableCell>{qual.percentage}%</TableCell>
                                        <TableCell>{qual.classGrade}</TableCell>
                                        <TableCell>
                                            <Button variant="destructive" size="icon" onClick={() => handleRemoveQualification(index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {qualifications.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center">No qualifications added yet.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <StepButtons onReset={() => setQualifications([])} onBack={onBack} />
            </form>
        </CardContent>
    </Card>
  );
}
