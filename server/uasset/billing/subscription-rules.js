/*
=========================================================
UASSET — ONE PRO RULE
=========================================================

Used by /api/billing/status and /api/assets/pro so both
always agree on who is Pro.

Lemon Squeezy statuses:
- active, on_trial   -> Pro (until ends_at, if set)
- cancelled          -> Pro until ends_at (grace period)
- past_due           -> Pro while LS retries payment
                        (until ends_at, if set)
- paused, expired,
  unpaid, other      -> not Pro
=========================================================
*/

function isFuture(value) {
  if (!value) {
    return false;
  }

  const time =
    new Date(value).getTime();

  return (
    !Number.isNaN(time) &&
    time > Date.now()
  );
}

function isPast(value) {
  if (!value) {
    return false;
  }

  const time =
    new Date(value).getTime();

  return (
    !Number.isNaN(time) &&
    time <= Date.now()
  );
}

export function isProSubscription(subscription) {
  if (!subscription) {
    return false;
  }

  const status =
    String(
      subscription.status || ""
    ).toLowerCase();

  if (
    status === "cancelled" ||
    subscription.cancelled === true
  ) {
    return (
      status !== "expired" &&
      isFuture(subscription.ends_at)
    );
  }

  if (
    status === "active" ||
    status === "on_trial" ||
    status === "past_due"
  ) {
    return !isPast(subscription.ends_at);
  }

  return false;
}

/*
  A user can have several subscription rows.
  Pro if ANY row qualifies; otherwise return the most
  recent row (rows arrive ordered updated_at desc).
*/
export function pickSubscription(rows) {
  const list =
    Array.isArray(rows)
      ? rows
      : [];

  return (
    list.find(isProSubscription) ||
    list[0] ||
    null
  );
}
