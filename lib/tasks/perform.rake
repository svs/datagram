task perform: :environment do
  $watches.bind($x, routing_key: "watch-watches").subscribe(block: true) do |di, md, payload|
    EM.synchrony do
      begin
        t = Time.now.to_i
        concurrency = 2
        payload = JSON.parse(payload)
        ap payload
        url = payload["url"].gsub("mysql://","mysql2://")
        db = Sequel.connect(url, pool_class: :em_synchrony)
        q = payload["data"]["query"]
        q = "SELECT bar FROM foo"
        r = db.fetch(q).all
        response = {
          elapsed: Time.now.to_i - t,
          status_code: 200,
          data: r,
          id: payload["key"]
        }
        $watch_responses.publish(response.to_json)
      rescue Exception => e
        response = {
          elapsed: Time.now.to_i - t,
          status_code: 422,
          data: {},
          error: e.message,
          id: payload["key"]
        }
        $watch_responses.publish(response.to_json)
      end
      EM.stop
    end
  end
end
