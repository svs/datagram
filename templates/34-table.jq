.responses["individual-cohort-details"].data as $data |
$data | map(.ride_period) | sort | unique as $dates |
{
 dates: $dates,
 data: $data | group_by(.email) | map(. as $u | {profile: $u[0].email,
						  from_area: $u[0].live_area_name,
						  to_area: $u[0].work_area_name,
						  data: $dates | map(. as $d | $u | map(select(.ride_period == $d))[0].count)
						}
				      )
 }
