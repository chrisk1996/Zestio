import { AppLayout } from '@/components/layout';
import ListingsGrid from './ListingsGrid';

export default function ListingPage() {
  return (
    <AppLayout title="Property Listings">
      <ListingsGrid />
    </AppLayout>
  );
}
