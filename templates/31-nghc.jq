.responses["nkp-ridership"] as $in |
{
 categories: .responses["nkp-ridership"].data|map(.date)|unique|map(.[5:10])|.[length-10:],
 groups: .responses["nkp-ridership"].data|map(.area)|unique|join(","),
 series: .responses["nkp-ridership"].data|map(.area)|unique|map(. as $n |
								{
								 name: .,
								 data: ($in.data|map(.date)|unique) | map(. as $d | ($in.data | map(select(.date == $d and .area == $n))) | map(.count)[0])|.[(length-10):]|map(. // 0)
								 }),
 total: .responses["nkp-summary"].data[1].count,
 prev_total: .responses["nkp-summary"].data[0].count,
 trend: ((.responses["nkp-summary"].data[1].count / .responses["nkp-summary"].data[0].count) - 1)

}
