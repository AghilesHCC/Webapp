import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Clock, Users, Target, Heart } from 'lucide-react'
import { useSEO } from '../hooks/useSEO'

const About = () => {
  useSEO()

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="pt-16 pb-20 bg-gradient-to-r from-accent to-teal text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-display font-bold mb-6"
          >
            À Propos de Coffice
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/90 max-w-3xl mx-auto"
          >
            Découvrez l'histoire et la vision de Coffice, le premier espace de coworking 
            nouvelle génération à Alger
          </motion.p>
        </div>
      </section>

      {/* Notre Histoire */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="animate-on-scroll"
            >
              <h2 className="text-4xl font-display font-bold text-primary mb-6">
                Notre Histoire
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Coffice est bien plus qu'un simple espace de coworking. Nous sommes un <strong className="text-primary">accélérateur-incubateur de startups</strong> dédié à l'écosystème entrepreneurial algérien, situé au cœur du <strong>Mohammadia Mall</strong>.
              </p>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Fondé en 2024, Coffice offre un environnement de travail moderne sur <strong>200m²</strong>, conçu pour stimuler l'innovation et favoriser la collaboration entre entrepreneurs, freelances et startups labelisées.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Grâce à notre partenariat stratégique avec <strong className="text-accent">Novihost</strong>, nous construisons un véritable écosystème propice à la croissance des projets innovants en Algérie.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="animate-on-scroll"
            >
              <img
                src="/espace_de_cowoking_vue_.jpeg"
                alt="Espace Coffice - Open Space"
                className="rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Nos Valeurs */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl font-display font-bold text-primary mb-4">
              Nos Valeurs
            </h2>
            <p className="text-xl text-gray-600">
              Les principes qui guident notre mission quotidienne
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -5 }}
              className="text-center p-8 bg-white rounded-2xl shadow-lg animate-on-scroll"
            >
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-display font-bold text-primary mb-4">Communauté</h3>
              <p className="text-gray-600">
                Nous créons un environnement où les professionnels peuvent se connecter, 
                collaborer et grandir ensemble dans un esprit de partage et d'entraide.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="text-center p-8 bg-white rounded-2xl shadow-lg animate-on-scroll"
            >
              <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-teal" />
              </div>
              <h3 className="text-xl font-display font-bold text-primary mb-4">Excellence</h3>
              <p className="text-gray-600">
                Nous nous engageons à fournir des services et des espaces de la plus haute qualité, 
                avec une attention particulière aux détails et aux besoins de nos membres.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="text-center p-8 bg-white rounded-2xl shadow-lg animate-on-scroll"
            >
              <div className="w-16 h-16 bg-warm/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-warm" />
              </div>
              <h3 className="text-xl font-display font-bold text-primary mb-4">Passion</h3>
              <p className="text-gray-600">
                Notre passion pour l'innovation et l'entrepreneuriat nous pousse à créer 
                des expériences uniques qui inspirent et motivent nos membres.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Localisation */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="animate-on-scroll"
            >
              <h2 className="text-4xl font-display font-bold text-primary mb-6">
                Notre Localisation
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Situé au cœur d'Alger, Coffice bénéficie d'un emplacement stratégique 
                facilement accessible en transport en commun et disposant de nombreuses 
                places de parking à proximité.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary mb-1">Adresse</h3>
                    <p className="text-gray-600">
                      Centre Commercial Mohammadia Mall<br/>
                      4ème étage, Bureau 1178<br/>
                      Mohammadia, Alger
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      <strong>Commodités :</strong> Parking couvert sécurisé 24/7, antennes CNRC et CASNOS dans l'immeuble, notaires et services aux entrepreneurs à proximité
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-teal/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-teal" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary mb-1">Téléphone</h3>
                    <p className="text-gray-600">+213 23 804 924</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-warm/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-warm" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary mb-1">Email</h3>
                    <p className="text-gray-600">desk@coffice.dz</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-rose/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-rose" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary mb-1">Horaires</h3>
                    <p className="text-gray-600">
                      Dimanche - Jeudi : 08h30 - 16h30
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="animate-on-scroll"
            >
              <div className="bg-gradient-to-br from-accent/10 to-teal/10 rounded-2xl overflow-hidden shadow-lg">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3196.9!2d3.052!3d36.731!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzbCsDQzJzUxLjYiTiAzwrAwMycwNy4yIkU!5e0!3m2!1sfr!2sdz!4v1234567890"
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localisation Coffice - Centre Commercial Mohammadia Mall"
                  className="w-full h-96"
                ></iframe>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Nos Partenaires */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl font-display font-bold text-primary mb-4">
              Nos Partenaires
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des collaborations stratégiques pour accompagner au mieux votre réussite
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="animate-on-scroll"
            >
              <div className="bg-gradient-to-br from-accent/5 to-teal/5 rounded-2xl p-8 border-2 border-accent/20">
                <div className="flex items-center gap-4 mb-6">
                  <img src="/novihost-logo.png" alt="Novihost" className="h-16" />
                  <div className="h-12 w-px bg-accent/30"></div>
                  <div className="text-2xl font-bold text-primary">COFFICE</div>
                </div>
                <h3 className="text-2xl font-bold text-primary mb-4">
                  Partenariat Novihost × Coffice
                </h3>
                <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                  Notre partenariat avec <strong>Novihost</strong>, leader de l'hébergement web en Algérie depuis 1999,
                  nous permet d'offrir une solution complète aux entrepreneurs : un espace physique professionnel
                  couplé à une présence digitale performante.
                </p>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Ensemble, nous créons l'écosystème idéal pour les startups et PME algériennes,
                  combinant domiciliation d'entreprise, espace de coworking, hébergement web,
                  nom de domaine .dz et services digitaux.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-accent"></div>
                    </div>
                    <p className="text-gray-700">
                      <strong>Pack Croisé :</strong> Domiciliation + Coworking + Web Hosting
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-accent"></div>
                    </div>
                    <p className="text-gray-700">
                      <strong>Codes Promo Mutuels :</strong> Avantages exclusifs pour nos membres
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-accent"></div>
                    </div>
                    <p className="text-gray-700">
                      <strong>Support 24/7 :</strong> Assistance technique et administrative continue
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="animate-on-scroll"
            >
              <div className="space-y-6">
                <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-accent/30 hover:shadow-lg transition-all">
                  <div className="text-4xl mb-3">🚀</div>
                  <h4 className="text-xl font-bold text-primary mb-2">Accélérer les Startups</h4>
                  <p className="text-gray-600">
                    Nous croyons que chaque entrepreneur algérien mérite les meilleurs outils
                    pour réussir. Notre mission est de supprimer les barrières entre l'idée
                    et la réalisation.
                  </p>
                </div>

                <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-accent/30 hover:shadow-lg transition-all">
                  <div className="text-4xl mb-3">🤝</div>
                  <h4 className="text-xl font-bold text-primary mb-2">Écosystème Intégré</h4>
                  <p className="text-gray-600">
                    En combinant espace physique (Coffice) et infrastructure digitale (Novihost),
                    nous créons un écosystème complet où les entrepreneurs peuvent se concentrer
                    sur l'essentiel : faire grandir leur business.
                  </p>
                </div>

                <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-accent/30 hover:shadow-lg transition-all">
                  <div className="text-4xl mb-3">💡</div>
                  <h4 className="text-xl font-bold text-primary mb-2">Innovation Continue</h4>
                  <p className="text-gray-600">
                    Nous innovons constamment pour offrir de nouveaux services adaptés
                    aux besoins des entrepreneurs algériens. D'autres partenariats stratégiques
                    sont en cours pour enrichir notre offre.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-accent text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 animate-on-scroll">
          <h2 className="text-4xl font-display font-bold mb-4">
            Venez Nous Rencontrer
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Planifiez une visite de nos espaces et découvrez pourquoi Coffice 
            est le choix idéal pour votre activité professionnelle
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="tel:+213555123456"
              className="bg-white text-accent px-8 py-4 rounded-full hover:bg-gray-100 transition-colors text-lg font-semibold"
            >
              Planifier une visite
            </a>
            <a 
              href="mailto:desk@coffice.dz"
              className="border-2 border-white text-white px-8 py-4 rounded-full hover:bg-white hover:text-accent transition-all text-lg font-semibold"
            >
              Nous contacter
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About