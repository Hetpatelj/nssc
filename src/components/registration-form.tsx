
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { initializeFirebase } from '@/firebase';
import { sendOtp } from '@/ai/flows/send-otp-flow';

const formSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    middleName: z.string().optional(),
    lastName: z.string().min(1, 'Last name is required'),
    dob: z.date({ required_error: 'Date of birth is required.' }),
    gender: z.string().min(1, 'Gender is required'),
    email: z.string().email('Invalid email address'),
    primaryMobile: z.string().regex(/^\d{10}$/, 'Invalid mobile number'),
    secondaryMobile: z
      .string()
      .regex(/^\d{10}$/, 'Invalid mobile number')
      .optional()
      .or(z.literal('')),
    securityQuestion: z.string().min(1, 'Security question is required'),
    securityAnswer: z.string().min(1, 'Security answer is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(15, 'Password must be at most 15 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Password must contain an uppercase letter, a number, and a special character'
      ),
    confirmPassword: z.string(),
    captcha: z.string().min(1, 'Captcha is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export function RegistrationForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [captcha, setCaptcha] = useState<{
    num1: number;
    num2: number;
    answer: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [otpInput, setOtpInput] = useState('');
  const [sentOtp, setSentOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);


  const { auth, firestore } = initializeFirebase();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      gender: '',
      email: '',
      primaryMobile: '',
      secondaryMobile: '',
      securityQuestion: '',
      securityAnswer: '',
      password: '',
      confirmPassword: '',
      captcha: '',
    },
  });

  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 10) + 1;
    const n2 = Math.floor(Math.random() * 10) + 1;
    setCaptcha({ num1: n1, num2: n2, answer: n1 + n2 });
  };

  useEffect(() => {
    generateCaptcha();
  }, []);
  
  const handleSendOtp = async () => {
    const email = form.getValues('email').trim();
    if (!email || !z.string().email().safeParse(email).success) {
        toast({
            variant: 'destructive',
            title: 'Invalid Email',
            description: 'Please enter a valid email address before sending an OTP.',
        });
        return;
    }
    
    setIsVerifying(true);
    try {
        const { otp } = await sendOtp(email);
        setSentOtp(otp);
        toast({
            title: 'OTP Sent',
            description: `An OTP has been sent to ${email}.`,
        });
        setIsOtpSent(true);
    } catch (error: any) {
        console.error("Error sending OTP:", error);
        toast({
            variant: 'destructive',
            title: 'OTP Error',
            description: error.message || 'Could not send OTP. Please try again later.',
        });
    } finally {
        setIsVerifying(false);
    }
  }
  
  const handleVerifyOtp = () => {
    if (otpInput === sentOtp && sentOtp !== '') {
        toast({
            title: 'Email Verified!',
            description: 'Your email address has been successfully verified.',
        });
        setIsOtpVerified(true);
    } else {
        toast({
            variant: 'destructive',
            title: 'Invalid OTP',
            description: 'The OTP you entered is incorrect. Please try again.',
        });
    }
  }


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (captcha && parseInt(values.captcha) !== captcha.answer) {
      toast({
        variant: 'destructive',
        title: 'Invalid Captcha',
        description: 'Please solve the math problem correctly.',
      });
      generateCaptcha();
      form.setValue('captcha', '');
      return;
    }
    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;
      const profileId =
        new Date().getFullYear().toString() +
        Math.random().toString(36).substring(2, 10).toUpperCase();

      await updateProfile(user, {
        displayName: `${values.firstName} ${values.lastName}`,
      });

      await setDoc(doc(firestore, 'users', user.uid), {
        profileId,
        firstName: values.firstName,
        middleName: values.middleName,
        lastName: values.lastName,
        dob: values.dob,
        gender: values.gender,
        email: values.email,
        primaryMobile: values.primaryMobile,
        secondaryMobile: values.secondaryMobile,
        securityQuestion: values.securityQuestion,
        createdAt: new Date(),
      });

       router.push(`/registration-success?profileId=${profileId}&email=${encodeURIComponent(values.email)}`);
      
    } catch (error: any) {
      console.error('Registration Error:', error);
      let description = 'An unexpected error occurred. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        description = 'This email address is already in use by another account.';
      } else {
        description = error.message;
      }
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter first name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="middleName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Middle / Father Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter middle name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date of Birth</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date('1900-01-01')
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Email</FormLabel>
                    <div className="flex gap-2">
                        <FormControl>
                            <Input placeholder="Enter email" {...field} disabled={isOtpSent} />
                        </FormControl>
                        <Button type="button" onClick={handleSendOtp} disabled={isOtpSent || isVerifying}>
                            {isVerifying ? <Loader2 className="animate-spin" /> : isOtpSent ? 'Sent' : 'Verify Email'}
                        </Button>
                    </div>
                    <FormMessage />
                </FormItem>
                )}
            />
            {isOtpSent && !isOtpVerified && (
                 <FormItem>
                    <FormLabel>Enter OTP</FormLabel>
                    <div className="flex gap-2">
                        <FormControl>
                            <Input placeholder="6-digit OTP" value={otpInput} onChange={(e) => setOtpInput(e.target.value)} maxLength={6} />
                        </FormControl>
                        <Button type="button" onClick={handleVerifyOtp}>Confirm OTP</Button>
                    </div>
                    <FormMessage />
                </FormItem>
            )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="primaryMobile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Mobile Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter mobile number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
          control={form.control}
          name="secondaryMobile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Secondary Mobile (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter secondary mobile number"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="securityQuestion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Security Question</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a security question" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="birth-city">
                      What is your birth city?
                    </SelectItem>
                    <SelectItem value="pet-name">
                      What is your first pet's name?
                    </SelectItem>
                    <SelectItem value="mother-maiden-name">
                      What is your mother's maiden name?
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="securityAnswer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Security Answer</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your answer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirm password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="captcha"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How much is the sum</FormLabel>
              <div className="flex items-center gap-2">
                <span className="p-2 bg-muted rounded-md">
                  {captcha ? `${captcha.num1} + ${captcha.num2} = ?` : '...'}
                </span>
                <FormControl>
                  <Input
                    placeholder="Your answer"
                    {...field}
                    disabled={!captcha}
                    className="w-32"
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting || !isOtpVerified}>
          {isSubmitting ? 'Registering...' : 'Register'}
        </Button>
         {!isOtpVerified && <p className="text-sm text-destructive mt-2">Please verify your email address to continue.</p>}
      </form>
    </Form>
  );
}
