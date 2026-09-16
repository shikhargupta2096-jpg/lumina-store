import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload = await req.json();
    const record = payload.record;

    if (!record) {
      throw new Error('No record found in webhook payload');
    }

    // Query all users
    const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) throw usersError;

    const users = usersData.users;
    const name = record.name || 'Unknown';
    const interest = record.interest || 'your services';
    const bodyText = record.message ? (record.message.substring(0, 97) + '...') : `${name} is interested in ${interest}`;

    // Create notifications for all admin users
    const notificationsToInsert = users.map((user) => ({
      user_id: user.id,
      title: `New Inquiry from ${name}`,
      body: bodyText,
      inquiry_id: record.id,
      is_read: false
    }));

    if (notificationsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notificationsToInsert);
      
      if (insertError) {
        console.error('Error inserting notifications:', insertError);
      }
    }

    // Query push tokens
    const { data: tokensData, error: tokensError } = await supabase
      .from('push_tokens')
      .select('token');

    let notifiedCount = 0;

    if (tokensData && tokensData.length > 0) {
      const expoMessages = tokensData.map((row) => ({
        to: row.token,
        sound: 'default',
        title: 'New Inquiry',
        body: `${name} is interested in ${interest}`,
        data: { inquiryId: record.id }
      }));

      const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expoMessages)
      });

      const expoResult = await expoResponse.json();
      console.log('Expo push result:', expoResult);
      notifiedCount = expoMessages.length;
    }

    return new Response(JSON.stringify({ success: true, notified: notifiedCount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in send-push-notification:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
