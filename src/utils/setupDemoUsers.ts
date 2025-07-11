
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
      } else {
        console.log(`Demo user ${user.email} created successfully`);
      }
    } catch (err) {
      console.error(`Exception creating user ${user.email}:`, err);
    }
  }
  
  console.log('Demo user setup complete');
};
