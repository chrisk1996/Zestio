'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppLayout } from '@/components/layout';
import { ListingFeatures } from '@/types/listing';
import { AddressStep } from './steps/AddressStep';
import { BasicsStep } from './steps/BasicsStep';
import { MediaStep } from './steps/MediaStep';
import { DescriptionStep } from './steps/DescriptionStep';
import { FeaturesStep } from './steps/FeaturesStep';
import { ReviewStep } from './steps/ReviewStep';
import { Loader2, Check } from 'lucide-react';

export interface ListingData {
  id?: string;
  transaction_type: 'sale' | 'rent';
  property_type: 'apartment' | 'house' | 'commercial' | 'land';
  title: string;
  description: string;
  // Address
  street: string;
  house_number: string;
  postal_code: string;
  city: string;
  district: string;
  country: string;
  latitude?: number;
  longitude?: number;
  proximity_data?: Record<string, unknown>;
  // Price
  price: number;
  cold_rent?: number;
  warm_rent?: number;
  additional_costs?: number;
  deposit?: number;
  hoa_fees?: number;
  // Property details
  living_area: number;
  plot_area: number;
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  floor: number;
  total_floors: number;
  construction_year: number;
  // Features
  energy_rating: string;
  heating_type: string;
  availability_date?: string;
  is_immediately_available?: boolean;
  features: ListingFeatures;
  // Media
  media_ids: string[];
  cover_image_id?: string;
}

const STEPS = [
  { id: 1, title: 'Address', subtitle: 'Auto-enrichment' },
  { id: 2, title: 'Basics', subtitle: 'Property details' },
  { id: 3, title: 'Media', subtitle: 'Photos & AI' },
  { id: 4, title: 'Description', subtitle: 'AI-generated' },
  { id: 5, title: 'Features', subtitle: 'Amenities' },
  { id: 6, title: 'Publish', subtitle: 'Review & sync' },
];

const initialData: ListingData = {
  transaction_type: 'sale',
  property_type: 'apartment',
  title: '',
  description: '',
  street: '',
  house_number: '',
  postal_code: '',
  city: '',
  district: '',
  country: 'Deutschland',
  price: 0,
  living_area: 0,
  plot_area: 0,
  rooms: 0,
  bedrooms: 0,
  bathrooms: 0,
  floor: 0,
  total_floors: 0,
  construction_year: 0,
  energy_rating: '',
  heating_type: '',
  features: {},
  media_ids: [],
};

export function ListingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<ListingData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Create draft on mount
  useEffect(() => {
    createDraft();
  }, []);

  const createDraft = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...initialData, status: 'draft' }),
      });
      if (res.ok) {
        const result = await res.json();
        setData(prev => ({ ...prev, id: result.id }));
      }
    } catch (e) {
      console.error('Error creating draft:', e);
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save with debounce
  const saveDraft = useCallback(async () => {
    if (!data.id) return;
    setIsSaving(true);
    try {
      await fetch(`/api/listings/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (e) {
      console.error('Error saving draft:', e);
    } finally {
      setIsSaving(false);
    }
  }, [data]);

  useEffect(() => {
    if (!data.id) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(saveDraft, 1500);
  }, [data, saveDraft]);

  const updateData = (updates: Partial<ListingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    setCurrentStep(prev => Math.min(prev + 1, 6));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const goToStep = (step: number) => {
    if (step <= currentStep || completedSteps.has(step) || step === currentStep + 1) {
      setCurrentStep(step);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <AddressStep data={data} updateData={updateData} onNext={nextStep} />;
      case 2:
        return <BasicsStep data={data} updateData={updateData} onNext={nextStep} onPrev={prevStep} />;
      case 3:
        return <MediaStep data={data} updateData={updateData} onNext={nextStep} onPrev={prevStep} />;
      case 4:
        return <DescriptionStep data={data} updateData={updateData} onNext={nextStep} onPrev={prevStep} />;
      case 5:
        return <FeaturesStep data={data} updateData={updateData} onNext={nextStep} onPrev={prevStep} />;
      case 6:
        return <ReviewStep data={data} updateData={updateData} onPrev={prevStep} />;
      default:
        return null;
    }
  };

  return (
    <AppLayout title="New Listing">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create Listing</h1>
          <p className="text-gray-600 mt-1">Build a complete, portal-ready property listing</p>
        </div>

        {/* Step Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => goToStep(step.id)}
                disabled={step.id > currentStep && !completedSteps.has(step.id) && step.id !== currentStep + 1}
                className={`flex items-center gap-3 transition-all ${
                  step.id === currentStep
                    ? 'opacity-100'
                    : step.id < currentStep || completedSteps.has(step.id)
                    ? 'opacity-70 hover:opacity-100'
                    : 'opacity-40 cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
                    step.id === currentStep
                      ? 'bg-indigo-600 text-white'
                      : step.id < currentStep || completedSteps.has(step.id)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step.id < currentStep || completedSteps.has(step.id) ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium text-gray-900">{step.title}</div>
                  <div className="text-xs text-gray-500">{step.subtitle}</div>
                </div>
              </button>
            ))}
          </div>
          {/* Progress line */}
          <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          {renderStep()}
        </div>

        {/* Saving indicator */}
        {isSaving && (
          <div className="fixed bottom-6 right-6 flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow-lg">
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </div>
        )}
      </div>
    </AppLayout>
  );
}
