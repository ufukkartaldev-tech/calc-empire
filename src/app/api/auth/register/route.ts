import { NextResponse } from 'next/server';
import { supabase } from '@/lib/auth/supabase-client';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = registerSchema.parse(body);

    // Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name,
        },
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 400 });
    }

    // Insert into profiles table
    const { error: profileError } = await supabase.from('profiles').insert([
      {
        id: authData.user.id,
        display_name: name,
        email: email,
      },
    ]);

    if (profileError) {
      // It might fail if profile is auto-created by trigger, ignore it
      console.warn('Profile insert error (might be handled by DB trigger):', profileError);
    }

    return NextResponse.json({ success: true, user: { id: authData.user.id, email } });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
