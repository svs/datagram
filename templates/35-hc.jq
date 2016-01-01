.responses["fill-rate-by-route-and-date"] as $in | {
    chart: {
            type: "line",
            width: 1080,
	    height: 700
        },
    title: {
	text: "Fill Rate / Route / Day",    x: -20
    },
    xAxis: {
	categories: .responses["fill-rate-by-route-and-date"].data|map(.date)|unique
    },
    yAxis: [
	{
	    title: "Number of Bookings",
	    floor: 0
	}
    ],
    plotOptions: {
            series: {
                marker: {
                    enabled: false
                }
            }
        },
    series: .responses["fill-rate-by-route-and-date"].data|map(.route)|unique|map(. as $n |
    {
	name: $n,
	type: "spline",
	data: ($in.data|map(.date)|unique) | map(. as $d | ($in.data | map(select(.date == $d and .route == $n))) | map(.fill_rate)[0])
    })
}
