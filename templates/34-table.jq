.responses["individual-cohort-details"].data as $data |
$data | map(.ride_period) | sort | unique as $dates |
{
 dates: $dates,
 data: $data | group_by(.email) | map(. as $u | {key: $u[0].email, value: $dates | map(. as $d | $u | map(select(.ride_period == $d))[0].count)}) | from_entries
 }
