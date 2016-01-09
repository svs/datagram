.responses["nkp-weekly-cohort"].data as $data |
$data | map(.period) | sort | unique as $dates |
{
 dates: $dates,
 data: $data | group_by(.email) | map(. as $u | {key: $u[0].email, value: $dates | map(. as $d | $u | map(select(.period == $d))[0].count)}) | from_entries
 }
