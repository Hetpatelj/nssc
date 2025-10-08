
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUser, initializeFirebase } from '@/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';


interface AppliedCourse {
  id: string;
  applicationId: string;
  courseCategory: string;
  lastUpdated: string;
  amount: string;
  date: string;
  status: 'Pending' | 'Appointment Booked' | 'Verified' | 'Rejected' | 'Refill Required';
  appointmentDate?: string;
}

export default function ApplyForRegistrationPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const { firestore } = initializeFirebase();
  const { toast } = useToast();

  const [appliedCourses, setAppliedCourses] = useState<AppliedCourse[]>([]);
  const [registrationYear, setRegistrationYear] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user && firestore) {
        const userDocRef = doc(firestore, 'users', user.uid);
        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data().appliedCourses) {
                setAppliedCourses(docSnap.data().appliedCourses);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    } else if (!userLoading) {
        setLoading(false);
    }
  }, [user, firestore, userLoading]);
  
  const updateCoursesInFirestore = async (courses: AppliedCourse[]) => {
      if (!user || !firestore) return;
      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        await setDoc(userDocRef, { appliedCourses: courses }, { merge: true });
        // No need to setAppliedCourses here, onSnapshot will do it.
      } catch (error) {
          console.error("Failed to update courses in Firestore:", error);
          toast({
              variant: 'destructive',
              title: 'Database Error',
              description: 'Could not save changes to the database.'
          })
      }
  }

  const handleApplyCourse = async () => {
    if (!registrationYear) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a registration year.',
      });
      return;
    }
   
    const newCourse: AppliedCourse = {
      id: `app-${Date.now()}`,
      applicationId: `202509C329110/CC/${registrationYear.split('-')[0]}/${(
        appliedCourses.length + 1
      )
        .toString()
        .padStart(2, '0')}`,
      courseCategory: 'National Skill Sector Council',
      lastUpdated: new Date().toLocaleString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
      }),
      amount: '2000.00',
      date: new Date().toLocaleDateString(),
      status: 'Pending',
    };

    const updatedCourses = [...appliedCourses, newCourse];
    await updateCoursesInFirestore(updatedCourses);

    toast({
        title: 'Application Added',
        description: 'Your new course application has been successfully added.',
    });
  };
  
  const handleOpenAppointmentPage = (courseId: string) => {
    router.push(`/candidate/appointment?applicationId=${courseId}`);
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
      const year = currentYear + i;
      years.push(`${year}-${(year + 1).toString().slice(-2)}`);
    }
    return years;
  };
  const yearOptions = generateYearOptions();
  
  const getStatusVariant = (status: AppliedCourse['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Verified':
      case 'Appointment Booked':
        return 'default';
      case 'Pending':
        return 'secondary';
      case 'Rejected':
      case 'Refill Required':
        return 'destructive';
      default:
        return 'outline';
    }
  };


  if (loading || userLoading) {
      return (
          <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      )
  }

  return (
    <>
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 font-ui space-y-8">
      <Card>
        <CardHeader className="bg-gray-600 text-white rounded-t-lg p-3">
          <CardTitle className="text-lg">Application for Registration</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div className="space-y-2">
              <Label htmlFor="admission-session">Registration Year</Label>
              <Select onValueChange={setRegistrationYear} value={registrationYear}>
                <SelectTrigger id="admission-session">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-category">Course Type</Label>
              <Input
                id="course-category"
                value="National Skill Sector Council"
                readOnly
                className="bg-gray-100"
              />
            </div>
          </div>
          <div className="flex justify-start pt-4">
            <Button
              onClick={handleApplyCourse}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Add New Application
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-gray-600 text-white rounded-t-lg p-3">
          <CardTitle className="text-lg">Your Applications</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {appliedCourses.length === 0 ? (
            <p className="text-center text-gray-500">No applications found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sr. No.</TableHead>
                    <TableHead>Application ID</TableHead>
                    <TableHead>Course Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appliedCourses.map((course, index) => {
                    const isBookingDisabled = course.status === 'Appointment Booked' || course.status === 'Verified' || course.status === 'Rejected';
                    const appointmentButtonText = () => {
                        if (course.status === 'Appointment Booked') return `Booked: ${new Date(course.appointmentDate!).toLocaleDateString()}`;
                        if (course.status === 'Refill Required') return 'Re-book Appointment';
                        return 'Book Appointment';
                    }

                    return (
                        <TableRow key={course.id}>
                        <TableCell>{index + 1}.</TableCell>
                        <TableCell>{course.applicationId}</TableCell>
                        <TableCell>{course.courseCategory}</TableCell>
                        <TableCell>₹{course.amount}</TableCell>
                        <TableCell>{course.date}</TableCell>
                        <TableCell>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleOpenAppointmentPage(course.id)}
                                disabled={isBookingDisabled}
                            >
                              {appointmentButtonText()}
                            </Button>
                        </TableCell>
                        <TableCell>
                            <Link href="/candidate/payment-confirmation">
                            <Button variant="destructive" size="sm">
                                Pay Fees
                            </Button>
                            </Link>
                        </TableCell>
                        <TableCell>
                           <Badge variant={getStatusVariant(course.status)}>
                                {course.status}
                            </Badge>
                        </TableCell>
                        </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
