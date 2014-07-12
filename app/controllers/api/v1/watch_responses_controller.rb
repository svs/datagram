module Api
  module V1
    class WatchResponsesController < ApplicationController
      def show
        r = WatchResponse.find_by(token: params[:id])
        render json: r.to_json
      end
    end
  end
end
