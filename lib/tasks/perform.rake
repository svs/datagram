task perform: :environment do
  $watches.bind($x, routing_key: "watch-watches").subscribe(block: true) do |di, md, payload|
    ap payload
    begin
      t = Time.now.to_i
      payload = JSON.parse(payload)
      context = {datagram: payload["datagram_id"], watch: payload["token"], timestamp: payload["timestamp"]}
      DgLog.new("#Perform processing watch #{payload["key"]}", context).log
      url = payload["url"]
      if url =~ /\Ahttp/
      elsif url =~ /\Adrive/
        u = URI.parse(url)
        token = u.user
        sheet_key = u.host
        worksheet = u.path[1..-1]
        session = GoogleDrive.login_with_oauth(token)
        data = session.spreadsheet_by_key(sheet_key).worksheets[worksheet.to_i].rows
        r = data[1..-1].map{|r| Hash[data[0].zip(r)]}
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
