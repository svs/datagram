    .responses["ridership-cohorts"].data as $rides |
    .responses["first-ride-growth"].data as $first_rides |
    ($rides|map(.ride_p)|unique) as $periods |
    {
	series: $periods|map(. as $period | {
					 first_ride_p: $period,
					 first_rides: $first_rides | map(select(.date == $period))[0].count,
					 data: $periods | map(. as $ride_p | ($rides | map(select(.ride_p == $ride_p and .first_ride_p == $period))[0] //
									       {
										first_ride_period: $period,
										ride_period: $ride_p,
										count: "-"
										}))
    })
}
