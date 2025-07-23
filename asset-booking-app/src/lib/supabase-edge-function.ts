// Initialize Database Edge Function
// This function will be deployed to Supabase Edge Functions
// It creates the necessary tables and policies for the Asset Booking App

interface RequestWithSupabase {
  supabaseClient: {
    rpc: (functionName: string, params?: Record<string, any>) => Promise<{
      data: any;
      error: any;
    }>;
  };
}

export async function initializeDatabase(req: RequestWithSupabase): Promise<Response> {
  // Get the Supabase client from the environment
  const { supabaseClient } = req;

  try {
    // Create assets table if it doesn't exist
    await supabaseClient.rpc('init_database_tables');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Database initialized successfully' 
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error: unknown) {
    console.error('Failed to initialize database:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
}

// Helper function to check if table exists
export async function tableExists(req: RequestWithSupabase, tableName: string): Promise<boolean> {
  const { supabaseClient } = req;
  
  try {
    const { data, error } = await supabaseClient.rpc('check_table_exists', { table_name: tableName });
    
    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}