'use client';

import React from 'react';
import { ResistorVisualizer, BeamDeflectionVisualizer, NormalDistributionChart } from '../visualizers';

interface EngineeringDashboardProps {
  className?: string;
}

export function EngineeringDashboard({ className = '' }: EngineeringDashboardProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${className}`}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Engineering Dashboard</h1>
              <p className="mt-2 text-gray-600">Interactive Visualizers & Calculators</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Live Calculations
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">3 Visualizers</h3>
                <p className="text-sm text-gray-600">Interactive engineering tools</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Real-time</h3>
                <p className="text-sm text-gray-600">Live calculations & updates</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Precise</h3>
                <p className="text-sm text-gray-600">Engineering-grade accuracy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Visualizers Grid */}
        <div className="space-y-8">
          {/* Section Header */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Engineering Visualizers</h2>
            <p className="text-gray-600">Explore interactive calculations with real-time visual feedback</p>
          </div>

          {/* Visualizers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {/* Resistor Visualizer */}
            <div className="transform transition-all duration-300 hover:scale-105">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
                  <h3 className="text-white font-semibold text-lg">Electrical</h3>
                  <p className="text-orange-100 text-sm">Resistor Color Code Calculator</p>
                </div>
                <div className="p-0">
                  <ResistorVisualizer className="border-0 shadow-none" />
                </div>
              </div>
            </div>

            {/* Beam Deflection Visualizer */}
            <div className="transform transition-all duration-300 hover:scale-105">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
                  <h3 className="text-white font-semibold text-lg">Mechanical</h3>
                  <p className="text-blue-100 text-sm">Beam Deflection Analysis</p>
                </div>
                <div className="p-0">
                  <BeamDeflectionVisualizer className="border-0 shadow-none" />
                </div>
              </div>
            </div>

            {/* Normal Distribution Chart */}
            <div className="transform transition-all duration-300 hover:scale-105">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-green-500 to-teal-500 px-6 py-4">
                  <h3 className="text-white font-semibold text-lg">Statistics</h3>
                  <p className="text-green-100 text-sm">Normal Distribution Analysis</p>
                </div>
                <div className="p-0">
                  <NormalDistributionChart className="border-0 shadow-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-12 bg-white rounded-lg shadow-lg p-8 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">About These Visualizers</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">🔌 Resistor Calculator</h4>
                <p className="text-gray-600 text-sm">
                  Calculate resistance values from color bands. Supports 4, 5, and 6 band resistors with real-time visual feedback.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">🏗️ Beam Analysis</h4>
                <p className="text-gray-600 text-sm">
                  Analyze beam deflection for cantilever and simply supported beams. Interactive controls for load, length, and material properties.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">📊 Distribution Analysis</h4>
                <p className="text-gray-600 text-sm">
                  Visualize normal distribution curves with adjustable mean and standard deviation. See the bell curve change in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>Engineering Dashboard - Interactive Visualizers</p>
            <p className="mt-2">Built with React, TypeScript, and Tailwind CSS</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
