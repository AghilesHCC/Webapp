import { motion } from 'framer-motion'
import { Users, Target, Heart } from 'lucide-react'
import { useSEO } from '../hooks/useSEO'
import { IMAGES } from '../config/images'

const About = () => {
  useSEO()

  return (
    <div className="min-h-screen pt-16">
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
                src={IMAGES.spaces.coworking.url}
                alt={IMAGES.spaces.coworking.alt}
                className="rounded-2xl shadow-2xl"
                loading="lazy"
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
                  <img src="/novihost-logo.png" alt="Novihost" className="h-12 w-auto" />
                  <div className="h-12 w-px bg-accent/30"></div>
                  <img src="/logo.png" alt="Coffice" className="h-10 w-auto" />
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