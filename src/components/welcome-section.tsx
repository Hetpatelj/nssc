
"use client";

import React from 'react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';

const administratorProfile = PlaceHolderImages.find(
  (img) => img.id === 'administrator-profile'
);
const registrarProfile = PlaceHolderImages.find(
  (img) => img.id === 'registrar-profile'
);

export function WelcomeSection() {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="font-headline text-2xl font-bold text-destructive/80 mb-2 border-b-2 border-primary/30 pb-2">
              Welcome to National Skills Sector Councils, New Delhi
            </h2>
            <p className="text-foreground/80 leading-relaxed font-body">
              The constitution of the National Skills Sector Councils is for the
              purpose of co-ordination and determination of standards of training and
              education in various skill sectors and to maintain a Register of registered 
              professionals in the State of Maharashtra.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="text-center">
              {administratorProfile && (
                <Image
                  src={administratorProfile.imageUrl}
                  alt="Dr. Vivek Pakhmode"
                  data-ai-hint="male portrait"
                  width={120}
                  height={120}
                  className="rounded-full mx-auto mb-3 border-4 border-gray-200"
                />
              )}
              <h3 className="font-bold font-ui text-lg text-primary underline">
                Dr. Vivek Pakhmode
              </h3>
              <p className="text-sm text-gray-600">Administrator</p>
            </div>
            <div className="text-center">
              {registrarProfile && (
                <Image
                  src={registrarProfile.imageUrl}
                  alt="Shilpa Kiran Parab"
                  data-ai-hint="female portrait"
                  width={120}
                  height={120}
                  className="rounded-full mx-auto mb-3 border-4 border-gray-200"
                />
              )}
              <h3 className="font-bold font-ui text-lg text-primary underline">
                Shilpa Kiran Parab
              </h3>
              <p className="text-sm text-gray-600">I/C Registrar</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
