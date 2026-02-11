-- Add index on rank_history.project_id for AI suggestions query performance
-- Without this index, every suggestion fetch does a sequential scan on rank_history

create index concurrently if not exists idx_rank_history_project_id
  on public.rank_history (project_id);
