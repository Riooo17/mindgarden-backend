# Paystack + Supabase Backend

## Deploy to Render
1. Push this project to GitHub.
2. Create a new **Web Service** in Render.
3. Connect your repo.
4. Set **Environment Variables**:
   - PAYSTACK_SECRET
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE
   - PORT=10000
5. Deploy.

## API Endpoints
- `POST /create-payment`
  - Body: `{ "email": "user@email.com", "amount": 49900 }`
  - Returns: `{ "authorization_url": "https://checkout.paystack.com/..." }`

- `POST /paystack-webhook`
  - Set this URL in Paystack Dashboard Webhooks.
  - Automatically updates Supabase `profiles.is_premium=true`.

## Notes
- Amount is in **kobo** (KES*100).
- The frontend should call `/create-payment`, then redirect user.
- On webhook success, the backend updates Supabase.
