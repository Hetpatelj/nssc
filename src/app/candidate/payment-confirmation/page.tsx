
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser, initializeFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState, Suspense } from 'react';

const DetailRow = ({ label, value }: { label: string; value: string | undefined }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 border-b last:border-b-0 px-6">
    <p className="text-md font-medium text-gray-600 w-full sm:w-1/3">{label}:</p>
    <p className="text-md font-semibold text-gray-800 w-full sm:w-2/3 mt-1 sm:mt-0">{value || '-'}</p>
  </div>
);

function PaymentConfirmationContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading: userLoading } = useUser();
    const { firestore } = initializeFirebase();
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && firestore) {
            const fetchUserData = async () => {
                const docRef = doc(firestore, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUserData(docSnap.data());
                }
                setLoading(false);
            };
            fetchUserData();
        } else if (!userLoading) {
            setLoading(false);
        }
    }, [user, userLoading, firestore]);

    const handleProceed = () => {
        // In a real app, this would redirect to a payment gateway
        // For now, we simulate success and allow slip download
        alert("Payment Successful (Simulated)! You can now download your slip.");
    }

    const handleDownloadSlip = () => {
        window.print();
    }
    
    if(loading || userLoading) {
        return <div className="flex justify-center p-8">Loading candidate details...</div>
    }
    
    if(!user || !userData) {
        return <div className="flex justify-center p-8">Could not load candidate information.</div>
    }

    const fullName = [userData.firstName, userData.middleName, userData.lastName].filter(Boolean).join(' ');

    const applicationData = {
        name: fullName.toUpperCase(),
        applicationId: '202509C329110/CC/2025/01', 
        admissionSession: '2025-26',
        courseType: 'National Skill Sector Council',
        fee: '2000'
    };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 flex justify-center">
      <Card className="w-full max-w-4xl shadow-lg font-ui">
        <CardContent className="p-0">
          <div className="bg-white rounded-lg">
             <div className="p-6 space-y-4">
                <DetailRow label="Candidate's Name" value={applicationData.name} />
                <DetailRow label="Application ID" value={applicationData.applicationId} />
                <DetailRow label="Admission Session" value={applicationData.admissionSession} />
                <DetailRow label="Course Type" value={applicationData.courseType} />
                <DetailRow label="Application Form Fee" value={`₹ ${applicationData.fee}`} />
            </div>
            <div className="flex justify-center items-center p-6 gap-4">
                <Button onClick={handleProceed} className="bg-green-600 hover:bg-green-700 text-white font-bold text-lg px-8 py-6">
                Proceed &gt;&gt;&gt;
                </Button>
                 <Button onClick={handleDownloadSlip} variant="outline" className="font-bold text-lg px-8 py-6">
                    Download Slip
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


export default function PaymentConfirmationPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PaymentConfirmationContent />
        </Suspense>
    )
}
