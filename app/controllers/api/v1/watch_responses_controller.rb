module Api
  module V1
    class WatchResponsesController < ApplicationController
      def show
        r = WatchResponse.find(params[:id])
        render json: r.to_json
      end
    end
  end
end
