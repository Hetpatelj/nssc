
'use client';

import { Suspense, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Upload, CheckCircle, X } from 'lucide-react';
import { addDays, format, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { FileUploadModal } from '@/components/file-upload-modal';
import { useUser, initializeFirebase } from '@/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const wizardSteps = [
    { id: 1, name: 'Details' },
    { id: 2, name: 'Uploads' },
    { id: 3, name: 'Confirm' }
];

const documents = [
    { id: 'aadhaar', label: 'Aadhaar Card' },
    { id: 'pan', label: 'PAN Card' },
    { id: 'ssc', label: '10th Marksheet' },
    { id: 'hsc', label: '12th Marksheet' },
    { id: 'tc', label: 'Transfer Certificate' },
    { id: 'photo', label: 'Passport Photo' },
]

// Mock data for available slots
const availableDates = [addDays(new Date(), 7), addDays(new Date(), 9), addDays(new Date(), 14)];
const timeSlotsByDate: Record<string, string[]> = {
    [format(availableDates[0], 'yyyy-MM-dd')]: ["10:00 AM - 11:00 AM", "11:00 AM - 12:00 PM", "02:00 PM - 03:00 PM"],
    [format(availableDates[1], 'yyyy-MM-dd')]: ["09:00 AM - 10:00 AM", "12:00 PM - 01:00 PM"],
    [format(availableDates[2], 'yyyy-MM-dd')]: ["10:00 AM - 11:00 AM", "01:00 PM - 02:00 PM", "03:00 PM - 04:00 PM"],
};


function AppointmentWizard() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useUser();
    const { firestore } = initializeFirebase();
    const { toast } = useToast();
    const applicationId = searchParams.get('applicationId');
    const [currentStep, setCurrentStep] = useState(1);
    const [dob, setDob] = useState<Date>();

    const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<Record<string, {name: string, url: string}>>({});
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [currentUploadDocId, setCurrentUploadDocId] = useState<string | null>(null);
    
    // State for Step 3
    const [appointmentDate, setAppointmentDate] = useState<Date | undefined>();
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
    const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

    const handleDocSelectChange = (docId: string, checked: boolean) => {
        setSelectedDocs(prev => 
            checked ? [...prev, docId] : prev.filter(id => id !== docId)
        );
    };

    const handleFileUpload = (file: {name: string, url: string}) => {
        if(currentUploadDocId) {
            setUploadedFiles(prev => ({
                ...prev,
                [currentUploadDocId]: file,
            }));
        }
        setCurrentUploadDocId(null);
    }
    
    const openUploadModal = (docId: string) => {
        setCurrentUploadDocId(docId);
        setIsUploadModalOpen(true);
    }
    
    const allDocsUploaded = selectedDocs.length > 0 && selectedDocs.every(docId => uploadedFiles[docId]);

    const handleDateSelect = (date: Date | undefined) => {
        if (!date) return;
        const isAvailable = availableDates.some(d => isSameDay(d, date));
        if (isAvailable) {
            setAppointmentDate(date);
            setSelectedTimeSlot(null); // Reset time slot when date changes
            setAvailableTimeSlots(timeSlotsByDate[format(date, 'yyyy-MM-dd')] || []);
        } else {
            setAppointmentDate(undefined);
            setAvailableTimeSlots([]);
        }
    }

    const handleProceedToPay = async () => {
        if (!user || !applicationId || !firestore || !appointmentDate) return;

        try {
            const userDocRef = doc(firestore, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                const appliedCourses = userData.appliedCourses || [];
                const courseIndex = appliedCourses.findIndex((c: any) => c.id === applicationId);

                if (courseIndex !== -1) {
                    appliedCourses[courseIndex].status = 'Appointment Booked';
                    appliedCourses[courseIndex].appointmentDate = appointmentDate.toISOString();
                    
                    const documentsToSave = Object.entries(uploadedFiles).map(([docId, file]) => ({
                        id: docId,
                        label: documents.find(d => d.id === docId)?.label || 'Document',
                        url: file.url,
                        name: file.name,
                        status: 'Pending',
                        uploadedAt: new Date().toISOString(),
                    }));

                    appliedCourses[courseIndex].documents = documentsToSave;

                    await updateDoc(userDocRef, { appliedCourses });
                    setShowPaymentSuccess(true);
                }
            }
        } catch (error) {
            console.error("Error booking appointment:", error);
            toast({
                variant: 'destructive',
                title: 'Booking Failed',
                description: 'Could not save the appointment. Please try again.',
            });
        }
    }

    const handleCloseSuccessPopup = () => {
        setShowPaymentSuccess(false);
        router.push('/candidate/apply');
    }


    return (
        <>
        <Card>
            <CardHeader>
                <CardTitle className="text-xl text-primary">
                    Appointment for Application: {applicationId}
                </CardTitle>
                 <div className="flex items-center justify-center pt-4">
                    <div className="flex items-center w-full max-w-md">
                    {wizardSteps.map((step, index) => (
                        <div key={step.id} className="flex items-center w-full">
                        <div className="flex flex-col items-center">
                            <div
                            className={cn(
                                'flex items-center justify-center w-10 h-10 rounded-full border-2 shrink-0',
                                step.id === currentStep
                                ? 'bg-primary text-white border-primary'
                                : 'bg-gray-200 border-gray-300',
                                step.id < currentStep ? 'bg-green-500 border-green-600 text-white' : ''
                            )}
                            >
                            {step.id}
                            </div>
                            <p className="text-xs mt-1 text-center">{step.name}</p>
                        </div>
                        {index < wizardSteps.length - 1 && (
                            <div
                            className={cn(
                                'flex-auto border-t-2',
                                step.id < currentStep ? 'border-green-500' : 'border-gray-300'
                            )}
                            ></div>
                        )}
                        </div>
                    ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {currentStep === 1 && (
                    <div className="space-y-6">
                        <h3 className="font-semibold text-lg">Step 1: Student Details & Document Selection</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Full Name *</Label>
                                <Input placeholder="Enter your full name" />
                            </div>
                             <div className="space-y-2">
                                <Label>Last Name *</Label>
                                <Input placeholder="Enter your last name" />
                            </div>
                             <div className="space-y-2">
                                <Label>Date of Birth *</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !dob && 'text-muted-foreground')}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {dob ? format(dob, 'PPP') : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dob} onSelect={setDob} initialFocus /></PopoverContent>
                                </Popover>
                            </div>
                             <div className="space-y-2">
                                <Label>Class / Course *</Label>
                                <Select>
                                    <SelectTrigger><SelectValue placeholder="Select Course" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="course1">National Skill Sector Council</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                              <div className="space-y-2">
                                <Label>Section *</Label>
                                <Select>
                                    <SelectTrigger><SelectValue placeholder="Select Section" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="a">Section A</SelectItem>
                                        <SelectItem value="b">Section B</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-semibold">Document Checklist *</h4>
                            <p className="text-sm text-muted-foreground">Select the documents you will be uploading.</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {documents.map(doc => (
                                    <div key={doc.id} className="flex items-center space-x-2">
                                        <Checkbox 
                                            id={doc.id} 
                                            onCheckedChange={(checked) => handleDocSelectChange(doc.id, checked as boolean)}
                                            checked={selectedDocs.includes(doc.id)}
                                        />
                                        <Label htmlFor={doc.id} className="font-normal">{doc.label}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={() => setCurrentStep(2)} disabled={selectedDocs.length === 0}>Next: Upload Documents</Button>
                        </div>
                    </div>
                )}

                 {currentStep === 2 && (
                    <div className="space-y-6">
                         <h3 className="font-semibold text-lg">Step 2: Document Upload</h3>
                         <p className="text-sm text-muted-foreground">
                            Please upload the documents you selected in the previous step.
                         </p>
                         <div className="space-y-4 rounded-md border p-4">
                            {selectedDocs.length > 0 ? (
                                selectedDocs.map(docId => {
                                    const doc = documents.find(d => d.id === docId);
                                    if (!doc) return null;

                                    return (
                                        <div key={docId} className="flex items-center justify-between">
                                            <Label htmlFor={docId} className="font-medium">{doc.label}</Label>
                                            <div className="flex items-center gap-2">
                                                <Button type="button" variant="outline" size="sm" onClick={() => openUploadModal(docId)}>
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    Upload
                                                </Button>
                                                {uploadedFiles[docId] && (
                                                    <span className="text-xs text-green-600">{uploadedFiles[docId].name}</span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <p className="text-center text-muted-foreground">No documents selected. Go back to select documents to upload.</p>
                            )}
                         </div>

                         <div className="flex justify-between mt-8">
                            <Button variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>
                             <Button onClick={() => setCurrentStep(3)} disabled={!allDocsUploaded}>Next</Button>
                        </div>
                    </div>
                 )}

                 {currentStep === 3 && (
                     <div className="space-y-6">
                         <h3 className="font-semibold text-lg">Step 3: Choose Appointment Slot & Confirm</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="font-medium">Select a Date</h4>
                                <Calendar
                                    mode="single"
                                    selected={appointmentDate}
                                    onSelect={handleDateSelect}
                                    disabled={(date) => date < new Date() && !isSameDay(date, new Date())}
                                    modifiers={{
                                        available: availableDates,
                                    }}
                                    modifiersStyles={{
                                        available: {
                                            color: 'hsl(var(--primary-foreground))',
                                            backgroundColor: 'hsl(var(--primary))',
                                        },
                                    }}
                                    className="rounded-md border justify-center flex"
                                />
                                <p className="text-xs text-muted-foreground text-center">Dates in green are available.</p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-medium">Select a Time Slot</h4>
                                {appointmentDate ? (
                                    availableTimeSlots.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-2">
                                            {availableTimeSlots.map(slot => (
                                                <Button 
                                                    key={slot}
                                                    variant={selectedTimeSlot === slot ? 'default' : 'outline'}
                                                    onClick={() => setSelectedTimeSlot(slot)}
                                                >
                                                    {slot}
                                                </Button>
                                            ))}
                                        </div>
                                    ) : (
                                         <p className="text-sm text-muted-foreground text-center pt-8">No time slots available for this date.</p>
                                    )
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center pt-8">Please select an available date to see time slots.</p>
                                )}
                            </div>
                         </div>
                          <div className="flex justify-between items-center mt-8">
                            <Button variant="outline" onClick={() => setCurrentStep(2)}>Back</Button>
                            {selectedTimeSlot && (
                                <Button onClick={handleProceedToPay} className="bg-accent hover:bg-accent/90">Proceed to Pay</Button>
                            )}
                        </div>
                    </div>
                 )}
            </CardContent>
        </Card>
        
        {currentUploadDocId && (
            <FileUploadModal 
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                title={`Upload ${documents.find(d => d.id === currentUploadDocId)?.label}`}
                onFileUpload={handleFileUpload}
            />
        )}
        
        {showPaymentSuccess && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-xl p-8 text-center flex flex-col items-center relative">
                    <button onClick={handleCloseSuccessPopup} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">
                        <X size={20} />
                    </button>
                    <CheckCircle className="text-green-500 h-16 w-16 mb-4" />
                    <h3 className="text-xl font-bold text-gray-800">Thank you for payment</h3>
                </div>
            </div>
        )}
        </>
    )
}

export default function AppointmentPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Suspense fallback={<div>Loading...</div>}>
        <AppointmentWizard />
      </Suspense>
    </div>
  );
}
