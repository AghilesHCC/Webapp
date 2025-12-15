import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Building,
  FileText,
  CheckCircle,
  Check,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Shield,
  Clock,
  Users,
  Star,
  Building2,
  Target,
  Receipt,
  Scale,
  BookOpen,
  Lightbulb,
  Server,
  Zap,
  Award
} from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { useSEO } from '../hooks/useSEO'
import { useAppStore } from '../store/store'

const DomiciliationPublic = () => {
  const { domiciliationServices, loadDemandesDomiciliation } = useAppStore()

  useSEO({
    title: 'Domiciliation d\'Entreprise à Alger | Coffice Coworking',
    description: 'Domiciliez votre entreprise au Centre Commercial Mohammadia Mall. Adresse prestigieuse, conformité légale, contrat notarié. 12.000 DA HT/mois avec accès coworking et partenariat Novihost inclus.',
    keywords: ['domiciliation entreprise Alger', 'adresse commerciale Alger', 'siège social Mohammadia Mall', 'domiciliation SARL Algérie', 'coworking Alger']
  })

  React.useEffect(() => {
    loadDemandesDomiciliation()
  }, [])

  const visibleCompanies = domiciliationServices.filter(service =>
    service.status === 'active' && service.visibleSurSite
  )

  const MAX_DOMICILIATIONS = 60
  const placesRestantes = MAX_DOMICILIATIONS - domiciliationServices.filter(s => s.status === 'active').length

  const pricingPlan = {
    name: 'Offre Unique',
    price: '12 000 DA HT',
    priceValue: 12000,
    period: '/mois',
    description: 'Formule complète pour votre domiciliation professionnelle',
    features: [
      'Adresse commerciale prestigieuse',
      'Gestion et réception du courrier',
      'Attestation de domiciliation',
      'Contrat notarié 100% conforme',
      'Accès coworking 8H/semaine',
      'Salles de réunion prioritaire',
      'Réductions de 20% sur tous les services',
      'Partenariat Novihost premium :',
      '  • Hébergement web professionnel',
      '  • Nom de domaine .DZ inclus',
      '  • 10 adresses email professionnelles',
      'Visibilité sur notre site',
      'Support prioritaire 24/7'
    ],
    popular: true
  }

  const businessServices = [
    {
      icon: Building2,
      name: 'Création d\'Entreprise',
      tagline: 'Accompagnement complet de A à Z',
      description: 'Nous vous accompagnons dans toutes les démarches de création de votre entreprise',
      color: 'from-blue-500 to-indigo-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      features: [
        'Choix de la forme juridique (SARL, EURL, SPA...)',
        'Rédaction des statuts et documents légaux',
        'Constitution du dossier CNRC',
        'Obtention du registre de commerce',
        'Immatriculation fiscale (NIF, NIS, AI)',
        'Accompagnement jusqu\'à l\'ouverture'
      ]
    },
    {
      icon: Target,
      name: 'Conseil & Stratégie',
      tagline: 'Expertise business pour votre réussite',
      description: 'Conseils personnalisés pour développer et optimiser votre activité',
      color: 'from-emerald-500 to-green-500',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      features: [
        'Analyse économique et étude de marché',
        'Business plan et prévisionnel financier',
        'Stratégie de développement commercial',
        'Optimisation fiscale et sociale',
        'Audit et diagnostic d\'entreprise',
        'Conseil en gestion et organisation'
      ]
    },
    {
      icon: Receipt,
      name: 'Comptabilité & Fiscalité',
      tagline: 'Gestion administrative complète',
      description: 'Prenez soin de votre business, on s\'occupe de votre compta',
      color: 'from-violet-500 to-purple-500',
      textColor: 'text-violet-600',
      bgColor: 'bg-violet-50',
      features: [
        'Tenue de comptabilité complète',
        'Déclarations fiscales et sociales',
        'Bulletins de paie et gestion RH',
        'Liasse fiscale et bilan annuel',
        'Suivi de trésorerie',
        'Conseils comptables personnalisés'
      ]
    },
    {
      icon: Scale,
      name: 'Assistance Juridique',
      tagline: 'Support légal pour votre activité',
      description: 'Accompagnement juridique pour toutes vos problématiques',
      color: 'from-rose-500 to-pink-500',
      textColor: 'text-rose-600',
      bgColor: 'bg-rose-50',
      features: [
        'Rédaction de contrats commerciaux',
        'Cession de parts et augmentation capital',
        'Propriété intellectuelle et marques',
        'Conseil en droit des affaires'
      ]
    },
    {
      icon: BookOpen,
      name: 'Formation Professionnelle',
      tagline: 'Développez vos compétences',
      description: 'Formations adaptées aux entrepreneurs et professionnels',
      color: 'from-cyan-500 to-blue-500',
      textColor: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      features: [
        'Gestion d\'entreprise et management',
        'Marketing digital et réseaux sociaux',
        'Comptabilité pour non-comptables',
        'Pitch et levée de fonds',
        'Techniques de vente et négociation',
        'Certification et attestation'
      ]
    }
  ]

  const novihostBenefits = [
    {
      icon: Server,
      title: 'Hébergement Web Premium',
      description: 'Hébergement haute performance pour votre site web professionnel'
    },
    {
      icon: Zap,
      title: 'Domaine .DZ inclus',
      description: 'Un nom de domaine .dz pour votre entreprise'
    },
    {
      icon: Mail,
      title: '10 Adresses Email Pro',
      description: '10 adresses email professionnelles @votreentreprise.dz'
    },
    {
      icon: Shield,
      title: 'Sécurité renforcée',
      description: 'Certificat SSL, sauvegardes automatiques et protection anti-DDoS'
    }
  ]

  const advantages = [
    {
      icon: Building,
      color: 'accent',
      title: 'Adresse Prestigieuse',
      description: 'Centre Commercial et d\'Affaires Mohammadia Mall, 4ème étage, Bureau 1178. Une adresse qui inspire confiance à vos clients et partenaires.'
    },
    {
      icon: Shield,
      color: 'teal',
      title: '100% Conforme',
      description: 'Contrat de location notarié conforme à la réglementation algérienne. Respect total des obligations légales et fiscales.'
    },
    {
      icon: FileText,
      color: 'warm',
      title: 'Service Complet',
      description: 'Attestations et certificats de domiciliation pour toutes vos démarches administratives.'
    },
    {
      icon: Clock,
      color: 'accent',
      title: 'Rapidité',
      description: 'Mise en place rapide de votre domiciliation. Obtenez votre attestation sous 48h après validation et signature.'
    },
    {
      icon: Users,
      color: 'teal',
      title: 'Accompagnement',
      description: 'Notre équipe vous accompagne dans toutes vos démarches administratives et juridiques liées à la domiciliation.'
    },
    {
      icon: CheckCircle,
      color: 'warm',
      title: 'Flexibilité',
      description: 'Formules adaptables selon vos besoins. Possibilité d\'accès au coworking et aux salles de réunion inclus.'
    },
    {
      icon: MapPin,
      color: 'accent',
      title: 'Proximité CNRC & CASNOS',
      description: 'Le Centre Régional du CNRC est situé un étage au-dessus, et la CASNOS également dans le même immeuble. Toutes vos démarches administratives facilitées!'
    }
  ]

  const steps = [
    {
      number: '01',
      title: 'Demande en ligne',
      description: 'Remplissez le formulaire de demande avec les informations de votre entreprise'
    },
    {
      number: '02',
      title: 'Validation',
      description: 'Notre équipe valide votre demande sous 24-48h et vous contacte'
    },
    {
      number: '03',
      title: 'Signature notaire',
      description: 'Rendez-vous chez le notaire pour signature du contrat de location'
    },
    {
      number: '04',
      title: 'Activation',
      description: 'Recevez votre attestation de domiciliation et démarrez vos activités'
    }
  ]

  const documentsNewCreation = [
    {
      text: 'Dénomination de la société',
      note: 'Peut être faite au niveau du CNRC juste au-dessus de nous'
    },
    { text: 'Pièce d\'identité' },
    { text: 'Extrait de naissance' },
    { text: 'Justificatif de domicile (Résidence)' }
  ]

  const documentsTransfer = [
    { text: 'Extrait de registre du commerce' },
    { text: 'Statuts de la société' },
    { text: 'PV de nomination du gérant' },
    {
      text: 'Copie NIF et NIS',
      optional: true
    },
    { text: 'Article d\'imposition' },
    { text: 'Pièce d\'identité du gérant' },
    { text: 'Justificatif de domicile du gérant' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="mb-6">Service de Domiciliation</Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-6">
              Domiciliez votre entreprise<br />au cœur d'Alger
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Une adresse prestigieuse au Centre Commercial Mohammadia Mall pour donner de la crédibilité
              à votre entreprise. <strong className="text-primary">Service exclusivement réservé aux startups labelisées par le ministère et aux auto-entrepreneurs.</strong> Contrat notarié 100% conforme à la législation algérienne.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/inscription">
                <button className="px-8 py-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg inline-flex items-center">
                  Commencer maintenant
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </Link>
              <a href="#tarifs">
                <button className="px-8 py-4 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition-all">
                  Voir les tarifs
                </button>
              </a>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          >
            <Card className="p-6 text-center bg-white">
              <div className="text-4xl font-bold text-accent mb-2">{domiciliationServices.filter(s => s.status === 'active').length}</div>
              <p className="text-gray-600">Entreprises domiciliées</p>
            </Card>
            <Card className="p-6 text-center bg-white">
              <div className="text-4xl font-bold text-teal mb-2">{placesRestantes}</div>
              <p className="text-gray-600">Places disponibles</p>
            </Card>
            <Card className="p-6 text-center bg-white">
              <div className="text-4xl font-bold text-warm mb-2">48h</div>
              <p className="text-gray-600">Délai d'activation</p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Avantages Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Pourquoi choisir Coffice?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Une domiciliation professionnelle avec tous les avantages d'un espace de coworking moderne
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {advantages.map((advantage, index) => (
              <motion.div
                key={advantage.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex"
              >
                <Card className="p-6 flex flex-col hover:shadow-lg transition-shadow w-full">
                  <div className={`w-14 h-14 bg-${advantage.color}/10 rounded-xl flex items-center justify-center mb-4`}>
                    <advantage.icon className={`w-7 h-7 text-${advantage.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-3">{advantage.title}</h3>
                  <p className="text-gray-600">{advantage.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Entreprises Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Services d'accompagnement aux entreprises
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Au-delà de la domiciliation, nous vous accompagnons dans toutes les étapes de vie de votre entreprise
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {businessServices.map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex"
              >
                <Card className="p-6 flex flex-col hover:shadow-xl transition-all duration-300 w-full border-t-4 border-transparent hover:border-current" style={{ borderTopColor: 'currentColor' }}>
                  <div className={`w-16 h-16 ${service.bgColor} rounded-2xl flex items-center justify-center mb-4 shadow-sm`}>
                    <service.icon className={`w-8 h-8 ${service.textColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-2">{service.name}</h3>
                  <p className={`text-sm font-medium ${service.textColor} mb-3`}>{service.tagline}</p>
                  <p className="text-gray-600 text-sm mb-4 flex-grow">{service.description}</p>

                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-green-600" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button className={`mt-6 w-full py-2 px-4 ${service.bgColor} ${service.textColor} font-medium rounded-lg hover:opacity-80 transition-opacity`}>
                    En savoir plus
                  </button>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Besoin d'accompagnement personnalisé? Notre équipe est à votre écoute
            </p>
            <a href="tel:+213238049240" className="inline-flex items-center gap-2 text-primary font-semibold hover:text-accent transition-colors">
              <Phone className="w-5 h-5" />
              +213 23 804 924
            </a>
          </div>
        </div>
      </section>

      {/* Novihost Partnership Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-4">Partenariat inclus</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Partenariat Novihost
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Tous nos clients en domiciliation bénéficient d'un partenariat exclusif avec <strong>Novihost</strong>,
              le leader algérien de l'hébergement web et des noms de domaine .DZ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {novihostBenefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 text-center hover:shadow-lg transition-shadow h-full bg-white">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-primary mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="p-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-3">Pourquoi Novihost?</h3>
                <p className="text-blue-100 mb-4">
                  Novihost est le partenaire idéal pour votre présence en ligne professionnelle.
                  Hébergement fiable, support réactif en français et arabe, et infrastructure 100% algérienne.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-200" />
                    <span>99.9% de disponibilité garantie</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-200" />
                    <span>Serveurs performants en Algérie</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-200" />
                    <span>Support technique professionnel</span>
                  </li>
                </ul>
              </div>
              <div className="flex-shrink-0">
                <a
                  href="https://novihost.dz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  Découvrir Novihost
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Tarifs Section */}
      <section id="tarifs" className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Formule de Domiciliation
            </h2>
            <p className="text-gray-600 text-lg">
              Une offre complète pour votre domiciliation professionnelle
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <Card className="p-8 border-2 border-accent shadow-2xl relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-accent text-white">Offre Unique</Badge>
              </div>

              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-primary mb-2">{pricingPlan.name}</h3>
                <p className="text-gray-600 mb-6">{pricingPlan.description}</p>
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-5xl font-bold text-primary">{pricingPlan.price}</span>
                </div>
                <span className="text-gray-500 text-lg">{pricingPlan.period}</span>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <Server className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary">Partenariat Novihost Premium Inclus</h4>
                    <p className="text-sm text-gray-600">Présence digitale professionnelle complète</p>
                  </div>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {pricingPlan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className={`text-gray-700 ${feature.startsWith('  •') ? 'ml-4 text-sm' : ''}`}>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/inscription" className="block">
                <Button
                  variant="primary"
                  className="w-full"
                  size="lg"
                >
                  Commencer maintenant
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </Card>
          </motion.div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Questions sur notre offre de domiciliation?
            </p>
            <a href="tel:+213238049240" className="inline-flex items-center gap-2 text-primary font-semibold hover:text-accent transition-colors">
              <Phone className="w-5 h-5" />
              +213 23 804 924
            </a>
          </div>
        </div>
      </section>

      {/* Processus Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Comment ça marche?
            </h2>
            <p className="text-gray-600 text-lg">
              Un processus simple et rapide en 4 étapes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-teal text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Documents Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Documents nécessaires
            </h2>
            <p className="text-gray-600 text-lg">
              Préparez ces documents pour accélérer votre demande
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Nouvelle création */}
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary">1. Nouvelle création</h3>
                  <p className="text-sm text-gray-600">Pour les nouvelles sociétés</p>
                </div>
              </div>

              <div className="space-y-3">
                {documentsNewCreation.map((doc, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"
                  >
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-gray-700">{doc.text}</span>
                      {doc.note && (
                        <p className="text-xs text-blue-600 mt-1 italic">{doc.note}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Transfert de siège social */}
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary">2. Transfert de siège social</h3>
                  <p className="text-sm text-gray-600">Pour les sociétés existantes</p>
                </div>
              </div>

              <div className="space-y-3">
                {documentsTransfer.map((doc, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 p-3 bg-teal-50 rounded-lg"
                  >
                    <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-gray-700">{doc.text}</span>
                      {doc.optional && (
                        <Badge className="ml-2 text-xs bg-gray-200 text-gray-600">Optionnel mais recommandé</Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Entreprises Domiciliées Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {visibleCompanies.length > 0
                ? `Rejoignez les ${visibleCompanies.length} entreprises qui ont choisi Coffice pour leur domiciliation`
                : `Soyez parmi les premières entreprises à domicilier votre siège social chez Coffice`
              }
            </p>
          </div>

          {visibleCompanies.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {visibleCompanies.map((company, index) => (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex"
                >
                  <Card className="p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 flex flex-col w-full border-l-4 border-accent">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-teal to-accent rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                        <Building className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-primary text-lg mb-2 truncate">
                          {company.companyName}
                        </h3>
                        <Badge variant="info" className="mb-3 text-xs">
                          {company.legalForm.toUpperCase()}
                        </Badge>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {company.activityDomain}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full w-fit">
                          <MapPin className="w-3 h-3 text-accent" />
                          <span className="font-medium">Mohammadia Mall</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

              <div className="mt-12 text-center">
                <p className="text-gray-600 mb-6">
                  Votre entreprise pourrait être ici!
                </p>
                <Link to="/inscription">
                  <button className="px-8 py-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg inline-flex items-center">
                    Rejoignez-nous
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-8">
                  Nous lançons notre service de domiciliation. Profitez de tarifs préférentiels en tant que membre fondateur!
                </p>
                <Link to="/inscription">
                  <button className="px-8 py-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg inline-flex items-center">
                    Je deviens membre fondateur
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-accent to-teal text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Prêt à domicilier votre entreprise?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Rejoignez les entreprises qui nous font confiance et donnez une adresse prestigieuse à votre société
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/inscription">
                <Button size="lg" className="bg-white text-accent hover:bg-gray-100">
                  Créer un compte
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  <Phone className="w-5 h-5 mr-2" />
                  Nous contacter
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 px-4 bg-white border-t">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <MapPin className="w-8 h-8 text-accent mb-3" />
              <h3 className="font-semibold text-primary mb-2">Adresse</h3>
              <p className="text-gray-600 text-sm">
                Centre Commercial Mohammadia Mall<br />
                4ème étage, Bureau 1178<br />
                Mohammadia, Alger
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Phone className="w-8 h-8 text-teal mb-3" />
              <h3 className="font-semibold text-primary mb-2">Téléphone</h3>
              <p className="text-gray-600 text-sm">
                +213 23 804 924<br />
                Dim - Jeu: 09h - 17h
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Mail className="w-8 h-8 text-warm mb-3" />
              <h3 className="font-semibold text-primary mb-2">Email</h3>
              <p className="text-gray-600 text-sm">
                desk@coffice.dz
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default DomiciliationPublic
