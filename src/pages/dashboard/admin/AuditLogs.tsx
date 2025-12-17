import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Download,
  Filter,
  Search,
  Calendar,
  User,
  Activity,
  FileText,
} from 'lucide-react';
import { AdminPageLayout } from '../../../components/admin/AdminPageLayout';
import { DataTable } from '../../../components/admin/DataTable';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { AuditService } from '../../../services/audit.service';
import { AuditLog, AuditAction, AuditEntityType } from '../../../types/audit';
import { format } from 'date-fns';

const ACTION_LABELS: Record<AuditAction, string> = {
  create: 'Création',
  update: 'Modification',
  delete: 'Suppression',
  approve: 'Approbation',
  reject: 'Rejet',
  login: 'Connexion',
  logout: 'Déconnexion',
  export: 'Export',
  import: 'Import',
};

const ACTION_COLORS: Record<AuditAction, string> = {
  create: 'bg-green-100 text-green-800',
  update: 'bg-blue-100 text-blue-800',
  delete: 'bg-red-100 text-red-800',
  approve: 'bg-green-100 text-green-800',
  reject: 'bg-red-100 text-red-800',
  login: 'bg-purple-100 text-purple-800',
  logout: 'bg-gray-100 text-gray-800',
  export: 'bg-yellow-100 text-yellow-800',
  import: 'bg-blue-100 text-blue-800',
};

const ENTITY_LABELS: Record<AuditEntityType, string> = {
  user: 'Utilisateur',
  espace: 'Espace',
  reservation: 'Réservation',
  domiciliation: 'Domiciliation',
  code_promo: 'Code Promo',
  abonnement: 'Abonnement',
  settings: 'Paramètres',
};

export default function AuditLogs() {
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState<AuditAction | ''>('');
  const [filterEntity, setFilterEntity] = useState<AuditEntityType | ''>('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const stats = useMemo(() => AuditService.getStats(), []);

  const logs = useMemo(() => {
    return AuditService.getLogs({
      search: search || undefined,
      action: filterAction || undefined,
      entityType: filterEntity || undefined,
    });
  }, [search, filterAction, filterEntity]);

  const handleExport = () => {
    const data = AuditService.export();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      key: 'timestamp' as keyof AuditLog,
      label: 'Date & Heure',
      render: (log: AuditLog) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {format(log.timestamp, 'dd/MM/yyyy')}
          </div>
          <div className="text-gray-500">
            {format(log.timestamp, 'HH:mm:ss')}
          </div>
        </div>
      ),
    },
    {
      key: 'userName' as keyof AuditLog,
      label: 'Utilisateur',
      render: (log: AuditLog) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{log.userName}</div>
          <div className="text-gray-500">{log.userEmail}</div>
        </div>
      ),
    },
    {
      key: 'action' as keyof AuditLog,
      label: 'Action',
      render: (log: AuditLog) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ACTION_COLORS[log.action]}`}>
          {ACTION_LABELS[log.action]}
        </span>
      ),
    },
    {
      key: 'entityType' as keyof AuditLog,
      label: 'Type',
      render: (log: AuditLog) => (
        <span className="text-sm text-gray-900">
          {ENTITY_LABELS[log.entityType]}
        </span>
      ),
    },
    {
      key: 'entityName' as keyof AuditLog,
      label: 'Entité',
      render: (log: AuditLog) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {log.entityName || log.entityId}
          </div>
        </div>
      ),
    },
  ];

  return (
    <AdminPageLayout
      title="Journal d'Audit"
      subtitle="Suivi de toutes les actions effectuées dans le système"
      icon={Shield}
      actions={
        <Button onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Exporter
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900">Total Actions</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalActions}</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <User className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900">Utilisateurs Actifs</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.topUsers.length}</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900">Créations</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.actionsByType.create || 0}
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900">Modifications</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.actionsByType.update || 0}
            </p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Rechercher dans les logs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value as AuditAction | '')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Toutes les actions</option>
              {Object.entries(ACTION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <select
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value as AuditEntityType | '')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les types</option>
              {Object.entries(ENTITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <DataTable
            data={logs}
            columns={columns}
            searchable={false}
            onRowClick={(log) => setSelectedLog(log)}
          />
        </div>
      </Card>

      {selectedLog && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedLog(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Détails du Log</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Date & Heure</label>
                  <p className="text-gray-900">
                    {format(selectedLog.timestamp, 'dd/MM/yyyy HH:mm:ss')}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Utilisateur</label>
                  <p className="text-gray-900">
                    {selectedLog.userName} ({selectedLog.userEmail})
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Action</label>
                  <p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ACTION_COLORS[selectedLog.action]}`}>
                      {ACTION_LABELS[selectedLog.action]}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Type d'Entité</label>
                  <p className="text-gray-900">{ENTITY_LABELS[selectedLog.entityType]}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Entité</label>
                  <p className="text-gray-900">
                    {selectedLog.entityName || selectedLog.entityId}
                  </p>
                </div>

                {selectedLog.changes && Object.keys(selectedLog.changes).length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Modifications
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      {Object.entries(selectedLog.changes).map(([field, change]) => (
                        <div key={field} className="text-sm">
                          <span className="font-medium text-gray-700">{field}:</span>
                          <div className="ml-4 mt-1">
                            <div className="text-red-600">
                              Ancien: {JSON.stringify(change.old)}
                            </div>
                            <div className="text-green-600">
                              Nouveau: {JSON.stringify(change.new)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Métadonnées
                    </label>
                    <pre className="bg-gray-50 rounded-lg p-4 text-xs overflow-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AdminPageLayout>
  );
}
