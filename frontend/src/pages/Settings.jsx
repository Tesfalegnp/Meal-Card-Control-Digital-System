import React, { useState } from "react";

export default function Settings() {
  const [settings, setSettings] = useState({
    theme: 'dark',
    fontSize: 'medium',
    language: 'english',
    notifications: true,
    autoBackup: true,
    analytics: true
  });

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            System Settings
          </h1>
          <p className="text-gray-300">Customize your meal card system experience</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Appearance Settings */}
          <div className="glass-effect p-6 rounded-xl">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              🎨 Appearance
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Theme</label>
                <div className="grid grid-cols-2 gap-2">
                  {['dark', 'light', 'auto'].map(theme => (
                    <button
                      key={theme}
                      onClick={() => updateSetting('theme', theme)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        settings.theme === theme 
                          ? 'border-blue-500 bg-blue-500/20' 
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Font Size</label>
                <div className="grid grid-cols-3 gap-2">
                  {['small', 'medium', 'large'].map(size => (
                    <button
                      key={size}
                      onClick={() => updateSetting('fontSize', size)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        settings.fontSize === size 
                          ? 'border-green-500 bg-green-500/20' 
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="glass-effect p-6 rounded-xl">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              ⚙️ System Preferences
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Language</label>
                <select 
                  value={settings.language}
                  onChange={(e) => updateSetting('language', e.target.value)}
                  className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                >
                  <option value="english">English</option>
                  <option value="amharic">Amharic</option>
                  <option value="oromo">Oromo</option>
                </select>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'notifications', label: 'Push Notifications', desc: 'Get real-time updates' },
                  { key: 'autoBackup', label: 'Auto Backup', desc: 'Automatic data backup' },
                  { key: 'analytics', label: 'Usage Analytics', desc: 'Help improve the system' }
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-sm text-gray-400">{item.desc}</div>
                    </div>
                    <button
                      onClick={() => updateSetting(item.key, !settings[item.key])}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings[item.key] ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        settings[item.key] ? 'translate-x-7' : 'translate-x-1'
                      }`}></div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="glass-effect p-6 rounded-xl lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              💾 Data Management
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                Export Data
              </button>
              <button className="p-4 bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
                Backup Now
              </button>
              <button className="p-4 bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                Clear Cache
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}