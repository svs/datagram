class DatagramSyncPublisher

  def initialize(payload)
    @payload = payload.with_indifferent_access
  end

  def execute!
    ap payload["watches"]
    payload["watches"].map do |p|
      send("execute_#{p["protocol"]}", {data: p["data"], url: p["url"]})
    end.tap{|r| ap r}
  end


  private

  attr_reader :payload

  def execute_mysql(params)
    ap params[:url]
    uri = URI.parse(params[:url])
    cattrs = Hash[
          [:host, :user, :password, :port].map {|d|
            [d, uri.send(d)]
          }]
    Mysql2::Client.new(cattrs).query(params[:data][:query])
  end

  def execute_postgres(params)
    ap params
  end


  def execute_http(params)
    ap params
  end

end
