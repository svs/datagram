task perform: :environment do
  $watches.bind($x, routing_key: "watch-watches").subscribe(block: true) do |di, md, payload|
    begin
      t = Time.now.to_i
      payload = JSON.parse(payload)
      ap payload
      context = {datagram: payload["datagram_id"], watch: payload["token"], timestamp: payload["timestamp"]}
      DgLog.new("#Perform processing watch #{payload["key"]}", context).log
      url = payload["url"]
      if url =~ /docs.google.com\/spreadsheets/
        ap "Sheet!"
        c = Clients::GoogleDrive.new(url, payload)
        r = c.data
      elsif url =~ /\Ahttp/
        d = payload["params"].slice(*payload["data"].keys) if payload["data"]
        r = JSON.parse(RestClient.get(payload["url"], {params: d}))
      else
        url = url.gsub("mysql://","mysql2://")
        options = url =~ /redshift/ ? {client_min_messages: false, force_standard_strings: false} : {}
        Sequel.connect(url, options) do |db|
          q = payload["data"]["query"]
          r = db.fetch(q).all
        end
      end
      elapsed = Time.now.to_i - t
      response = {
        elapsed: elapsed,
        status_code: 200,
        data: r,
        id: payload["key"],
        datagram_id: payload["datagram_id"],
        timestamp: payload["timestamp"]
      }
      $watch_responses.publish(response.to_json)
      DgLog.new("#Perform finished #{payload["key"]} in #{elapsed} seconds", context).log
    rescue Exception => e
      Rails.logger.error("#Perform #{e.message}")
      response = {
        elapsed: Time.now.to_i - t,
        status_code: 422,
        data: {},
        error: e.message,
        id: payload["key"],
        datagram_id: payload["datagram_id"]
      }
      $watch_responses.publish(response.to_json)
      Rails.logger.error "#Perform finished #{payload["key"]} in #{elapsed} seconds with error #{e.message}"
    end
  end
end
