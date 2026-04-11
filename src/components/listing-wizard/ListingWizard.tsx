'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppLayout } from '@/components/layout';
import { ListingFeatures } from '@/types/listing';
import { Loader2, Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { AddressStep } from './steps/AddressStep';
import { BasicsStep } from './steps/BasicsStep';
import { MediaStep } from './steps/MediaStep';
import { DescriptionStep } from './steps/DescriptionStep';
import { FeaturesStep } from './steps/FeaturesStep';
import { ReviewStep } from './steps/ReviewStep';
import { ListingPreview } from './ListingPreview';

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
  { id: 1, title: 'Address', subtitle: 'Location & enrichment', icon: '📍' },
  { id: 2, title: 'Basics', subtitle: 'Property details', icon: '🏠' },
  { id: 3, title: 'Media', subtitle: 'Photos & floor plan', icon: '📸' },
  { id: 4, title: 'Description', subtitle: 'AI-generated', icon: '✍️' },
  { id: 5, title: 'Features', subtitle: 'Amenities', icon: '✓' },
  { id: 6, title: 'Publish', subtitle: 'Review & sync', icon: '🚀' },
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

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.latitude && data.longitude && data.city;
      case 2:
        return data.property_type && data.living_area > 0 && data.rooms > 0;
      case 4:
        return data.title && data.description;
      default:
        return true;
    }
  };

  return (
    <AppLayout title="New Listing">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Create New Listing</h1>
              <p className="text-sm text-gray-500">
                {isSaving ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Auto-saved'
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">
                Save Draft
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                Preview
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-12 gap-8">
            {/* Left: Step Navigation */}
            <div className="col-span-3">
              <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-8">
                <div className="space-y-1">
                  {STEPS.map((step) => (
                    <button
                      key={step.id}
                      onClick={() => goToStep(step.id)}
                      disabled={step.id > currentStep && !completedSteps.has(step.id) && step.id !== currentStep + 1}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                        step.id === currentStep
                          ? 'bg-indigo-50 border border-indigo-200'
                          : step.id < currentStep || completedSteps.has(step.id)
                          ? 'hover:bg-gray-50'
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          step.id === currentStep
                            ? 'bg-indigo-600 text-white'
                            : step.id < currentStep || completedSteps.has(step.id)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {step.id < currentStep || completedSteps.has(step.id) ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          step.id
                        )}
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${
                          step.id === currentStep ? 'text-indigo-900' : 'text-gray-700'
                        }`}>
                          {step.title}
                        </div>
                        <div className="text-xs text-gray-500">{step.subtitle}</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Progress */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>Progress</span>
                    <span>{Math.round(((currentStep - 1) / 5) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-300"
                      style={{ width: `${((currentStep - 1) / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Center: Step Content */}
            <div className="col-span-5">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                {renderStep()}
              </div>
            </div>

            {/* Right: Live Preview */}
            <div className="col-span-4">
              <div className="sticky top-8">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-sm font-medium text-gray-700">Live Preview</h3>
                  </div>
                  <div className="p-4">
                    <ListingPreview data={data} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
