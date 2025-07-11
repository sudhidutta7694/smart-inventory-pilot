
import { supabase } from "@/integrations/supabase/client";

export const setupDemoUsers = async () => {
  const demoUsers = [
    {
      email: 'admin1@supply.com',
      password: 'south123pass',
      userData: {
        name: 'Sarah Johnson',
        warehouse: 'South'
      }
    },
    {
      email: 'admin2@supply.com', 
      password: 'east123pass',
      userData: {
        name: 'Mike Chen',
        warehouse: 'East'
      }
    }
  ];

  console.log('Setting up demo users...');
  
  for (const user of demoUsers) {
    try {
      // First, check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', user.email)
        .maybeSingle();

      if (existingUser) {
        console.log(`Demo user ${user.email} already exists`);
        continue;
      }

      // Try to sign up the user
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: user.userData
        }
      });

      if (error) {
        console.error(`Error creating user ${user.email}:`, error.message);
        
        // If user already exists but not in our users table, try to sign them in to trigger profile creation
        if (error.message.includes('already registered')) {
          console.log(`User ${user.email} already registered, attempting to create profile...`);
          
          try {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: user.email,
              password: user.password
            });

            if (!signInError && signInData.user) {
              // Create the user profile manually
              const { error: insertError } = await supabase
                .from('users')
                .insert([{
                  id: signInData.user.id,
                  email: user.email,
                  name: user.userData.name,
                  warehouse: user.userData.warehouse
                }]);

              if (insertError) {
                console.error(`Error creating profile for ${user.email}:`, insertError);
              } else {
                console.log(`Profile created for existing user ${user.email}`);
              }

              // Sign out after creating profile
              await supabase.auth.signOut();
            }
          } catch (signInErr) {
            console.error(`Error signing in ${user.email}:`, signInErr);
          }
        }
      } else {
        console.log(`Demo user ${user.email} created successfully`);
      }
    } catch (err) {
      console.error(`Exception creating user ${user.email}:`, err);
    }
  }
  
  console.log('Demo user setup complete');
};
