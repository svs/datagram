.responses["nkp-ridership-by-tod"] as $in | {
    title: {
	text: "NKP Tickets by ToD",    x: -20
    },
    subtitle: {
	text: .responses["nkp-ridership-by-tod"].metadata.report_time,
	x: -20
    },
    chart: {
            type: "column"
    },
    plotOptions: {
            column: {
                stacking: "normal",
            }
    },
    xAxis: {
	categories: .responses["nkp-ridership-by-tod"].data|map(.date)|unique
    },
    yAxis: [
	{
	    title: "Number of Bookings",
	    floor: 0
	}
    ],
    series: .responses["nkp-ridership-by-tod"].data|map(.tod)|unique|map(. as $n | {
	name: .,
	data: ($in.data|map(.date)|unique) | map(. as $d | ($in.data | map(select(.date == $d and .tod == $n))) | map(.count)[0])[-5:]
    })
}
