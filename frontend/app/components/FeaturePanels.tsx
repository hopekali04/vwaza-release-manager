/**
 * Feature Panels for Auth Pages
 * Visual panels showing platform benefits on signup/signin pages
 */

import React from 'react';
import { Upload, DollarSign, BarChart3, Globe, Sparkles, Music } from 'lucide-react';
import { Card, FeatureItem } from '~/components/AuthLayout';

export function SignupFeaturePanel() {
  return (
    <div className="w-full max-w-lg space-y-8 animate-in slide-in-from-right-8 duration-700">
      {/* Upload Preview Card */}
      <Card className="p-6 bg-neutral-950/80 border-neutral-800 shadow-2xl relative overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-500">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <Sparkles className="w-32 h-32 text-[#ccff00]" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#ccff00]/10 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-[#ccff00]" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Easy Upload</h3>
              <p className="text-xs text-neutral-500">Drag & drop your tracks</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-neutral-800 rounded flex items-center justify-center">
                <Music className="w-4 h-4 text-neutral-400" />
              </div>
              <div className="flex-1">
                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#ccff00] w-3/4"></div>
                </div>
              </div>
              <span className="text-xs text-neutral-500">75%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-neutral-800 rounded flex items-center justify-center">
                <Music className="w-4 h-4 text-neutral-400" />
              </div>
              <div className="flex-1">
                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#ccff00] w-1/2"></div>
                </div>
              </div>
              <span className="text-xs text-neutral-500">50%</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Secondary Card with Offset */}
      <Card className="p-4 bg-neutral-950/80 border-neutral-800 shadow-xl transform -translate-x-4 -translate-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-neutral-800 rounded-md shrink-0 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-neutral-400" />
          </div>
          <div className="flex-1">
            <div className="h-3 bg-neutral-800 rounded w-32 mb-2" />
            <div className="h-2 bg-neutral-800/50 rounded w-20" />
          </div>
        </div>
      </Card>

      {/* Headline */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Turn your passion</h2>
        <h2 className="text-3xl font-bold tracking-tight text-neutral-500">into a career.</h2>
      </div>

      {/* Features List */}
      <div className="space-y-6">
        <FeatureItem icon={Upload} title="Unlimited Uploads" description="No storage limits." />
        <FeatureItem icon={Globe} title="Global Distribution" description="Reach fans worldwide." />
        <FeatureItem icon={BarChart3} title="Deep Analytics" description="Know your audience." />
      </div>

      {/* Testimonial */}
      <div className="mt-8 pt-8 border-t border-neutral-800">
        <p className="text-neutral-400 text-sm italic">"Vwaza made distributing my first EP effortless. The upload process is incredibly smooth."</p>
        <div className="mt-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700" />
          <div>
            <p className="text-white text-xs font-medium">Sarah Chen</p>
            <p className="text-neutral-500 text-[10px]">Independent Artist</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SigninFeaturePanel() {
  return (
    <div className="w-full max-w-lg space-y-8 animate-in slide-in-from-right-8 duration-700">
      {/* Earnings Preview Card */}
      <Card className="p-6 bg-neutral-950/80 border-neutral-800 shadow-2xl relative overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-500">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <DollarSign className="w-32 h-32 text-[#ccff00]" />
        </div>
        <div className="relative z-10">
          <div className="mb-4">
            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">This Month</p>
            <p className="text-4xl font-bold text-white">$2,847</p>
            <p className="text-xs text-green-400 mt-1">↑ 23% from last month</p>
          </div>
          <div className="space-y-3 mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-neutral-800 rounded"></div>
                <div>
                  <p className="text-sm text-white font-medium">Midnight Echoes</p>
                  <p className="text-xs text-neutral-500">12.5K streams</p>
                </div>
              </div>
              <span className="text-sm text-white">$847</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-neutral-800 rounded"></div>
                <div>
                  <p className="text-sm text-white font-medium">Solar Flare</p>
                  <p className="text-xs text-neutral-500">8.2K streams</p>
                </div>
              </div>
              <span className="text-sm text-white">$623</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Secondary Card with Offset */}
      <Card className="p-4 bg-neutral-950/80 border-neutral-800 shadow-xl transform -translate-x-4 -translate-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-neutral-800 rounded-md shrink-0 flex items-center justify-center">
            <Music className="w-6 h-6 text-neutral-400" />
          </div>
          <div className="flex-1">
            <div className="h-3 bg-neutral-800 rounded w-32 mb-2" />
            <div className="h-2 bg-neutral-800/50 rounded w-20" />
          </div>
        </div>
      </Card>

      {/* Headline */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Everything you need to</h2>
        <h2 className="text-3xl font-bold tracking-tight text-neutral-500">grow your career.</h2>
      </div>

      {/* Features List */}
      <div className="space-y-6">
        <FeatureItem 
          icon={BarChart3} 
          title="Real-time Analytics" 
          description="Track your performance across platforms." 
        />
        <FeatureItem 
          icon={Globe} 
          title="Global Reach" 
          description="Your music on all major streaming services." 
        />
        <FeatureItem 
          icon={DollarSign} 
          title="Monetization" 
          description="Earn from streams, sales, and fan support." 
        />
      </div>

      {/* Testimonial */}
      <div className="mt-8 pt-8 border-t border-neutral-800">
        <p className="text-neutral-400 text-sm italic">"The analytics dashboard changed how I understand my audience. Revenue is up 40% this quarter."</p>
        <div className="mt-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700" />
          <div>
            <p className="text-white text-xs font-medium">Alex Rivera</p>
            <p className="text-neutral-500 text-[10px]">Indie Artist</p>
          </div>
        </div>
      </div>
    </div>
  );
}
