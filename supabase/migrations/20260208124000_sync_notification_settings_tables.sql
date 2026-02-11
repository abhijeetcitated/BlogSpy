-- Keep legacy and current notification settings tables aligned.
-- Canonical writer in app now updates both, but this backfills existing rows.

insert into public.notification_settings (
  user_id,
  weekly_seo_report,
  rank_alerts,
  decay_alerts,
  competitor_alerts,
  product_updates,
  unsubscribe_all
)
select
  n.userid,
  n.weeklyreport,
  n.rankalerts,
  n.decayalerts,
  n.competitoralerts,
  n.productupdates,
  n.unsubscribeall
from public.notificationsettings n
on conflict (user_id) do update
set
  weekly_seo_report = excluded.weekly_seo_report,
  rank_alerts = excluded.rank_alerts,
  decay_alerts = excluded.decay_alerts,
  competitor_alerts = excluded.competitor_alerts,
  product_updates = excluded.product_updates,
  unsubscribe_all = excluded.unsubscribe_all,
  updated_at = now();
