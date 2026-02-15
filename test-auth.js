const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const env = fs.readFileSync('.env.local', 'utf8')
const getEnv = (key) => env.split('\n').find(l => l.startsWith(key)).split('=')[1].replace(/"/g, '').trim()

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL')
const supabaseKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSignUp() {
    console.log('Testing SignUp...')
    const email = `test-${Date.now()}@example.com`
    const password = 'Password123!'

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: 'Test Agent',
                role: 'farmer'
            }
        }
    })

    if (error) {
        console.error('SignUp Error:', error.message)
        console.error('Details:', error)
    } else {
        console.log('SignUp Success!')
        console.log('User ID:', data.user?.id)
        console.log('Session exists:', !!data.session)
    }
}

testSignUp()
