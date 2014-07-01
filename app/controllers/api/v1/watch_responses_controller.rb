module Api
  module V1
    class WatchResponsesController < ApplicationController
      protect_from_forgery :except => [:update]

      def update
        wr = WatchResponse.find(params[:id])
        data = (params[:data].is_a?(String) ? JSON.parse(params[:data]) : params[:data]) || {}
        if wr.update(response_json: {data: data.merge(_http_status: params[:status_code])},
                     status_code: params[:status_code],
                     elapsed: params[:elapsed],
                     response_received_at: Time.zone.now)

          begin
            Rails.logger.info "Pushing watch id: #{wr.watch_id}"
            d = {token: wr.token, modified: wr.modified}
            Pusher.trigger('stats', 'data', d)
          end
          render json: "ok"
        else
          render json: "not allowed", status: 422
        end
      end

      def show
        r = WatchResponse.find(params[:id])
        render json: r.to_json
      end

      private

      def update_params
        params.require(:data)
      end

    end
  end
end
