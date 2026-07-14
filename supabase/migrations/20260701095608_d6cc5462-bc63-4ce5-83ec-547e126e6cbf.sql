
-- List users with their roles (admin only)
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE(user_id uuid, email text, created_at timestamptz, last_sign_in_at timestamptz, roles text[])
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  RETURN QUERY
  SELECT u.id, u.email::text, u.created_at, u.last_sign_in_at,
    COALESCE(array_agg(ur.role::text) FILTER (WHERE ur.role IS NOT NULL), ARRAY[]::text[])
  FROM auth.users u
  LEFT JOIN public.user_roles ur ON ur.user_id = u.id
  GROUP BY u.id, u.email, u.created_at, u.last_sign_in_at
  ORDER BY u.created_at DESC;
END;
$$;

-- Grant or revoke a role by email (admin only). Cannot remove own admin role.
CREATE OR REPLACE FUNCTION public.admin_set_role(_email text, _role app_role, _grant boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT id INTO target_id FROM auth.users WHERE lower(email) = lower(_email) LIMIT 1;
  IF target_id IS NULL THEN
    RAISE EXCEPTION 'user not found';
  END IF;

  IF _grant THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (target_id, _role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    IF _role = 'admin' AND target_id = auth.uid() THEN
      RAISE EXCEPTION 'cannot remove your own admin role';
    END IF;
    DELETE FROM public.user_roles WHERE user_id = target_id AND role = _role;
  END IF;

  RETURN true;
END;
$$;
