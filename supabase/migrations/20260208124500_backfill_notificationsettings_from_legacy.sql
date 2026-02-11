-- Backfill canonical notificationsettings from legacy notification_settings.
-- This prevents empty settings UI for users created before table split.

insert into public.notificationsettings (
  userid,
  weeklyreport,
  rankalerts,
  decayalerts,
  competitoralerts,
  productupdates,
  unsubscribeall
)
select
  s.user_id,
  s.weekly_seo_report,
  s.rank_alerts,
  s.decay_alerts,
  s.competitor_alerts,
  s.product_updates,
  s.unsubscribe_all
from public.notification_settings s
on conflict (userid) do update
set
  weeklyreport = excluded.weeklyreport,
  rankalerts = excluded.rankalerts,
  decayalerts = excluded.decayalerts,
  competitoralerts = excluded.competitoralerts,
  productupdates = excluded.productupdates,
  unsubscribeall = excluded.unsubscribeall,
  updatedat = now();
