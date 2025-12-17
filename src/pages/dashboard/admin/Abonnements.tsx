import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
} from 'lucide-react';
import { AdminPageLayout } from '../../../components/admin/AdminPageLayout';
import { DataTable } from '../../../components/admin/DataTable';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import { Abonnement, AbonnementUtilisateur } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';
import toast from 'react-hot-toast';

export default function Abonnements() {
  const [abonnements, setAbonnements] = useState<Abonnement[]>([
    {
      id: '1',
      nom: 'Starter',
      type: 'mensuel',
      prix: 5000,
      creditsMensuels: 20,
      dureeMois: 1,
      dureeJours: 30,
      description: 'Idéal pour démarrer',
      avantages: ['20 heures/mois', 'WiFi inclus', 'Café gratuit'],
      actif: true,
      ordre: 1,
    },
    {
      id: '2',
      nom: 'Professional',
      type: 'mensuel',
      prix: 12000,
      prixAvecDomiciliation: 18000,
      creditsMensuels: 60,
      dureeMois: 1,
      dureeJours: 30,
      description: 'Pour les professionnels',
      avantages: ['60 heures/mois', 'Salles de réunion', 'Domiciliation optionnelle', 'Support prioritaire'],
      actif: true,
      ordre: 2,
    },
    {
      id: '3',
      nom: 'Entreprise',
      type: 'mensuel',
      prix: 25000,
      prixAvecDomiciliation: 30000,
      creditsMensuels: 160,
      dureeMois: 1,
      dureeJours: 30,
      description: 'Pour les équipes',
      avantages: ['160 heures/mois', 'Bureau dédié', 'Domiciliation incluse', 'Support dédié', 'Accès 24/7'],
      actif: true,
      ordre: 3,
    },
  ]);

  const [souscriptions] = useState<AbonnementUtilisateur[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAbonnement, setEditingAbonnement] = useState<Abonnement | null>(null);
  const [formData, setFormData] = useState<Partial<Abonnement>>({
    nom: '',
    type: 'mensuel',
    prix: 0,
    creditsMensuels: 0,
    dureeMois: 1,
    dureeJours: 30,
    description: '',
    avantages: [],
    actif: true,
    ordre: 0,
  });

  const stats = {
    totalAbonnements: abonnements.length,
    actifs: abonnements.filter(a => a.actif).length,
    totalSouscriptions: souscriptions.length,
    revenuMensuel: souscriptions
      .filter(s => s.statut === 'actif')
      .reduce((sum, s) => {
        const abo = abonnements.find(a => a.id === s.abonnementId);
        return sum + (abo?.prix || 0);
      }, 0),
  };

  const handleOpenModal = (abonnement?: Abonnement) => {
    if (abonnement) {
      setEditingAbonnement(abonnement);
      setFormData(abonnement);
    } else {
      setEditingAbonnement(null);
      setFormData({
        nom: '',
        type: 'mensuel',
        prix: 0,
        creditsMensuels: 0,
        dureeMois: 1,
        dureeJours: 30,
        description: '',
        avantages: [],
        actif: true,
        ordre: abonnements.length + 1,
      });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.nom || !formData.prix) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (editingAbonnement) {
      setAbonnements(prev =>
        prev.map(a => (a.id === editingAbonnement.id ? { ...a, ...formData } as Abonnement : a))
      );
      toast.success('Abonnement mis à jour');
    } else {
      const newAbonnement: Abonnement = {
        ...formData,
        id: `abo_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Abonnement;
      setAbonnements(prev => [...prev, newAbonnement]);
      toast.success('Abonnement créé');
    }

    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet abonnement ?')) {
      setAbonnements(prev => prev.filter(a => a.id !== id));
      toast.success('Abonnement supprimé');
    }
  };

  const handleToggleActif = (id: string) => {
    setAbonnements(prev =>
      prev.map(a => (a.id === id ? { ...a, actif: !a.actif } : a))
    );
    toast.success('Statut mis à jour');
  };

  const columns = [
    {
      key: 'ordre' as keyof Abonnement,
      label: 'Ordre',
      render: (abo: Abonnement) => (
        <span className="text-sm font-medium text-gray-900">{abo.ordre}</span>
      ),
    },
    {
      key: 'nom' as keyof Abonnement,
      label: 'Nom',
      render: (abo: Abonnement) => (
        <div>
          <div className="font-medium text-gray-900">{abo.nom}</div>
          <div className="text-sm text-gray-500">{abo.description}</div>
        </div>
      ),
    },
    {
      key: 'prix' as keyof Abonnement,
      label: 'Prix',
      render: (abo: Abonnement) => (
        <div>
          <div className="font-semibold text-gray-900">{formatCurrency(abo.prix)}</div>
          {abo.prixAvecDomiciliation && (
            <div className="text-sm text-gray-500">
              {formatCurrency(abo.prixAvecDomiciliation)} (avec domiciliation)
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'creditsMensuels' as keyof Abonnement,
      label: 'Crédits',
      render: (abo: Abonnement) => (
        <span className="text-sm text-gray-900">{abo.creditsMensuels}h/mois</span>
      ),
    },
    {
      key: 'avantages' as keyof Abonnement,
      label: 'Avantages',
      render: (abo: Abonnement) => (
        <div className="text-sm text-gray-600">
          {abo.avantages.slice(0, 2).join(', ')}
          {abo.avantages.length > 2 && ` +${abo.avantages.length - 2}`}
        </div>
      ),
    },
    {
      key: 'actif' as keyof Abonnement,
      label: 'Statut',
      render: (abo: Abonnement) => (
        <button
          onClick={() => handleToggleActif(abo.id)}
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            abo.actif
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {abo.actif ? (
            <>
              <Check className="w-3 h-3 mr-1" />
              Actif
            </>
          ) : (
            <>
              <X className="w-3 h-3 mr-1" />
              Inactif
            </>
          )}
        </button>
      ),
    },
    {
      key: 'id' as keyof Abonnement,
      label: 'Actions',
      render: (abo: Abonnement) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenModal(abo)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(abo.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminPageLayout
      title="Gestion des Abonnements"
      subtitle="Créez et gérez les offres d'abonnement"
      icon={CreditCard}
      actions={
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvel Abonnement
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900">Total Offres</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalAbonnements}</p>
            <p className="text-sm text-gray-600 mt-1">{stats.actifs} actives</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900">Souscriptions</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalSouscriptions}</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900">Revenu Mensuel</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(stats.revenuMensuel)}
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900">MRR Moyen</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(stats.totalSouscriptions > 0 ? stats.revenuMensuel / stats.totalSouscriptions : 0)}
            </p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <DataTable data={abonnements} columns={columns} searchable={true} />
        </div>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingAbonnement ? 'Modifier l\'Abonnement' : 'Nouvel Abonnement'}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nom"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="mensuel">Mensuel</option>
                <option value="trimestriel">Trimestriel</option>
                <option value="annuel">Annuel</option>
              </select>
            </div>
          </div>

          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Prix (DZD)"
              type="number"
              value={formData.prix}
              onChange={(e) => setFormData({ ...formData, prix: Number(e.target.value) })}
              required
            />

            <Input
              label="Prix avec Domiciliation (DZD)"
              type="number"
              value={formData.prixAvecDomiciliation || ''}
              onChange={(e) => setFormData({ ...formData, prixAvecDomiciliation: Number(e.target.value) || undefined })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Crédits Mensuels (heures)"
              type="number"
              value={formData.creditsMensuels}
              onChange={(e) => setFormData({ ...formData, creditsMensuels: Number(e.target.value) })}
            />

            <Input
              label="Ordre d'affichage"
              type="number"
              value={formData.ordre}
              onChange={(e) => setFormData({ ...formData, ordre: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Avantages (un par ligne)
            </label>
            <textarea
              value={formData.avantages?.join('\n') || ''}
              onChange={(e) => setFormData({ ...formData, avantages: e.target.value.split('\n').filter(Boolean) })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="WiFi inclus&#10;Café gratuit&#10;Accès 24/7"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="actif"
              checked={formData.actif}
              onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="actif" className="text-sm text-gray-700">
              Abonnement actif
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              {editingAbonnement ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </div>
      </Modal>
    </AdminPageLayout>
  );
}
