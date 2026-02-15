const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rgkwogjvsuwqmcaenfvo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJna3dvZ2p2c3V3cW1jYWVuZnZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NzcyOTgsImV4cCI6MjA4NjQ1MzI5OH0.F6Zu4D9au74J_vEh8sFfZBsh9-gZaCJzyiHdszZ5kE8'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
    console.log('🔍 Проверка подключения к Supabase...\n')

    try {
        // Проверяем все поля
        const { data: allFields, error: allError, count: totalCount } = await supabase
            .from('fields')
            .select('*', { count: 'exact' })

        if (allError) {
            console.error('❌ Ошибка при чтении таблицы fields:', allError.message)
            return
        }

        console.log(`📊 Всего полей в базе: ${totalCount || 0}`)

        // Проверяем pending поля
        const { data, error, count } = await supabase
            .from('fields')
            .select('*, profiles(full_name)', { count: 'exact' })
            .eq('status', 'pending')
            .order('risk_score', { ascending: false })

        if (error) {
            console.error('❌ Ошибка при чтении pending полей:', error.message)
            console.error('Детали:', error)
            return
        }

        console.log(`✅ Заявок в статусе "pending": ${count || 0}\n`)

        if (data && data.length > 0) {
            console.log('📋 Список заявок в очереди:')
            data.forEach((field, i) => {
                console.log(`  ${i + 1}. ${field.name} - ${field.crop_type} (Риск: ${field.risk_score}%)`)
                console.log(`     Фермер: ${field.profiles?.full_name || 'Неизвестно'}`)
                console.log(`     ID: ${field.id}`)
                console.log('')
            })
        } else {
            console.log('⚠️  НЕТ ЗАЯВОК В ОЧЕРЕДИ!')
            console.log('\n💡 Решение:')
            console.log('   1. Откройте Supabase Dashboard → SQL Editor')
            console.log('   2. Вставьте SQL скрипт для создания моковых данных')
            console.log('   3. Нажмите RUN\n')
        }

    } catch (err) {
        console.error('❌ Критическая ошибка:', err.message)
    }
}

testConnection()
