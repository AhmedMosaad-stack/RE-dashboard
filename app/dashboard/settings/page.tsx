'use client';

import React from 'react';
import { Bell, Palette, User } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {

  return (
    <div className="page-fade-in space-y-6">
      <PageHeader title="Settings" subtitle="Manage your account and preferences." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="hand-border card-pop">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" style={{ color: 'var(--pop-blue)' }} />
              General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Agency Name</p>
              <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>RE Travel Agency</p>
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Region</p>
              <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>North America</p>
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Currency</p>
              <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>USD ($)</p>
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Timezone</p>
              <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>UTC−05:00 Eastern Time</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hand-border card-pop">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" style={{ color: 'var(--pop-teal)' }} />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Theme</p>
              <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>System default</p>
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Accent Color</p>
              <div className="mt-1 flex gap-2">
                {['var(--pop-blue)', 'var(--pop-green)', 'var(--pop-red)', 'var(--pop-orange)', 'var(--pop-teal)', 'var(--pop-purple)'].map((color, i) => (
                  <span
                    key={i}
                    style={{
                      display: 'inline-block',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: color,
                      border: '2px solid var(--ink)',
                    }}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Date Format</p>
              <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>MM/DD/YYYY</p>
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Language</p>
              <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>English (US)</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hand-border card-pop">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" style={{ color: 'var(--pop-orange)' }} />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Role</p>
              <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>Administrator</p>
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Email</p>
              <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>admin@retravel.com</p>
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Member Since</p>
              <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>January 2024</p>
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Plan</p>
              <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>Professional</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
