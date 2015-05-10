task perform: :environment do
  $watches.bind($x, routing_key: "watch-watches").subscribe(block: true) do |di, md, payload|
    begin
      t = Time.now.to_i
      payload = JSON.parse(payload)
      Rails.logger.info "#Perform processing watch #{payload["key"]}"
      url = payload["url"].gsub("mysql://","mysql2://")
      db = Sequel.connect(url)
      q = payload["data"]["query"]
      r = db.fetch(q).all
      elapsed = Time.now.to_i - t
      response = {
        elapsed: elapsed,
        status_code: 200,
        data: r,
        id: payload["key"]
      }
      $watch_responses.publish(response.to_json)
      Rails.logger.info "#Perform finished #{payload["key"]} in #{elapsed} seconds"
    rescue Exception => e
        response = {
        elapsed: Time.now.to_i - t,
        status_code: 422,
        data: {},
        error: e.message,
        id: payload["key"]
      }
      $watch_responses.publish(response.to_json)
      Rails.logger.error "#Perform finished #{payload["key"]} in #{elapsed} seconds with error #{e.message}"
    end
  end
end
