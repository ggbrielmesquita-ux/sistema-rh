import { createClient } from '@supabase/supabase-js'

// 👇 COLOQUEI SEU LINK AQUI DIRETO (Confirme se é este mesmo)
const supabaseUrl = 'https://mlnumtqkgkrprpsbhys.supabase.co'

// 👇 APAGUE O TEXTO ABAIXO E COLE SUA CHAVE GIGANTE (aquela que começa com eyJh...) DENTRO DAS ASPAS
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sbnVtdHFrZ2tycHJwcnNiaHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMjcwNjMsImV4cCI6MjA4NTkwMzA2M30.SKg75x-pV-MJWlIarM45vP7J0t8bpsHRd1SL1yE8AeU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)