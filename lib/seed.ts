import { createClient } from '@supabase/supabase-js'
import { RouteWithDetails } from '@/types'
import { mockRoutes } from './mock-data'

// This script seeds your Supabase database with the mock data
// Run it after setting up your Supabase project

async function seedDatabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for seeding

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    console.log('Starting database seed...')

    // Create a test user first (or use an existing one)
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: 'test@mototrip.com',
      password: 'testpassword123',
      email_confirm: true,
    })

    if (userError && userError.message !== 'User already registered') {
      throw userError
    }

    const userId = userData?.user?.id || 'existing-user-id'

    // Insert routes
    for (const route of mockRoutes) {
      const { stops, ...routeData } = route

      const { data: insertedRoute, error: routeError } = await supabase
        .from('routes')
        .insert({
          ...routeData,
          user_id: userId,
        })
        .select()
        .single()

      if (routeError) {
        console.error(`Error inserting route ${route.title}:`, routeError)
        continue
      }

      console.log(`✓ Inserted route: ${route.title}`)

      // Insert stops if they exist
      if (stops && stops.length > 0) {
        const stopsData = stops.map(stop => ({
          ...stop,
          route_id: insertedRoute.id,
        }))

        const { error: stopsError } = await supabase
          .from('route_stops')
          .insert(stopsData)

        if (stopsError) {
          console.error(`Error inserting stops for ${route.title}:`, stopsError)
        } else {
          console.log(`  ✓ Inserted ${stops.length} stops`)
        }
      }
    }

    console.log('✓ Database seed completed!')
  } catch (error) {
    console.error('Error seeding database:', error)
  }
}

// Run the seed function
if (require.main === module) {
  seedDatabase()
}

export { seedDatabase }
