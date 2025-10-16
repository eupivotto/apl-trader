'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { TrendingUp } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="text-center space-y-6 px-4">
        <TrendingUp className="mx-auto h-20 w-20 text-green-500" />
        <h1 className="text-5xl font-bold">Trade Management Platform</h1>
        <p className="text-xl text-gray-300 max-w-2xl">
          Sistema completo de gerenciamento de trades para sua equipe
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <Button
            size="lg"
            onClick={() => router.push('/login')}
            className="bg-green-600 hover:bg-green-700"
          >
            Fazer Login
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="border-white text-white hover:bg-white hover:text-gray-900"
          >
            Ir para Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
