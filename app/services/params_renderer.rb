class ParamsRenderer
  # Given
  # params: {a: "{{b}}", c: "{{start_date}}"}
  # data: {b: "foo", start_date: "[[-1d]]"}
  # Returns
  # {a: "foo", c: "2016-03-27"}

  def initialize(params, data)
    @data = data || {}
    @params = params || {}
  end

  def render
    replace_dates && render_mustache
  end

  def real_data
    replace_dates
  end
  #private

  attr_reader :data, :params

  def render_mustache
    @result = params ?JSON.parse(CGI.unescapeHTML(::Mustache.render(JSON.dump(params), data).gsub("\\n"," "))) : params
  end

  def replace_dates
    @data = Hash[
      data.map{|k,v|
        [k, render_date(v)]
      }
    ]
  end

  def render_date(v)
    return v unless (m = v.match(/\A\[\[(.*)\]\]\Z/) rescue nil)
    v = m[0]
    match_data, direction, value, type, snap, business = v.match(/([+-])(\d+)(wd|[mwd])([[\<\>]]?)([+-]?)/).to_a # extracts [[-1w<]] into ["-","1","w","<"]
    return v unless match_data
    dur = ActiveSupport::Duration.new(
      Time.now,
      {
        {"w" => :weeks, "m" => :months, "d" => :days}[type] => value.to_i
      }
    )

    dt = dur.send({"+" => "since", "-" => "ago"}[direction])
    if ["<",">"].include?(snap)
      dt = dt.send({"<" => "beginning", ">" => "end"}[snap] + "_of_" + {"w" => "week", "m" => "month"}[type])
    end
    if business == "-"
      dt = 0.business_days.before(dt)
    end
    if business == "+"
      dt = 0.business_days.after(dt)
    end

     dt.strftime('%Y-%m-%d')

  end
end
