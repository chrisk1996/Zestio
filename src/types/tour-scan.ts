// Tour Scan Types

export type TourScanStatus = 'uploading' | 'processing' | 'done' | 'failed';

export interface TourScan {
  id: string;
  user_id: string;
  title: string | null;
  status: TourScanStatus;
  kiri_task_id: string | null;
  splat_file_url: string | null;
  splat_file_path: string | null;
  thumbnail_url: string | null;
  image_count: number;
  credits_used: number;
  error_message: string | null;
  metadata: Record<string, unknown>;
  is_public: boolean;
  share_token: string;
  created_at: string;
  completed_at: string | null;
}

export const TOUR_STATUS_CONFIG: Record<TourScanStatus, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  uploading: {
    label: 'Uploading',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  processing: {
    label: 'Processing',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
  },
  done: {
    label: 'Complete',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
  failed: {
    label: 'Failed',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
  },
};
