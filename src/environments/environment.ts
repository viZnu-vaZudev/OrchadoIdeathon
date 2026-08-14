export const environment = {
  production: false,
  // TODO: Replace with your Supabase project URL (Project Settings → API).
  supabaseUrl: 'https://deeutslnkuxkzwixdolr.supabase.co',
  // TODO: Replace with your Supabase anon/public key. NEVER put the service role key here.
  supabaseAnonKey: 'sb_publishable_Kg82HVww4dDp6R16OSO0gA_muMICrQ3'
};

// Firebase configuration placeholders — replace with your project values
export const firebaseConfig = {
  apiKey: 'AIzaSyBfZ_6CfvjxvejqsCG1Ql6y7ZZQyVGNzMI',
  authDomain: 'ideathonnotification.firebaseapp.com',
  projectId: 'ideathonnotification',
  storageBucket: 'ideathonnotification.appspot.com',
  messagingSenderId: '787367206809',
  appId: '1:787367206809:web:9f2d05fa4ff6b1fbc97d08'
};

// VAPID key placeholder for Web Push
export const vapidKey = 'BEmwoDGYPJ9h14XQlChU8BCaH8Frf6UhYWfKXmsh1zcCLlW-7rmbv0DQJ9PE2sLgSkk_waSQS7Ldpj5A3DS27Aw';

// URL of notification send endpoint (deploy the server and set this to its /send URL)
export const edgeFunctionUrl = '';
