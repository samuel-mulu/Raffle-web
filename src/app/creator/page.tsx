import { redirect } from 'next/navigation';

export default function LegacyCreatorPage() {
  redirect('/creator/overview');
}
