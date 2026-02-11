-- Invite accept (v2): on accept, create org_membership + default cash_box_memberships

create or replace function public.spendnote_accept_invite_v2(
  p_token text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_email text;
  v_hash text;
  v_invite public.invites;
  v_role text;
  v_org_id uuid;
  v_first_box_id uuid;
  v_now timestamptz := now();
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select lower(trim(email))
    into v_email
  from public.profiles
  where id = v_uid
  limit 1;

  if v_email is null or v_email = '' then
    raise exception 'Profile missing';
  end if;

  v_hash := encode(public.digest(coalesce(p_token, ''), 'sha256'), 'hex');

  select *
    into v_invite
  from public.invites
  where token_hash = v_hash
    and status = 'pending'
    and (expires_at is null or expires_at > v_now)
  limit 1;

  if v_invite.id is null then
    raise exception 'Invite not found or not pending';
  end if;

  if lower(coalesce(v_invite.invited_email, '')) <> v_email then
    raise exception 'Invite email mismatch';
  end if;

  v_role := case
    when lower(coalesce(v_invite.role, '')) = 'admin' then 'admin'
    else 'user'
  end;

  v_org_id := v_invite.org_id;

  insert into public.org_memberships (org_id, user_id, role)
  values (v_org_id, v_uid, v_role)
  on conflict (org_id, user_id)
  do update set role = excluded.role;

  update public.invites
  set status = 'active',
      accepted_by = v_uid
  where id = v_invite.id;

  if v_role = 'admin' then
    insert into public.cash_box_memberships (cash_box_id, user_id, role_in_box)
    select cb.id, v_uid, 'admin'
    from public.cash_boxes cb
    where cb.org_id = v_org_id
    on conflict (cash_box_id, user_id) do nothing;
  else
    select cb.id
      into v_first_box_id
    from public.cash_boxes cb
    where cb.org_id = v_org_id
    order by cb.sort_order nulls last, cb.created_at asc
    limit 1;

    if v_first_box_id is not null then
      insert into public.cash_box_memberships (cash_box_id, user_id, role_in_box)
      values (v_first_box_id, v_uid, 'user')
      on conflict (cash_box_id, user_id) do nothing;
    end if;
  end if;

  return jsonb_build_object(
    'success', true,
    'org_id', v_org_id,
    'role', v_role
  );
end;
$$;
