import React, { useState, useEffect } from 'react';
import { SystemSetting, AuditLog } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Sliders,
  ShieldCheck,
  Save,
  Search,
} from 'lucide-react';

export const AdminSystemSettings: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'SETTINGS' | 'AUDIT'>('SETTINGS');
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  // Local edits map
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [auditSearch, setAuditSearch] = useState<string>('');

  const loadSettingsAndLogs = async () => {
    setIsLoading(true);
    try {
      const [settingsRes, logsRes] = await Promise.all([
        api.getSystemSettings(),
        api.getAuditLogs(60),
      ]);

      if (settingsRes.success && settingsRes.data) {
        setSettings(settingsRes.data);
        const map: Record<string, string> = {};
        settingsRes.data.forEach((s) => {
          map[s.key] = s.value;
        });
        setEditedValues(map);
      }

      if (logsRes.success && logsRes.data) {
        setAuditLogs(logsRes.data);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch platform configuration.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettingsAndLogs();
  }, []);

  const handleSaveSetting = async (key: string) => {
    const value = editedValues[key];
    setSavingKey(key);
    try {
      await api.updateSystemSetting(key, value);
      showToast(`Setting "${key}" updated successfully.`, 'success');
      loadSettingsAndLogs();
    } catch (err: any) {
      showToast(err.message || 'Failed to update setting.', 'error');
    } finally {
      setSavingKey(null);
    }
  };

  const filteredLogs = auditLogs.filter((log) => {
    if (!auditSearch.trim()) return true;
    const term = auditSearch.toLowerCase();
    return (
      log.action.toLowerCase().includes(term) ||
      (log.details && log.details.toLowerCase().includes(term)) ||
      (log.user?.name && log.user.name.toLowerCase().includes(term)) ||
      (log.user?.email && log.user.email.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-emerald-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-600" />
            Global Platform Configuration & Security Logs
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Dynamic system runtime parameters, rate-limit thresholds, and immutable forensic audit trails.
          </p>
        </div>

        <div className="flex items-center p-1 bg-white border border-emerald-100 rounded-2xl text-xs font-bold shadow-soft-sm">
          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'SETTINGS'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Cluster Parameters
          </button>
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'AUDIT'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Audit Trail ({auditLogs.length})
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-500">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium">Synchronizing configuration schema...</p>
        </div>
      ) : activeTab === 'SETTINGS' ? (
        /* SYSTEM SETTINGS */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settings.map((s) => {
              const currentValue = editedValues[s.key] ?? s.value;
              const isModified = currentValue !== s.value;
              const isBoolean = s.value === 'true' || s.value === 'false';

              return (
                <div
                  key={s.id}
                  className="clinical-card p-6 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <code className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                        {s.key}
                      </code>
                      <span className="text-[10px] text-gray-400">
                        Updated {new Date(s.updated_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                      {s.description || 'Configurable runtime variable.'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center gap-3">
                    {isBoolean ? (
                      <select
                        value={currentValue}
                        onChange={(e) =>
                          setEditedValues((prev) => ({ ...prev, [s.key]: e.target.value }))
                        }
                        className="flex-1 px-3 py-2 bg-[#FAFCFA] border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 font-mono font-medium"
                      >
                        <option value="true">true (Enabled)</option>
                        <option value="false">false (Disabled)</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={currentValue}
                        onChange={(e) =>
                          setEditedValues((prev) => ({ ...prev, [s.key]: e.target.value }))
                        }
                        className="flex-1 px-3 py-2 bg-[#FAFCFA] border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 font-mono font-medium"
                      />
                    )}

                    <button
                      onClick={() => handleSaveSetting(s.key)}
                      disabled={savingKey === s.key || !isModified}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        isModified
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Save className="w-3.5 h-3.5" />
                      {savingKey === s.key ? 'Saving...' : 'Apply'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* AUDIT LOG TRAIL */
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-emerald-100 flex items-center justify-between gap-4 shadow-soft-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search audit actions, user emails, or parameters..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#F8FAF8] border border-emerald-100 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="text-xs text-gray-500 font-medium">
              Showing <strong className="text-emerald-700">{filteredLogs.length}</strong> events
            </div>
          </div>

          <div className="clinical-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFCFA] text-gray-500 uppercase tracking-wider font-bold border-b border-emerald-100">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action Event</th>
                    <th className="py-3 px-4">Triggered By</th>
                    <th className="py-3 px-4">Payload Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100/60 text-gray-700">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-emerald-50/30">
                      <td className="py-3 px-4 whitespace-nowrap text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {log.user ? (
                          <div>
                            <div className="font-bold text-gray-900">{log.user.name}</div>
                            <div className="text-[10px] text-gray-400">{log.user.email}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">System Automation</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-gray-600 max-w-md break-all">
                        {log.details || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
