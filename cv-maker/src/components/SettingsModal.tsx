import { useState, useEffect } from 'react';
import type { AISettings, AIProvider } from '../types';
import { AI_PROVIDERS, DEFAULT_SETTINGS } from '../constants/config';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AISettings;
  onSave: (settings: AISettings) => Promise<void>;
}

export function SettingsModal({ isOpen, onClose, settings, onSave }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<AISettings>(settings);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset local settings when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
      setShowApiKey(false);
      setError(null);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const currentProvider = AI_PROVIDERS.find((p) => p.id === localSettings.provider);

  const handleProviderChange = (providerId: AIProvider) => {
    const provider = AI_PROVIDERS.find((p) => p.id === providerId);
    setLocalSettings({
      ...localSettings,
      provider: providerId,
      baseUrl: provider?.defaultBaseUrl,
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await onSave(localSettings);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setLocalSettings({ ...DEFAULT_SETTINGS });
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-800">AI Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5">
          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Provider
            </label>
            <select
              value={localSettings.provider}
              onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              {AI_PROVIDERS.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {currentProvider?.description}
            </p>
          </div>

          {/* Model ID Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model ID
            </label>
            <input
              type="text"
              value={localSettings.model}
              onChange={(e) => setLocalSettings({ ...localSettings, model: e.target.value })}
              placeholder="e.g., gpt-4o-mini, llama3.1, gemini-1.5-flash"
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter the exact model ID for your selected provider
            </p>
          </div>

          {/* Base URL (for local providers) */}
          {currentProvider?.defaultBaseUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base URL
              </label>
              <input
                type="text"
                value={localSettings.baseUrl || currentProvider.defaultBaseUrl}
                onChange={(e) => setLocalSettings({ ...localSettings, baseUrl: e.target.value })}
                placeholder={currentProvider.defaultBaseUrl}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Default: {currentProvider.defaultBaseUrl}
              </p>
            </div>
          )}

          {/* API Key */}
          {currentProvider?.requiresApiKey && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={localSettings.apiKey}
                  onChange={(e) => setLocalSettings({ ...localSettings, apiKey: e.target.value })}
                  placeholder={`Enter your ${currentProvider.name} API key`}
                  className="w-full px-3 py-2 pr-10 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showApiKey ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Your API key is stored locally in your browser and never sent to our servers.
              </p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Reset button */}
          <button
            onClick={handleReset}
            disabled={isSaving}
            className="text-xs text-gray-500 hover:text-gray-700 underline disabled:opacity-50"
          >
            Reset to defaults
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
