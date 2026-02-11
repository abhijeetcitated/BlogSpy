begin;

-- userprojects
alter table if exists public.userprojects enable row level security;

drop policy if exists "userprojects_select_own" on public.userprojects;
create policy "userprojects_select_own"
  on public.userprojects
  for select
  to authenticated
  using (userid = auth.uid());

drop policy if exists "userprojects_insert_own" on public.userprojects;
create policy "userprojects_insert_own"
  on public.userprojects
  for insert
  to authenticated
  with check (userid = auth.uid());

drop policy if exists "userprojects_update_own" on public.userprojects;
create policy "userprojects_update_own"
  on public.userprojects
  for update
  to authenticated
  using (userid = auth.uid())
  with check (userid = auth.uid());

drop policy if exists "userprojects_delete_own" on public.userprojects;
create policy "userprojects_delete_own"
  on public.userprojects
  for delete
  to authenticated
  using (userid = auth.uid());

-- activity_logs
alter table if exists public.activity_logs enable row level security;

drop policy if exists "activity_logs_select_own" on public.activity_logs;
create policy "activity_logs_select_own"
  on public.activity_logs
  for select
  to authenticated
  using (
    user_id = auth.uid()
    and (
      project_id is null
      or exists (
        select 1
        from public.userprojects p
        where p.id = activity_logs.project_id
          and p.userid = auth.uid()
      )
    )
  );

drop policy if exists "activity_logs_insert_own" on public.activity_logs;
create policy "activity_logs_insert_own"
  on public.activity_logs
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and (
      project_id is null
      or exists (
        select 1
        from public.userprojects p
        where p.id = activity_logs.project_id
          and p.userid = auth.uid()
      )
    )
  );

drop policy if exists "activity_logs_update_own" on public.activity_logs;
create policy "activity_logs_update_own"
  on public.activity_logs
  for update
  to authenticated
  using (
    user_id = auth.uid()
    and (
      project_id is null
      or exists (
        select 1
        from public.userprojects p
        where p.id = activity_logs.project_id
          and p.userid = auth.uid()
      )
    )
  )
  with check (
    user_id = auth.uid()
    and (
      project_id is null
      or exists (
        select 1
        from public.userprojects p
        where p.id = activity_logs.project_id
          and p.userid = auth.uid()
      )
    )
  );

drop policy if exists "activity_logs_delete_own" on public.activity_logs;
create policy "activity_logs_delete_own"
  on public.activity_logs
  for delete
  to authenticated
  using (
    user_id = auth.uid()
    and (
      project_id is null
      or exists (
        select 1
        from public.userprojects p
        where p.id = activity_logs.project_id
          and p.userid = auth.uid()
      )
    )
  );

-- rank_history
alter table if exists public.rank_history enable row level security;

drop policy if exists "rank_history_select_own_project" on public.rank_history;
create policy "rank_history_select_own_project"
  on public.rank_history
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.userprojects p
      where p.id = rank_history.project_id
        and p.userid = auth.uid()
    )
  );

drop policy if exists "rank_history_insert_own_project" on public.rank_history;
create policy "rank_history_insert_own_project"
  on public.rank_history
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.userprojects p
      where p.id = rank_history.project_id
        and p.userid = auth.uid()
    )
  );

drop policy if exists "rank_history_update_own_project" on public.rank_history;
create policy "rank_history_update_own_project"
  on public.rank_history
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.userprojects p
      where p.id = rank_history.project_id
        and p.userid = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.userprojects p
      where p.id = rank_history.project_id
        and p.userid = auth.uid()
    )
  );

drop policy if exists "rank_history_delete_own_project" on public.rank_history;
create policy "rank_history_delete_own_project"
  on public.rank_history
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.userprojects p
      where p.id = rank_history.project_id
        and p.userid = auth.uid()
    )
  );

-- content_performance
alter table if exists public.content_performance enable row level security;

drop policy if exists "content_performance_select_own_project" on public.content_performance;
create policy "content_performance_select_own_project"
  on public.content_performance
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.userprojects p
      where p.id = content_performance.project_id
        and p.userid = auth.uid()
    )
  );

drop policy if exists "content_performance_insert_own_project" on public.content_performance;
create policy "content_performance_insert_own_project"
  on public.content_performance
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.userprojects p
      where p.id = content_performance.project_id
        and p.userid = auth.uid()
    )
  );

drop policy if exists "content_performance_update_own_project" on public.content_performance;
create policy "content_performance_update_own_project"
  on public.content_performance
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.userprojects p
      where p.id = content_performance.project_id
        and p.userid = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.userprojects p
      where p.id = content_performance.project_id
        and p.userid = auth.uid()
    )
  );

drop policy if exists "content_performance_delete_own_project" on public.content_performance;
create policy "content_performance_delete_own_project"
  on public.content_performance
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.userprojects p
      where p.id = content_performance.project_id
        and p.userid = auth.uid()
    )
  );

-- trend_watchlist
alter table if exists public.trend_watchlist enable row level security;

drop policy if exists "trend_watchlist_select_own_project" on public.trend_watchlist;
create policy "trend_watchlist_select_own_project"
  on public.trend_watchlist
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.userprojects p
      where p.id = trend_watchlist.project_id
        and p.userid = auth.uid()
    )
  );

drop policy if exists "trend_watchlist_insert_own_project" on public.trend_watchlist;
create policy "trend_watchlist_insert_own_project"
  on public.trend_watchlist
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.userprojects p
      where p.id = trend_watchlist.project_id
        and p.userid = auth.uid()
    )
  );

drop policy if exists "trend_watchlist_update_own_project" on public.trend_watchlist;
create policy "trend_watchlist_update_own_project"
  on public.trend_watchlist
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.userprojects p
      where p.id = trend_watchlist.project_id
        and p.userid = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.userprojects p
      where p.id = trend_watchlist.project_id
        and p.userid = auth.uid()
    )
  );

drop policy if exists "trend_watchlist_delete_own_project" on public.trend_watchlist;
create policy "trend_watchlist_delete_own_project"
  on public.trend_watchlist
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.userprojects p
      where p.id = trend_watchlist.project_id
        and p.userid = auth.uid()
    )
  );

commit;
