.responses["today-s-cohorts"] as $in |
{
 chart: {
	 width: 1000
	 },
 title: {
	 text: $in.params.name,    x: -20
	 },
 subtitle: {
	    text: $in.params.date,
	    x: -20
	    },
 xAxis: {
	 categories: $in.data|map(.cohort)|unique
	 },
 yAxis: [
	 {
	  title: "Number of Tickets",
	  floor: 0
	  },
	 {
	  title: "Average Rides Taken",
	  opposite: true,
	  floor: 0
	  }
	 ],
 series: ($in.data|map(.route_name)|unique|map(. as $n |
 {
  name: .,
  type: "column",
  data: ($in.data|map(.cohort)|unique) | map(. as $d | ($in.data | map(select(.cohort == $d and .route_name == $n))) | map(.passengers)[0])
  }))
}
