import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Building, Calendar, CreditCard, BarChart3, Settings, LogOut, Menu, X, Bell, Search, Plus, FileEdit as Edit, Trash2, Eye, Check, AlertCircle, Download, Filter, DollarSign, TrendingUp, UserCheck, UserX, MapPin, Clock, RefreshCw } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/store';
import { formatDate, formatCurrency, formatTime, getInitials } from '../utils/formatters';
import toast from 'react-hot-toast';
import { useState } from 'react';
import Logo from '../components/Logo';

const ERPSystem = () => {
  const { user, logout } = useAuthStore();
  const {
    users, reservations, espaces, updateReservation, updateUser,
    deleteUser, updateEspace, initializeData, abonnements, abonnementsUtilisateurs,
    transactions, getAdminStats, getNotificationSettings, updateNotificationSettings,
    loadUsers, loadReservations, addUser, addEspace, addAbonnement, updateAbonnement
  } = useAppStore();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notificationSettings, setNotificationSettings] = useState(getNotificationSettings());
  const [formData, setFormData] = useState<any>({});
  const location = useLocation();

  React.useEffect(() => {
    if (user?.role === 'admin') {
      loadUsers();
      loadReservations();
    }
  }, [user]);

  // Redirection si non authentifie ou non admin
  if (!user || user?.role !== 'admin') {
    return <Navigate to="/connexion" replace />;
  }

  const today = new Date();
  const todayStr = today.toDateString();
  const thisMonth = today.getMonth();
  
  // Stats en temps réel
  const adminStats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.statut === 'actif').length,
    suspendedUsers: users.filter(u => u.statut === 'suspendu').length,
    totalReservations: reservations.length,
    todayReservations: reservations.filter(r => 
      new Date(r.dateDebut).toDateString() === todayStr
    ).length,
    pendingReservations: reservations.filter(r => r.statut === 'en_attente').length,
    totalSpaces: espaces.length,
    availableSpaces: espaces.filter(e => e.disponible).length,
    monthlyRevenue: reservations
      .filter(r => new Date(r.dateCreation).getMonth() === thisMonth)
      .reduce((sum, r) => sum + r.montantTotal, 0)
  };

  const navigation = [
    { name: 'Tableau de bord', id: 'dashboard', icon: LayoutDashboard },
    { name: 'Utilisateurs', id: 'users', icon: Users },
    { name: 'Espaces', id: 'spaces', icon: Building },
    { name: 'Réservations', id: 'reservations', icon: Calendar },
    { name: 'Abonnements', id: 'subscriptions', icon: CreditCard },
    { name: 'Rapports', id: 'reports', icon: BarChart3 },
    { name: 'Paramètres', id: 'settings', icon: Settings }
  ];

  // Actions fonctionnelles
  const handleConfirmReservation = async (reservationId) => {
    await updateReservation(reservationId, { statut: 'confirmee' });
    toast.success('Réservation confirmée');
    setShowActionModal(false);
  };

  const handleCancelReservation = async (reservationId) => {
    await updateReservation(reservationId, { statut: 'annulee' });
    toast.success('Réservation annulée');
    setShowActionModal(false);
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'actif' ? 'suspendu' : 'actif';
    await updateUser(userId, { statut: newStatus });
    toast.success(`Utilisateur ${newStatus}`);
    setShowActionModal(false);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Supprimer cet utilisateur définitivement ?')) {
      await deleteUser(userId);
      toast.success('Utilisateur supprimé');
      setShowActionModal(false);
    }
  };

  const handleToggleSpaceAvailability = (spaceId, currentStatus) => {
    updateEspace(spaceId, { disponible: !currentStatus });
    toast.success(`Espace ${!currentStatus ? 'activé' : 'désactivé'}`);
    setShowActionModal(false);
  };

  const openActionModal = (type, item = null) => {
    setActionType(type);
    setSelectedItem(item);

    // Mapper les données selon le type
    if (type === 'edit-space' && item) {
      setFormData({
        ...item,
        tarifHoraire: item.tarif?.horaire || 0,
        tarifJournalier: item.tarif?.journalier || 0,
        tarifMensuel: item.tarif?.mensuel || 0,
        equipements: item.equipements?.join(', ') || ''
      });
    } else if (type === 'edit-subscription' && item) {
      setFormData({
        ...item,
        avantages: item.avantages?.join('\n') || ''
      });
    } else {
      setFormData(item || {});
    }

    setShowActionModal(true);
  };

  const handleCreateUser = async () => {
    if (!formData.email || !formData.password) {
      toast.error('Email et mot de passe sont obligatoires');
      return;
    }
    const result = await addUser({
      email: formData.email,
      password: formData.password,
      nom: formData.nom || '',
      prenom: formData.prenom || '',
      telephone: formData.telephone || '',
      entreprise: formData.entreprise || '',
      role: formData.role || 'user'
    });
    if (result.success) {
      toast.success('Utilisateur cree avec succes');
      setShowActionModal(false);
      setFormData({});
    } else {
      toast.error(result.error || 'Erreur lors de la creation');
    }
  };

  const handleUpdateUser = async () => {
    if (!formData.email) {
      toast.error('Email est obligatoire');
      return;
    }
    const updatedData: any = {
      email: formData.email,
      nom: formData.nom,
      prenom: formData.prenom,
      telephone: formData.telephone,
      entreprise: formData.entreprise,
      adresse: formData.adresse,
      role: formData.role
    };
    if (formData.password) {
      updatedData.password = formData.password;
    }
    await updateUser(selectedItem.id, updatedData);
    toast.success('Utilisateur modifié avec succès');
    setShowActionModal(false);
    setFormData({});
  };

  const handleCreateEspace = async () => {
    const result = await addEspace({
      nom: formData.nom,
      type: formData.type || 'bureau',
      capacite: parseInt(formData.capacite) || 1,
      equipements: formData.equipements?.split(',').map((e: string) => e.trim()) || [],
      prixHeure: parseFloat(formData.tarifHoraire) || 0,
      prixJour: parseFloat(formData.tarifJournalier) || 0,
      prixSemaine: parseFloat(formData.tarifMensuel) || 0,
      disponible: true,
      description: formData.description || ''
    });
    if (result.success) {
      toast.success('Espace cree avec succes');
      setShowActionModal(false);
      setFormData({});
    } else {
      toast.error(result.error || 'Erreur lors de la creation');
    }
  };

  const handleUpdateEspace = async () => {
    const result = await updateEspace(selectedItem.id, {
      nom: formData.nom,
      type: formData.type,
      capacite: parseInt(formData.capacite),
      equipements: formData.equipements?.split(',').map((e: string) => e.trim()) || [],
      prixHeure: parseFloat(formData.tarifHoraire),
      prixJour: parseFloat(formData.tarifJournalier),
      prixSemaine: parseFloat(formData.tarifMensuel),
      description: formData.description
    });
    if (result.success) {
      toast.success('Espace modifie avec succes');
      setShowActionModal(false);
      setFormData({});
    } else {
      toast.error(result.error || 'Erreur lors de la modification');
    }
  };

  const handleCreateAbonnement = () => {
    addAbonnement({
      nom: formData.nom,
      type: formData.type || 'standard',
      prix: parseFloat(formData.prix) || 0,
      avantages: formData.avantages?.split('\n').filter((a: string) => a.trim()) || [],
      dureeJours: parseInt(formData.dureeJours) || 30,
      couleur: formData.couleur || '#3B82F6'
    });
    toast.success('Abonnement cree avec succes');
    setShowActionModal(false);
    setFormData({});
  };

  const handleUpdateAbonnement = () => {
    updateAbonnement(selectedItem.id, {
      nom: formData.nom,
      prix: parseFloat(formData.prix),
      avantages: formData.avantages?.split('\n').filter((a: string) => a.trim()),
      dureeJours: parseInt(formData.dureeJours),
      couleur: formData.couleur
    });
    toast.success('Abonnement modifie avec succes');
    setShowActionModal(false);
    setFormData({});
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">Administration Coffice</h1>
          <p className="text-gray-600">Gestion complète - {formatDate(today)}</p>
        </div>
        <Button onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Revenus ce mois</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(adminStats.monthlyRevenue)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
              <Building className="w-6 h-6 text-accent" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Espaces disponibles</p>
              <p className="text-2xl font-bold text-primary">{adminStats.availableSpaces}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-warm/10 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-warm" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Réservations aujourd'hui</p>
              <p className="text-2xl font-bold text-primary">{adminStats.todayReservations}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-teal/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-teal" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Utilisateurs actifs</p>
              <p className="text-2xl font-bold text-primary">{adminStats.activeUsers}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Actions urgentes */}
      {adminStats.pendingReservations > 0 && (
        <Card className="p-4 bg-red-50 border border-red-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
              <div>
                <h3 className="font-bold text-red-800">{adminStats.pendingReservations} réservations en attente</h3>
                <p className="text-red-600 text-sm">Nécessitent votre confirmation</p>
              </div>
            </div>
            <Button onClick={() => openActionModal('pending-reservations')}>
              Traiter maintenant
            </Button>
          </div>
        </Card>
      )}
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold text-primary">Gestion des Utilisateurs</h1>
        <Button onClick={() => openActionModal('create-user')}>
          <Plus className="w-5 h-5 mr-2" />
          Nouvel utilisateur
        </Button>
      </div>

      <Card className="p-6">
        <Input
          placeholder="Rechercher un utilisateur..."
          icon={<Search className="w-5 h-5" />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
        
        <div className="space-y-3">
          {users
            .filter(u => 
              u.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
              u.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
              u.email.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((userItem) => (
              <div key={userItem.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent to-teal rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {getInitials(userItem.prenom, userItem.nom)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-primary">{userItem.prenom} {userItem.nom}</p>
                    <p className="text-sm text-gray-600">{userItem.email}</p>
                    <p className="text-xs text-gray-500">{userItem.profession || 'Non renseigné'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={userItem.statut === 'actif' ? 'success' : 'warning'}>
                    {userItem.statut}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openActionModal('edit-user', userItem)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleUserStatus(userItem.id, userItem.statut)}
                  >
                    {userItem.statut === 'actif' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteUser(userItem.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );

  const renderSpaces = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold text-primary">Gestion des Espaces</h1>
        <Button onClick={() => openActionModal('create-space')}>
          <Plus className="w-5 h-5 mr-2" />
          Nouvel espace
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {espaces.map((espace) => (
          <Card key={espace.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-display font-semibold text-primary">{espace.nom}</h3>
                <p className="text-sm text-gray-600">{espace.description}</p>
              </div>
              <Badge variant={espace.disponible ? 'success' : 'error'}>
                {espace.disponible ? 'Disponible' : 'Indisponible'}
              </Badge>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Capacité:</span>
                <span className="font-medium">{espace.capacite} personnes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Prix/heure:</span>
                <span className="font-medium text-accent">{formatCurrency(espace.prixHeure)}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => handleToggleSpaceAvailability(espace.id, espace.disponible)}
              >
                {espace.disponible ? 'Désactiver' : 'Activer'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openActionModal('edit-space', espace)}
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderReservations = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold text-primary">Gestion des Réservations</h1>
      
      <div className="space-y-4">
        {reservations.map((reservation) => (
          <Card key={reservation.id} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-primary">{reservation.espace.nom}</h3>
                <p className="text-sm text-gray-600">
                  {reservation.utilisateur.prenom} {reservation.utilisateur.nom}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDate(reservation.dateDebut)} à {formatTime(reservation.dateDebut)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={reservation.statut === 'confirmee' ? 'success' : 'warning'}>
                  {reservation.statut}
                </Badge>
                <span className="text-sm font-medium">{formatCurrency(reservation.montantTotal)}</span>
                {reservation.statut === 'en_attente' && (
                  <div className="flex gap-1">
                    <Button size="sm" onClick={() => handleConfirmReservation(reservation.id)}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleCancelReservation(reservation.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSubscriptions = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-primary">Gestion des Abonnements</h2>
          <Button onClick={() => openActionModal('create-subscription')}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvel Abonnement
          </Button>
        </div>

        {/* Plans d'abonnement */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {abonnements.map(plan => (
            <Card key={plan.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-primary">{plan.nom}</h3>
                <Badge variant={plan.actif ? 'success' : 'default'}>
                  {plan.actif ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
              <div className="mb-4">
                <p className="text-3xl font-bold text-accent">{formatCurrency(plan.prix, 'DZD')}</p>
                <p className="text-sm text-gray-500">par mois</p>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.avantages.map((avantage, idx) => (
                  <li key={idx} className="flex items-start text-sm text-gray-600">
                    <Check className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    {avantage}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => openActionModal('edit-subscription', plan)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Modifier
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Abonnés actifs */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">
            Abonnements Actifs ({abonnementsUtilisateurs.filter(a => a.statut === 'actif').length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Début</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fin</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {abonnementsUtilisateurs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Aucun abonnement actif pour le moment
                    </td>
                  </tr>
                ) : (
                  abonnementsUtilisateurs.map(sub => (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{sub.utilisateur.prenom} {sub.utilisateur.nom}</p>
                          <p className="text-sm text-gray-500">{sub.utilisateur.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge style={{ backgroundColor: sub.abonnement.couleur }}>
                          {sub.abonnement.nom}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(sub.dateDebut)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(sub.dateFin)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={sub.statut === 'actif' ? 'success' : 'default'}>
                          {sub.statut}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  const renderReports = () => {
    const stats = getAdminStats();
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Calculs KPI avancés
    const reservationsAujourdhui = reservations.filter(r =>
      new Date(r.dateDebut).toDateString() === today.toDateString()
    ).length;

    const caTotal = transactions
      .filter(t => t.statut === 'validee' && t.type !== 'remboursement')
      .reduce((sum, t) => sum + t.montant, 0);

    const caMoisDernier = transactions
      .filter(t => {
        const date = new Date(t.dateCreation);
        return date.getMonth() === (currentMonth - 1) &&
               date.getFullYear() === currentYear &&
               t.statut === 'validee' &&
               t.type !== 'remboursement';
      })
      .reduce((sum, t) => sum + t.montant, 0);

    const croissanceCA = caMoisDernier > 0
      ? (((stats.caMois - caMoisDernier) / caMoisDernier) * 100).toFixed(1)
      : 0;

    const ticketMoyen = stats.reservationsCeMois > 0
      ? stats.caMois / stats.reservationsCeMois
      : 0;

    const abonnesActifs = abonnementsUtilisateurs.filter(a => a.statut === 'actif').length;
    const revenus_abonnements = abonnementsUtilisateurs
      .filter(a => a.statut === 'actif')
      .reduce((sum, a) => sum + a.abonnement.prix, 0);

    const tauxConfirmation = reservations.length > 0
      ? ((reservations.filter(r => r.statut === 'confirmee').length / reservations.length) * 100).toFixed(1)
      : 0;

    const espacePlusReserve = espaces.reduce((max, espace) => {
      const count = reservations.filter(r => r.espace?.id === espace.id).length;
      return count > (max.count || 0) ? { ...espace, count } : max;
    }, { nom: 'N/A', count: 0 });

    const heuresReservees = reservations
      .filter(r => new Date(r.dateDebut).getMonth() === currentMonth)
      .reduce((sum, r) => {
        const debut = new Date(r.dateDebut);
        const fin = new Date(r.dateFin);
        return sum + (fin.getTime() - debut.getTime()) / (1000 * 60 * 60);
      }, 0);

    const nouveauxUtilisateurs = users.filter(u => {
      const date = new Date(u.dateCreation);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-primary">Rapports & Statistiques</h2>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exporter PDF
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exporter Excel
            </Button>
          </div>
        </div>

        {/* KPI Principaux */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 bg-gradient-to-br from-green-50 to-white border-green-200">
            <div className="flex items-center justify-between mb-3">
              <DollarSign className="w-10 h-10 text-green-600" />
              <div className={`flex items-center text-sm font-semibold ${typeof croissanceCA === 'number' && croissanceCA >= 0 || typeof croissanceCA === 'string' && parseFloat(croissanceCA) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="w-4 h-4 mr-1" />
                {(typeof croissanceCA === 'number' ? croissanceCA : parseFloat(croissanceCA)) > 0 ? '+' : ''}{croissanceCA}%
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(stats.caMois, 'DZD')}</p>
            <p className="text-sm text-gray-600">CA du mois</p>
            <p className="text-xs text-gray-500 mt-2">vs {formatCurrency(caMoisDernier, 'DZD')} mois dernier</p>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-blue-50 to-white border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <Calendar className="w-10 h-10 text-blue-600" />
              <Badge variant="info">{reservationsAujourdhui} aujourd'hui</Badge>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.reservationsCeMois}</p>
            <p className="text-sm text-gray-600">Réservations ce mois</p>
            <p className="text-xs text-gray-500 mt-2">{heuresReservees.toFixed(0)}h réservées</p>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-accent/10 to-white border-accent/30">
            <div className="flex items-center justify-between mb-3">
              <UserCheck className="w-10 h-10 text-accent" />
              <Badge style={{ backgroundColor: '#14B8A6' }}>+{nouveauxUtilisateurs} nouveau(x)</Badge>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.activeUsers}</p>
            <p className="text-sm text-gray-600">Utilisateurs actifs</p>
            <p className="text-xs text-gray-500 mt-2">{users.length} au total</p>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-purple-50 to-white border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <BarChart3 className="w-10 h-10 text-purple-600" />
              <div className="text-sm font-semibold text-purple-600">{tauxConfirmation}% confirmé</div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.tauxOccupation}%</p>
            <p className="text-sm text-gray-600">Taux d'occupation</p>
            <p className="text-xs text-gray-500 mt-2">{espaces.filter(e => e.disponible).length}/{espaces.length} espaces dispo</p>
          </Card>
        </div>

        {/* KPI Secondaires */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(ticketMoyen, 'DZD')}</p>
                <p className="text-sm text-gray-600">Ticket moyen</p>
              </div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500" style={{ width: '75%' }}></div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mr-3">
                <CreditCard className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{abonnesActifs}</p>
                <p className="text-sm text-gray-600">Abonnés actifs</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Revenus: {formatCurrency(revenus_abonnements, 'DZD')}/mois</p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                <Building className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold text-gray-900 truncate">{espacePlusReserve.nom}</p>
                <p className="text-sm text-gray-600">Espace le plus réservé</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">{espacePlusReserve.count} réservations</p>
          </Card>
        </div>

        {/* Performance par type d'espace */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Performance par Type d'Espace</h3>
          <div className="space-y-4">
            {['bureau', 'open_space', 'salle_reunion'].map(type => {
              const espacesType = espaces.filter(e => e.type === type);
              const reservationsType = reservations.filter(r => r.espace.type === type);
              const caType = reservationsType.reduce((sum, r) => sum + r.montantTotal, 0);
              const typeLabels: Record<string, string> = {
                'bureau': 'Bureaux Privés',
                'open_space': 'Open Space',
                'salle_reunion': 'Salles de Réunion'
              };
              const percentage = reservations.length > 0
                ? (reservationsType.length / reservations.length * 100).toFixed(0)
                : 0;

              return (
                <div key={type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-700">{typeLabels[type]}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">{reservationsType.length} réservations</span>
                      <span className="text-sm font-semibold text-green-600">{formatCurrency(caType, 'DZD')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-accent to-teal transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-12 text-right">{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Répartition CA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Répartition du CA</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Réservations ponctuelles</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.caMois - revenus_abonnements, 'DZD')}</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {caTotal > 0 ? ((stats.caMois - revenus_abonnements) / caTotal * 100).toFixed(0) : 0}%
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Abonnements</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(revenus_abonnements, 'DZD')}</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {caTotal > 0 ? (revenus_abonnements / caTotal * 100).toFixed(0) : 0}%
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Top 5 Utilisateurs</h3>
            <div className="space-y-3">
              {users
                .map(u => ({
                  ...u,
                  totalSpent: reservations
                    .filter(r => r.utilisateur?.id === u.id)
                    .reduce((sum, r) => sum + r.montantTotal, 0)
                }))
                .sort((a, b) => b.totalSpent - a.totalSpent)
                .slice(0, 5)
                .map((u, idx) => (
                  <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent to-teal rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{idx + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{u.prenom} {u.nom}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{formatCurrency(u.totalSpent, 'DZD')}</p>
                      <p className="text-xs text-gray-500">
                        {reservations.filter(r => r.utilisateur?.id === u.id).length} rés.
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>

        {/* Transactions récentes */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">
            Transactions Récentes ({transactions.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Aucune transaction pour le moment
                    </td>
                  </tr>
                ) : (
                  transactions.slice(0, 10).map(tx => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(tx.dateCreation)}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{tx.utilisateur.prenom} {tx.utilisateur.nom}</p>
                          <p className="text-sm text-gray-500">{tx.utilisateur.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="default">{tx.type}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${tx.type === 'remboursement' ? 'text-red-600' : 'text-green-600'}`}>
                          {tx.type === 'remboursement' ? '-' : '+'} {formatCurrency(tx.montant, 'DZD')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={tx.statut === 'validee' ? 'success' : tx.statut === 'echouee' ? 'danger' : 'warning'}>
                          {tx.statut}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  const renderSettings = () => {
    const handleToggle = (key: string) => {
      const newSettings = { ...notificationSettings, [key]: !notificationSettings[key] };
      setNotificationSettings(newSettings);
      updateNotificationSettings(newSettings);
      toast.success('Paramètres mis à jour');
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-primary">Paramètres Système</h2>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Réinitialiser
          </Button>
        </div>

        {/* Notifications */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium text-gray-900">Notifications Email</p>
                <p className="text-sm text-gray-500">Recevoir des emails pour les événements importants</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.emailNotificationsEnabled}
                  onChange={() => handleToggle('emailNotificationsEnabled')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium text-gray-900">Rappels de Réservation</p>
                <p className="text-sm text-gray-500">Envoyer des rappels 24h avant</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.reservationReminders}
                  onChange={() => handleToggle('reservationReminders')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium text-gray-900">Notifications de Paiement</p>
                <p className="text-sm text-gray-500">Alertes pour les paiements et transactions</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.paymentNotifications}
                  onChange={() => handleToggle('paymentNotifications')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Alertes Maintenance</p>
                <p className="text-sm text-gray-500">Notifications pour la maintenance des espaces</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.maintenanceAlerts}
                  onChange={() => handleToggle('maintenanceAlerts')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>
          </div>
        </Card>

        {/* Paramètres généraux */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Paramètres Généraux</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'espace
              </label>
              <Input value="Coffice Coworking" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse
              </label>
              <Input value="Mohammadia Mall, Bureau 1178, 4ème étage, Alger" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email de contact
              </label>
              <Input type="email" value="desk@coffice.dz" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <Input value="+213 (0)XX XX XX XX" />
            </div>
            <Button className="mt-4">
              Enregistrer les modifications
            </Button>
          </div>
        </Card>

        {/* Informations système */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Informations Système</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Version</p>
              <p className="font-medium">4.2.0</p>
            </div>
            <div>
              <p className="text-gray-500">Dernière mise à jour</p>
              <p className="font-medium">5 Octobre 2025</p>
            </div>
            <div>
              <p className="text-gray-500">Utilisateurs</p>
              <p className="font-medium">{users.length}</p>
            </div>
            <div>
              <p className="text-gray-500">Espaces</p>
              <p className="font-medium">{espaces.length}</p>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'users': return renderUsers();
      case 'spaces': return renderSpaces();
      case 'reservations': return renderReservations();
      case 'subscriptions': return renderSubscriptions();
      case 'reports': return renderReports();
      case 'settings': return renderSettings();
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center p-6 border-b">
            <Logo className="h-12" />
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`
                    flex items-center w-full px-4 py-3 rounded-xl font-medium transition-all duration-200
                    ${active
                      ? 'bg-accent text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-accent'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-teal rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user ? getInitials(user.prenom, user.nom) : 'AD'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user ? `${user.prenom} ${user.nom}` : 'Admin'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@coffice.dz'}</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent text-white mt-1">
                  Admin
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <Search className="w-5 h-5 text-gray-400 absolute left-3" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-gray-50"
              />
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <Bell className="w-5 h-5 text-gray-500" />
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {adminStats.pendingReservations}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>

      {/* Modal d'actions */}
      <Modal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        title="Actions Administrateur"
        size="lg"
      >
        <div className="space-y-6">
          {actionType === 'pending-reservations' && (
            <div>
              <h4 className="font-medium text-primary mb-4">
                Réservations en attente ({adminStats.pendingReservations})
              </h4>
              <div className="space-y-3">
                {reservations.filter(r => r.statut === 'en_attente').map((reservation) => (
                  <div key={reservation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-primary">{reservation.espace.nom}</p>
                      <p className="text-sm text-gray-600">
                        {reservation.utilisateur.prenom} {reservation.utilisateur.nom}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(reservation.dateDebut)} à {formatTime(reservation.dateDebut)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleConfirmReservation(reservation.id)}>
                        <Check className="w-4 h-4 mr-1" />
                        Confirmer
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleCancelReservation(reservation.id)}>
                        <X className="w-4 h-4 mr-1" />
                        Refuser
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(actionType === 'create-user' || actionType === 'edit-user') && (
            <div className="space-y-4">
              <h4 className="font-medium text-primary mb-4">
                {actionType === 'create-user' ? 'Créer un nouvel utilisateur' : 'Modifier l\'utilisateur'}
              </h4>
              <Input
                label="Email *"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="utilisateur@example.com"
              />
              <Input
                label={actionType === 'create-user' ? 'Mot de passe *' : 'Nouveau mot de passe (laisser vide pour ne pas changer)'}
                type="password"
                value={formData.password || ''}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="********"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Prénom"
                  value={formData.prenom || ''}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                />
                <Input
                  label="Nom"
                  value={formData.nom || ''}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                />
              </div>
              <Input
                label="Téléphone"
                value={formData.telephone || ''}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                placeholder="+213..."
              />
              <Input
                label="Entreprise"
                value={formData.entreprise || ''}
                onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
                placeholder="Nom de l'entreprise"
              />
              <Input
                label="Adresse"
                value={formData.adresse || ''}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                placeholder="Adresse complète"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
                <select
                  value={formData.role || 'user'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="user">Utilisateur</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowActionModal(false)}>Annuler</Button>
                <Button onClick={actionType === 'create-user' ? handleCreateUser : handleUpdateUser}>
                  {actionType === 'create-user' ? 'Créer' : 'Modifier'}
                </Button>
              </div>
            </div>
          )}

          {(actionType === 'create-space' || actionType === 'edit-space') && (
            <div className="space-y-4">
              <h4 className="font-medium text-primary mb-4">
                {actionType === 'create-space' ? 'Créer un nouvel espace' : 'Modifier l\'espace'}
              </h4>
              <Input
                label="Nom de l'espace"
                value={formData.nom || ''}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Box 1, Open Space..."
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={formData.type || 'bureau'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  >
                    <option value="bureau">Bureau privé</option>
                    <option value="open_space">Open Space</option>
                    <option value="salle_reunion">Salle de réunion</option>
                  </select>
                </div>
                <Input
                  label="Capacité"
                  type="number"
                  value={formData.capacite || ''}
                  onChange={(e) => setFormData({ ...formData, capacite: e.target.value })}
                />
              </div>
              <Input
                label="Équipements (séparés par virgule)"
                value={formData.equipements || ''}
                onChange={(e) => setFormData({ ...formData, equipements: e.target.value })}
                placeholder="WiFi, Écran, Tableau blanc..."
              />
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Tarif horaire (DZD)"
                  type="number"
                  value={formData.tarifHoraire || ''}
                  onChange={(e) => setFormData({ ...formData, tarifHoraire: e.target.value })}
                />
                <Input
                  label="Tarif journalier (DZD)"
                  type="number"
                  value={formData.tarifJournalier || ''}
                  onChange={(e) => setFormData({ ...formData, tarifJournalier: e.target.value })}
                />
                <Input
                  label="Tarif mensuel (DZD)"
                  type="number"
                  value={formData.tarifMensuel || ''}
                  onChange={(e) => setFormData({ ...formData, tarifMensuel: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  rows={3}
                  placeholder="Description de l'espace..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowActionModal(false)}>Annuler</Button>
                <Button onClick={actionType === 'create-space' ? handleCreateEspace : handleUpdateEspace}>
                  {actionType === 'create-space' ? 'Créer' : 'Modifier'}
                </Button>
              </div>
            </div>
          )}

          {(actionType === 'create-subscription' || actionType === 'edit-subscription') && (
            <div className="space-y-4">
              <h4 className="font-medium text-primary mb-4">
                {actionType === 'create-subscription' ? 'Créer un abonnement' : 'Modifier l\'abonnement'}
              </h4>
              <Input
                label="Nom de l'abonnement"
                value={formData.nom || ''}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Starter, Premium..."
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Prix mensuel (DZD)"
                  type="number"
                  value={formData.prix || ''}
                  onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Durée (jours)"
                  type="number"
                  value={formData.dureeJours || ''}
                  onChange={(e) => setFormData({ ...formData, dureeJours: e.target.value })}
                  placeholder="30"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Couleur</label>
                  <input
                    type="color"
                    value={formData.couleur || '#3B82F6'}
                    onChange={(e) => setFormData({ ...formData, couleur: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Avantages (un par ligne)
                </label>
                <textarea
                  value={formData.avantages?.join ? formData.avantages.join('\n') : formData.avantages || ''}
                  onChange={(e) => setFormData({ ...formData, avantages: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  rows={5}
                  placeholder="Accès zone principale&#10;WiFi haute vitesse&#10;Café inclus"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowActionModal(false)}>Annuler</Button>
                <Button onClick={actionType === 'create-subscription' ? handleCreateAbonnement : handleUpdateAbonnement}>
                  {actionType === 'create-subscription' ? 'Créer' : 'Modifier'}
                </Button>
              </div>
            </div>
          )}

          {actionType === 'pending-reservations' && (
            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => setShowActionModal(false)}>
                Fermer
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ERPSystem;