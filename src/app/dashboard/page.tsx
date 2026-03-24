import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Image, Box, Credits, Settings, LogOut } from 'lucide-react'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Fetch user credits (we'll create this table)
  const { data: userData } = await supabase
    .from('propertypix_users')
    .select('credits, used_credits')
    .eq('id', user.id)
    .single()

  const credits = userData?.credits ?? 10 // Default 10 free credits
  const usedCredits = userData?.used_credits ?? 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-white">PropertyPix Pro</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-700/50 px-4 py-2 rounded-lg">
              <Credits className="w-4 h-4 text-green-400" />
              <span className="text-white font-medium">{credits - usedCredits} credits</span>
            </div>
            <span className="text-slate-400">{user.email}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Photo Enhancement Card */}
          <Link href="/enhance" className="group">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:border-blue-500/50 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Image className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                Photo Enhancement
              </h2>
              <p className="text-slate-400 mb-6">
                Upload property photos and enhance them with AI. Adjust lighting, remove objects, and make listings shine.
              </p>
              <div className="flex items-center text-blue-400 font-medium">
                Enhance Photos
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>

          {/* Floor Plan 3D Card */}
          <Link href="/floorplan" className="group">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:border-purple-500/50 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
                <Box className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
                Floor Plan 3D
              </h2>
              <p className="text-slate-400 mb-6">
                Convert 2D floor plans into interactive 3D models. Let buyers explore properties virtually.
              </p>
              <div className="flex items-center text-purple-400 font-medium">
                Create 3D Model
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Section */}
        <div className="mt-12 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-6">Your Statistics</h3>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold text-white">{usedCredits}</div>
              <div className="text-slate-400">Enhancements Used</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400">{credits - usedCredits}</div>
              <div className="text-slate-400">Credits Remaining</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400">0</div>
              <div className="text-slate-400">3D Models Created</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
