// KIRI Engine API Client
// REST client for 3DGS scan processing

const KIRI_BASE_URL = 'https://api.kiriengine.app/api';

function getApiKey(): string {
  const key = process.env.KIRI_API_KEY;
  if (!key) throw new Error('KIRI_API_KEY environment variable is not set');
  return key;
}

interface KIRITaskResult {
  taskId: string;
}

interface KIRITaskStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  resultUrl?: string;
  errorMessage?: string;
}

export async function createTask(imageUrls: string[]): Promise<KIRITaskResult> {
  const response = await fetch(`${KIRI_BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: '3dgs',
      images: imageUrls,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`KIRI API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return { taskId: data.task_id || data.taskId || data.id };
}

export async function getTaskStatus(taskId: string): Promise<KIRITaskStatus> {
  const response = await fetch(`${KIRI_BASE_URL}/tasks/${taskId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getApiKey()}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`KIRI API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  const statusMap: Record<string, KIRITaskStatus['status']> = {
    'pending': 'pending',
    'processing': 'processing',
    'running': 'processing',
    'completed': 'completed',
    'done': 'completed',
    'success': 'completed',
    'failed': 'failed',
    'error': 'failed',
  };

  const mappedStatus = statusMap[data.status?.toLowerCase()] || 'pending';

  return {
    status: mappedStatus,
    resultUrl: data.result_url || data.output_url || data.download_url,
    errorMessage: data.error_message || data.error,
  };
}
