.responses["nkp-ridership"] as $in | {
    title: {
	text: "NKP Tickets / Day",    x: -20
    },
    subtitle: {
	text: .responses["nkp-ridership"].metadata.report_time,
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
	categories: .responses["nkp-ridership"].data|map(.date)|unique
    },
    yAxis: [
	{
	    title: "Number of Bookings",
	    floor: 0
	}
    ],
    series: .responses["nkp-ridership"].data|map(.area)|unique|map(. as $n | {
	name: .,
	data: ($in.data|map(.date)|unique) | map(. as $d | ($in.data | map(select(.date == $d and .area == $n))) | map(.count)[0])[-5:]
    })
}
