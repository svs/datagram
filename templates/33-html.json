    .responses["ridership-cohorts"].data as $rides |
    .responses["signup-growth"].data as $signups |
    ($rides|map(.ride_week)|unique) as $weeks |
    {
	series: $weeks|map(. as $week | {
					 signup_week: $week,
					 signups: $signups | map(select(.date == $week))[0].count,
					 data: $weeks | map(. as $ride_week | ($rides | map(select(.ride_week == $ride_week and .signup_week == $week))[0] //
									       {
										signup_week: $week,
										ride_week: $ride_week,
										count: "-"
										}))
    })
}
