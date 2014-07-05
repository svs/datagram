module Api
  module V1
    class WatchResponsesController < ApplicationController
      protect_from_forgery :except => [:update]

      def update
        ap params
        wr = WatchResponse.find(params[:id])
        data = (params[:data].is_a?(String) ? JSON.parse(params[:data]) : params[:data]) || {}
        data = data.merge(_http_status: params[:status_code]) if data.is_a? Hash
        binding.pry
        if wr.update(response_json: {data: data},
                     status_code: params[:status_code],
                     elapsed: params[:elapsed],
                     response_received_at: Time.zone.now,
                     error: params[:errors])

          begin
            Rails.logger.info "Pushing watch id: #{wr.watch_id}"
            d = {token: wr.token, modified: wr.modified}
            Pusher.trigger('stats', 'data', d)
          end
          render json: "ok"
        else
          render json: "not ok", status: 422
        end
      end

      def show
        r = WatchResponse.find(params[:id])
        render json: r.to_json
      end

      private


    end
  end
end
