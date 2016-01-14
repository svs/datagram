{
 ping: .responses["latest-ping"].data,
 trip: .responses["trip-details"].data,
 message: .responses["latest-ping"].params.message,
 eta: .responses["latest-ping"].params.eta,
 distance: .responses["latest-ping"].params.distance,
 errors: .responses["latest-ping"].params.errors,
 lag: .responses["latest-ping"].params.last_ping_diff
 }
