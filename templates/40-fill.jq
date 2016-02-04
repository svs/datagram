.responses["today-s-trips"] as $in | {
    title: {
	text: ("Occupancy For" + $in.params.name),    x: -20
    },
    subtitle: {
	text: ($in.params.start_date + "-" + $in.params.end_date),
	x: -20
    },
    chart: {
            type: "bar"
    },
    plotOptions: {
            series: {
                stacking: "normal",
            }
    },
    xAxis: {
	categories: $in.data|map(.code)
    },
    yAxis: [
	{
	    title: "Number of Bookings",
	    floor: 0
	}
    ],
    series: [	     {
	      name: "Empty",
	      data: $in.data|map(.capacity - .reservations)
		      },
	     {
	      name: "Filled",
	      data: $in.data|map(.reservations)
	      }
	     ]
}
