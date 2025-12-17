import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage,
    storageKey: 'coffice-auth',
    flowType: 'pkce'
  }
})

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          nom: string
          prenom: string
          telephone: string | null
          role: 'user' | 'admin'
          statut: 'actif' | 'inactif' | 'suspendu'
          avatar: string | null
          profession: string | null
          entreprise: string | null
          adresse: string | null
          bio: string | null
          wilaya: string | null
          commune: string | null
          type_entreprise: string | null
          nif: string | null
          nis: string | null
          registre_commerce: string | null
          article_imposition: string | null
          numero_auto_entrepreneur: string | null
          raison_sociale: string | null
          date_creation_entreprise: string | null
          capital: number | null
          siege_social: string | null
          activite_principale: string | null
          forme_juridique: string | null
          absences: number | null
          banned_until: string | null
          derniere_connexion: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          nom: string
          prenom: string
          telephone?: string | null
          role?: 'user' | 'admin'
          statut?: 'actif' | 'inactif' | 'suspendu'
          avatar?: string | null
          profession?: string | null
          entreprise?: string | null
          adresse?: string | null
          bio?: string | null
          wilaya?: string | null
          commune?: string | null
          type_entreprise?: string | null
          nif?: string | null
          nis?: string | null
          registre_commerce?: string | null
          article_imposition?: string | null
          numero_auto_entrepreneur?: string | null
          raison_sociale?: string | null
          date_creation_entreprise?: string | null
          capital?: number | null
          siege_social?: string | null
          activite_principale?: string | null
          forme_juridique?: string | null
          absences?: number | null
          banned_until?: string | null
          derniere_connexion?: string | null
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      parrainages: {
        Row: {
          id: string
          parrain_id: string
          code_parrain: string
          parraines: number
          recompenses_totales: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          parrain_id: string
          code_parrain: string
          parraines?: number
          recompenses_totales?: number
        }
        Update: Partial<Database['public']['Tables']['parrainages']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'parrainage' | 'reservation' | 'domiciliation' | 'abonnement' | 'system'
          titre: string
          message: string
          lue: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type?: 'parrainage' | 'reservation' | 'domiciliation' | 'abonnement' | 'system'
          titre: string
          message: string
          lue?: boolean
        }
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
    }
  }
}
