module Api
  module V1
    class WatchResponsesController < ApplicationController
      before_action :authenticate_user!
      respond_to :json
      def show
        r = WatchResponse.find_by(token: params[:id])
        render json: r.as_json(params[:max_size].to_i || 10000)
      end
    end
  end
end
