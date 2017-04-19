namespace :fix do
  task charts_to_highcharts: :environment do
    Datagram.all.each do |d|
      vs = d.views
      (vs || []).map do |v|
        ap "Found #{d.name}:#{v["name"]} render: #{v["render"]}"
        if v["render"] == "chart"
          v["render"] = "highcharts"
          ap "#FixChartsToHighchartsUpdated view render from charts to highcharts for #{d.name}:#{v["name"]}"
        end
      end
      Raise unless d.save
    end
  end
end
